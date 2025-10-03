import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantInfo {
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    primaryColor: string;
    logoUrl: string;
    doctorName?: string;
  };
}

export interface PreventiveConsultationData {
  basicInfo: {
    name: string;
    patientId: string;
    birthDate: string;
    sex: 'macho' | 'hembra';
    color: string;
    breed: string;
    photoUrl?: string;
  };
  preventiveMedicine: { [medicineId: string]: PreventiveMedicine };
  pregnancy: {
    isPregnant: boolean;
    pregnancyPercentage: number;
    estimatedReliefDate: string;
    ultrasoundDate: string;
    notes: string;
  };
}

export interface PreventiveMedicine {
  type: string;
  product: string;
  date: string;
  nextDose: string;
  lot: string;
  imageUrl?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreventiveConsultationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getTenantInfo(tenantId: string): Observable<TenantInfo> {
    return this.http.get<TenantInfo>(`${this.apiUrl}/public/tenant/${tenantId}`);
  }

  getPreventiveData(tenantId: string, patientId: string): Observable<PreventiveConsultationData> {
    return this.http.get<PreventiveConsultationData>(`${this.apiUrl}/public/preventiva/${tenantId}/${patientId}`);
  }
}
