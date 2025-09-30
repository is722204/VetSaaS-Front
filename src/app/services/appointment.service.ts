import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private apiService: ApiService) { }

  getAppointments(): Observable<{ [appointmentId: string]: Appointment }> {
    return this.apiService.get<{ [appointmentId: string]: Appointment }>('/appointments');
  }

  getAppointment(appointmentId: string): Observable<Appointment> {
    return this.apiService.get<Appointment>(`/appointments/${appointmentId}`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.apiService.post<Appointment>('/appointments', appointment);
  }

  updateAppointment(appointmentId: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.apiService.put<Appointment>(`/appointments/${appointmentId}`, appointment);
  }

  deleteAppointment(appointmentId: string): Observable<void> {
    return this.apiService.delete<void>(`/appointments/${appointmentId}`);
  }

  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<{ [appointmentId: string]: Appointment }> {
    return this.apiService.get<{ [appointmentId: string]: Appointment }>(`/appointments/date-range?start=${startDate}&end=${endDate}`);
  }

  getAppointmentsByPatient(patientId: string): Observable<{ [appointmentId: string]: Appointment }> {
    return this.apiService.get<{ [appointmentId: string]: Appointment }>(`/appointments/patient/${patientId}`);
  }
}