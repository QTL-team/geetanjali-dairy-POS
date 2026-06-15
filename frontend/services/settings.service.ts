import api from "@/lib/api/axios";

export const getBusinessSettings = async () => {
  const response = await api.get("/settings/business");
  return response.data;
};

export const updateBusinessSettings = async (data: any) => {
  const response = await api.patch("/settings/business", data);
  return response.data;
};
