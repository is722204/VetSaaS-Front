import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
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
    this.appointmentForm = this.createForm();
    
    if (this.patientId) {
      this.loadPatientInfo();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      type: ['', Validators.required],
      veterinarian: ['', [Validators.required, Validators.minLength(2)]],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      notes: [''],
      status: ['scheduled'],
      duration: ['60'],
      location: [''],
      priority: ['normal']
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
    if (this.appointmentForm.valid && this.patientId) {
      this.isLoading = true;
      
      const appointmentData = {
        ...this.appointmentForm.value,
        createdAt: new Date().toISOString()
      };

      this.patientService.addAppointment(this.patientId, appointmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/app/patients', this.patientId]);
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
    if (this.patientId) {
      this.router.navigate(['/app/patients', this.patientId]);
    } else {
      this.router.navigate(['/app/patients']);
    }
  }
}