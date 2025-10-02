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
  
  // Propiedades calculadas para la gestación
  calculatedPregnancyPercentage = 0;
  pregnancyDays = 0;
  estimatedReliefDate = '';
  daysUntilRelief = 0;

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
        conceptionDate: [''],
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
      
      // Si no es hembra, asegurar que no hay datos de gestación
      if (formValue.basicInfo.sex !== 'hembra') {
        formValue.pregnancy = {
          isPregnant: false,
          conceptionDate: '',
          pregnancyPercentage: 0,
          estimatedReliefDate: '',
          ultrasoundDate: '',
          notes: ''
        };
      }
      
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
        formData.append('conceptionDate', formValue.pregnancy.conceptionDate);
        formData.append('pregnancyPercentage', formValue.pregnancy.pregnancyPercentage);
        formData.append('estimatedReliefDate', formValue.pregnancy.estimatedReliefDate);
        formData.append('ultrasoundDate', formValue.pregnancy.ultrasoundDate);
        formData.append('notes', formValue.pregnancy.notes);
        formData.append('image', this.selectedImage);

        this.patientService.createPatientWithImage(formData).subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.router.navigate(['/app/patients']);
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
            this.router.navigate(['/app/patients']);
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
    this.router.navigate(['/app/patients']);
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

  onSexChange(): void {
    const sex = this.patientForm.get('basicInfo.sex')?.value;
    const pregnancyGroup = this.patientForm.get('pregnancy');
    const conceptionDateControl = pregnancyGroup?.get('conceptionDate');
    
    // Si no es hembra, limpiar todos los datos de gestación
    if (sex !== 'hembra') {
      pregnancyGroup?.get('isPregnant')?.setValue(false);
      pregnancyGroup?.get('conceptionDate')?.setValue('');
      pregnancyGroup?.get('pregnancyPercentage')?.setValue(0);
      pregnancyGroup?.get('estimatedReliefDate')?.setValue('');
      pregnancyGroup?.get('ultrasoundDate')?.setValue('');
      pregnancyGroup?.get('notes')?.setValue('');
      this.resetPregnancyCalculations();
      
      // Quitar validación del campo de fecha de concepción
      conceptionDateControl?.clearValidators();
      conceptionDateControl?.updateValueAndValidity();
    }
  }

  onPregnancyChange(): void {
    const pregnancyGroup = this.patientForm.get('pregnancy');
    const isPregnant = pregnancyGroup?.get('isPregnant')?.value;
    const conceptionDateControl = pregnancyGroup?.get('conceptionDate');
    
    if (isPregnant) {
      // Si está preñada, hacer el campo de fecha de concepción requerido
      conceptionDateControl?.setValidators([Validators.required]);
    } else {
      // Si no está preñada, quitar la validación y limpiar campos
      conceptionDateControl?.clearValidators();
      pregnancyGroup?.get('conceptionDate')?.setValue('');
      pregnancyGroup?.get('pregnancyPercentage')?.setValue(0);
      pregnancyGroup?.get('estimatedReliefDate')?.setValue('');
      pregnancyGroup?.get('ultrasoundDate')?.setValue('');
      pregnancyGroup?.get('notes')?.setValue('');
      this.resetPregnancyCalculations();
    }
    
    // Actualizar la validación
    conceptionDateControl?.updateValueAndValidity();
  }

  onConceptionDateChange(): void {
    this.calculatePregnancyData();
  }

  private calculatePregnancyData(): void {
    const conceptionDate = this.patientForm.get('pregnancy.conceptionDate')?.value;
    
    if (!conceptionDate) {
      this.resetPregnancyCalculations();
      return;
    }

    const conception = new Date(conceptionDate);
    const today = new Date();
    
    // Calcular días de gestación
    const timeDiff = today.getTime() - conception.getTime();
    this.pregnancyDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Calcular porcentaje (gestación de caballos: ~340 días)
    const totalPregnancyDays = 340;
    this.calculatedPregnancyPercentage = Math.min(Math.max((this.pregnancyDays / totalPregnancyDays) * 100, 0), 100);
    
    // Calcular fecha estimada de parto (11 meses = ~330 días)
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330);
    this.estimatedReliefDate = estimatedRelief.toISOString().split('T')[0];
    
    // Calcular días restantes
    const reliefTimeDiff = estimatedRelief.getTime() - today.getTime();
    this.daysUntilRelief = Math.ceil(reliefTimeDiff / (1000 * 3600 * 24));
    
    // Actualizar el formulario con los valores calculados (porcentaje como entero)
    this.patientForm.get('pregnancy.pregnancyPercentage')?.setValue(Math.round(this.calculatedPregnancyPercentage));
    this.patientForm.get('pregnancy.estimatedReliefDate')?.setValue(this.estimatedReliefDate);
  }

  private resetPregnancyCalculations(): void {
    this.calculatedPregnancyPercentage = 0;
    this.pregnancyDays = 0;
    this.estimatedReliefDate = '';
    this.daysUntilRelief = 0;
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
