import SidebarItem from "./SidebarItem";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { sidebarMenu } from "../data/sidebarMenu";
import sidebarLogo from "../assets/images/sidebarLogo.avif";

export default function Sidebar({ role }) {
  const { darkMode } = useTheme();
  const {
    open,
    hovered,
    setHovered,
    mobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();

  const isExpanded = open || hovered || mobileOpen;
  const menuItems = sidebarMenu(role);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-30 md:hidden"
        />
      )}

      <aside
        onMouseEnter={() => {
          if (window.innerWidth >= 768 && !open) setHovered(true);
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 768 && !open) setHovered(false);
        }}
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300  
          ${
            darkMode
              ? "bg-gray-900 border-r border-gray-700 shadow-lg"
              : "bg-white border-r border-gray-200 "
          }
          ${isExpanded ? "w-64" : "w-24"}
          ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Header */}
        <div
          className={`h-16 flex items-center px-4  ${
            darkMode
              ? "bg-gray-900 border-b border-gray-700 shadow-lg"
              : "bg-white border-b border-gray-200 "
          }

          ${isExpanded ? "justify-between" : "justify-center"}`}
        >
          {isExpanded && (
            <span className="ml-4">
              {/* Role logo */}
              <img
                src={sidebarLogo}
      
                alt={`${role || "Dashboard"} Logo`}
                className="w-10 h-10 rounded-full"
              />

              {/* Optional text next to logo */}
             
            </span>
          )}

          <button
            onClick={toggleSidebar}
            className="hidden md:block text-xl text-gray-500"
          >
            {open ? "×" : "☰"}
          </button>

          <button onClick={toggleMobileSidebar} className="md:hidden text-gray-500 text-xl">
            ×
          </button>
        </div>

        {/* Menu */}
        <div
          className={`
    pt-3 pb-12
 space-y-2 overflow-y-auto h-[calc(100vh-64px)]
    transition-all
    ${isExpanded ? "px-6" : "px-4"}
  `}
        >
          {menuItems.map((section, idx) => (
            <SidebarItem
              key={idx}
              item={section}
              desktopCollapsed={!isExpanded}
              forceExpand={mobileOpen}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
