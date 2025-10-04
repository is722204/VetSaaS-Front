import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { ModalService } from '../../../services/modal.service';
import { Patient } from '../../../models/patient.model';
import { parseDate, formatDate, calculateAge, daysDifference } from '../../../utils/date.utils';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  isLoading = true;
  activeTab = 'medical-history';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadPatient(patientId);
    }
  }

  private loadPatient(patientId: string): void {
    this.isLoading = true;
    this.patientService.getPatient(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando paciente:', error);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/app/patients']);
  }

  getPatientAge(birthDate: string): string {
    return calculateAge(birthDate);
  }

  formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  getMedicalHistoryArray(): any[] {
    if (!this.patient?.medicalHistory) return [];
    return Object.entries(this.patient.medicalHistory).map(([id, record]) => ({
      id,
      ...record
    }));
  }

  getPreventiveMedicineArray(): any[] {
    if (!this.patient?.preventiveMedicine) return [];
    return Object.entries(this.patient.preventiveMedicine).map(([id, medicine]) => ({
      id,
      ...medicine
    }));
  }

  getAppointmentsArray(): any[] {
    if (!this.patient?.appointments) return [];
    return Object.entries(this.patient.appointments).map(([id, appointment]) => ({
      id,
      ...appointment
    }));
  }

  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAppointmentStatusText(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'rescheduled':
        return 'Reprogramada';
      default:
        return 'Desconocido';
    }
  }

  openImageModal(imageUrl: string): void {
    // TODO: Implementar modal para ver imagen en tamaño completo
    window.open(imageUrl, '_blank');
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x300?text=Caballo';
  }

  onEditClick(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.router.navigate(['/app/patients', patientId, 'edit']);
    }
  }

  onAddMedicalRecord(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('medical-record', patientId, this.patient.basicInfo.name);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  onAddPreventiveMedicine(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('preventive-medicine', patientId, this.patient.basicInfo.name);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  onAddAppointment(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('appointment', patientId, this.patient.basicInfo.name);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  onMedicalRecordClick(record: any): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('medical-record-detail', patientId, this.patient.basicInfo.name, record);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  onPreventiveMedicineClick(medicine: any): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('preventive-medicine-detail', patientId, this.patient.basicInfo.name, medicine);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  onAppointmentClick(appointment: any): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId && this.patient) {
      this.modalService.openModal('appointment-detail', patientId, this.patient.basicInfo.name, appointment);
      // Suscribirse a cambios del modal para refrescar datos
      this.modalService.modal$.subscribe(modal => {
        if (!modal.isOpen && this.patient) {
          this.loadPatient(patientId);
        }
      });
    }
  }

  // Métodos para calcular el progreso de gestación dinámicamente
  getPregnancyProgress(): number {
    // Verificar que el paciente existe y está preñado
    if (!this.patient?.pregnancy?.isPregnant) {
      return 0;
    }

    // Verificar que hay fecha de concepción
    const conceptionDate = this.patient.pregnancy.conceptionDate;
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
    if (!this.patient?.pregnancy?.isPregnant || !this.patient.pregnancy.conceptionDate) {
      return 0;
    }

    return daysDifference(this.patient.pregnancy.conceptionDate);
  }

  getEstimatedReliefDate(): string {
    if (!this.patient?.pregnancy?.isPregnant || !this.patient.pregnancy.conceptionDate) {
      return '';
    }

    const conception = parseDate(this.patient.pregnancy.conceptionDate);
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330); // 11 meses = ~330 días
    
    return estimatedRelief.toISOString().split('T')[0];
  }

  getDaysUntilRelief(): number {
    if (!this.patient?.pregnancy?.isPregnant || !this.patient.pregnancy.conceptionDate) {
      return 0;
    }

    const conception = parseDate(this.patient.pregnancy.conceptionDate);
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330);
    
    const today = new Date();
    const reliefTimeDiff = estimatedRelief.getTime() - today.getTime();
    return Math.ceil(reliefTimeDiff / (1000 * 3600 * 24));
  }

  getPregnancyStatusText(): string {
    const progress = this.getPregnancyProgress();
    const daysUntil = this.getDaysUntilRelief();
    
    if (progress >= 100) {
      return 'Lista para el parto';
    } else if (progress >= 80) {
      return 'Último trimestre';
    } else if (progress >= 50) {
      return 'Segundo trimestre';
    } else if (progress >= 20) {
      return 'Primer trimestre';
    } else {
      return 'Inicio de gestación';
    }
  }
}
