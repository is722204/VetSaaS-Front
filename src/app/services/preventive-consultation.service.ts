import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  image?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreventiveConsultationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getPreventiveData(tenantId: string, patientId: string): Observable<PreventiveConsultationData> {
    return this.http.get<PreventiveConsultationData>(`${this.apiUrl}/public/preventiva/${tenantId}/${patientId}`);
  }
}
