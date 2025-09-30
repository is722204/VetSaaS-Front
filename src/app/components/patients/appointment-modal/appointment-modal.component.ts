import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.css']
})
export class AppointmentModalComponent implements OnInit {
  @Input() patientId: string = '';
  @Input() patientName: string = '';
  @Output() close = new EventEmitter<void>();

  appointmentForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  getFieldError(controlName: string): string | null {
    const control = this.appointmentForm.get(controlName);
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
    if (this.appointmentForm.valid) {
      this.isLoading = true;
      
      const appointmentData = {
        ...this.appointmentForm.value,
        createdAt: new Date().toISOString()
      };

      this.patientService.addAppointment(this.patientId, appointmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.close.emit();
        },
        error: (error) => {
          console.error('Error programando cita:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.appointmentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}