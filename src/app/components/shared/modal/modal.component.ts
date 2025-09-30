import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  modalData: ModalData | null = null;
  private subscription: Subscription = new Subscription();
  private startY = 0;
  private currentY = 0;
  private isDragging = false;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modal$.subscribe(modal => {
      this.isOpen = modal.isOpen;
      this.modalData = modal.data || null;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeModal(): void {
    this.modalService.closeModal();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onHandleTouchStart(event: TouchEvent): void {
    this.startY = event.touches[0].clientY;
    this.isDragging = true;
  }

  onHandleTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.currentY = event.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    
    if (deltaY > 0) {
      // Solo permitir arrastrar hacia abajo
      const modalElement = event.currentTarget as HTMLElement;
      const modalContent = modalElement.closest('.relative.bg-white.rounded-t-2xl');
      if (modalContent) {
        (modalContent as HTMLElement).style.transform = `translateY(${Math.min(deltaY, 100)}px)`;
      }
    }
  }

  onHandleTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    const deltaY = this.currentY - this.startY;
    
    if (deltaY > 100) {
      // Si se arrastró más de 100px hacia abajo, cerrar el modal
      this.closeModal();
    } else {
      // Si no, regresar a la posición original
      const modalElement = event.currentTarget as HTMLElement;
      const modalContent = modalElement.closest('.relative.bg-white.rounded-t-2xl');
      if (modalContent) {
        (modalContent as HTMLElement).style.transform = 'translateY(0)';
      }
    }
    
    this.isDragging = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onDayAppointmentClick(appointment: any): void {
    // Cerrar el modal de citas del día y abrir el modal de detalles de la cita específica
    this.closeModal();
    this.modalService.openModal('appointment-detail', '', '', appointment);
  }
}