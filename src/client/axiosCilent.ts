import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    accept: "*/*",
  },
});

// List of endpoints to exclude from auth
const authExcludedEndpoints = [
  "/authenticate/verify",
  "/authenticate/token",
  "/authenticate/authorize",
  // "/accounts/register",
];

// Helper to check if the request should be excluded
function isAuthExcluded(url: string = "") {
  return authExcludedEndpoints.some((endpoint) => url.includes(endpoint));
}

// Request interceptor
apiClient.interceptors.request.use((config) => {
  if (!isAuthExcluded(config.url || "")) {
    const userDetails = localStorage.getItem("cine-user-details");
    let accessToken: string | null = null;
    try {
      accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
    } catch {
      accessToken = null;
    }
    if (accessToken) {
      if (config.headers) {
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
      }
    }
  }
  return config;
});

export default apiClient;

export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.get<T>(url, config);
};

export const post = async <T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  // Only set Content-Type for non-FormData
  if (!(data instanceof FormData)) {
    config = {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "application/json",
      },
    };
  }
  return apiClient.post<T>(url, data, config);
};

export const put = async <T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.put<T>(url, data, config);
};

export const remove = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.delete<T>(url, config);
};
