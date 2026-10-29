import axios from "axios";
import type { AuthContext, AuthUser } from "@ederson-agencia/shared";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const TOKEN_KEYS: Record<AuthContext, string> = {
  agency: "ea_token_agency",
  academy: "ea_token_academy"
};
const LEGACY_TOKEN_KEY = "ea_token";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? ""
});

let agencyToken: string | null = localStorage.getItem(TOKEN_KEYS.agency);
let academyToken: string | null = localStorage.getItem(TOKEN_KEYS.academy);

let onUnauthorized: ((realm: AuthContext | "unknown") => void) | null = null;

export function migrateLegacyAuthToken(): void {
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy && !agencyToken) {
    agencyToken = legacy;
    localStorage.setItem(TOKEN_KEYS.agency, legacy);
  }
  if (legacy) localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function setUnauthorizedHandler(handler: (realm: AuthContext | "unknown") => void) {
  onUnauthorized = handler;
}

export function getStoredToken(context: AuthContext): string | null {
  return context === "agency" ? agencyToken : academyToken;
}

export function setAuthToken(context: AuthContext, token: string | null) {
  if (context === "agency") {
    agencyToken = token;
    if (token) localStorage.setItem(TOKEN_KEYS.agency, token);
    else localStorage.removeItem(TOKEN_KEYS.agency);
  } else {
    academyToken = token;
    if (token) localStorage.setItem(TOKEN_KEYS.academy, token);
    else localStorage.removeItem(TOKEN_KEYS.academy);
  }
}

function isAcademyApiPath(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return path.startsWith("/courses") || path.startsWith("/admin/courses");
}

function isAgencyApiPath(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return path.startsWith("/agency");
}

function tokenForRequest(url: string): string | null {
  if (isAgencyApiPath(url)) return agencyToken;
  if (isAcademyApiPath(url)) return academyToken ?? agencyToken;
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (pathname.startsWith("/academia")) return academyToken ?? agencyToken;
  if (pathname.startsWith("/agencia") || pathname === "/login") return agencyToken;
  return agencyToken ?? academyToken;
}

function realmForRequest(url: string): AuthContext | "unknown" {
  if (isAgencyApiPath(url)) return "agency";
  if (isAcademyApiPath(url)) return "academy";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (pathname.startsWith("/academia")) return "academy";
  if (pathname.startsWith("/agencia") || pathname === "/login") return "agency";
  return "unknown";
}

client.interceptors.request.use((config) => {
  const url = String(config.url ?? "");
  const token = tokenForRequest(url);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 500;
    const message = error.response?.data?.message ?? "Erro de comunicação com a API.";
    const path = String(error.config?.url ?? "");
    const isLoginAttempt = path.includes("/auth/login");
    if (status === 401 && onUnauthorized && !isLoginAttempt) {
      onUnauthorized(realmForRequest(path));
    }
    return Promise.reject(new ApiError(message, status));
  }
);

export async function fetchAuthMe(token: string): Promise<{ user: AuthUser; authContext?: AuthContext }> {
  const { data } = await client.get<{ user: AuthUser; authContext?: AuthContext }>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

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

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await client.put<T>(url, body);
  return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await client.delete<T>(url);
  return data;
}

export function apiAssetUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export type LoginResponse = {
  token: string;
  user: AuthUser;
  homePath: string;
  authContext?: AuthContext;
};
