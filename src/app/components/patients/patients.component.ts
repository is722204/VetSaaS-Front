import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: { [patientId: string]: Patient } = {};
  patientsList: Patient[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.isLoading = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.patientsList = Object.values(patients);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
        this.isLoading = false;
      }
    });
  }

  get filteredPatients(): Patient[] {
    if (!this.searchTerm) {
      return this.patientsList;
    }
    
    return this.patientsList.filter(patient =>
      patient.basicInfo.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.basicInfo.patientId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.basicInfo.owner.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onPatientClick(patientId: string): void {
    this.router.navigate(['/patients', patientId]);
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

  getSexIcon(sex: string): string {
    return sex === 'macho' ? 'fas fa-mars' : 'fas fa-venus';
  }

  getSexColor(sex: string): string {
    return sex === 'macho' ? 'text-blue-600' : 'text-pink-600';
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x200?text=Caballo';
  }

  onNewPatientClick(): void {
    this.router.navigate(['/patients/new']);
  }
}
