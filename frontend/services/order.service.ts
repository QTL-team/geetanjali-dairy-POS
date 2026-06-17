import api from "@/lib/api/axios";
import { Product } from "./product.service";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  returnedQuantity?: number;
  billedQuantity?: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  orderItemId: string;
  returnedQuantity: number;
  remarks?: string;
  createdAt: string;
  orderItem?: OrderItem;
}

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export interface Order {
  id: string;
  orderNumber: string;
  contactNumber: string;
  deliveryAddress?: string;
  deliveryDate: string;
  notes?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  workerSlipPrinted?: boolean;
  deliverySlipPrinted?: boolean;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
  };
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderPayload {
  customerName: string;
  contactNumber: string;
  deliveryAddress?: string;
  deliveryDate: string;
  notes?: string;
  items: CreateOrderItemPayload[];
}

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: CreateOrderPayload): Promise<Order> => {
  const response = await api.post("/orders", data);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export const recordOrderPayment = async (id: string, amount: number, method: string, notes?: string): Promise<Order> => {
  const response = await api.post(`/orders/${id}/payment`, { amount, method, notes });
  return response.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/cancel`);
  return response.data;
};

export interface RecordReturnPayload {
  orderItemId: string;
  returnedQuantity: number;
  remarks?: string;
}

export const getOrderReturns = async (orderId: string): Promise<OrderReturn[]> => {
  const response = await api.get(`/orders/${orderId}/returns`);
  return response.data;
};

export const recordOrderReturn = async (orderId: string, payload: RecordReturnPayload): Promise<OrderReturn> => {
  const response = await api.post(`/orders/${orderId}/returns`, payload);
  return response.data;
};

export const getDeliveryMessage = async (id: string): Promise<{ phone: string; message: string; whatsappUrl: string }> => {
  const response = await api.get(`/orders/${id}/delivery-message`);
  return response.data;
};

export const downloadWorkerSlip = async (id: string, orderNumber: string): Promise<void> => {
  const response = await api.get(`/orders/${id}/worker-slip/pdf`, {
    responseType: "blob",
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `WorkerSlip_${orderNumber}.pdf`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const getDeliverySlip = async (id: string) => {
  const response = await api.get(`/orders/${id}/delivery-slip`);
  return response.data;
};

export const downloadDeliverySlipPdf = async (id: string, orderNumber: string): Promise<void> => {
  const response = await api.get(`/orders/${id}/delivery-slip/pdf`, {
    responseType: "blob",
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `DeliverySlip_${orderNumber}.pdf`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
