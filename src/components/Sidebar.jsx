// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-violet-50";
const linkActive = "bg-violet-600 text-white hover:bg-violet-600";
const linkInactive = "text-gray-700";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${linkBase} ${isActive ? linkActive : linkInactive}`
    }
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-md mt-24 bg-white rounded-2xl shadow-xl">
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
}

export default function Sidebar() {
  const nav = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("authToken");
    nav("/login", { replace: true });
  };

  return (
    <>
      <aside className="h-screen w-64 bg-white p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 py-4">
          <img src={logo} alt="Carelia" className="h-8 w-auto object-contain" />
        </div>

        <nav className="mt-6 space-y-2">
          <NavItem to="/dashboard" icon={HomeIcon} label="Dashboard" />
          <NavItem to="/courses" icon={BookOpenIcon} label="Courses" />
          <NavItem to="/users" icon={UsersIcon} label="Users" />
          <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" />
        </nav>

        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Confirm Logout Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Log out"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={doLogout}
            >
              Logout
            </button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to log out of your account?
        </p>
      </Modal>
    </>
  );
}
