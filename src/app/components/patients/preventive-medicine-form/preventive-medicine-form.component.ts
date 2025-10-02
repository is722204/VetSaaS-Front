import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-preventive-medicine-form',
  templateUrl: './preventive-medicine-form.component.html',
  styleUrls: ['./preventive-medicine-form.component.css']
})
export class PreventiveMedicineFormComponent implements OnInit {
  medicineForm!: FormGroup;
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
    this.medicineForm = this.createForm();
    
    if (this.patientId) {
      this.loadPatientInfo();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      dosage: ['', [Validators.required, Validators.minLength(2)]],
      frequency: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      veterinarian: ['', [Validators.required, Validators.minLength(2)]],
      notes: [''],
      nextDoseDate: [''],
      isActive: [true]
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
    const control = this.medicineForm.get(controlName);
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
    if (this.medicineForm.valid && this.patientId) {
      this.isLoading = true;
      
      const medicineData = {
        ...this.medicineForm.value,
        createdAt: new Date().toISOString()
      };

      this.patientService.addPreventiveMedicine(this.patientId, medicineData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/app/patients', this.patientId]);
        },
        error: (error) => {
          console.error('Error agregando medicina preventiva:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.medicineForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.patientId) {
      this.router.navigate(['/app/patients', this.patientId]);
    } else {
      this.router.navigate(['/app/patients']);
    }
  }
}