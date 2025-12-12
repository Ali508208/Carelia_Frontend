// src/pages/Settings.jsx
import { useRef, useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import {
  fetchCurrentAdmin,
  updateAdminProfile,
  changeAdminPassword,
} from "../services/adminAuthService";

/** Small dropdown to switch languages (EN/DE) */
function LanguageMenu() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = i18n.language?.startsWith("de") ? "de" : "en";
  const label = current === "de" ? t("common.german") : t("common.english");

  const setLang = (lng) => {
    localStorage.setItem("app_lang", lng); // ✅ persist
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t("common.language")}
      >
        🌐 {label}
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg z-10"
        >
          <button
            role="option"
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
            onClick={() => setLang("en")}
          >
            {t("common.english")}
          </button>
          <button
            role="option"
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
            onClick={() => setLang("de")}
          >
            {t("common.german")}
          </button>
        </div>
      )}
    </div>
  );
}

const Pill = ({ children, color = "emerald" }) => {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
};

const FieldRow = ({ label, value, children }) => (
  <div className="py-4">
    <p className="text-sm text-gray-500">{label}</p>
    {children ? (
      children
    ) : (
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    )}
  </div>
);

export default function Settings() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // edit form states
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const fileRef = useRef(null);

  // Load current admin on mount
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const admin = await fetchCurrentAdmin();
        if (!admin) {
          setLoading(false);
          return;
        }

        const createdAt = admin.createdAt || new Date().toISOString();
        const lastLogin =
          admin.lastLogin || admin.updatedAt || admin.createdAt || createdAt;

        setProfile({
          id: admin.id || admin._id,
          name: admin.fullName,
          email: admin.email,
          role: admin.role || "Administrator",
          createdAt,
          lastLogin,
          status: t("common.active"),
          avatarPreview: admin.profileImage || null, // if you return it from /me
        });

        setForm({
          name: admin.fullName,
          email: admin.email,
        });
      } catch (err) {
        console.error("Failed to load admin profile", err);
        alert(t("settings.alerts.loadError") || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, [t]);

  const initials =
    profile?.name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const openPicker = () => fileRef.current?.click();

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    // Only local preview for now – backend upload can be added later
    setProfile((p) => (p ? { ...p, avatarPreview: url } : p));
  };

  const saveChanges = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert(t("settings.alerts.fillAll") || "Please fill all required fields.");
      return;
    }

    try {
      setSavingProfile(true);

      const updated = await updateAdminProfile({
        fullName: form.name.trim(),
        email: form.email.trim(),
        // profileImage: REAL_URL_FROM_UPLOAD (TODO: when avatar upload is wired)
      });

      setProfile((p) =>
        p
          ? {
              ...p,
              name: updated.fullName,
              email: updated.email,
              role: updated.role || p.role,
            }
          : p
      );
      setEdit(false);
      alert(
        t("settings.alerts.profileUpdated") || "Profile updated successfully."
      );
    } catch (err) {
      console.error("Failed to update admin profile", err);
      alert(
        t("settings.alerts.profileUpdateError") ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      alert(t("settings.alerts.fillAll"));
      return;
    }
    if (pwd.next !== pwd.confirm) {
      alert(t("settings.alerts.mismatch"));
      return;
    }

    try {
      setChangingPassword(true);
      await changeAdminPassword(pwd.current, pwd.next);
      setPwd({ current: "", next: "", confirm: "" });
      alert(t("settings.alerts.updated"));
    } catch (err) {
      console.error("Failed to change admin password", err);
      alert(
        t("settings.alerts.passwordError") ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          {t("settings.loading") || "Loading settings..."}
        </p>
      </div>
    );
  }

  // If profile failed to load completely
  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          {t("settings.noProfile") || "Admin profile not available."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {edit ? (
              <button
                onClick={() => setEdit(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={t("settings.back")}
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
              </button>
            ) : null}
            <h1 className="text-2xl font-bold">
              {edit ? t("settings.editTitle") : t("settings.title")}
            </h1>
          </div>

          {/* Language switcher */}
          <LanguageMenu />
        </div>

        {/* ====== VIEW MODE ====== */}
        {!edit && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative">
                {profile.avatarPreview ? (
                  <img
                    src={profile.avatarPreview}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover"
                    draggable="false"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                    {initials}
                  </div>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold">{profile.name}</h2>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <p className="text-xs text-gray-400">{profile.role}</p>
            </div>

            {/* Info rows */}
            <div className="mt-6 divide-y divide-gray-100">
              <FieldRow
                label={t("settings.view.fullName")}
                value={profile.name}
              />
              <FieldRow
                label={t("settings.view.email")}
                value={profile.email}
              />
              <FieldRow
                label={t("settings.view.createdAt")}
                value={
                  profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"
                }
              />
              <FieldRow label={t("settings.view.role")} value={profile.role} />
              <FieldRow
                label={t("settings.view.lastLogin")}
                value={
                  profile.lastLogin
                    ? new Date(profile.lastLogin).toLocaleString()
                    : "-"
                }
              />
              <FieldRow label={t("settings.view.status")}>
                <div className="mt-1">
                  <Pill color="emerald">{profile.status}</Pill>
                </div>
              </FieldRow>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  setForm({ name: profile.name, email: profile.email });
                  setEdit(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 shadow-md"
              >
                <PencilSquareIcon className="h-5 w-5" />
                {t("settings.view.editProfile")}
              </button>
            </div>
          </div>
        )}

        {/* ====== EDIT MODE ====== */}
        {edit && (
          <div className="space-y-6">
            {/* Profile Settings card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="font-semibold mb-5">
                {t("settings.profileCard.title")}
              </h3>

              <div className="flex items-start gap-4 mb-6">
                {/* Avatar + edit */}
                <div className="relative">
                  {profile.avatarPreview ? (
                    <img
                      src={profile.avatarPreview}
                      alt="avatar"
                      className="h-12 w-12 rounded-full object-cover"
                      draggable="false"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openPicker}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
                    title={t("settings.profileCard.editPhoto")}
                  >
                    <CameraIcon className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {t("settings.profileCard.profilePhoto")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("settings.profileCard.profilePhotoHint")}
                  </p>
                  <button
                    onClick={openPicker}
                    className="mt-2 text-sm text-violet-600 hover:text-violet-700"
                    type="button"
                  >
                    {t("settings.profileCard.editPhoto")}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onPick}
                  />
                </div>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("settings.profileCard.nameLabel")}
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder={t("settings.profileCard.namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("settings.profileCard.emailLabel")}
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder={t("settings.profileCard.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveChanges}
                  className="rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 disabled:opacity-70"
                  disabled={savingProfile}
                >
                  {savingProfile
                    ? t("settings.profileCard.saving") || "Saving..."
                    : t("settings.profileCard.save")}
                </button>
              </div>
            </div>

            {/* Security Settings card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="font-semibold mb-5">
                {t("settings.securityCard.title")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("settings.securityCard.changePassword")}
              </p>

              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("settings.securityCard.current")}
                  </label>
                  <input
                    type={show.current ? "text" : "password"}
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                    placeholder={t("settings.securityCard.currentPlaceholder")}
                    value={pwd.current}
                    onChange={(e) =>
                      setPwd((s) => ({ ...s, current: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShow((s) => ({ ...s, current: !s.current }))
                    }
                    className="absolute right-2 bottom-2.5 p-2 text-gray-500 hover:text-gray-700"
                    title={
                      show.current
                        ? t("settings.securityCard.hide")
                        : t("settings.securityCard.show")
                    }
                  >
                    {show.current ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* New + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("settings.securityCard.new")}
                    </label>
                    <input
                      type={show.next ? "text" : "password"}
                      className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                      placeholder={t("settings.securityCard.newPlaceholder")}
                      value={pwd.next}
                      onChange={(e) =>
                        setPwd((s) => ({ ...s, next: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                      className="absolute right-2 bottom-2.5 p-2 text-gray-500 hover:text-gray-700"
                      title={
                        show.next
                          ? t("settings.securityCard.hide")
                          : t("settings.securityCard.show")
                      }
                    >
                      {show.next ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("settings.securityCard.confirm")}
                    </label>
                    <input
                      type={show.confirm ? "text" : "password"}
                      className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                      placeholder={t(
                        "settings.securityCard.confirmPlaceholder"
                      )}
                      value={pwd.confirm}
                      onChange={(e) =>
                        setPwd((s) => ({ ...s, confirm: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow((s) => ({ ...s, confirm: !s.confirm }))
                      }
                      className="absolute right-2 bottom-2.5 p-2 text-gray-500 hover:text-gray-700"
                      title={
                        show.confirm
                          ? t("settings.securityCard.hide")
                          : t("settings.securityCard.show")
                      }
                    >
                      {show.confirm ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={updatePassword}
                  className="rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700 disabled:opacity-70"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? t("settings.securityCard.updating") || "Updating..."
                    : t("settings.securityCard.update")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
