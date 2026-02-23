import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  listImpulses,
  createImpulse,
  updateImpulse,
  deleteImpulse,
  uploadImpulseAudio,
} from "../services/dailyImpulseAdminService";

/* ─── tiny helpers ─────────────────────────── */

const fmtSec = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
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
    const fn = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {/* Footer */}
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Audio upload sub-component ──────────── */

function AudioUploader({ currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const ref = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please select an audio file (mp3, wav, ogg…)");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // Simulate progress ticks while uploading
      const ticker = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 300);

      const url = await uploadImpulseAudio(file);
      clearInterval(ticker);
      setProgress(100);

      // Try to get audio duration from the file itself
      const audioEl = new Audio(URL.createObjectURL(file));
      audioEl.onloadedmetadata = () => {
        onUploaded(url, Math.round(audioEl.duration));
        setUploading(false);
        setProgress(0);
      };
      audioEl.onerror = () => {
        onUploaded(url, 0);
        setUploading(false);
        setProgress(0);
      };
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition ${
          uploading
            ? "border-violet-300 bg-violet-50"
            : currentUrl
              ? "border-emerald-300 bg-emerald-50"
              : "border-gray-200 hover:border-violet-300 hover:bg-violet-50"
        }`}
        onClick={() => !uploading && ref.current?.click()}
      >
        <input
          ref={ref}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFile}
        />
        <div
          className={`p-2 rounded-lg ${
            currentUrl ? "bg-emerald-100" : "bg-violet-100"
          }`}
        >
          {currentUrl ? (
            <CheckIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ArrowUpTrayIcon className="h-5 w-5 text-violet-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div>
              <p className="text-sm font-medium text-violet-700">Uploading…</p>
              <div className="mt-1 h-1.5 w-full bg-violet-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : currentUrl ? (
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Audio uploaded ✓
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {currentUrl}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload audio
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                MP3, WAV, OGG up to 100 MB
              </p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* ─── Field helpers ────────────────────────── */

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${className}`}
    {...props}
  />
);

/* ─── Empty state ─────────────────────────── */

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-4 rounded-full bg-violet-50 mb-4">
      <MusicalNoteIcon className="h-10 w-10 text-violet-400" />
    </div>
    <h3 className="text-lg font-semibold mb-1">No Daily Impulses Yet</h3>
    <p className="text-gray-500 text-sm mb-6 max-w-xs">
      Add your first audio impulse so users can listen to a daily motivation on
      the home screen.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
    >
      <PlusIcon className="h-4 w-4" />
      Add First Impulse
    </button>
  </div>
);

/* ─── Default form state ──────────────────── */

const EMPTY_FORM = {
  title: "Daily Impulse",
  subtitle: "",
  quote: "",
  audioUrl: "",
  audioLenSec: 0,
  isActive: true,
  order: 0,
};

/* ═══════════════════════════════════════════════════════ */
/*                    MAIN PAGE                           */
/* ═══════════════════════════════════════════════════════ */

export default function DailyImpulsePage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load list ──────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await listImpulses();
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load impulses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Open add modal ─────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  // ─── Open edit modal ────────────────────────────────
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle,
      quote: item.quote,
      audioUrl: item.audioUrl,
      audioLenSec: item.audioLenSec,
      isActive: item.isActive,
      order: item.order ?? 0,
    });
    setModalOpen(true);
  };

  // ─── Save (create or update) ─────────────────────────
  const handleSave = async () => {
    if (!form.subtitle.trim() || !form.quote.trim() || !form.audioUrl.trim()) {
      return; // basic guard
    }
    setSaving(true);
    try {
      if (editItem) {
        const updated = await updateImpulse(editItem._id, form);
        setItems((prev) =>
          prev.map((i) => (i._id === editItem._id ? updated : i)),
        );
      } else {
        const created = await createImpulse(form);
        setItems((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteImpulse(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle active quickly ────────────────────────
  const toggleActive = async (item) => {
    try {
      const updated = await updateImpulse(item._id, {
        isActive: !item.isActive,
      });
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const canSave =
    form.subtitle.trim() && form.quote.trim() && form.audioUrl.trim();

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("impulse.title")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {t("impulse.subtitle")}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            {t("impulse.addBtn")}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg
              className="animate-spin h-8 w-8 text-violet-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
            <EmptyState onAdd={openAdd} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("impulse.table.impulse")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("impulse.table.quote")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("impulse.table.duration")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("impulse.table.status")}
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-50 shrink-0">
                          <MusicalNoteIcon className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.subtitle}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                        {item.quote}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <PlayCircleIcon className="h-4 w-4 text-gray-400" />
                        {fmtSec(item.audioLenSec)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(item)}
                        title="Toggle active"
                      >
                        <StatusPill active={item.isActive} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded-lg hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editItem ? t("impulse.modal.editTitle") : t("impulse.modal.addTitle")
        }
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t("impulse.modal.saving") : t("impulse.modal.save")}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Title */}
          <Field label={t("impulse.form.title")}>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Daily Impulse"
            />
          </Field>

          {/* Subtitle */}
          <Field label={t("impulse.form.subtitle")} required>
            <Input
              value={form.subtitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, subtitle: e.target.value }))
              }
              placeholder="e.g. Ground yourself"
            />
          </Field>

          {/* Quote */}
          <Field
            label={t("impulse.form.quote")}
            required
            hint={t("impulse.form.quoteHint")}
          >
            <Textarea
              rows={3}
              value={form.quote}
              onChange={(e) =>
                setForm((f) => ({ ...f, quote: e.target.value }))
              }
              placeholder="e.g. Take three slow breaths and notice how your body feels."
            />
          </Field>

          {/* Audio upload */}
          <Field label={t("impulse.form.audio")} required>
            <AudioUploader
              currentUrl={form.audioUrl}
              onUploaded={(url, lenSec) =>
                setForm((f) => ({
                  ...f,
                  audioUrl: url,
                  audioLenSec: lenSec || f.audioLenSec,
                }))
              }
            />
          </Field>

          {/* Audio duration override */}
          <Field
            label={t("impulse.form.duration")}
            hint={t("impulse.form.durationHint")}
          >
            <Input
              type="number"
              min={0}
              value={form.audioLenSec}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  audioLenSec: Number(e.target.value),
                }))
              }
              placeholder="e.g. 45"
            />
          </Field>

          {/* Order */}
          <Field
            label={t("impulse.form.order")}
            hint={t("impulse.form.orderHint")}
          >
            <Input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({ ...f, order: Number(e.target.value) }))
              }
            />
          </Field>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {t("impulse.form.active")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("impulse.form.activeHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? "bg-violet-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Confirm Modal ────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t("impulse.deleteModal.title")}
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
            >
              {deleting
                ? t("impulse.deleteModal.deleting")
                : t("impulse.deleteModal.confirm")}
            </button>
          </>
        }
      >
        <p className="text-gray-600 text-sm">
          {t("impulse.deleteModal.message", {
            name: deleteTarget?.subtitle || "",
          })}
        </p>
      </Modal>
    </div>
  );
}
