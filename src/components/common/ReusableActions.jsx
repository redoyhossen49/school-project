import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "react-router-dom"; // ✅ For detecting current route

export default function ReusableActions({
  item,
  onEdit,
  onDelete,
  onAccept,
  onReject,
  deleteMessage = "Are you sure you want to delete this item?",
}) {
  const { darkMode } = useTheme();
  const location = useLocation(); // ✅ Detect current page
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (ref.current) {
      const tableRow = ref.current.closest('tr');
      let isLastRow = false;

      if (tableRow) {
        const tbody = tableRow.closest('tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr');
          isLastRow = tableRow === rows[rows.length - 1];
        }
      }

      // Dropdown below for all except last row
      setPositionTop(!isLastRow);
    }

    setOpen(!open);
  };

  // ✅ Check if current page is PromoteRequest
  const isPromoteRequestPage = location.pathname.includes("promoterequest");

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`h-6 w-6 p-0 flex items-center justify-center transition-colors ${
          darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute -right-6 w-24 border  z-50 ${
            positionTop ? "top-7" : "bottom-7"
          } ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
        >
          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode ? "hover:bg-gray-700 text-gray-100" : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            <FiEdit className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm(deleteMessage)) onDelete(item);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
            }`}
          >
            <FiTrash2 className="w-3 h-3" />
            Delete
          </button>

          {/* ✅ Accept & Reject only on PromoteRequest page */}
          {isPromoteRequestPage && (
            <>
              <button
                onClick={() => onAccept(item)}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
                  darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                }`}
              >
                <FiCheck className="w-3 h-3" />
                Accept
              </button>

              <button
                onClick={() => onReject(item)}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
                  darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                <FiX className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
