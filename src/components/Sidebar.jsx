import { NavLink } from "react-router-dom";
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

export default function Sidebar() {
  const logout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <aside className="h-screen w-64  bg-white p-4 flex flex-col">
      <div className="flex items-center gap-3 px-2 py-4">
        <img src={logo} alt="Carelia" className="h-8 w-20 rounded" />
      </div>

      <nav className="mt-6 space-y-2">
        <NavItem to="/dashboard" icon={HomeIcon} label="Dashboard" />
        <NavItem to="/courses" icon={BookOpenIcon} label="Courses" />
        <NavItem to="/users" icon={UsersIcon} label="Users" />
        <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" />
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}
