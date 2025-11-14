import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  PlayCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import {
  listActiveCategories,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadLearningFile,
} from "../services/learningAdminService";

/* ---------- small UI helpers ---------- */

const StatusPill = ({ isPublished }) => {
  const { t } = useTranslation();
  const key = isPublished ? "active" : "draft";
  const map = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700" },
    draft: { bg: "bg-amber-50", text: "text-amber-700" },
  };
  const c = map[key];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {t(`courses.status.${key}`)}
    </span>
  );
};

const IconButton = ({ title, onClick, children, className = "" }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-2 rounded-lg hover:bg-gray-100 transition ${className}`}
  >
    {children}
  </button>
);

const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[90]"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 id="modal-title" className="text-lg font-semibold">
              {title}
            </h3>
          </div>
          <div className="p-6 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilePickerBox = ({
  type, // "image" | "video"
  label,
  sublabel,
  accept,
  file,
  preview,
  onSelect,
  onClear,
  className = "",
  height = "h-40",
}) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const Icon = type === "image" ? PhotoIcon : PlayCircleIcon;

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onSelect(f, url);
  };

  return (
    <div
      onClick={openPicker}
      className={`border-2 border-dashed border-gray-300 rounded-2xl ${height} 
      flex items-center justify-center text-center cursor-pointer hover:border-violet-300 transition ${className}`}
    >
      {!preview ? (
        <div>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Icon className="h-6 w-6" />
            <p className="font-medium">{label}</p>
          </div>
          {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
        </div>
      ) : (
        <div className="relative w-full h-full p-2">
          {type === "image" ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover rounded-xl"
              draggable="false"
            />
          ) : (
            <video
              src={preview}
              className="w-full h-full object-cover rounded-xl"
              controls
            />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1 rounded-lg shadow"
            title={t("courses.form.removeFile")}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        hidden
      />
    </div>
  );
};

/* ---------- page ---------- */

export default function Courses() {
  const { t } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nav = useNavigate();

  // ---------- load categories + courses ----------

  const loadCategories = async () => {
    try {
      const items = await listActiveCategories();
      setCategories(items || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadCourses = async (opts = {}) => {
    setLoadingList(true);
    try {
      const { q = "", categoryId = "" } = opts;
      const res = await searchCourses({
        q: q || undefined,
        categoryId: categoryId || undefined,
        sort: "newest",
        limit: 100,
      });
      setCourses(res.items || []);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  // reload when category filter or search query changes
  useEffect(() => {
    loadCourses({ q: query, categoryId: categoryIdFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryIdFilter]);

  const categoryNameMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c._id] = c.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    // search is already handled server-side via `q`, but we keep this in case
    if (!query) return courses;
    return courses.filter((c) =>
      `${c.title} ${c.subtitle} ${categoryNameMap[c.categoryId] || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [courses, query, categoryNameMap]);

  // ---------- handlers ----------

  const onAdd = () => {
    const defaultCategoryId = categories[0]?._id || "";
    setEditing({
      _id: null,
      categoryId: defaultCategoryId,
      title: "",
      subtitle: "",
      description: "",
      durationWeeks: 0,
      level: "beginner",
      coverImage: "",
      trailerUrl: "",
      // UI-only fields
      coverFile: null,
      coverPreview: null,
      trailerFile: null,
      trailerPreview: null,
    });
    setModalOpen(true);
  };

  const onEdit = (course) => {
    setEditing({
      ...course,
      // UI-only fields
      coverFile: null,
      coverPreview: course.coverImage || null,
      trailerFile: null,
      trailerPreview: course.trailerUrl || null,
    });
    setModalOpen(true);
  };

  const onDelete = (course) => {
    setPendingDelete(course);
    setConfirmOpen(true);
  };

  const resetModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const saveCourse = async () => {
    if (!editing.title.trim()) {
      return alert(t("courses.form.validation.titleRequired"));
    }
    if (!editing.categoryId) {
      return alert(t("courses.form.validation.categoryRequired"));
    }

    setSaving(true);
    try {
      let coverImageUrl = editing.coverImage || "";
      let trailerUrl = editing.trailerUrl || "";

      // upload cover image if new file selected
      if (editing.coverFile) {
        coverImageUrl = await uploadLearningFile(
          editing.coverFile,
          "courseThumbnail"
        );
      }

      // upload trailer video if new file selected
      if (editing.trailerFile) {
        trailerUrl = await uploadLearningFile(
          editing.trailerFile,
          "lessonVideo"
        );
      }

      const payload = {
        categoryId: editing.categoryId,
        title: editing.title.trim(),
        subtitle: editing.subtitle || "",
        description: editing.description || editing.subtitle || "",
        durationWeeks: Number(editing.durationWeeks || 0),
        level: editing.level || "beginner",
        coverImage: coverImageUrl,
        trailerUrl: trailerUrl,
        // For now we publish immediately so it shows up in search
        isPublished: true,
      };

      if (editing._id) {
        await updateCourse(editing._id, payload);
      } else {
        await createCourse(payload);
      }

      await loadCourses({ q: query, categoryId: categoryIdFilter });
      resetModal();
    } catch (err) {
      console.error("Failed to save course", err);
      alert(t("courses.form.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;
    setDeleting(true);
    try {
      await deleteCourse(pendingDelete._id);
      await loadCourses({ q: query, categoryId: categoryIdFilter });
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to delete course", err);
      alert(t("courses.modals.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("courses.title")}</h1>
            <p className="text-sm text-gray-500">{t("courses.subtitle")}</p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            {t("courses.addCourse")}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder={t("courses.searchPlaceholder")}
            className="w-full sm:w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="w-full sm:w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500"
            value={categoryIdFilter}
            onChange={(e) => setCategoryIdFilter(e.target.value)}
          >
            <option value="">{t("courses.filters.allCategories")}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">{t("courses.allCourses")}</h3>
            {loadingList && (
              <span className="text-xs text-gray-500">
                {t("courses.loading")}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.course")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.category")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.duration")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.enrolled")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.status")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("courses.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => {
                  const categoryName = categoryNameMap[c.categoryId] || "—";
                  return (
                    <tr
                      key={c._id}
                      className={
                        idx !== filtered.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }
                    >
                      {/* Course cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-200 to-fuchsia-200 overflow-hidden flex items-center justify-center">
                            {c.coverImage ? (
                              <img
                                src={c.coverImage}
                                alt={c.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-500">
                                {t("courses.labels.noImage")}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {c.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.subtitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {categoryName}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {c.durationWeeks || 0} {t("courses.labels.weeks")}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {c.views || 0} {t("courses.labels.views")}
                      </td>

                      <td className="px-6 py-4">
                        <StatusPill isPublished={c.isPublished} />
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <IconButton
                            title={t("courses.actions.manageContent")}
                            onClick={() => nav(`/courses/${c._id}`)}
                          >
                            <PlayCircleIcon className="h-5 w-5 text-emerald-600" />
                          </IconButton>
                          <IconButton
                            title={t("courses.actions.edit")}
                            onClick={() => onEdit(c)}
                          >
                            <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                          </IconButton>
                          <IconButton
                            title={t("courses.actions.delete")}
                            onClick={() => onDelete(c)}
                            className="hover:bg-red-50"
                          >
                            <TrashIcon className="h-5 w-5 text-red-500" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && !loadingList && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-gray-500"
                      colSpan={6}
                    >
                      {t("courses.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* -------- Add/Edit Modal -------- */}
        <Modal
          open={modalOpen}
          onClose={resetModal}
          title={
            editing?._id
              ? t("courses.modals.editTitle")
              : t("courses.modals.addTitle")
          }
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={resetModal}
                disabled={saving}
              >
                {t("courses.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-70"
                onClick={saveCourse}
                disabled={saving}
              >
                {saving
                  ? t("courses.actions.saving")
                  : editing?._id
                  ? t("courses.actions.saveChanges")
                  : t("courses.actions.saveCourse")}
              </button>
            </div>
          }
        >
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-1">
                <label
                  htmlFor="course-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("courses.form.titleLabel")}
                </label>
                <input
                  id="course-title"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("courses.form.titlePlaceholder")}
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>

              {/* Category */}
              <div className="md:col-span-1">
                <label
                  htmlFor="course-category"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("courses.form.categoryLabel")}
                </label>
                <select
                  id="course-category"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  value={editing.categoryId || ""}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, categoryId: e.target.value }))
                  }
                >
                  <option value="">
                    {t("courses.form.categoryPlaceholder")}
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtitle / short description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="course-subtitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("courses.form.subtitleLabel")}
                </label>
                <input
                  id="course-subtitle"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("courses.form.subtitlePlaceholder")}
                  value={editing.subtitle || ""}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, subtitle: e.target.value }))
                  }
                />
              </div>

              {/* Duration (weeks) */}
              <div className="md:col-span-1">
                <label
                  htmlFor="course-duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("courses.form.durationWeeksLabel")}
                </label>
                <input
                  id="course-duration"
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  value={editing.durationWeeks ?? 0}
                  onChange={(e) =>
                    setEditing((s) => ({
                      ...s,
                      durationWeeks: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* Level */}
              <div className="md:col-span-1">
                <label
                  htmlFor="course-level"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("courses.form.levelLabel")}
                </label>
                <select
                  id="course-level"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  value={editing.level || "beginner"}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, level: e.target.value }))
                  }
                >
                  <option value="beginner">
                    {t("courses.levels.beginner")}
                  </option>
                  <option value="intermediate">
                    {t("courses.levels.intermediate")}
                  </option>
                  <option value="advanced">
                    {t("courses.levels.advanced")}
                  </option>
                </select>
              </div>

              {/* Course Image */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("courses.form.imageLabel")}
                </label>
                <FilePickerBox
                  type="image"
                  label={t("courses.form.imageDropLabel")}
                  sublabel={t("courses.form.imageDropSub")}
                  accept="image/*"
                  file={editing.coverFile}
                  preview={editing.coverPreview}
                  onSelect={(file, url) =>
                    setEditing((s) => ({
                      ...s,
                      coverFile: file,
                      coverPreview: url,
                    }))
                  }
                  onClear={() =>
                    setEditing((s) => ({
                      ...s,
                      coverFile: null,
                      coverPreview: null,
                      coverImage: "",
                    }))
                  }
                />
              </div>

              {/* Trailer Video */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("courses.form.trailerLabel")}
                </label>
                <FilePickerBox
                  type="video"
                  height="h-40"
                  label={t("courses.form.trailerDropLabel")}
                  sublabel={t("courses.form.trailerDropSub")}
                  accept="video/*"
                  file={editing.trailerFile}
                  preview={editing.trailerPreview}
                  onSelect={(file, url) =>
                    setEditing((s) => ({
                      ...s,
                      trailerFile: file,
                      trailerPreview: url,
                    }))
                  }
                  onClear={() =>
                    setEditing((s) => ({
                      ...s,
                      trailerFile: null,
                      trailerPreview: null,
                      trailerUrl: "",
                    }))
                  }
                />
              </div>
            </div>
          )}
        </Modal>

        {/* -------- Delete Confirm Modal -------- */}
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={t("courses.modals.deleteTitle")}
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                {t("courses.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? t("courses.actions.deleting")
                  : t("courses.actions.delete")}
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            {t("courses.modals.deleteConfirm", {
              title: pendingDelete?.title || "",
            })}
          </p>
        </Modal>
      </div>
    </div>
  );
}
