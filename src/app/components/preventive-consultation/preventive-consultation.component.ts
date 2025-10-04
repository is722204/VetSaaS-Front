import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PreventiveConsultationService, PreventiveConsultationData, PreventiveMedicine, TenantInfo } from '../../services/preventive-consultation.service';
import { parseDate, formatDate, calculateAge, daysDifference } from '../../utils/date.utils';

@Component({
  selector: 'app-preventive-consultation',
  templateUrl: './preventive-consultation.component.html',
  styleUrls: ['./preventive-consultation.component.css']
})
export class PreventiveConsultationComponent implements OnInit {
  tenantId: string = '';
  patientId: string = '';
  searchPatientId: string = '';
  patientData: PreventiveConsultationData | null = null;
  tenantInfo: TenantInfo | null = null;
  isLoading: boolean = false;
  isLoadingTenant: boolean = false;
  errorMessage: string = '';
  tenantErrorMessage: string = '';
  isSearched: boolean = false;
  
  // Modal de imagen
  showImageModal: boolean = false;
  selectedImageUrl: string = '';
  selectedImageType: 'patient' | 'medicine' = 'patient';
  selectedMedicineData: any = null;

  constructor(
    private route: ActivatedRoute,
    private preventiveService: PreventiveConsultationService
  ) {}

  ngOnInit(): void {
    // Obtener el tenantId y id_animal de la ruta
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
      this.patientId = params['id_animal'] || '';
      
      this.loadTenantInfo();
    });
  }

  loadTenantInfo(): void {
    this.isLoadingTenant = true;
    this.tenantErrorMessage = '';

    this.preventiveService.getTenantInfo(this.tenantId)
      .subscribe({
        next: (data) => {
          this.tenantInfo = data;
          this.isLoadingTenant = false;
          
          // Si hay id_animal en la ruta, hacer la búsqueda automática después de cargar el tenant
          if (this.patientId) {
            this.searchPatientId = this.patientId;
            this.onSearch();
          }
        },
        error: (error) => {
          this.isLoadingTenant = false;
          if (error.status === 404) {
            this.tenantErrorMessage = 'Clínica no encontrada';
          } else {
            this.tenantErrorMessage = 'Error al cargar información de la clínica';
          }
        }
      });
  }

  onSearch(): void {
    if (!this.searchPatientId.trim()) {
      this.errorMessage = 'Por favor ingresa el ID del animal';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.patientData = null;
    this.isSearched = true;

    this.preventiveService.getPreventiveData(this.tenantId, this.searchPatientId.trim())
      .subscribe({
        next: (data) => {
          this.patientData = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 404) {
            this.errorMessage = 'No se encontró ningún animal con ese ID';
          } else {
            this.errorMessage = 'Error al buscar la información. Inténtalo de nuevo.';
          }
        }
      });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  getPreventiveMedicineArray(): { id: string, data: PreventiveMedicine }[] {
    if (!this.patientData?.preventiveMedicine) return [];
    
    return Object.entries(this.patientData.preventiveMedicine)
      .map(([id, data]) => ({ id, data }))
      .sort((a, b) => parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime());
  }

  formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  calculateAge(): string {
    if (!this.patientData?.basicInfo.birthDate) return 'No especificada';
    return calculateAge(this.patientData.basicInfo.birthDate);
  }

  resetSearch(): void {
    this.searchPatientId = '';
    this.patientData = null;
    this.errorMessage = '';
    this.isSearched = false;
  }

  // Métodos para calcular el progreso de gestación dinámicamente
  getPregnancyProgress(): number {
    // Verificar que el paciente existe y está preñado
    if (!this.patientData?.pregnancy?.isPregnant) {
      return 0;
    }

    // Verificar que hay fecha de concepción
    const conceptionDate = this.patientData.pregnancy.conceptionDate;
    if (!conceptionDate) {
      return 0;
    }

    // Calcular días de gestación
    const pregnancyDays = daysDifference(conceptionDate);
    
    // Si los días son negativos (fecha futura), retornar 0
    if (pregnancyDays < 0) {
      return 0;
    }
    
    // Si no hay días de gestación, retornar 0
    if (pregnancyDays === 0) {
      return 0;
    }
    
    // Calcular porcentaje (gestación de caballos: ~340 días)
    const totalPregnancyDays = 340;
    const percentage = (pregnancyDays / totalPregnancyDays) * 100;
    
    // Asegurar que el porcentaje esté entre 0 y 100
    const finalPercentage = Math.min(Math.max(Math.round(percentage), 0), 100);
    
    return finalPercentage;
  }

  getPregnancyDays(): number {
    if (!this.patientData?.pregnancy?.isPregnant || !this.patientData.pregnancy.conceptionDate) {
      return 0;
    }

    return daysDifference(this.patientData.pregnancy.conceptionDate);
  }

  getEstimatedReliefDate(): string {
    if (!this.patientData?.pregnancy?.isPregnant || !this.patientData.pregnancy.conceptionDate) {
      return '';
    }

    const conception = parseDate(this.patientData.pregnancy.conceptionDate);
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330); // 11 meses = ~330 días
    
    return estimatedRelief.toISOString().split('T')[0];
  }

  getDaysUntilRelief(): number {
    if (!this.patientData?.pregnancy?.isPregnant || !this.patientData.pregnancy.conceptionDate) {
      return 0;
    }

    const conception = parseDate(this.patientData.pregnancy.conceptionDate);
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330);
    
    const today = new Date();
    const timeDiff = estimatedRelief.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  getPregnancyStatusText(): string {
    const progress = this.getPregnancyProgress();
    
    if (progress === 0) {
      return 'Inicio de gestación';
    } else if (progress < 25) {
      return 'Primer trimestre';
    } else if (progress < 50) {
      return 'Segundo trimestre';
    } else if (progress < 75) {
      return 'Tercer trimestre';
    } else if (progress < 90) {
      return 'Final de gestación';
    } else {
      return 'Próximo al parto';
    }
  }

  // Métodos para el modal de imagen
  openImageModal(imageUrl: string, type: 'patient' | 'medicine' = 'patient', medicineData?: any): void {
    this.selectedImageUrl = imageUrl;
    this.selectedImageType = type;
    this.selectedMedicineData = medicineData;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImageUrl = '';
    this.selectedImageType = 'patient';
    this.selectedMedicineData = null;
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
  }
}
