import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function SidebarItem({ item, collapsed }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  // Submenu
  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center w-full
            px-3 py-2 rounded-lg
            text-gray-600
            hover:bg-blue-50 hover:text-blue-600
          "
        >
          <Icon size={18} />
          {!collapsed && (
            <>
              <span className="ml-3 flex-1 text-left">
                {item.label}
              </span>
              <ChevronDown
                size={16}
                className={`transition ${open ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {!collapsed && open && (
          <div className="ml-9 mt-1 space-y-1">
            {item.children.map((sub, i) => (
              <NavLink
                key={i}
                to={sub.path}
                className={({ isActive }) =>
                  `block px-3 py-1 rounded-md text-sm
                  ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-600"
                  }`
                }
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Normal item
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-lg
        ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
        }`
      }
    >
      <Icon size={18} />
      {!collapsed && (
        <span className="ml-3">{item.label}</span>
      )}
    </NavLink>
  );
}
