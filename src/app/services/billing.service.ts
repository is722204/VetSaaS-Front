import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Invoice, PaymentLink } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  constructor(private apiService: ApiService) { }

  getInvoices(): Observable<{ [invoiceId: string]: Invoice }> {
    return this.apiService.get<{ [invoiceId: string]: Invoice }>('/billing/invoices');
  }

  getInvoice(invoiceId: string): Observable<Invoice> {
    return this.apiService.get<Invoice>(`/billing/invoices/${invoiceId}`);
  }

  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.apiService.post<Invoice>('/billing/invoices', invoice);
  }

  updateInvoice(invoiceId: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.apiService.put<Invoice>(`/billing/invoices/${invoiceId}`, invoice);
  }

  deleteInvoice(invoiceId: string): Observable<void> {
    return this.apiService.delete<void>(`/billing/invoices/${invoiceId}`);
  }

  generatePaymentLink(invoiceId: string): Observable<PaymentLink> {
    return this.apiService.post<PaymentLink>(`/billing/invoices/${invoiceId}/payment-link`, {});
  }

  getPaymentLinks(): Observable<{ [linkId: string]: PaymentLink }> {
    return this.apiService.get<{ [linkId: string]: PaymentLink }>('/billing/payment-links');
  }

  generateInvoicePDF(invoiceId: string): Observable<{ pdfUrl: string }> {
    return this.apiService.post<{ pdfUrl: string }>(`/billing/invoices/${invoiceId}/pdf`, {});
  }

  getDashboardStats(): Observable<{
    totalPatients: number;
    totalRevenue: number;
    weeklyAppointments: number;
  }> {
    return this.apiService.get('/dashboard/stats');
  }
}