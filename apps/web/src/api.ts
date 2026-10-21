import axios from "axios";
import type { AuthUser } from "@ederson-agencia/shared";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? ""
});

let authToken: string | null = localStorage.getItem("ea_token");
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("ea_token", token);
  else localStorage.removeItem("ea_token");
}

client.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 500;
    const message = error.response?.data?.message ?? "Erro de comunicação com a API.";
    if (status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(new ApiError(message, status));
  }
);

export async function apiGet<T>(url: string): Promise<T> {
  const { data } = await client.get<T>(url);
  return data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await client.post<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await client.patch<T>(url, body);
  return data;
}

export type LoginResponse = { token: string; user: AuthUser; homePath: string };
