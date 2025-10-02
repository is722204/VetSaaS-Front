import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api'; // URL del backend

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getHeadersForFormData(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // No incluir Content-Type para FormData, el navegador lo maneja automáticamente
    });
  }

  // Métodos genéricos para CRUD
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    // Si es FormData, usar headers especiales
    if (data instanceof FormData) {
      return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeadersForFormData() });
    }
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    // Si es FormData, usar headers especiales
    if (data instanceof FormData) {
      return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeadersForFormData() });
    }
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeaders() });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() });
  }
}
