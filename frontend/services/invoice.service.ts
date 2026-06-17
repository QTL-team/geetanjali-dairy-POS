import api from "../lib/api/axios";

export interface InvoiceCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface InvoiceOrderSummary {
  id: string;
  orderNumber: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID";
  generatedAt: string;
  order: InvoiceOrderSummary;
  customer: InvoiceCustomer;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: string;
  notes: string | null;
  paymentType: string;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID";
  generatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    customer: {
      id: string;
      name: string;
      phone: string;
      address: string | null;
    };
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      product: {
        id: string;
        name: string;
        gujaratiName: string | null;
        unit: string;
      };
    }>;
  };
  payments: InvoicePayment[];
}

export async function getInvoices(): Promise<InvoiceSummary[]> {
  const { data } = await api.get("/invoices");
  return data;
}

export async function getInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
}

export async function generateInvoice(orderId: string): Promise<{ id: string }> {
  const { data } = await api.post(`/invoices/order/${orderId}`);
  return data;
}

export async function recordPayment(
  invoiceId: string, 
  paymentData: { amount: number; method: string; notes?: string }
): Promise<unknown> {
  const { data } = await api.post(`/invoices/${invoiceId}/payment`, paymentData);
  return data;
}

export const downloadBillPdf = async (id: string, invoiceNumber: string): Promise<void> => {
  const response = await api.get(`/invoices/${id}/pdf`, {
    responseType: "blob",
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `Bill_${invoiceNumber}.pdf`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
