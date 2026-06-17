import api from "@/lib/api/axios";

export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface TopProduct {
  name: string;
  totalSold: number;
}

export interface SalesReport {
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
}

export interface OutstandingBalance {
  customerId: string;
  customerName: string;
  phone: string | null;
  pendingAmount: number;
}

export const getSalesReport = async (startDate?: string, endDate?: string): Promise<SalesReport> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get(`/reports/sales${query}`);
  return response.data;
};

export const getOutstandingBalancesReport = async (): Promise<OutstandingBalance[]> => {
  const response = await api.get('/reports/outstanding');
  return response.data;
};

export interface ReturnMetrics {
  totalReturnedQty: number;
  totalReturnValue: number;
  topReturnedProducts: { name: string; totalReturned: number }[];
  customerWiseReturns: { name: string; totalReturned: number }[];
  totalReturnedStockValue: number;
}

export const getReturnMetrics = async (startDate?: string, endDate?: string): Promise<ReturnMetrics> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get(`/reports/returns${query}`);
  return response.data;
};
