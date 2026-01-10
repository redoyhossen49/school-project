import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function StudentActions() {
    const {darkMode}=useTheme();
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
    <div className="relative" ref={ref}>
      {/* Horizontal 3 dots */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-32 ${darkMode?"bg-gray-500 text-gray-100":"bg-white text-gray-900"} border border-gray-200  shadow-lg z-50`}>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              alert("Edit student");
            }}
          >
            <FiEdit className="w-4 h-4 text-blue-600" />
            Edit
          </button>

          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              alert("Delete student");
            }}
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
