import api from "../lib/api/axios";

export interface PaymentSummary {
  id: string;
  amount: number;
  paidAt: string;
  method: string;
  paymentType: string;
  notes: string | null;
  invoiceNumber: string;
  customerName: string;
}

export interface PaymentDetail {
  id: string;
  amount: number;
  paidAt: string;
  method: string;
  paymentType: string;
  notes: string | null;
  invoiceId: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    order: {
      id: string;
      orderNumber: string;
      customer: {
        id: string;
        name: string;
        phone: string;
      };
    };
  };
}

export async function getPayments(): Promise<PaymentSummary[]> {
  const { data } = await api.get("/payments");
  return data;
}

export async function getPayment(id: string): Promise<PaymentDetail> {
  const { data } = await api.get(`/payments/${id}`);
  return data;
}
