import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '../../../utils/date.utils';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-appointment-detail-modal',
  templateUrl: './appointment-detail-modal.component.html',
  styleUrls: ['./appointment-detail-modal.component.css']
})
export class AppointmentDetailModalComponent implements OnInit {
  @Input() appointment: any;
  @Input() patientId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() appointmentDeleted = new EventEmitter<void>();

  showDeleteModal = false;
  isDeleting = false;

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit();
  }

  openAttachment(url: string): void {
    window.open(url, '_blank');
  }

  formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  showDeleteConfirmation(): void {
    this.showDeleteModal = true;
  }

  hideDeleteConfirmation(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.patientId || !this.appointment?.id) {
      console.error('PatientId o AppointmentId no disponible');
      return;
    }

    this.isDeleting = true;
    
    this.patientService.deleteAppointment(this.patientId, this.appointment.id).subscribe({
      next: (response) => {
        console.log('Cita eliminada exitosamente');
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.appointmentDeleted.emit(); // Emitir evento para actualizar la lista
        this.closeModal(); // Cerrar el modal
      },
      error: (error) => {
        console.error('Error eliminando cita:', error);
        this.isDeleting = false;
        // Aquí podrías mostrar un mensaje de error al usuario
        alert('Error al eliminar la cita. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
