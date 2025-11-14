import { useMemo, useState, useEffect } from "react";
import {
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { listAdminUsers, updateUserStatus } from "../services/adminService";

/* ---------- UI bits ---------- */

const StatusPill = ({ statusKey }) => {
  const { t } = useTranslation();
  const map = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700" },
    blocked: { bg: "bg-rose-50", text: "text-rose-700" },
  };
  const k = map[statusKey] ? statusKey : "active";
  const c = map[k];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {t(`users.status.${k}`)}
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

/* ---------- page ---------- */

export default function Users() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null); // "block" | "activate"

  const filtered = useMemo(() => {
    if (!query) return rows;
    return rows.filter((u) =>
      `${u.name} ${u.email} ${u.role}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [rows, query]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const users = await listAdminUsers();
        setRows(
          users.map((u) => ({
            id: u._id,
            name: u.fullName,
            email: u.email,
            role: u.role === "admin" ? "Admin" : "Learner",
            joined: u.createdAt,
            status:
              (u.status || "active")[0].toUpperCase() +
              (u.status || "active").slice(1), // "Active"/"Blocked"
            avatar: {
              bg: "from-violet-300 to-fuchsia-300", // or random if you want
            },
          }))
        );
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openView = (u) => {
    setSelected(u);
    setViewOpen(true);
  };

  const openConfirm = (u, type) => {
    setSelected(u);
    setActionType(type);
    setConfirmOpen(true);
  };

  const doConfirm = async () => {
    if (!selected || !actionType) return;
    const newStatus = actionType === "block" ? "blocked" : "active";
    try {
      await updateUserStatus(selected.id, newStatus);
      setRows((prev) =>
        prev.map((u) =>
          u.id === selected.id
            ? { ...u, status: newStatus[0].toUpperCase() + newStatus.slice(1) }
            : u
        )
      );
      setConfirmOpen(false);
      setSelected(null);
      setActionType(null);
    } catch (err) {
      console.error("Failed to update user status", err);
      // optional: show toast/alert
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{t("users.title")}</h1>
            <p className="text-sm text-gray-500">{t("users.subtitle")}</p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                className="w-full rounded-xl border-gray-300 pl-10 pr-3 py-2.5 focus:border-violet-500 focus:ring-violet-500"
                placeholder={t("users.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Language switcher */}
            {/* <LanguageMenu /> */}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">{t("users.allUsers")}</h3>
            {loading && (
              <span className="text-xs text-gray-400">
                {t("users.loading")}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.user")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.email")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.role")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.joined")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.status")}
                  </th>
                  <th className="px-6 py-3 font-medium">
                    {t("users.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u, idx) => {
                  const statusKey = (u.status || "").toLowerCase(); // "active" | "blocked"
                  return (
                    <tr
                      key={u.id}
                      className={`${
                        idx !== filtered.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${u.avatar.bg} flex items-center justify-center text-white font-semibold`}
                          >
                            {u.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 text-gray-700">{u.role}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(u.joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill statusKey={statusKey} />
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <IconButton
                            title={t("users.actions.view")}
                            onClick={() => openView(u)}
                          >
                            <EyeIcon className="h-5 w-5 text-gray-700" />
                          </IconButton>

                          {statusKey === "blocked" ? (
                            <IconButton
                              title={t("users.actions.activate")}
                              onClick={() => openConfirm(u, "activate")}
                              className="hover:bg-emerald-50"
                            >
                              <LockOpenIcon className="h-5 w-5 text-emerald-600" />
                            </IconButton>
                          ) : (
                            <IconButton
                              title={t("users.actions.block")}
                              onClick={() => openConfirm(u, "block")}
                              className="hover:bg-rose-50"
                            >
                              <LockClosedIcon className="h-5 w-5 text-rose-600" />
                            </IconButton>
                          )}
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
                      {t("users.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Info Modal */}
        <Modal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title={t("users.modals.userInfo")}
          footer={
            <div className="flex items-center justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                onClick={() => setViewOpen(false)}
              >
                {t("users.actions.close")}
              </button>
            </div>
          }
        >
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${selected.avatar.bg} flex items-center justify-center text-white font-semibold`}
                >
                  {selected.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <div className="text-lg font-semibold">{selected.name}</div>
                  <div className="text-sm text-gray-500">{selected.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">{t("users.table.role")}</p>
                  <p className="font-medium">{selected.role}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">{t("users.table.joined")}</p>
                  <p className="font-medium">
                    {new Date(selected.joined).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">{t("users.table.status")}</p>
                  <p className="font-medium">
                    {t(`users.status.${(selected.status || "").toLowerCase()}`)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">User ID</p>
                  <p className="font-medium">{selected.id}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Block/Activate Confirm Modal */}
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={
            actionType === "block"
              ? t("users.modals.blockTitle")
              : t("users.modals.activateTitle")
          }
          footer={
            <div className="flex items-center gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setConfirmOpen(false)}
              >
                {t("users.actions.cancel")}
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-white ${
                  actionType === "block"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
                onClick={doConfirm}
              >
                {actionType === "block"
                  ? t("users.actions.block")
                  : t("users.actions.activate")}
              </button>
            </div>
          }
        >
          {selected && (
            <p className="text-gray-700">
              {t("users.modals.confirmText", {
                action:
                  actionType === "block"
                    ? t("users.actions.block").toLowerCase()
                    : t("users.actions.activate").toLowerCase(),
                name: selected.name,
              })}
            </p>
          )}
        </Modal>
      </div>
    </div>
  );
}
