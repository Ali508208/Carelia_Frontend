import { useMemo, useState, useRef } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  PlayCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/* ---------- small UI helpers ---------- */

const StatusPill = ({ status }) => {
  const map = {
    Active: { bg: "bg-emerald-50", text: "text-emerald-700" },
    Draft: { bg: "bg-amber-50", text: "text-amber-700" },
  };
  const c = map[status] ?? map.Active;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {status}
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl mt-10 bg-white rounded-2xl shadow-xl">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="p-6">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dropzone = ({ label, sublabel }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex items-center justify-center text-center">
      <div>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <PhotoIcon className="h-6 w-6" />
          <p className="font-medium">{label}</p>
        </div>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>
    </div>
  );
};

const VideoDrop = ({ label, sublabel }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl h-36 flex items-center justify-center text-center">
      <div>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <PlayCircleIcon className="h-6 w-6" />
          <p className="font-medium">{label}</p>
        </div>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
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
  const [rows, setRows] = useState(seed);
  const [query, setQuery] = useState(""); // (reserved for future search)
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null); // course object or null
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
    if (!editing.title.trim()) return alert("Please enter a course title");
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
    <div className="-m-6 p-6 bg-gray-50 min-h-[calc(100vh-3rem)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Courses Management</h1>
            <p className="text-sm text-gray-500">
              Manage and organize your courses
            </p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Add Course
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold">All Courses</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Course</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Enrolled</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
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
                      {c.duration} min
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {c.enrolled} users
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={c.status} />
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <IconButton title="Edit" onClick={() => onEdit(c)}>
                          <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          onClick={() => onDelete(c)}
                          className="hover:bg-red-50"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-gray-500"
                      colSpan={6}
                    >
                      No courses found.
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
          title={editing?.id ? "Edit Course" : "Add New Course"}
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                onClick={saveCourse}
              >
                {editing?.id ? "Save Changes" : "Save Course"}
              </button>
            </div>
          }
        >
          {/* Keep local preview state inside editing */}
          {/* Ensure editing has keys: imageFile, imagePreview, videoFile, videoPreview */}
          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Enter course title"
                value={editing?.title ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, title: e.target.value }))
                }
              />
            </div>

            {/* Category */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Enter course description"
                value={editing?.subtitle ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, subtitle: e.target.value }))
                }
              />
            </div>

            {/* Duration */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
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
                Course Image
              </label>
              <FilePickerBox
                type="image"
                label="Click to upload image or drag and drop"
                sublabel="PNG, JPG up to 10MB"
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
                Course Video
              </label>
              <FilePickerBox
                type="video"
                height="h-36"
                label="Click to upload video or drag and drop"
                sublabel="MP4, MOV, AVI up to 500MB"
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
          title="Delete Course"
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{pendingDelete?.title}</span>? This
            action cannot be undone.
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
            title="Remove file"
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
