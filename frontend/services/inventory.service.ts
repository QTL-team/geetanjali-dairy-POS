import api from "@/lib/api/axios";

export interface InventorySummary {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface InventoryHistory {
  id: string;
  productId: string;
  quantity: number;
  type: 'ADD' | 'RESERVE' | 'RETURN' | 'ADJUSTMENT';
  remarks?: string;
  createdAt: string;
}

export const getInventorySummary = async (): Promise<InventorySummary[]> => {
  const response = await api.get("/inventory/summary");
  return response.data;
};

export const addStock = async (id: string, quantity: number, remarks?: string): Promise<any> => {
  const response = await api.post(`/inventory/add-stock/${id}`, { quantity, remarks });
  return response.data;
};

export const reserveStock = async (id: string, quantity: number, remarks?: string): Promise<any> => {
  const response = await api.post(`/inventory/reserve-stock/${id}`, { quantity, remarks });
  return response.data;
};

export const returnStock = async (id: string, quantity: number, remarks?: string): Promise<any> => {
  const response = await api.post(`/inventory/return-stock/${id}`, { quantity, remarks });
  return response.data;
};

export const getInventoryHistory = async (id: string): Promise<InventoryHistory[]> => {
  const response = await api.get(`/inventory/history/${id}`);
  return response.data;
};
