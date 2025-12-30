import { useState } from "react";
import { sidebarMenu } from "../data/sidebarMenu";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        bg-white border-r
        h-screen
        sticky top-0
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        hidden md:block
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <h1 className="text-xl font-bold text-blue-600">
            PreSkool
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-blue-600"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      <div className="p-3 space-y-6">
        {sidebarMenu.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="text-xs text-gray-400 font-semibold mb-2">
                {section.section}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item, i) => (
                <SidebarItem
                  key={i}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
