
import api from "../lib/api/axios";
export interface ProductionProduct {
  productId: string;
  name: string;
  gujaratiName: string | null;
  quantity: number;
  unit: string;
  currentStock: number;
  remainingAfterProduction: number;
  status: "READY" | "LOW_STOCK";
}

export interface LowStockWarning {
  productId: string;
  name: string;
  gujaratiName: string | null;
  required: number;
  available: number;
  shortage: number;
  unit: string;
}

export interface ProductionPlan {
  date: string;
  totalOrders: number;
  estimatedRevenue: number;
  lowStockWarnings: LowStockWarning[];
  products: ProductionProduct[];
}

export async function getProductionPlan(): Promise<ProductionPlan> {
  const { data } = await api.get("/production/tomorrow");
  return data;
}
