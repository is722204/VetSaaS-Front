import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { compressImageForWeb, isValidImageFile, formatFileSize, CompressionResult } from '../../../utils/image-compression.utils';

@Component({
  selector: 'app-medical-record-modal',
  templateUrl: './medical-record-modal.component.html',
  styleUrls: ['./medical-record-modal.component.css']
})
export class MedicalRecordModalComponent implements OnInit {
  @Input() patientId: string = '';
  @Input() patientName: string = '';
  @Output() close = new EventEmitter<void>();

  medicalRecordForm!: FormGroup;
  isLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isCompressingImage = false;
  compressionStats: CompressionResult | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.medicalRecordForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  async onImageSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
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
        
        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target?.result as string;
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
        this.imagePreview = null;
        this.compressionStats = null;
      } finally {
        this.isCompressingImage = false;
      }
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.compressionStats = null;
  }

  // Método para formatear el tamaño de archivo (disponible en template)
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
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
    if (this.medicalRecordForm.valid) {
      this.isLoading = true;
      
      const formData = new FormData();
      formData.append('date', this.medicalRecordForm.get('date')?.value);
      formData.append('description', this.medicalRecordForm.get('description')?.value);
      
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this.patientService.addMedicalRecord(this.patientId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.close.emit();
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
    this.close.emit();
  }
}