import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarItem({
  item,
  desktopCollapsed,
  forceExpand = false,
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const Icon = item.icon;

  // collapsed only when desktop + not forced
  const collapsed = desktopCollapsed && !forceExpand;
  const showText = !collapsed;

  // auto open submenu if route matches
  useEffect(() => {
    if (item.children?.length) {
      const active = item.children.some((child) =>
        location.pathname.startsWith(child.path)
      );
      if (active) setOpen(true);
    }
  }, [location.pathname, item.children]);

  // ================= With children =================
  if (item.children?.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center w-full px-3 py-2 rounded-lg transition
            hover:bg-blue-50 hover:text-blue-600
            ${open ? "text-blue-600" : ""}
          `}
        >
          {Icon && <Icon size={18} />}

          {showText && (
            <>
              <span className="ml-3 flex-1 text-left text-sm font-medium">
                {item.label}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {/* children menu */}
        {showText && open && (
          <div className="ml-9 mt-1 space-y-1">
            {item.children.map((sub, i) => (
              <NavLink
                key={i}
                to={sub.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-md text-sm transition
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                {sub.icon && (
                  <sub.icon size={16} className="inline-block mr-2" />
                )}
                {sub.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ================= Without children =================
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-lg transition
        ${
          isActive
            ? "bg-blue-200 text-blue-600 font-medium"
            : "hover:bg-blue-200 hover:text-blue-600"
        }`
      }
    >
      {Icon && <Icon size={18} />}
      {showText && (
        <span className="ml-3 text-sm font-medium">{item.label}</span>
      )}
    </NavLink>
  );
}
