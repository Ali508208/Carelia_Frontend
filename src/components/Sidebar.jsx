import { useEffect, useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adminLogout } from "../services/adminAuthService";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-violet-50";
const linkActive = "bg-violet-600 text-white hover:bg-violet-600";
const linkInactive = "text-gray-700";

const NavItem = ({ to, icon: Icon, label, onNavigate }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${linkBase} ${isActive ? linkActive : linkInactive}`
    }
    onClick={onNavigate}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Blurred, darkened backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl ring-1 ring-black/5">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Sidebar with a global topbar (desktop + mobile)
 * - Mobile: off-canvas with overlay
 * - Desktop: docked panel that can be shown/hidden via topbar hamburger
 *
 * Props:
 *   open: boolean (controlled by Layout)
 *   setOpen: fn(next:boolean)
 */
export default function Sidebar({ open, setOpen }) {
  const nav = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { t } = useTranslation();

  const isMobile = useMemo(
    () => window.matchMedia && window.matchMedia("(max-width: 767px)").matches,
    []
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen((v) => !v), [setOpen]);

  const doLogout = () => {
    adminLogout();
    nav("/login", { replace: true });
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Prevent body scroll only for MOBILE drawer
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

  return (
    <>
      {/* Top bar (now on ALL breakpoints) */}
      <div className="fixed top-0 inset-x-0 z-[60] flex items-center justify-between bg-white/80 backdrop-blur px-4 py-3 ">
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle sidebar"
            aria-controls="app-sidebar"
            aria-expanded={open}
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100"
          >
            {open ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <img src={logo} alt="Carelia" className="h-7 w-auto object-contain" />
        </div>

        {/* Right side area (optional actions, user menu…) */}
        <div className="flex items-center gap-2">
          {/* Placeholder for future actions */}
        </div>
      </div>

      {/* Overlay (mobile only) */}
      {open && (
        <button
          className="fixed inset-0 z-[50] bg-black/20 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={close}
        />
      )}

      {/* Sidebar drawer (slides on ALL breakpoints) */}
      <aside
        id="app-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-[55] w-64 bg-white p-4 flex flex-col shadow-lg transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          // Height minus the topbar (56px-ish)
          "pt-2 mt-14",
          // On desktop it’s docked; the Layout adds md:pl-64 when open
          "md:shadow md:mt-14",
        ].join(" ")}
      >
        {/* Brand (desktop extra space / optional) */}
        {/* <div className="hidden md:flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Carelia" className="h-8 w-auto object-contain" />
        </div> */}

        <nav className="mt-2 space-y-2">
          <NavItem
            to="/dashboard"
            icon={HomeIcon}
            label={t("dashboardside")}
            onNavigate={() => (isMobile ? close() : undefined)}
          />
          <NavItem
            to="/categories"
            icon={TagIcon}
            label={t("categoriesside")}
            onNavigate={() => (isMobile ? close() : undefined)}
          />
          <NavItem
            to="/courses"
            icon={BookOpenIcon}
            label={t("coursesside")}
            onNavigate={() => (isMobile ? close() : undefined)}
          />
          <NavItem
            to="/users"
            icon={UsersIcon}
            label={t("usersside")}
            onNavigate={() => (isMobile ? close() : undefined)}
          />
          <NavItem
            to="/settings"
            icon={Cog6ToothIcon}
            label={t("settingsside")}
            onNavigate={() => (isMobile ? close() : undefined)}
          />
        </nav>

        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          {t("logout")}
        </button>
      </aside>

      {/* Confirm Logout Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("logout_confirm_title")}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setConfirmOpen(false)}
            >
              {t("cancel")}
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => {
                setConfirmOpen(false);
                doLogout();
              }}
            >
              {t("logout")}
            </button>
          </div>
        }
      >
        <p className="text-gray-700">{t("logout_confirm_message")}</p>
      </Modal>
    </>
  );
}
