import { useState, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";

export default function FilterDropdown({
  title = "Filter",
  fields = [],
  selected = {},
  setSelected = () => {},
  darkMode = false,
  isOpen = false,
  onClose = () => {},
  onApply = () => {},
}) {
  const [openKey, setOpenKey] = useState(null);
  const [tempValues, setTempValues] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTempValues(selected || {});
      setOpenKey(null);
    }
  }, [isOpen, selected]);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0
      z-50 mt-2 w-64 border shadow-sm p-4
      ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
    >
      {/* Title */}
      <h3
        className={`text-sm font-semibold mb-3 ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {title}
      </h3>

      {/* Fields */}
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="relative">
            {/* Select Button */}
            <button
              onClick={() =>
                setOpenKey(openKey === field.key ? null : field.key)
              }
              className={`w-full h-8 px-3 text-xs flex justify-between items-center border rounded
              ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            >
              <span>
                {tempValues[field.key] || field.placeholder}
              </span>
              <BiChevronDown size={16} />
            </button>

            {/* Options dropdown (MATCH SELECT STYLE) */}
            {openKey === field.key && (
              <div
                className={`absolute top-full left-0 mt-1 w-full max-h-44 overflow-y-auto
                border rounded shadow-sm z-50
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* Placeholder / All */}
                <button
                  onClick={() => {
                    setTempValues((p) => ({ ...p, [field.key]: "" }));
                    setOpenKey(null);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left
                  hover:bg-blue-100
                  ${
                    !tempValues[field.key]
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 font-medium"
                      : darkMode
                      ? "text-gray-200"
                      : "text-gray-800"
                  }`}
                >
                  {field.placeholder}
                </button>

                {/* Options */}
                {field.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTempValues((p) => ({ ...p, [field.key]: opt }));
                      setOpenKey(null);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left
                    hover:bg-blue-100
                    ${
                      tempValues[field.key] === opt
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600 font-medium"
                        : darkMode
                        ? "text-gray-200"
                        : "text-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setTempValues({})}
          className={`flex-1 h-8 text-xs border rounded
          ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "bg-gray-100 border-gray-300 text-gray-700"
          }`}
        >
          Reset
        </button>

        <button
          onClick={() => {
            setSelected(tempValues);
            onApply(tempValues);
            onClose();
          }}
          className="flex-1 h-8 text-xs text-white font-medium rounded
          bg-blue-600 hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
