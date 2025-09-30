import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  selectedImage: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {}

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

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.patientForm.value;
      
      // Si hay imagen, usar FormData
      if (this.selectedImage) {
        const formData = new FormData();
        formData.append('name', formValue.basicInfo.name);
        formData.append('patientId', formValue.basicInfo.patientId);
        formData.append('birthDate', formValue.basicInfo.birthDate);
        formData.append('sex', formValue.basicInfo.sex);
        formData.append('color', formValue.basicInfo.color);
        formData.append('breed', formValue.basicInfo.breed);
        formData.append('ownerName', formValue.basicInfo.owner.name);
        formData.append('ownerPhone', formValue.basicInfo.owner.phone);
        formData.append('ownerEmail', formValue.basicInfo.owner.email);
        formData.append('isPregnant', formValue.pregnancy.isPregnant);
        formData.append('pregnancyPercentage', formValue.pregnancy.pregnancyPercentage);
        formData.append('estimatedReliefDate', formValue.pregnancy.estimatedReliefDate);
        formData.append('ultrasoundDate', formValue.pregnancy.ultrasoundDate);
        formData.append('notes', formValue.pregnancy.notes);
        formData.append('image', this.selectedImage);

        this.patientService.createPatientWithImage(formData).subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.router.navigate(['/patients']);
          },
          error: (error: any) => {
            this.isSubmitting = false;
            this.errorMessage = 'Error al crear el paciente. Por favor, inténtalo de nuevo.';
            console.error('Error creando paciente:', error);
          }
        });
      } else {
        // Sin imagen, usar JSON normal
        const patientData: Partial<Patient> = {
          basicInfo: {
            ...formValue.basicInfo,
            createdAt: new Date().toISOString()
          },
          medicalHistory: {},
          preventiveMedicine: {},
          pregnancy: formValue.pregnancy
        };

        this.patientService.createPatient(patientData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.errorMessage = 'Error al crear el paciente. Por favor, inténtalo de nuevo.';
            console.error('Error creando paciente:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedImage);
    } else {
      this.selectedImage = null;
      this.imagePreviewUrl = null;
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    const fileInput = document.getElementById('patientImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
