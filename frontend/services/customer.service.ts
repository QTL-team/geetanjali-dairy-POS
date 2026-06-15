import api from '@/lib/api/axios';

export interface CustomerStats {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
  pendingAmount: number;
  lastOrderDate: string | null;
}

export interface CustomerDetails extends Omit<CustomerStats, 'totalOrders' | 'totalRevenue' | 'pendingAmount' | 'lastOrderDate'> {
  orders: {
    id: string;
    orderNumber: string;
    deliveryDate: string;
    status: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    invoice: {
      id: string;
      invoiceNumber: string;
      amount: number;
      paidAmount: number;
      balanceAmount: number;
      status: string;
      generatedAt: string;
      payments: {
        id: string;
        amount: number;
        method: string;
        paymentType: string;
        paidAt: string;
      }[];
    } | null;
    items: {
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      product: {
        id: string;
        name: string;
        unit: string;
      };
    }[];
  }[];
}

export async function getCustomers(): Promise<CustomerStats[]> {
  const { data } = await api.get('/customers');
  return data;
}

export async function getCustomerDetails(id: string): Promise<CustomerDetails> {
  const { data } = await api.get(`/customers/${id}`);
  return data;
}
