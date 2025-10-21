import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: replace with real API
    await new Promise((r) => setTimeout(r, 700));
    localStorage.setItem("authToken", "demo-token");
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-rose-500" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="relative m-auto max-w-md p-10 text-white">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("auth.login.brandTitle")}
            </h1>
          </div>
          <p className="text-white/90 leading-relaxed">
            {t("auth.login.brandDesc")}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {t("auth.login.bullet1")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {t("auth.login.bullet2")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {t("auth.login.bullet3")}
            </li>
          </ul>
        </div>
      </div>

      {/* Right login card */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={logo}
              alt="Carelia"
              className="h-10 w-10 object-contain"
              draggable="false"
            />
            <div>
              <h2 className="text-xl font-semibold leading-tight">
                {t("auth.login.welcome")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("auth.login.subtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("auth.login.emailLabel")}
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border-gray-300 pl-10 pr-3 py-2.5 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("auth.login.passwordLabel")}
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border-gray-300 pl-10 pr-10 py-2.5 focus:border-violet-500 focus:ring-violet-500"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPwd
                      ? t("auth.login.hidePassword")
                      : t("auth.login.showPassword")
                  }
                  title={
                    showPwd
                      ? t("auth.login.hidePassword")
                      : t("auth.login.showPassword")
                  }
                >
                  {showPwd ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, remember: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                {t("auth.login.rememberMe")}
              </label>
              <button
                type="button"
                className="text-sm text-violet-600 hover:text-violet-700"
                onClick={() => alert("Forgot password flow TBD")}
              >
                {t("auth.login.forgot")}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 text-white py-3 font-medium hover:bg-violet-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
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
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {t("auth.login.legal")}{" "}
              <span className="underline decoration-dotted">
                {t("auth.login.terms")}
              </span>{" "}
              {t("auth.login.and")}{" "}
              <span className="underline decoration-dotted">
                {t("auth.login.privacy")}
              </span>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
