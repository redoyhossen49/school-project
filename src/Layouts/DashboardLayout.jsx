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

  const role = localStorage.getItem("role");

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
  const marginLeft = windowWidth >= 768 ? (isExpanded ? 256 : 80) : 0; // md breakpoint=768px

  return (
    <div className={`min-h-screen w-full `}>
      <Sidebar role={role} />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 relative z-10"
        style={{ marginLeft }}
      >
        <TopNavbar />

        <main
          className={`flex-1 overflow-y-auto pt-16 pb-8 px-1 md:px-4  ${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 shadow-2xl text-gray-800"
          }`}
        >
          

          <Outlet />
        </main>
      </div>
    </div>
  );
}
