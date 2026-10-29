import axios from "axios";
import type { AuthContext, AuthUser } from "@ederson-agencia/shared";
import { notifySessionExpired } from "./auth/sessionNavigation.js";

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

/** Render/Vercel às vezes gravam só o host — sem https o browser não resolve a API. */
export function normalizeApiBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    return trimmed.replace(/\/$/, "");
  }
  return `https://${trimmed.replace(/\/$/, "")}`;
}

/** API pública em produção (Render) — fallback quando VITE_API_URL não foi definido no build. */
const DEFAULT_PUBLIC_API = "https://ederson-agencia-api.onrender.com";

function isLocalDevApi(url: string): boolean {
  return /^https?:\/\/(127\.0\.0\.1|localhost):3333\/?$/i.test(url);
}

function resolveApiBaseUrl(): string {
  const configured = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (import.meta.env.DEV) {
    // Sem VITE_API_URL → proxy do Vite (VITE_DEV_API_TARGET, padrão Render).
    // localhost:3333 sem Postgres local → 500; não usar como base no browser.
    if (!configured || isLocalDevApi(configured)) return "";
    return configured;
  }
  return configured || DEFAULT_PUBLIC_API;
}

const API_BASE_URL = resolveApiBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL
});

let agencyToken: string | null = localStorage.getItem(TOKEN_KEYS.agency);
let academyToken: string | null = localStorage.getItem(TOKEN_KEYS.academy);

export function migrateLegacyAuthToken(): void {
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy && !agencyToken) {
    agencyToken = legacy;
    localStorage.setItem(TOKEN_KEYS.agency, legacy);
  }
  if (legacy) localStorage.removeItem(LEGACY_TOKEN_KEY);
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
    const isAuthAttempt = path.includes("/auth/login") || path.includes("/auth/register");
    if (status === 401 && !isAuthAttempt && typeof window !== "undefined") {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      notifySessionExpired(realmForRequest(path), returnPath);
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

export async function apiUploadForm<T>(url: string, form: FormData): Promise<T> {
  const { data } = await client.post<T>(url, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
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
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized;
}

export type LoginResponse = {
  token: string;
  user: AuthUser;
  homePath: string;
  authContext?: AuthContext;
};
