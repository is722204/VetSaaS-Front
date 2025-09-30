import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  isLoading = true;
  activeTab = 'medical-history';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadPatient(patientId);
    }
  }

  private loadPatient(patientId: string): void {
    this.isLoading = true;
    this.patientService.getPatient(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando paciente:', error);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  getPatientAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} años`;
    }
    
    return `${age} años`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getMedicalHistoryArray(): any[] {
    if (!this.patient?.medicalHistory) return [];
    return Object.entries(this.patient.medicalHistory).map(([id, record]) => ({
      id,
      ...record
    }));
  }

  getPreventiveMedicineArray(): any[] {
    if (!this.patient?.preventiveMedicine) return [];
    return Object.entries(this.patient.preventiveMedicine).map(([id, medicine]) => ({
      id,
      ...medicine
    }));
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x300?text=Caballo';
  }

  onEditClick(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.router.navigate(['/patients', patientId, 'edit']);
    }
  }
}
