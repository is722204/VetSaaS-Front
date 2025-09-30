import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-appointment-detail-modal',
  templateUrl: './appointment-detail-modal.component.html',
  styleUrls: ['./appointment-detail-modal.component.css']
})
export class AppointmentDetailModalComponent implements OnInit {
  @Input() appointment: any;
  @Output() close = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit();
  }

  openAttachment(url: string): void {
    window.open(url, '_blank');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getAppointmentStatusIcon(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'fas fa-calendar-check';
      case 'completed':
        return 'fas fa-check-circle';
      case 'cancelled':
        return 'fas fa-times-circle';
      case 'rescheduled':
        return 'fas fa-calendar-alt';
      default:
        return 'fas fa-question-circle';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'media':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'Alta';
      case 'media':
      case 'medium':
        return 'Media';
      case 'baja':
      case 'low':
        return 'Baja';
      default:
        return 'No especificada';
    }
  }
}
