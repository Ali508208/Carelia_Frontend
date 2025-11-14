import { useEffect, useMemo, useRef, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import {
  listActiveCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadLearningFile,
} from "../services/learningAdminService";

/* ---------- helpers ---------- */

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const StatusPill = ({ isActive }) => {
  const { t } = useTranslation();
  const key = isActive ? "active" : "inactive";
  const map = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700" },
    inactive: { bg: "bg-gray-100", text: "text-gray-600" },
  };
  const c = map[key];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {t(`categories.status.${key}`)}
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
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 max-h-[90vh] flex flex-col">
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
  label,
  sublabel,
  accept,
  file,
  preview,
  onSelect,
  onClear,
  className = "",
  height = "h-32",
}) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

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
            <PhotoIcon className="h-6 w-6" />
            <p className="font-medium">{label}</p>
          </div>
          {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
        </div>
      ) : (
        <div className="relative w-full h-full p-2">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover rounded-xl"
            draggable="false"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1 rounded-lg shadow"
            title={t("categories.form.removeFile")}
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

export default function Categories() {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---------- load categories ----------

  const loadCategories = async () => {
    setLoadingList(true);
    try {
      const items = await listActiveCategories();
      // listActiveCategories returns only active categories;
      // you might later add an admin-specific endpoint to include inactive.
      setRows(items || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return rows;
    return rows.filter((c) =>
      `${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  // ---------- handlers ----------

  const onAdd = () => {
    setEditing({
      _id: null,
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      isActive: true,
      // UI-only
      imageFile: null,
      imagePreview: null,
    });
    setModalOpen(true);
  };

  const onEdit = (cat) => {
    setEditing({
      ...cat,
      imageFile: null,
      imagePreview: cat.imageUrl || null,
    });
    setModalOpen(true);
  };

  const onDelete = (cat) => {
    setPendingDelete(cat);
    setConfirmOpen(true);
  };

  const resetModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const saveCategory = async () => {
    if (!editing.name.trim()) {
      return alert(t("categories.form.validation.nameRequired"));
    }
    if (!editing.slug.trim()) {
      return alert(t("categories.form.validation.slugRequired"));
    }

    setSaving(true);
    try {
      let imageUrl = editing.imageUrl || "";

      if (editing.imageFile) {
        imageUrl = await uploadLearningFile(editing.imageFile, "category");
      }

      const payload = {
        name: editing.name.trim(),
        slug: editing.slug.trim().toLowerCase(),
        description: editing.description || "",
        imageUrl,
        isActive: editing.isActive ?? true,
      };

      if (editing._id) {
        await updateCategory(editing._id, payload);
      } else {
        await createCategory(payload);
      }

      await loadCategories();
      resetModal();
    } catch (err) {
      console.error("Failed to save category", err);
      alert(t("categories.form.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete._id);
      await loadCategories();
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to delete category", err);
      alert(t("categories.modals.deleteError"));
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
            <h1 className="text-2xl font-bold">{t("categories.title")}</h1>
            <p className="text-sm text-gray-500">{t("categories.subtitle")}</p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            {t("categories.addCategory")}
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder={t("categories.searchPlaceholder")}
            className="w-full sm:w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">{t("categories.allCategories")}</h3>
            {loadingList && (
              <span className="text-xs text-gray-500">
                {t("categories.loading")}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">
                    {t("categories.table.category")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("categories.table.description")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("categories.table.status")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("categories.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
                  <tr
                    key={c._id}
                    className={
                      idx !== filtered.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }
                  >
                    {/* Category cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-200 to-fuchsia-200 overflow-hidden flex items-center justify-center">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-500 px-1 text-center">
                              {t("categories.labels.noImage")}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-400">/{c.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-gray-700 max-w-md">
                      <div className="line-clamp-2">{c.description}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusPill isActive={c.isActive !== false} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <IconButton
                          title={t("categories.actions.edit")}
                          onClick={() => onEdit(c)}
                        >
                          <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                        </IconButton>
                        <IconButton
                          title={t("categories.actions.delete")}
                          onClick={() => onDelete(c)}
                          className="hover:bg-red-50"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loadingList && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-gray-500"
                      colSpan={4}
                    >
                      {t("categories.empty")}
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
              ? t("categories.modals.editTitle")
              : t("categories.modals.addTitle")
          }
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={resetModal}
                disabled={saving}
              >
                {t("categories.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-70"
                onClick={saveCategory}
                disabled={saving}
              >
                {saving
                  ? t("categories.actions.saving")
                  : editing?._id
                  ? t("categories.actions.saveChanges")
                  : t("categories.actions.saveCategory")}
              </button>
            </div>
          }
        >
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="md:col-span-1">
                <label
                  htmlFor="cat-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("categories.form.nameLabel")}
                </label>
                <input
                  id="cat-name"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("categories.form.namePlaceholder")}
                  value={editing.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditing((s) => ({
                      ...s,
                      name: val,
                      slug: s._id ? s.slug : slugify(val),
                    }));
                  }}
                />
              </div>

              {/* Slug */}
              <div className="md:col-span-1">
                <label
                  htmlFor="cat-slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("categories.form.slugLabel")}
                </label>
                <input
                  id="cat-slug"
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("categories.form.slugPlaceholder")}
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, slug: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="cat-desc"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("categories.form.descriptionLabel")}
                </label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("categories.form.descriptionPlaceholder")}
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Image */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("categories.form.imageLabel")}
                </label>
                <FilePickerBox
                  label={t("categories.form.imageDropLabel")}
                  sublabel={t("categories.form.imageDropSub")}
                  accept="image/*"
                  file={editing.imageFile}
                  preview={editing.imagePreview}
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
                      imageUrl: "",
                    }))
                  }
                />
              </div>

              {/* Status */}
              <div className="md:col-span-1 flex items-center mt-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    checked={editing.isActive !== false}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, isActive: e.target.checked }))
                    }
                  />
                  {t("categories.form.activeLabel")}
                </label>
              </div>
            </div>
          )}
        </Modal>

        {/* -------- Delete Confirm Modal -------- */}
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={t("categories.modals.deleteTitle")}
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                {t("categories.actions.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? t("categories.actions.deleting")
                  : t("categories.actions.delete")}
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            {t("categories.modals.deleteConfirm", {
              name: pendingDelete?.name || "",
            })}
          </p>
        </Modal>
      </div>
    </div>
  );
}
