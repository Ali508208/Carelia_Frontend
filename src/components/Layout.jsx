import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
