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
  viewMode: 'cards' | 'table' = 'cards';
  selectedSex = '';
  selectedPregnancyStatus = '';

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
    let filtered = this.patientsList;

    // Filtro por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(patient =>
        patient.basicInfo.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.basicInfo.patientId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.basicInfo.owner.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.basicInfo.breed.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtro por sexo
    if (this.selectedSex) {
      filtered = filtered.filter(patient => patient.basicInfo.sex === this.selectedSex);
    }

    // Filtro por estado de gestación
    if (this.selectedPregnancyStatus) {
      if (this.selectedPregnancyStatus === 'pregnant') {
        filtered = filtered.filter(patient => patient.pregnancy?.isPregnant === true);
      } else if (this.selectedPregnancyStatus === 'not-pregnant') {
        filtered = filtered.filter(patient => !patient.pregnancy?.isPregnant);
      }
    }

    return filtered;
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

  onEditPatient(patientId: string): void {
    this.router.navigate(['/patients', patientId, 'edit']);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSex = '';
    this.selectedPregnancyStatus = '';
  }

  // Métodos de estadísticas
  getMaleCount(): number {
    return this.patientsList.filter(patient => patient.basicInfo.sex === 'macho').length;
  }

  getFemaleCount(): number {
    return this.patientsList.filter(patient => patient.basicInfo.sex === 'hembra').length;
  }

  getPregnantCount(): number {
    return this.patientsList.filter(patient => patient.pregnancy?.isPregnant === true).length;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Métodos de porcentajes para las estadísticas
  getMalePercentage(): number {
    if (this.patientsList.length === 0) return 0;
    return Math.round((this.getMaleCount() / this.patientsList.length) * 100);
  }

  getFemalePercentage(): number {
    if (this.patientsList.length === 0) return 0;
    return Math.round((this.getFemaleCount() / this.patientsList.length) * 100);
  }

  getPregnantPercentage(): number {
    const femaleCount = this.getFemaleCount();
    if (femaleCount === 0) return 0;
    return Math.round((this.getPregnantCount() / femaleCount) * 100);
  }
}
