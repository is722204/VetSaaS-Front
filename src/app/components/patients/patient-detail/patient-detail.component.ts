import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { ModalService } from '../../../services/modal.service';
import { Patient } from '../../../models/patient.model';

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
    this.router.navigate(['/patients']);
  }

  getPatientAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} años`;
    }
    
    return `${age} años`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      this.router.navigate(['/patients', patientId, 'edit']);
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
}
