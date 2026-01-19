import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function ReusableActions({ 
  item, 
  onEdit, 
  onDelete, 
  deleteMessage = "Are you sure you want to delete this item?",
  getId = (item) => item?.sl || item?.id 
}) {
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

      // Check if this is the first or last row in the table
      const tableRow = ref.current.closest('tr');
      let isFirstRow = false;
      let isLastRow = false;
      let isSingleRow = false;
      let tableContainerBottom = null;
      
      if (tableRow) {
        const tbody = tableRow.closest('tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr');
          isFirstRow = tableRow === rows[0];
          isLastRow = tableRow === rows[rows.length - 1];
          isSingleRow = rows.length === 1; // Check if only one row exists
        }

        // Get table container boundaries
        const tableContainer = ref.current.closest('.overflow-x-auto, .border, [class*="border"]');
        if (tableContainer) {
          const containerRect = tableContainer.getBoundingClientRect();
          tableContainerBottom = containerRect.bottom;
        }
      }

      // Calculate space below within table container
      const spaceBelowInContainer = tableContainerBottom 
        ? tableContainerBottom - rect.bottom 
        : spaceBelow;

      // Show above if:
      // 1. Single row: always show below (on top of button)
      // 2. First row: prefer showing below, only show above if very little space
      // 3. Last row (but not single): always show above for last row
      // 4. Middle rows: check space
      if (isSingleRow) {
        // Single row: always show below (on top of action button)
        setPositionTop(true); // always show below for single row
      } else if (isFirstRow) {
        // First row: prefer showing below, only show above if very little space
        if (spaceBelow < 30) {
          setPositionTop(false); // show above only if very little space
        } else {
          setPositionTop(true); // show below for first row
        }
      } else if (isLastRow) {
        // Last row (but not single): show above
        setPositionTop(false); // show above for last row
      } else {
        // Middle rows: check space
        if (spaceBelow < dropdownHeight || (tableContainerBottom && spaceBelowInContainer < dropdownHeight)) {
          setPositionTop(false); // show above
        } else {
          setPositionTop(true); // show below
        }
      }
    }
    setOpen(!open);
  };

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`h-6 w-6 p-0 flex items-center justify-center transition-colors ${
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
            positionTop ? "top-7" : "bottom-7"
          } ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          <button
            onClick={() => onEdit(item)}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode
                ? "hover:bg-gray-700 text-gray-100"
                : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            <FiEdit className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            Edit
          </button>

          <button
            onClick={() => {
              if (confirm(deleteMessage)) {
                const id = getId(item);
                onDelete(id);
              }
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
              darkMode
                ? "text-red-400 hover:bg-gray-700"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <FiTrash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
