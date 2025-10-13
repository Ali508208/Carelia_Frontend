// src/pages/Settings.jsx
import { useRef, useState } from "react";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

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
  // mock user profile
  const [profile, setProfile] = useState({
    name: "Alexandra Johnson",
    email: "alexandra.johnson@carelia.com",
    role: "System Administrator",
    createdAt: "2024-01-15",
    lastLogin: "2025-10-07T14:30:00Z",
    status: "Active",
    avatarPreview: null, // if uploaded, show here
  });

  const [edit, setEdit] = useState(false);

  // edit form states
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
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

  const initials = profile.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const openPicker = () => fileRef.current?.click();

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setProfile((p) => ({ ...p, avatarPreview: url }));
  };

  const saveChanges = () => {
    setProfile((p) => ({
      ...p,
      name: form.name,
      email: form.email,
    }));
    setEdit(false);
  };

  const updatePassword = () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      alert("Please fill all password fields.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }
    // TODO: call API – on success:
    setPwd({ current: "", next: "", confirm: "" });
    alert("Password updated.");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {edit ? (
            <button
              onClick={() => setEdit(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Back"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
          ) : null}
          <h1 className="text-2xl font-bold">
            {edit ? "Edit Profile" : "Setting"}
          </h1>
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
              <FieldRow label="Full Name" value={profile.name} />
              <FieldRow label="Email Address" value={profile.email} />
              <FieldRow
                label="Account Created Date"
                value={new Date(profile.createdAt).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              />
              <FieldRow label="Role" value={profile.role} />
              <FieldRow
                label="Last Login"
                value={new Date(profile.lastLogin).toLocaleString()}
              />
              <FieldRow label="Account Status">
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
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* ====== EDIT MODE ====== */}
        {edit && (
          <div className="space-y-6">
            {/* Profile Settings card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="font-semibold mb-5">Profile Settings</h3>

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
                    title="Edit photo"
                  >
                    <CameraIcon className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-sm text-gray-500">
                    Upload a new profile picture to personalize your account
                  </p>
                  <button
                    onClick={openPicker}
                    className="mt-2 text-sm text-violet-600 hover:text-violet-700"
                    type="button"
                  >
                    Edit Photo
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
                    Full Name
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-violet-500"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveChanges}
                  className="rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Security Settings card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="font-semibold mb-5">Security Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Change Password</p>

              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type={show.current ? "text" : "password"}
                    className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Enter current password"
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
                    title={show.current ? "Hide" : "Show"}
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
                      New Password
                    </label>
                    <input
                      type={show.next ? "text" : "password"}
                      className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                      placeholder="Enter new password"
                      value={pwd.next}
                      onChange={(e) =>
                        setPwd((s) => ({ ...s, next: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                      className="absolute right-2 bottom-2.5 p-2 text-gray-500 hover:text-gray-700"
                      title={show.next ? "Hide" : "Show"}
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
                      Confirm New Password
                    </label>
                    <input
                      type={show.confirm ? "text" : "password"}
                      className="mt-1 w-full rounded-xl border-gray-300 px-4 py-3 pr-10 focus:border-violet-500 focus:ring-violet-500"
                      placeholder="Confirm new password"
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
                      title={show.confirm ? "Hide" : "Show"}
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
                  className="rounded-xl bg-violet-600 text-white px-4 py-2.5 font-medium hover:bg-violet-700"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
