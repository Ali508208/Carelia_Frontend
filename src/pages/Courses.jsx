import { useMemo, useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  PlayCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

/* ---------- small UI helpers ---------- */

const StatusPill = ({ statusKey }) => {
  const { t } = useTranslation();
  const map = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700" },
    draft: { bg: "bg-amber-50", text: "text-amber-700" },
  };
  const k = map[statusKey] ? statusKey : "active";
  const c = map[k];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {t(`courses.status.${k}`)}
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

/* ---------- seed data ---------- */

const seed = [
  {
    id: "c1",
    title: "Mindfulness Basics",
    subtitle: "Introduction to mindful living",
    category: "Mindfulness",
    duration: 45,
    enrolled: 234,
    status: "Active",
    thumb: { bg: "from-pink-300 to-violet-300" },
  },
  {
    id: "c2",
    title: "Stress Management",
    subtitle: "Techniques for daily stress relief",
    category: "Stress Management",
    duration: 60,
    enrolled: 189,
    status: "Active",
    thumb: { bg: "from-emerald-200 to-cyan-200" },
  },
  {
    id: "c3",
    title: "Self-Care Essentials",
    subtitle: "Building healthy daily habits",
    category: "Self-Care",
    duration: 30,
    enrolled: 156,
    status: "Draft",
    thumb: { bg: "from-rose-200 to-fuchsia-200" },
  },
];

/* ---------- page ---------- */

export default function Courses() {
  const { t } = useTranslation();
  const [rows, setRows] = useState(seed);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filtered = useMemo(() => {
    if (!query) return rows;
    return rows.filter((r) =>
      `${r.title} ${r.subtitle} ${r.category}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [rows, query]);

  const onAdd = () => {
    setEditing({
      id: null,
      title: "",
      subtitle: "",
      category: "Mindfulness",
      duration: 60,
      enrolled: 0,
      status: "Draft",
      thumb: { bg: "from-violet-200 to-fuchsia-200" },
      imageFile: null,
      imagePreview: null,
      videoFile: null,
      videoPreview: null,
    });
    setModalOpen(true);
  };

  const onEdit = (course) => {
    setEditing({ ...course });
    setModalOpen(true);
  };

  const onDelete = (course) => {
    setPendingDelete(course);
    setConfirmOpen(true);
  };

  const saveCourse = () => {
    if (!editing.title.trim())
      return alert(t("courses.form.validation.titleRequired"));
    setRows((prev) => {
      if (editing.id) {
        return prev.map((r) => (r.id === editing.id ? editing : r));
      }
      return [{ ...editing, id: crypto.randomUUID() }, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
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

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold">{t("courses.allCourses")}</h3>
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
                  const statusKey = (c.status || "").toLowerCase(); // "active" | "draft"
                  return (
                    <tr
                      key={c.id}
                      className={`${
                        idx !== filtered.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Course cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.thumb.bg}`}
                          />
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

                      <td className="px-6 py-4 text-gray-700">{c.category}</td>

                      <td className="px-6 py-4 text-gray-700">
                        {c.duration} {t("courses.labels.min")}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {c.enrolled} {t("courses.labels.users")}
                      </td>

                      <td className="px-6 py-4">
                        <StatusPill statusKey={statusKey} />
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
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

                {filtered.length === 0 && (
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
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          title={
            editing?.id
              ? t("courses.modals.editTitle")
              : t("courses.modals.addTitle")
          }
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
              >
                {t("courses.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                onClick={saveCourse}
              >
                {editing?.id
                  ? t("courses.actions.saveChanges")
                  : t("courses.actions.saveCourse")}
              </button>
            </div>
          }
        >
          {/* Form grid */}
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
                value={editing?.title ?? ""}
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
                value={editing?.category ?? "Mindfulness"}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, category: e.target.value }))
                }
              >
                <option>Mindfulness</option>
                <option>Stress Management</option>
                <option>Self-Care</option>
                <option>Productivity</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="course-desc"
                className="block text-sm font-medium text-gray-700"
              >
                {t("courses.form.descriptionLabel")}
              </label>
              <textarea
                id="course-desc"
                rows={3}
                className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                placeholder={t("courses.form.descriptionPlaceholder")}
                value={editing?.subtitle ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Duration */}
            <div className="md:col-span-1">
              <label
                htmlFor="course-duration"
                className="block text-sm font-medium text-gray-700"
              >
                {t("courses.form.durationLabel")}
              </label>
              <input
                id="course-duration"
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                value={editing?.duration ?? 60}
                onChange={(e) =>
                  setEditing((s) => ({
                    ...s,
                    duration: Number(e.target.value),
                  }))
                }
              />
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
                file={editing?.imageFile}
                preview={editing?.imagePreview}
                onSelect={(file, url) =>
                  setEditing((s) => ({
                    ...s,
                    imageFile: file,
                    imagePreview: url,
                  }))
                }
                onClear={() =>
                  setEditing((s) => ({
                    ...s,
                    imageFile: null,
                    imagePreview: null,
                  }))
                }
              />
            </div>

            {/* Course Video */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("courses.form.videoLabel")}
              </label>
              <FilePickerBox
                type="video"
                height="h-36"
                label={t("courses.form.videoDropLabel")}
                sublabel={t("courses.form.videoDropSub")}
                accept="video/*"
                file={editing?.videoFile}
                preview={editing?.videoPreview}
                onSelect={(file, url) =>
                  setEditing((s) => ({
                    ...s,
                    videoFile: file,
                    videoPreview: url,
                  }))
                }
                onClear={() =>
                  setEditing((s) => ({
                    ...s,
                    videoFile: null,
                    videoPreview: null,
                  }))
                }
              />
            </div>
          </div>
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
              >
                {t("courses.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                {t("courses.actions.delete")}
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            {t("courses.modals.deleteConfirm", { title: pendingDelete?.title })}
          </p>
        </Modal>
      </div>
    </div>
  );
}

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
