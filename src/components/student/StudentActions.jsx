import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function StudentActions({ student, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
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

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-6 w-6 p-0 flex items-center justify-center rounded hover:bg-gray-100"
      >
        <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <div
          className={`absolute right-8 top-full  w-24 ${
            darkMode ? "bg-gray-500 text-gray-100" : "bg-gray-50 text-gray-900"
          } border border-gray-200 shadow-lg z-50`}
        >
          <button
            onClick={() => onEdit(student)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <FiEdit className="w-4 h-4 text-blue-600" />
            Edit
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this student?")) {
                onDelete(student.id);
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
