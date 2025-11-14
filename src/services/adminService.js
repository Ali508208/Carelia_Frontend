// src/services/adminService.js
import { get, put } from "../utils/httpClient";

// Dashboard
export async function getDashboardStats() {
  const res = await get("/admin/dashboard/stats");
  return res.data.stats;
}

export async function getDashboardActivity() {
  const res = await get("/admin/dashboard/activity");
  return res.data.items; // array of activity
}

// Users
export async function listAdminUsers() {
  const res = await get("/admin/users");
  return res.data.users; // array of users
}

export async function updateUserStatus(id, status) {
  // status: "active" | "blocked"
  const res = await put(`/admin/users/${id}/status`, { status });
  return res.data.user;
}
