// ─── ShadowDrive AI — Backend API Client ───
// HTTP client for communicating with the standalone backend.
// Used by the Next.js frontend to replace direct API route calls.

import { TOKEN_KEY, API_ROUTES } from '../packages/shared/src/constants';
import type {
  Scenario,
  AuthResponse,
  User,
  GenerateRequest,
  LoginRequest,
  RegisterRequest,
  ProgressRecord,
  FavoriteRecord,
  CourseRecord,
  LessonRecord,
} from '../packages/shared/src/types';

// ─── Base URL ───
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Token Management ───

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP Helper ───

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Auth API ───

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>(API_ROUTES.AUTH_REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>(API_ROUTES.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>(API_ROUTES.AUTH_ME);
}

export function logout(): void {
  clearToken();
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── Generate API ───

export async function generateScenario(data: GenerateRequest): Promise<Scenario> {
  return apiFetch<Scenario>(API_ROUTES.GENERATE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Progress API ───

export async function getProgress(): Promise<{ data: ProgressRecord[] }> {
  return apiFetch<{ data: ProgressRecord[] }>(API_ROUTES.PROGRESS);
}

export async function saveProgress(lessonId: number, completed: boolean): Promise<{ data: ProgressRecord }> {
  return apiFetch<{ data: ProgressRecord }>(API_ROUTES.PROGRESS, {
    method: 'POST',
    body: JSON.stringify({ lessonId, completed }),
  });
}

// ─── Favorites API ───

export async function getFavorites(): Promise<{ data: FavoriteRecord[] }> {
  return apiFetch<{ data: FavoriteRecord[] }>(API_ROUTES.FAVORITES);
}

export async function toggleFavorite(type: 'course' | 'scenario', targetId: number): Promise<{ data: FavoriteRecord | null; removed: boolean }> {
  return apiFetch<{ data: FavoriteRecord | null; removed: boolean }>(API_ROUTES.FAVORITES, {
    method: 'POST',
    body: JSON.stringify({ type, targetId }),
  });
}

// ─── Courses API ───

export async function getCourses(): Promise<{ data: CourseRecord[] }> {
  return apiFetch<{ data: CourseRecord[] }>(API_ROUTES.COURSES);
}

export async function getCourse(id: number): Promise<{ data: CourseRecord & { lessons: LessonRecord[]; progress: Record<number, boolean> } }> {
  return apiFetch<{ data: CourseRecord & { lessons: LessonRecord[]; progress: Record<number, boolean> } }>(`${API_ROUTES.COURSES}/${id}`);
}

// ─── Health API ───

export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(API_ROUTES.HEALTH);
}
