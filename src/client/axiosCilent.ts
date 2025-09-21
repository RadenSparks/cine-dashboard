
import axios, { type AxiosResponse } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "*/*",
  },
});

export default apiClient;

export const get = async <T>(url: string): Promise<AxiosResponse<T>> => {
  return apiClient.get<T>(url);
};

export const post = async <T>(url: string, data: unknown): Promise<AxiosResponse<T>> => {
  return apiClient.post<T>(url, data);
};

export const put = async <T>(url: string, data: unknown): Promise<AxiosResponse<T>> => {
  return apiClient.put<T>(url, data);
};

export const remove = async <T>(url: string): Promise<AxiosResponse<T>> => {
  return apiClient.delete<T>(url);
};
