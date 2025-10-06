import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { compressImageForWeb, isValidImageFile, formatFileSize, CompressionResult } from '../../../utils/image-compression.utils';

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
  
  // Propiedades para manejo de imágenes
  selectedImage: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isCompressingImage = false;
  compressionStats: CompressionResult | null = null;

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
      medications: this.fb.array([]),
      imageUrl: ['']
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
          this.router.navigate(['/app/patients', this.patientId]);
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
      this.router.navigate(['/app/patients', this.patientId]);
    } else {
      this.router.navigate(['/app/patients']);
    }
  }

  // Métodos para manejo de imágenes
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar que sea una imagen
      if (!isValidImageFile(file)) {
        console.error('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP, GIF)');
        return;
      }

      // Validar tamaño (máximo 20MB)
      if (file.size > 20 * 1024 * 1024) {
        console.error('La imagen es demasiado grande. Máximo 20MB permitido.');
        return;
      }

      this.isCompressingImage = true;

      try {
        // Comprimir la imagen
        this.compressionStats = await compressImageForWeb(file);
        this.selectedImage = this.compressionStats.compressedFile;
        
        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result;
        };
        reader.readAsDataURL(this.selectedImage);
        
        console.log('Imagen comprimida:', {
          originalSize: formatFileSize(this.compressionStats.originalSize),
          compressedSize: formatFileSize(this.compressionStats.compressedSize),
          compressionRatio: this.compressionStats.compressionRatio + '%'
        });
        
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        this.selectedImage = null;
        this.imagePreviewUrl = null;
        this.compressionStats = null;
      } finally {
        this.isCompressingImage = false;
      }
    } else {
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      this.compressionStats = null;
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    this.compressionStats = null;
    const fileInput = document.getElementById('medicalRecordImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Método para formatear el tamaño de archivo (disponible en template)
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }
}