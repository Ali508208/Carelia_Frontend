// src/services/dailyImpulseAdminService.js
import { get, post, put, del } from "../utils/httpClient";

// ─── Upload audio file ─────────────────────────────────
export async function uploadImpulseAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await post("/daily-impulse/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url; // string
}

// ─── List all ─────────────────────────────────────────
export async function listImpulses() {
  const res = await get("/daily-impulse/admin/");
  return res.data.items;
}

// ─── Create ───────────────────────────────────────────
export async function createImpulse(payload) {
  const res = await post("/daily-impulse/admin/", payload);
  return res.data.item;
}

// ─── Update ───────────────────────────────────────────
export async function updateImpulse(id, payload) {
  const res = await put(`/daily-impulse/admin/${id}`, payload);
  return res.data.item;
}

// ─── Delete ───────────────────────────────────────────
export async function deleteImpulse(id) {
  await del(`/daily-impulse/admin/${id}`);
  return true;
}
