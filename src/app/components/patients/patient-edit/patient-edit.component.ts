import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-edit',
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.css']
})
export class PatientEditComponent implements OnInit {
  patientForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  patientId: string = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') || '';
    if (this.patientId) {
      this.loadPatient();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        patientId: ['', [Validators.required, Validators.minLength(3)]],
        birthDate: ['', Validators.required],
        sex: ['', Validators.required],
        color: ['', [Validators.required, Validators.minLength(2)]],
        breed: ['', [Validators.required, Validators.minLength(2)]],
        photoUrl: [''],
        owner: this.fb.group({
          name: ['', [Validators.required, Validators.minLength(2)]],
          phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
          email: ['', [Validators.required, Validators.email]]
        })
      }),
      pregnancy: this.fb.group({
        isPregnant: [false],
        pregnancyPercentage: [0, [Validators.min(0), Validators.max(100)]],
        estimatedReliefDate: [''],
        ultrasoundDate: [''],
        notes: ['']
      })
    });
  }

  private loadPatient(): void {
    this.isLoading = true;
    this.patientService.getPatient(this.patientId).subscribe({
      next: (patient) => {
        this.populateForm(patient);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando paciente:', error);
        this.errorMessage = 'Error al cargar el paciente. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  private populateForm(patient: Patient): void {
    this.patientForm.patchValue({
      basicInfo: {
        name: patient.basicInfo.name,
        patientId: patient.basicInfo.patientId,
        birthDate: patient.basicInfo.birthDate,
        sex: patient.basicInfo.sex,
        color: patient.basicInfo.color,
        breed: patient.basicInfo.breed,
        photoUrl: patient.basicInfo.photoUrl,
        owner: {
          name: patient.basicInfo.owner.name,
          phone: patient.basicInfo.owner.phone,
          email: patient.basicInfo.owner.email
        }
      },
      pregnancy: {
        isPregnant: patient.pregnancy?.isPregnant || false,
        pregnancyPercentage: patient.pregnancy?.pregnancyPercentage || 0,
        estimatedReliefDate: patient.pregnancy?.estimatedReliefDate || '',
        ultrasoundDate: patient.pregnancy?.ultrasoundDate || '',
        notes: patient.pregnancy?.notes || ''
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.patientForm.value;
      
      // Preparar los datos del paciente para actualización
      const patientData: Partial<Patient> = {
        basicInfo: {
          ...formValue.basicInfo,
          createdAt: this.patientForm.get('basicInfo.createdAt')?.value || new Date().toISOString()
        },
        medicalHistory: this.patientForm.get('medicalHistory')?.value || {},
        preventiveMedicine: this.patientForm.get('preventiveMedicine')?.value || {},
        pregnancy: formValue.pregnancy
      };

      this.patientService.updatePatient(this.patientId, patientData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.router.navigate(['/patients', this.patientId]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Error al actualizar el paciente. Por favor, inténtalo de nuevo.';
          console.error('Error actualizando paciente:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients', this.patientId]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFieldError(fieldPath: string): string {
    const field = this.patientForm.get(fieldPath);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'Formato de email inválido';
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  onPregnancyChange(): void {
    const pregnancyGroup = this.patientForm.get('pregnancy');
    const isPregnant = pregnancyGroup?.get('isPregnant')?.value;
    
    if (!isPregnant) {
      pregnancyGroup?.get('pregnancyPercentage')?.setValue(0);
      pregnancyGroup?.get('estimatedReliefDate')?.setValue('');
      pregnancyGroup?.get('ultrasoundDate')?.setValue('');
      pregnancyGroup?.get('notes')?.setValue('');
    }
  }
}
