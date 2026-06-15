import api from "@/lib/api/axios";

export const login = async (
  email: string,
  password: string,
) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    },
  );

  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await api.patch("/auth/change-password", data);
  return response.data;
};