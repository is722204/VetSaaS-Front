export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  invoiceNumber: string;
  patientId: string;
  ownerId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'transfer';
  paymentLink: string;
  pdfUrl: string;
}

export interface PaymentLink {
  amount: number;
  description: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
}
