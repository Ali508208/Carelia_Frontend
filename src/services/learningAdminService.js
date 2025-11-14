// src/services/learningAdminService.js
import { get, post, put, del } from "../utils/httpClient";

// ---------- UPLOADS (Firebase via backend) ----------

/**
 * Upload a file to Firebase Storage via backend.
 * scope: 'category' | 'courseThumbnail' | 'lessonVideo' | 'material' | 'other'
 * returns: url (string)
 */
export async function uploadLearningFile(file, scope = "other") {
  const formData = new FormData();
  formData.append("file", file);
  if (scope) formData.append("scope", scope);

  const res = await post("/admin/learning/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url;
}

// ---------- CATEGORIES (ADMIN) ----------

export async function createCategory(payload) {
  // { name, slug, description?, imageUrl? }
  const res = await post("/admin/learning/categories", payload);
  return res.data.category;
}

export async function updateCategory(id, payload) {
  const res = await put(`/admin/learning/categories/${id}`, payload);
  return res.data.category;
}

export async function deleteCategory(id) {
  await del(`/admin/learning/categories/${id}`);
  return true;
}

// For listing categories in admin, we can reuse the public list
export async function listActiveCategories() {
  const res = await get("/learning/categories");
  return res.data.items; // array of Category
}

// ---------- COURSES (ADMIN) ----------

export async function createCourse(payload) {
  // expects shape matching Course model: { categoryId, title, subtitle, ... }
  const res = await post("/admin/learning/courses", payload);
  return res.data.course;
}

export async function updateCourse(id, payload) {
  const res = await put(`/admin/learning/courses/${id}`, payload);
  return res.data.course;
}

export async function publishCourse(id) {
  const res = await post(`/admin/learning/courses/${id}/publish`);
  return res.data.course;
}

export async function unpublishCourse(id) {
  const res = await post(`/admin/learning/courses/${id}/unpublish`);
  return res.data.course;
}

export async function deleteCourse(id) {
  await del(`/admin/learning/courses/${id}`);
  return true;
}

// Admin can reuse public search for now (only returns isPublished: true)
export async function searchCourses(params = {}) {
  // params: { q?, categoryId?, sort?, page?, limit? }
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const qs = query.toString();
  const res = await get(`/learning/search${qs ? `?${qs}` : ""}`);
  return res.data; // { items, total, page, limit }
}

// Get full public view of a course (includes lessons & materials)
export async function getCoursePublic(id) {
  const res = await get(`/learning/${id}`);
  return res.data; // { course, lessons, materials }
}

// ---------- LESSONS (ADMIN) ----------

export async function createLesson(payload) {
  // { courseId, title, videoUrl, order, ... }
  const res = await post("/admin/learning/lessons", payload);
  return res.data.lesson;
}

export async function updateLesson(id, payload) {
  const res = await put(`/admin/learning/lessons/${id}`, payload);
  return res.data.lesson;
}

export async function deleteLesson(id) {
  await del(`/admin/learning/lessons/${id}`);
  return true;
}

// ---------- MATERIALS (ADMIN) ----------

export async function createMaterial(payload) {
  // { courseId, title, type, url, mime, size }
  const res = await post("/admin/learning/materials", payload);
  return res.data.material;
}

export async function updateMaterial(id, payload) {
  const res = await put(`/admin/learning/materials/${id}`, payload);
  return res.data.material;
}

export async function deleteMaterial(id) {
  await del(`/admin/learning/materials/${id}`);
  return true;
}
