import SidebarItem from "./SidebarItem";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { sidebarMenu } from "../data/sidebarMenu";

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

  // Sidebar expanded logic
  const isExpanded = open || hovered || mobileOpen;

  // role based menu
  const menuItems = sidebarMenu(role);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-30 md:hidden "
        />
      )}

      <aside
        onMouseEnter={() => {
          // ✅ desktop only hover open
          if (window.innerWidth >= 768 && !open) {
            setHovered(true);
          }
        }}
        onMouseLeave={() => {
          // ✅ desktop only hover close
          if (window.innerWidth >= 768 && !open) {
            setHovered(false);
          }
        }}
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-amber-100
          ${darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-700"}
          ${isExpanded ? "w-64" : "w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Header */}
        <div
          className={`h-16 flex items-center px-4 border-b border-amber-100
            ${isExpanded ? "justify-between" : "justify-center"}
          `}
        >
          {isExpanded && (
            <span className="font-bold text-indigo-600 text-lg">
              {role
                ? role.charAt(0).toUpperCase() + role.slice(1)
                : "Dashboard"}{" "}
              Dashboard
            </span>
          )}

          {/* Desktop toggle */}
          <button onClick={toggleSidebar} className="hidden md:block text-xl">
            {open ? "×" : "☰"}
          </button>

          {/* Mobile close */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden text-xl"
          >
            ×
          </button>
        </div>

        {/* Menu */}
        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
          {menuItems?.map((section, idx) => (
            <SidebarItem
              key={idx}
              item={{
                label: section.title,
                icon: section.icon,
                children: section.children,
              }}
              desktopCollapsed={!isExpanded}
              forceExpand={mobileOpen}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
