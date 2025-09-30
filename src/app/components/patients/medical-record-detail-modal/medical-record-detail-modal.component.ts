import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-medical-record-detail-modal',
  templateUrl: './medical-record-detail-modal.component.html',
  styleUrls: ['./medical-record-detail-modal.component.css']
})
export class MedicalRecordDetailModalComponent implements OnInit {
  @Input() record: any;
  @Output() close = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit();
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

  openImageModal(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }
}
