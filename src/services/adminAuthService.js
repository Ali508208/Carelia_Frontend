// services/adminAuthService.js
import Cookies from "js-cookie";
import { post, get, ADMIN_TOKEN_COOKIE_KEY } from "../utils/httpClient";

const COOKIE_OPTIONS = {
  expires: 7, // days
  sameSite: "lax",
  // secure: true, // enable in production over HTTPS
};

/**
 * Login admin and store token + admin info
 */
export async function adminLogin(email, password, remember = true) {
  const res = await post("/admin/auth/login", { email, password });

  const { token, admin } = res.data;

  if (!token) throw new Error("No token in response");

  Cookies.set(ADMIN_TOKEN_COOKIE_KEY, token, {
    ...COOKIE_OPTIONS,
    expires: remember ? 7 : 1,
  });

  localStorage.setItem("adminUser", JSON.stringify(admin));

  return admin;
}

/**
 * Logout admin – clear token + local storage
 */
export function adminLogout() {
  Cookies.remove(ADMIN_TOKEN_COOKIE_KEY);
  localStorage.removeItem("adminUser");
}

/**
 * Fetch current admin from backend (/admin/auth/me)
 */
export async function fetchCurrentAdmin() {
  const res = await get("/admin/auth/me");
  const admin = res.data.admin;

  // keep local copy in sync
  if (admin) {
    localStorage.setItem("adminUser", JSON.stringify(admin));
  }

  return admin;
}

/**
 * Update admin profile (/admin/auth/profile)
 * payload can contain: { fullName?, email?, profileImage? }
 */
export async function updateAdminProfile(payload) {
  const res = await post("/admin/auth/profile", payload);
  const admin = res.data.admin;

  if (admin) {
    localStorage.setItem("adminUser", JSON.stringify(admin));
  }

  return admin;
}

/**
 * Change admin password (/admin/auth/change-password)
 * currentPassword + newPassword must match backend controller
 */
export async function changeAdminPassword(currentPassword, newPassword) {
  await post("/admin/auth/change-password", {
    currentPassword,
    newPassword,
  });
  // if needed, you can return res.data too
}
