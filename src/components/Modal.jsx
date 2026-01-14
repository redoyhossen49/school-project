import { useTheme } from "../context/ThemeContext";

export default function Modal({
  open,
  title,
  children,
  onClose,
  onSave,
  saveText = "Save",
  width = "w-80",
}) {
  if (!open) return null;

  const {darkMode}=useTheme();

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center">
      <div
        className={`rounded w-[80%] md:w-88 shadow-sm border ${darkMode? "bg-gray-800 text-gray-200  border-gray-500 ":"bg-white border-gray-200 text-gray-800"}  py-4 px-6 space-y-3 `}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className={`px-3 py-1 text-xs border shadow-sm rounded ${darkMode?"border-gray-400":"border-gray-300"}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
          >
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
}
