import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private apiService: ApiService) { }

  getPatients(): Observable<{ [patientId: string]: Patient }> {
    return this.apiService.get<{ [patientId: string]: Patient }>('/patients');
  }

  getPatient(patientId: string): Observable<Patient> {
    return this.apiService.get<Patient>(`/patients/${patientId}`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.apiService.post<Patient>('/patients', patient);
  }

  createPatientWithImage(patientData: FormData): Observable<Patient> {
    return this.apiService.post<Patient>('/patients/with-image', patientData);
  }

  updatePatient(patientId: string, patient: Partial<Patient>): Observable<Patient> {
    return this.apiService.put<Patient>(`/patients/${patientId}`, patient);
  }

  updatePatientWithImage(patientId: string, patientData: FormData): Observable<Patient> {
    return this.apiService.put<Patient>(`/patients/${patientId}/with-image`, patientData);
  }

  deletePatient(patientId: string): Observable<void> {
    return this.apiService.delete<void>(`/patients/${patientId}`);
  }

  addMedicalRecord(patientId: string, record: FormData | any): Observable<any> {
    return this.apiService.post(`/patients/${patientId}/medical-history`, record);
  }

  addPreventiveMedicine(patientId: string, medicine: FormData | any): Observable<any> {
    return this.apiService.post(`/patients/${patientId}/preventive-medicine`, medicine);
  }

  updatePregnancy(patientId: string, pregnancy: any): Observable<any> {
    return this.apiService.put(`/patients/${patientId}/pregnancy`, pregnancy);
  }

  addAppointment(patientId: string, appointment: any): Observable<any> {
    return this.apiService.post(`/patients/${patientId}/appointments`, appointment);
  }
}