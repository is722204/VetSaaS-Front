import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-preventive-medicine-modal',
  templateUrl: './preventive-medicine-modal.component.html',
  styleUrls: ['./preventive-medicine-modal.component.css']
})
export class PreventiveMedicineModalComponent implements OnInit {
  @Input() patientId: string = '';
  @Input() patientName: string = '';
  @Output() close = new EventEmitter<void>();

  medicineForm!: FormGroup;
  isLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.medicineForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      date: ['', Validators.required],
      nextDose: ['', Validators.required],
      lot: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
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
    if (this.medicineForm.valid) {
      this.isLoading = true;
      
      const formData = new FormData();
      formData.append('type', this.medicineForm.get('type')?.value);
      formData.append('date', this.medicineForm.get('date')?.value);
      formData.append('nextDose', this.medicineForm.get('nextDose')?.value);
      formData.append('lot', this.medicineForm.get('lot')?.value);
      
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this.patientService.addPreventiveMedicine(this.patientId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.close.emit();
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
    this.close.emit();
  }
}