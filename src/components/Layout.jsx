import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Default: open on desktop, closed on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const setByMQ = () => setSidebarOpen(mq.matches);
    setByMQ();
    mq.addEventListener("change", setByMQ);
    return () => mq.removeEventListener("change", setByMQ);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top padding for the sticky topbar inside Sidebar (56px approx) */}
      <main
        className={`pt-14 p-6 transition-[padding] duration-300 ${
          sidebarOpen ? "md:pl-64" : "md:pl-0"
        }`}
      >
        <Outlet />
      </main>

      {/* Sidebar renders the topbar too, and receives control props */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
    </div>
  );
}
