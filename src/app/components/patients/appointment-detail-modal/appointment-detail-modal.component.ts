import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '../../../utils/date.utils';

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
    return formatDate(dateString);
  }
}
