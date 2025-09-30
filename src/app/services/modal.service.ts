import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  type: 'medical-record' | 'preventive-medicine' | 'appointment';
  patientId: string;
  patientName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<{ isOpen: boolean; data?: ModalData }>({ isOpen: false });
  public modal$ = this.modalSubject.asObservable();

  openModal(type: 'medical-record' | 'preventive-medicine' | 'appointment', patientId: string, patientName: string): void {
    this.modalSubject.next({
      isOpen: true,
      data: { type, patientId, patientName }
    });
  }

  closeModal(): void {
    this.modalSubject.next({ isOpen: false });
  }
}