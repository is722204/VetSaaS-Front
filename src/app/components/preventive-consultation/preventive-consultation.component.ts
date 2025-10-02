import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PreventiveConsultationService, PreventiveConsultationData, PreventiveMedicine, TenantInfo } from '../../services/preventive-consultation.service';
import { parseDate, formatDate, calculateAge } from '../../utils/date.utils';

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

  constructor(
    private route: ActivatedRoute,
    private preventiveService: PreventiveConsultationService
  ) {}

  ngOnInit(): void {
    // Obtener el tenantId de la ruta
    this.route.params.subscribe(params => {
      this.tenantId = params['tenantId'];
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
}
