import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-medical-record-form',
  templateUrl: './medical-record-form.component.html',
  styleUrls: ['./medical-record-form.component.css']
})
export class MedicalRecordFormComponent implements OnInit {
  medicalRecordForm!: FormGroup;
  isLoading = false;
  patientId: string | null = null;
  patientName: string = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    this.medicalRecordForm = this.createForm();
    
    if (this.patientId) {
      this.loadPatientInfo();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      diagnosis: ['', [Validators.required, Validators.minLength(5)]],
      treatment: ['', [Validators.required, Validators.minLength(5)]],
      veterinarian: ['', [Validators.required, Validators.minLength(2)]],
      notes: [''],
      followUpDate: [''],
      medications: this.fb.array([])
    });
  }

  private loadPatientInfo(): void {
    if (this.patientId) {
      this.patientService.getPatient(this.patientId).subscribe({
        next: (patient) => {
          this.patientName = patient.basicInfo.name;
        },
        error: (error) => {
          console.error('Error cargando información del paciente:', error);
        }
      });
    }
  }

  getFieldError(controlName: string): string | null {
    const control = this.medicalRecordForm.get(controlName);
    if (control?.invalid && (control?.touched || control?.dirty)) {
      if (control?.errors?.['required']) {
        return 'Este campo es requerido.';
      }
      if (control?.errors?.['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.medicalRecordForm.valid && this.patientId) {
      this.isLoading = true;
      
      const medicalRecordData = {
        ...this.medicalRecordForm.value,
        createdAt: new Date().toISOString()
      };

      this.patientService.addMedicalRecord(this.patientId, medicalRecordData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/patients', this.patientId]);
        },
        error: (error) => {
          console.error('Error agregando registro médico:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.medicalRecordForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.patientId) {
      this.router.navigate(['/patients', this.patientId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }
}