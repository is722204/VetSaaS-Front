import { Component, OnInit } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { Invoice, PaymentLink } from '../../models/billing.model';
import { Patient } from '../../models/patient.model';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  invoices: { [invoiceId: string]: Invoice } = {};
  invoicesList: Invoice[] = [];
  patients: { [patientId: string]: Patient } = {};
  paymentLinks: { [linkId: string]: PaymentLink } = {};
  
  // Helper methods for template
  getPatientsArray(): Patient[] {
    return Object.values(this.patients);
  }
  
  getPaymentLinksArray(): PaymentLink[] {
    return Object.values(this.paymentLinks);
  }
  
  getPaymentLinksKeys(): string[] {
    return Object.keys(this.paymentLinks);
  }
  
  isLoading = true;
  activeTab = 'pos';
  
  // POS Form
  selectedPatient: Patient | null = null;
  invoiceItems: InvoiceItem[] = [];
  newItem: InvoiceItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  };

  constructor(
    private billingService: BillingService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Cargar facturas
    this.billingService.getInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.invoicesList = Object.values(invoices);
      },
      error: (error) => {
        console.error('Error cargando facturas:', error);
      }
    });

    // Cargar pacientes
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
      }
    });

    // Cargar links de pago
    this.billingService.getPaymentLinks().subscribe({
      next: (links) => {
        this.paymentLinks = links;
      },
      error: (error) => {
        console.error('Error cargando links de pago:', error);
      }
    });

    this.isLoading = false;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // POS Methods
  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
  }

  addItem(): void {
    if (this.newItem.description && this.newItem.unitPrice > 0) {
      this.newItem.total = this.newItem.quantity * this.newItem.unitPrice;
      this.invoiceItems.push({ ...this.newItem });
      this.newItem = {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      };
    }
  }

  removeItem(index: number): void {
    this.invoiceItems.splice(index, 1);
  }

  getSubtotal(): number {
    return this.invoiceItems.reduce((sum, item) => sum + item.total, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.16; // 16% IVA
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  createInvoice(): void {
    if (!this.selectedPatient || this.invoiceItems.length === 0) {
      return;
    }

    const invoice: Partial<Invoice> = {
      patientId: this.selectedPatient.basicInfo.patientId,
      ownerId: this.selectedPatient.basicInfo.owner.name,
      items: this.invoiceItems,
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      total: this.getTotal(),
      status: 'pending',
      paymentMethod: 'cash'
    };

    this.billingService.createInvoice(invoice).subscribe({
      next: (createdInvoice) => {
        console.log('Factura creada:', createdInvoice);
        this.resetPOS();
        this.loadData(); // Recargar datos
      },
      error: (error) => {
        console.error('Error creando factura:', error);
      }
    });
  }

  generatePaymentLink(invoiceId: string): void {
    this.billingService.generatePaymentLink(invoiceId).subscribe({
      next: (link) => {
        console.log('Link de pago generado:', link);
        this.loadData(); // Recargar datos
      },
      error: (error) => {
        console.error('Error generando link de pago:', error);
      }
    });
  }

  generatePDF(invoiceId: string): void {
    this.billingService.generateInvoicePDF(invoiceId).subscribe({
      next: (result) => {
        console.log('PDF generado:', result.pdfUrl);
        window.open(result.pdfUrl, '_blank');
      },
      error: (error) => {
        console.error('Error generando PDF:', error);
      }
    });
  }

  resetPOS(): void {
    this.selectedPatient = null;
    this.invoiceItems = [];
    this.newItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }
}
