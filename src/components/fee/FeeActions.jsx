import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function FeeActions({ fee, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true); // true -> dropdown below, false -> dropdown above
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownHeight = 70; // approx height of dropdown
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < dropdownHeight) {
        setPositionTop(false); // show above
      } else {
        setPositionTop(true); // show below
      }
    }
    setOpen(!open);
  };

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`h-6 w-6 p-0 flex items-center justify-center rounded transition-colors ${
          darkMode
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute -right-4 w-24 border shadow-sm z-50 ${
            positionTop ? "top-8" : "bottom-8"
          } ${
            darkMode
              ? "bg-gray-500 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          <button
            onClick={() => {
              setOpen(false); // Close dropdown
              onEdit(fee);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode
                ? "hover:bg-gray-600 text-gray-100"
                : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            <FiEdit className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            Edit
          </button>

          <button
            onClick={() => {
              setOpen(false); // Close dropdown
              if (confirm("Are you sure you want to delete this fee?")) {
                onDelete(fee.sl); // Use fee.sl for deletion
              }
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode
                ? "text-red-400 hover:bg-red-900/30"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
