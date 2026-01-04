import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { Outlet } from "react-router-dom";


export default function DashboardLayout() {
  const { darkMode } = useTheme();
  const { open, hovered, mobileOpen, setMobileOpen } = useSidebar();
  const isExpanded = open || hovered;

  const role = localStorage.getItem("dummyRole") || "student";

  // Window width state for responsive margin
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine marginLeft based on screen size and sidebar state
  const marginLeft =
    windowWidth >= 768 ? (isExpanded ? 256 : 80) : 0; // md breakpoint=768px

  return (
    <div className={`min-h-screen w-full `}>
      
      <Sidebar role={role} />

      

      <div
        className="flex flex-col min-h-screen transition-all duration-300 relative z-10"
        style={{ marginLeft }}
      >
        <TopNavbar />

        <main className={`flex-1 overflow-y-auto pt-16 px-4 md:px-6 lg:px-8 ${darkMode?  "bg-slate-900 text-white": "bg-gray-200 text-gray-800"}`}>
          <h1 className="text-2xl font-bold mb-4 text-left">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
