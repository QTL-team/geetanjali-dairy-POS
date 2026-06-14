import api from "@/lib/api/axios";
import { Product } from "./product.service";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  contactNumber: string;
  deliveryAddress?: string;
  deliveryDate: string;
  notes?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
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

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/cancel`);
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
