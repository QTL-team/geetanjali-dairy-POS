import api from "@/lib/api/axios";

export type UnitType = "KG" | "LITER" | "PIECE";

export interface Product {
  id: string;
  name: string;
  gujaratiName: string | null;
  description: string | null;
  unit: UnitType;
  sellingPrice: number;
  availableStock: number;
  reservedStock: number;
  returnedStock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  gujaratiName?: string;
  description?: string;
  unit: UnitType;
  sellingPrice: number;
  availableStock?: number;
  lowStockThreshold?: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products");
  return response.data;
};

export const createProduct = async (data: CreateProductPayload): Promise<Product> => {
  const response = await api.post("/products", data);
  return response.data;
};
