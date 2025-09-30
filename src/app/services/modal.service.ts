import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  type: 'medical-record' | 'preventive-medicine' | 'appointment' | 'medical-record-detail' | 'preventive-medicine-detail' | 'appointment-detail';
  patientId: string;
  patientName: string;
  data?: any; // Para pasar los datos del elemento específico
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<{ isOpen: boolean; data?: ModalData }>({ isOpen: false });
  public modal$ = this.modalSubject.asObservable();

  openModal(type: 'medical-record' | 'preventive-medicine' | 'appointment' | 'medical-record-detail' | 'preventive-medicine-detail' | 'appointment-detail', patientId: string, patientName: string, data?: any): void {
    this.modalSubject.next({
      isOpen: true,
      data: { type, patientId, patientName, data }
    });
  }

  closeModal(): void {
    this.modalSubject.next({ isOpen: false });
  }
}