import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '../../../utils/date.utils';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-medical-record-detail-modal',
  templateUrl: './medical-record-detail-modal.component.html',
  styleUrls: ['./medical-record-detail-modal.component.css']
})
export class MedicalRecordDetailModalComponent implements OnInit {
  @Input() record: any;
  @Input() patientId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() recordDeleted = new EventEmitter<void>();

  showDeleteModal = false;
  isDeleting = false;

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit();
  }

  formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  openImageModal(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  showDeleteConfirmation(): void {
    this.showDeleteModal = true;
  }

  hideDeleteConfirmation(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.patientId || !this.record?.id) {
      console.error('PatientId o RecordId no disponible');
      return;
    }

    this.isDeleting = true;
    
    this.patientService.deleteMedicalRecord(this.patientId, this.record.id).subscribe({
      next: (response) => {
        console.log('Registro médico eliminado exitosamente');
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.recordDeleted.emit(); // Emitir evento para actualizar la lista
        this.closeModal(); // Cerrar el modal
      },
      error: (error) => {
        console.error('Error eliminando registro médico:', error);
        this.isDeleting = false;
        // Aquí podrías mostrar un mensaje de error al usuario
        alert('Error al eliminar el registro médico. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
