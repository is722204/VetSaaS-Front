import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '../../../utils/date.utils';

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
    return formatDate(dateString);
  }

  openImageModal(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }
}
