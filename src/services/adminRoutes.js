// routes/adminRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/admin/categoryController.js";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "../controllers/admin/courseController.js";

import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/admin/lessonController.js";

import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} from "../controllers/admin/materialController.js";

import { recalcEnrollments } from "../controllers/admin/enrollmentController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// All admin routes are protected
router.use(protectAdmin);

/* ────────────────────────────────────────────────
   📚 CATEGORY ROUTES
──────────────────────────────────────────────── */
router
  .route("/learning/categories")
  .get(getCategories) // GET all categories
  .post(createCategory); // POST create new category

router
  .route("/learning/categories/:id")
  .get(getCategoryById) // GET single category
  .put(updateCategory) // PUT update category
  .delete(deleteCategory); // DELETE category

/* ────────────────────────────────────────────────
   🎓 COURSE ROUTES
──────────────────────────────────────────────── */
router
  .route("/learning/courses")
  .get(getCourses) // GET all courses
  .post(createCourse); // POST create new course

router
  .route("/learning/courses/:id")
  .get(getCourseById) // GET single course
  .put(updateCourse) // PUT update course
  .delete(deleteCourse); // DELETE course

// Publish / Unpublish
router.post("/learning/courses/:id/publish", publishCourse);
router.post("/learning/courses/:id/unpublish", unpublishCourse);

/* ────────────────────────────────────────────────
   📖 LESSON ROUTES
──────────────────────────────────────────────── */
router
  .route("/learning/lessons")
  .get(getLessons) // GET all lessons
  .post(createLesson); // POST create new lesson

router
  .route("/learning/lessons/:id")
  .get(getLessonById) // GET single lesson
  .put(updateLesson) // PUT update lesson
  .delete(deleteLesson); // DELETE lesson

/* ────────────────────────────────────────────────
   📂 MATERIAL ROUTES
──────────────────────────────────────────────── */
router
  .route("/learning/materials")
  .get(getMaterials) // GET all materials
  .post(createMaterial); // POST upload/create material

router
  .route("/learning/materials/:id")
  .get(getMaterialById) // GET material by ID
  .put(updateMaterial) // PUT update
  .delete(deleteMaterial); // DELETE

/* ────────────────────────────────────────────────
   📊 ENROLLMENT & RATING UTILITIES
──────────────────────────────────────────────── */
// Recalculate progress for an enrollment
router.post("/learning/enrollments/:id/recalc", recalcEnrollments);

export default router;
