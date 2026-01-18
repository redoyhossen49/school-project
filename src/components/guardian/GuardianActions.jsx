import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function GuardianActions({
  guardian,
  studentId,
  onEdit,
  onDelete,
}) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true); // true = below, false = above
  const ref = useRef(null);

  /* outside click close */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* smart position (top / bottom) */
  const toggleDropdown = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownHeight = 70; // approx
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < dropdownHeight) {
        setPositionTop(false); // show above
      } else {
        setPositionTop(true); // show below
      }
    }
    setOpen((p) => !p);
  };

  return (
    <div ref={ref} className="relative h-6 flex items-center">
      {/* ===== Action Button ===== */}
      <button
        onClick={toggleDropdown}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100"
      >
        <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
      </button>

      {/* ===== Dropdown ===== */}
      {open && (
        <div
          className={`absolute -right-4 w-24 border  z-50
            ${positionTop ? "top-7" : "bottom-7"}
            ${
              darkMode
                ? "bg-gray-500 text-gray-100 border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
        >
          <button
            onClick={() => {
              onEdit(guardian, studentId);
              setOpen(false);
            }}
            className="w-full h-7 flex items-center gap-2 px-3 text-xs hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <FiEdit className="w-3 h-3 text-blue-600" />
            Edit
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this guardian?")) {
                onDelete(studentId);
              }
              setOpen(false);
            }}
            className="w-full h-7 flex items-center gap-2 px-3 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-gray-600"
          >
            <FiTrash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
