import api from "@/lib/api/axios";

export interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
  tomorrowDeliveries: number;
  pendingInvoices: number;
  lowStockProducts: any[]; // Adjust this when Product type is available
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboard");
  return response.data;
};
