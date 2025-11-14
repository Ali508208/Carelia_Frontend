import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getCoursePublic,
  createLesson,
  updateLesson,
  deleteLesson,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  uploadLearningFile,
} from "../services/learningAdminService";

/* ---------- shared UI helpers ---------- */

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
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h3 id="modal-title" className="text-lg font-semibold">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
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

const FilePickerBox = ({
  type, // "video" | "file"
  label,
  sublabel,
  accept,
  file,
  preview,
  onSelect,
  onClear,
  className = "",
  height = "h-40 sm:h-52",
  mime, // <-- NEW
}) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const Icon = type === "video" ? PlayCircleIcon : DocumentTextIcon;

  const openPicker = () => inputRef.current?.click();
  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f); // use URL for both video & file
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
        <div className="relative w-full h-full p-2 flex items-center justify-center">
          {type === "video" ? (
            <video
              src={preview}
              className="w-full h-full object-cover rounded-xl"
              controls
            />
          ) : mime?.startsWith("audio/") ? (
            <div className="w-full flex flex-col gap-1">
              <audio src={preview} controls className="w-full" />
              <p className="text-xs text-gray-500 truncate mt-1">
                {file?.name || preview}
              </p>
            </div>
          ) : mime === "application/pdf" ? (
            <div className="w-full max-h-full flex flex-col">
              <iframe
                src={preview}
                className="flex-1 w-full rounded-lg border border-gray-200"
                title="PDF preview"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">
                {file?.name || preview}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DocumentTextIcon className="h-5 w-5" />
              <span className="truncate">{file?.name || preview}</span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1 rounded-lg shadow"
            title={t("courseBuilder.form.removeFile")}
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

export default function CourseBuilder() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);

  // lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonSaving, setLessonSaving] = useState(false);

  // lesson delete
  const [lessonDeleteOpen, setLessonDeleteOpen] = useState(false);
  const [pendingLessonDelete, setPendingLessonDelete] = useState(null);
  const [lessonDeleting, setLessonDeleting] = useState(false);

  // material modal state
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialSaving, setMaterialSaving] = useState(false);

  // material delete
  const [materialDeleteOpen, setMaterialDeleteOpen] = useState(false);
  const [pendingMaterialDelete, setPendingMaterialDelete] = useState(null);
  const [materialDeleting, setMaterialDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCoursePublic(courseId);
      setCourse(res.course);
      setLessons(res.lessons || []);
      setMaterials(res.materials || []);
    } catch (err) {
      console.error("Failed to load course", err);
      alert(t("courseBuilder.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [lessons]
  );

  /* ---------- LESSONS ---------- */

  const openAddLesson = () => {
    setEditingLesson({
      _id: null,
      title: "",
      description: "",
      order: (lessons.length || 0) + 1,
      videoUrl: "",
      durationSec: 0,
      isFreePreview: false,
      objectives: [],
      // UI only
      videoFile: null,
      videoPreview: null,
      objectivesText: "",
    });
    setLessonModalOpen(true);
  };

  const openEditLesson = (l) => {
    setEditingLesson({
      ...l,
      videoFile: null,
      videoPreview: l.videoUrl || null,
      objectivesText: (l.objectives || []).join("\n"),
    });
    setLessonModalOpen(true);
  };

  const saveLesson = async () => {
    if (!editingLesson.title.trim()) {
      return alert(t("courseBuilder.lessons.validation.titleRequired"));
    }

    setLessonSaving(true);
    try {
      let videoUrl = editingLesson.videoUrl || "";

      if (editingLesson.videoFile) {
        videoUrl = await uploadLearningFile(
          editingLesson.videoFile,
          "lessonVideo"
        );
      }

      const objectivesArray = (editingLesson.objectivesText || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        courseId,
        title: editingLesson.title.trim(),
        description: editingLesson.description || "",
        order: Number(editingLesson.order || 0),
        videoUrl,
        durationSec: Number(editingLesson.durationSec || 0),
        isFreePreview: Boolean(editingLesson.isFreePreview),
        objectives: objectivesArray,
      };

      if (editingLesson._id) {
        await updateLesson(editingLesson._id, payload);
      } else {
        await createLesson(payload);
      }

      await loadData();
      setLessonModalOpen(false);
      setEditingLesson(null);
    } catch (err) {
      console.error("Failed to save lesson", err);
      alert(t("courseBuilder.lessons.saveError"));
    } finally {
      setLessonSaving(false);
    }
  };

  const askDeleteLesson = (lesson) => {
    setPendingLessonDelete(lesson);
    setLessonDeleteOpen(true);
  };

  const doDeleteLesson = async () => {
    if (!pendingLessonDelete?._id) return;
    setLessonDeleting(true);
    try {
      await deleteLesson(pendingLessonDelete._id);
      await loadData();
      setLessonDeleteOpen(false);
      setPendingLessonDelete(null);
    } catch (err) {
      console.error("Failed to delete lesson", err);
      alert(t("courseBuilder.lessons.deleteError"));
    } finally {
      setLessonDeleting(false);
    }
  };

  /* ---------- MATERIALS ---------- */

  const openAddMaterial = () => {
    setEditingMaterial({
      _id: null,
      title: "",
      type: "pdf",
      url: "",
      mime: "",
      size: 0,
      // UI
      file: null,
      filePreview: "",
    });
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (m) => {
    setEditingMaterial({
      ...m,
      file: null,
      filePreview: m.url || "",
    });
    setMaterialModalOpen(true);
  };

  const saveMaterial = async () => {
    if (!editingMaterial.title.trim()) {
      return alert(t("courseBuilder.materials.validation.titleRequired"));
    }

    setMaterialSaving(true);
    try {
      let url = editingMaterial.url || "";
      let mime = editingMaterial.mime || "";
      let size = editingMaterial.size || 0;

      if (editingMaterial.file) {
        url = await uploadLearningFile(editingMaterial.file, "material");
        mime = editingMaterial.file.type || "";
        size = editingMaterial.file.size || 0;
      }

      const payload = {
        courseId,
        title: editingMaterial.title.trim(),
        type: editingMaterial.type || "other",
        url,
        mime,
        size,
      };

      if (editingMaterial._id) {
        await updateMaterial(editingMaterial._id, payload);
      } else {
        await createMaterial(payload);
      }

      await loadData();
      setMaterialModalOpen(false);
      setEditingMaterial(null);
    } catch (err) {
      console.error("Failed to save material", err);
      alert(t("courseBuilder.materials.saveError"));
    } finally {
      setMaterialSaving(false);
    }
  };

  const askDeleteMaterial = (m) => {
    setPendingMaterialDelete(m);
    setMaterialDeleteOpen(true);
  };

  const doDeleteMaterial = async () => {
    if (!pendingMaterialDelete?._id) return;
    setMaterialDeleting(true);
    try {
      await deleteMaterial(pendingMaterialDelete._id);
      await loadData();
      setMaterialDeleteOpen(false);
      setPendingMaterialDelete(null);
    } catch (err) {
      console.error("Failed to delete material", err);
      alert(t("courseBuilder.materials.deleteError"));
    } finally {
      setMaterialDeleting(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">{t("courseBuilder.loading")}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium">
            {t("courseBuilder.notFound")}
          </p>
          <button
            onClick={() => nav("/courses")}
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t("courseBuilder.backToCourses")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/courses")}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t("courseBuilder.backToCourses")}
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {course.title}
            </h1>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {t("courseBuilder.stats", {
              lessons: lessons.length,
              materials: materials.length,
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lessons column (larger) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-md">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {t("courseBuilder.lessons.title")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t("courseBuilder.lessons.subtitle")}
                  </p>
                </div>
                <button
                  onClick={openAddLesson}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-violet-700 w-full sm:w-auto justify-center"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t("courseBuilder.lessons.addLesson")}
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {sortedLessons.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-500 text-sm">
                    {t("courseBuilder.lessons.empty")}
                  </div>
                )}

                {sortedLessons.map((l) => (
                  <div
                    key={l._id}
                    className="px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-xs text-gray-400 w-6 text-right">
                        #{l.order ?? 0}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{l.title}</p>
                          {l.isFreePreview && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                              {t("courseBuilder.lessons.freePreview")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {l.durationSec
                            ? t("courseBuilder.lessons.durationLabel", {
                                minutes: Math.round(l.durationSec / 60),
                              })
                            : t("courseBuilder.lessons.noDuration")}
                        </p>

                        {/* ⬇️ ADD THIS ⬇️ */}
                        {l.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {l.description}
                          </p>
                        )}
                        {/* ⬆️ ADD THIS ⬆️ */}

                        {l.objectives?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {l.objectives.map((o, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-600 flex gap-1"
                              >
                                <span className="mt-1 h-1 w-1 rounded-full bg-gray-400" />
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        title={t("courseBuilder.lessons.edit")}
                        onClick={() => openEditLesson(l)}
                      >
                        <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                      </IconButton>
                      <IconButton
                        title={t("courseBuilder.lessons.delete")}
                        onClick={() => askDeleteLesson(l)}
                        className="hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Materials column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-md">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {t("courseBuilder.materials.title")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t("courseBuilder.materials.subtitle")}
                  </p>
                </div>
                <button
                  onClick={openAddMaterial}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-violet-700 w-full sm:w-auto justify-center"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t("courseBuilder.materials.addMaterial")}
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {materials.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-500 text-sm">
                    {t("courseBuilder.materials.empty")}
                  </div>
                )}

                {materials.map((m) => (
                  <div
                    key={m._id}
                    className="px-5 py-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <DocumentTextIcon className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t(
                            `courseBuilder.materials.types.${m.type || "other"}`
                          )}
                          {m.size
                            ? ` • ${(m.size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        title={t("courseBuilder.materials.edit")}
                        onClick={() => openEditMaterial(m)}
                      >
                        <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                      </IconButton>
                      <IconButton
                        title={t("courseBuilder.materials.delete")}
                        onClick={() => askDeleteMaterial(m)}
                        className="hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LESSON MODAL */}
        <Modal
          open={lessonModalOpen}
          onClose={() => {
            setLessonModalOpen(false);
            setEditingLesson(null);
          }}
          title={
            editingLesson?._id
              ? t("courseBuilder.lessons.editModalTitle")
              : t("courseBuilder.lessons.addModalTitle")
          }
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  setLessonModalOpen(false);
                  setEditingLesson(null);
                }}
                disabled={lessonSaving}
              >
                {t("courseBuilder.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-70"
                onClick={saveLesson}
                disabled={lessonSaving}
              >
                {lessonSaving
                  ? t("courseBuilder.lessons.saving")
                  : editingLesson?._id
                  ? t("courseBuilder.lessons.saveChanges")
                  : t("courseBuilder.lessons.saveLesson")}
              </button>
            </div>
          }
        >
          {editingLesson && (
            <div className="space-y-4">
              {/* Title + order */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("courseBuilder.lessons.form.titleLabel")}
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                    value={editingLesson.title}
                    onChange={(e) =>
                      setEditingLesson((s) => ({
                        ...s,
                        title: e.target.value,
                      }))
                    }
                    placeholder={t(
                      "courseBuilder.lessons.form.titlePlaceholder"
                    )}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("courseBuilder.lessons.form.orderLabel")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                    value={editingLesson.order ?? 1}
                    onChange={(e) =>
                      setEditingLesson((s) => ({
                        ...s,
                        order: Number(e.target.value || 1),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Duration + free preview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("courseBuilder.lessons.form.durationLabel")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                    value={editingLesson.durationSec ?? 0}
                    onChange={(e) =>
                      setEditingLesson((s) => ({
                        ...s,
                        durationSec: Number(e.target.value || 0),
                      }))
                    }
                    placeholder={t(
                      "courseBuilder.lessons.form.durationPlaceholder"
                    )}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    {t("courseBuilder.lessons.form.durationHint")}
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center mt-6">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      checked={Boolean(editingLesson.isFreePreview)}
                      onChange={(e) =>
                        setEditingLesson((s) => ({
                          ...s,
                          isFreePreview: e.target.checked,
                        }))
                      }
                    />
                    {t("courseBuilder.lessons.form.freePreviewLabel")}
                  </label>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("courseBuilder.lessons.form.descriptionLabel")}
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                  placeholder={t(
                    "courseBuilder.lessons.form.descriptionPlaceholder"
                  )}
                  value={editingLesson.description || ""}
                  onChange={(e) =>
                    setEditingLesson((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("courseBuilder.lessons.form.objectivesLabel")}
                </label>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                  placeholder={t(
                    "courseBuilder.lessons.form.objectivesPlaceholder"
                  )}
                  value={editingLesson.objectivesText || ""}
                  onChange={(e) =>
                    setEditingLesson((s) => ({
                      ...s,
                      objectivesText: e.target.value,
                    }))
                  }
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  {t("courseBuilder.lessons.form.objectivesHint")}
                </p>
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("courseBuilder.lessons.form.videoLabel")}
                </label>
                <FilePickerBox
                  type="video"
                  height="h-80"
                  label={t("courseBuilder.lessons.form.videoDropLabel")}
                  sublabel={t("courseBuilder.lessons.form.videoDropSub")}
                  accept="video/*"
                  file={editingLesson.videoFile}
                  preview={editingLesson.videoPreview || editingLesson.videoUrl}
                  mime={editingLesson.videoFile?.type || "video/*"}
                  onSelect={(file, url) =>
                    setEditingLesson((s) => ({
                      ...s,
                      videoFile: file,
                      videoPreview: url,
                    }))
                  }
                  onClear={() =>
                    setEditingLesson((s) => ({
                      ...s,
                      videoFile: null,
                      videoPreview: null,
                      videoUrl: "",
                    }))
                  }
                />
              </div>
            </div>
          )}
        </Modal>

        {/* LESSON DELETE MODAL */}
        <Modal
          open={lessonDeleteOpen}
          onClose={() => setLessonDeleteOpen(false)}
          title={t("courseBuilder.lessons.deleteModalTitle")}
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setLessonDeleteOpen(false)}
                disabled={lessonDeleting}
              >
                {t("courseBuilder.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                onClick={doDeleteLesson}
                disabled={lessonDeleting}
              >
                {lessonDeleting
                  ? t("courseBuilder.lessons.deleting")
                  : t("courseBuilder.lessons.delete")}
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            {t("courseBuilder.lessons.deleteConfirm", {
              title: pendingLessonDelete?.title || "",
            })}
          </p>
        </Modal>

        {/* MATERIAL MODAL */}
        <Modal
          open={materialModalOpen}
          onClose={() => {
            setMaterialModalOpen(false);
            setEditingMaterial(null);
          }}
          title={
            editingMaterial?._id
              ? t("courseBuilder.materials.editModalTitle")
              : t("courseBuilder.materials.addModalTitle")
          }
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  setMaterialModalOpen(false);
                  setEditingMaterial(null);
                }}
                disabled={materialSaving}
              >
                {t("courseBuilder.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-70"
                onClick={saveMaterial}
                disabled={materialSaving}
              >
                {materialSaving
                  ? t("courseBuilder.materials.saving")
                  : editingMaterial?._id
                  ? t("courseBuilder.materials.saveChanges")
                  : t("courseBuilder.materials.saveMaterial")}
              </button>
            </div>
          }
        >
          {editingMaterial && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("courseBuilder.materials.form.titleLabel")}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                  value={editingMaterial.title}
                  onChange={(e) =>
                    setEditingMaterial((s) => ({
                      ...s,
                      title: e.target.value,
                    }))
                  }
                  placeholder={t(
                    "courseBuilder.materials.form.titlePlaceholder"
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("courseBuilder.materials.form.typeLabel")}
                </label>
                <select
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-2.5 focus:border-violet-500 focus:ring-violet-500 text-sm"
                  value={editingMaterial.type || "pdf"}
                  onChange={(e) =>
                    setEditingMaterial((s) => ({
                      ...s,
                      type: e.target.value,
                    }))
                  }
                >
                  <option value="pdf">
                    {t("courseBuilder.materials.types.pdf")}
                  </option>
                  <option value="audio">
                    {t("courseBuilder.materials.types.audio")}
                  </option>
                  <option value="worksheet">
                    {t("courseBuilder.materials.types.worksheet")}
                  </option>
                  <option value="other">
                    {t("courseBuilder.materials.types.other")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("courseBuilder.materials.form.fileLabel")}
                </label>
                <FilePickerBox
                  type="file"
                  label={t("courseBuilder.materials.form.fileDropLabel")}
                  sublabel={t("courseBuilder.materials.form.fileDropSub")}
                  accept="*/*"
                  file={editingMaterial.file}
                  preview={editingMaterial.filePreview || editingMaterial.url}
                  mime={editingMaterial.file?.type || editingMaterial.mime} // ⬅️ KEY LINE
                  onSelect={(file, preview) =>
                    setEditingMaterial((s) => ({
                      ...s,
                      file,
                      filePreview: preview,
                    }))
                  }
                  onClear={() =>
                    setEditingMaterial((s) => ({
                      ...s,
                      file: null,
                      filePreview: "",
                      url: "",
                    }))
                  }
                />
              </div>
            </div>
          )}
        </Modal>

        {/* MATERIAL DELETE MODAL */}
        <Modal
          open={materialDeleteOpen}
          onClose={() => setMaterialDeleteOpen(false)}
          title={t("courseBuilder.materials.deleteModalTitle")}
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setMaterialDeleteOpen(false)}
                disabled={materialDeleting}
              >
                {t("courseBuilder.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                onClick={doDeleteMaterial}
                disabled={materialDeleting}
              >
                {materialDeleting
                  ? t("courseBuilder.materials.deleting")
                  : t("courseBuilder.materials.delete")}
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            {t("courseBuilder.materials.deleteConfirm", {
              title: pendingMaterialDelete?.title || "",
            })}
          </p>
        </Modal>
      </div>
    </div>
  );
}
