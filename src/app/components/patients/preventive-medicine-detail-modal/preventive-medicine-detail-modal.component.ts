import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '../../../utils/date.utils';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-preventive-medicine-detail-modal',
  templateUrl: './preventive-medicine-detail-modal.component.html',
  styleUrls: ['./preventive-medicine-detail-modal.component.css']
})
export class PreventiveMedicineDetailModalComponent implements OnInit {
  @Input() medicine: any;
  @Input() patientId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() medicineDeleted = new EventEmitter<void>();

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

  getMedicineTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'vacuna':
      case 'vacunación':
        return 'fas fa-syringe';
      case 'desparasitación':
      case 'desparasitante':
        return 'fas fa-bug';
      case 'vitamina':
      case 'suplemento':
        return 'fas fa-pills';
      case 'antibiótico':
        return 'fas fa-prescription-bottle';
      default:
        return 'fas fa-pills';
    }
  }

  getMedicineTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'vacuna':
      case 'vacunación':
        return 'bg-blue-100 text-blue-600';
      case 'desparasitación':
      case 'desparasitante':
        return 'bg-orange-100 text-orange-600';
      case 'vitamina':
      case 'suplemento':
        return 'bg-green-100 text-green-600';
      case 'antibiótico':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  showDeleteConfirmation(): void {
    this.showDeleteModal = true;
  }

  hideDeleteConfirmation(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.patientId || !this.medicine?.id) {
      console.error('PatientId o MedicineId no disponible');
      return;
    }

    this.isDeleting = true;
    
    this.patientService.deletePreventiveMedicine(this.patientId, this.medicine.id).subscribe({
      next: (response) => {
        console.log('Medicina preventiva eliminada exitosamente');
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.medicineDeleted.emit(); // Emitir evento para actualizar la lista
        this.closeModal(); // Cerrar el modal
      },
      error: (error) => {
        console.error('Error eliminando medicina preventiva:', error);
        this.isDeleting = false;
        // Aquí podrías mostrar un mensaje de error al usuario
        alert('Error al eliminar la medicina preventiva. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
