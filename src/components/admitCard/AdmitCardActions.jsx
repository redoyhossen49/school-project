import { useState, useEffect, useRef } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2, FiPrinter, FiEye } from "react-icons/fi";

export default function AdmitCardActions({ row, onEdit, onDelete, onPrint, onView, darkMode, canEdit }) {
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true);
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
      const dropdownHeight = canEdit ? 140 : 70; // Height based on number of options (View + Print + Edit/Delete)
      const spaceBelow = window.innerHeight - rect.bottom;

      const tableRow = ref.current.closest('tr');
      let isFirstRow = false;
      let isLastRow = false;
      let isSingleRow = false;

      if (tableRow) {
        const tbody = tableRow.closest('tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr');
          isFirstRow = tableRow === rows[0];
          isLastRow = tableRow === rows[rows.length - 1];
          isSingleRow = rows.length === 1;
        }
      }

      if (isSingleRow) {
        setPositionTop(true);
      } else if (isFirstRow) {
        setPositionTop(spaceBelow >= 30);
      } else if (isLastRow) {
        setPositionTop(false);
      } else {
        setPositionTop(spaceBelow >= dropdownHeight);
      }
    }
    setOpen(!open);
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`h-6 w-6 p-0 flex items-center justify-center transition-colors ${darkMode
          ? "hover:bg-gray-700 text-gray-300"
          : "hover:bg-gray-100 text-gray-600"
          }`}
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute -right-4 w-28 border shadow-sm z-50 ${positionTop ? "top-7" : "bottom-7"
            } ${darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
            }`}
        >
          {/* View Button - Always visible */}
          <button
            onClick={() => {
              onView(row);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${darkMode
              ? "hover:bg-gray-700 text-gray-100"
              : "hover:bg-gray-100 text-gray-900"
              }`}
          >
            <FiEye className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            View
          </button>

          {/* Print Button - Always visible */}
          <button
            onClick={() => {
              onPrint(row);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
              ? "hover:bg-gray-700 text-gray-100"
              : "hover:bg-gray-100 text-gray-900"
              }`}
          >
            <FiPrinter className={`w-3 h-3 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            Print
          </button>

          {/* Edit and Delete - Only if canEdit */}
          {canEdit && (
            <>
              <button
                onClick={() => {
                  onEdit(row);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
                  ? "hover:bg-gray-700 text-gray-100"
                  : "hover:bg-gray-100 text-gray-900"
                  }`}
              >
                <FiEdit className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                Edit
              </button>

              <button
                onClick={() => {
                  onDelete(row);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
                  ? "text-red-400 hover:bg-gray-700"
                  : "text-red-600 hover:bg-red-50"
                  }`}
              >
                <FiTrash2 className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
