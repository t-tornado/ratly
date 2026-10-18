import { apiClient } from "./client";
import type { UserRow, DashboardStats } from "@ratly/core";

interface DashboardResponse {
  stats: DashboardStats;
  rows: UserRow[];
}

async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>("/admin/dashboard");
  return data;
}

async function resetWindow(userId: string): Promise<UserRow> {
  const { data } = await apiClient.post<UserRow>(`/admin/users/${encodeURIComponent(userId)}/reset`);
  return data;
}

async function adjustLimit(userId: string, limit: number): Promise<UserRow> {
  const { data } = await apiClient.put<UserRow>(`/admin/users/${encodeURIComponent(userId)}/limit`, { limit });
  return data;
}

async function resetLimitToDefault(userId: string): Promise<UserRow> {
  const { data } = await apiClient.delete<UserRow>(`/admin/users/${encodeURIComponent(userId)}/limit`);
  return data;
}

async function addExtra(userId: string, amount: number): Promise<UserRow> {
  const { data } = await apiClient.post<UserRow>(`/admin/users/${encodeURIComponent(userId)}/extra`, { amount });
  return data;
}

async function pauseUser(userId: string, seconds: number): Promise<UserRow> {
  const { data } = await apiClient.post<UserRow>(`/admin/users/${encodeURIComponent(userId)}/pause`, { seconds });
  return data;
}

async function unlockUser(userId: string): Promise<UserRow> {
  const { data } = await apiClient.delete<UserRow>(`/admin/users/${encodeURIComponent(userId)}/pause`);
  return data;
}

async function fetchUser(userId: string): Promise<UserRow> {
  const { data } = await apiClient.get<UserRow>(`/admin/users/${encodeURIComponent(userId)}`);
  return data;
}

export { fetchDashboard, fetchUser, resetWindow, adjustLimit, resetLimitToDefault, addExtra, pauseUser, unlockUser };
export type { DashboardResponse };
