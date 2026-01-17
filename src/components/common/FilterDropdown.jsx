import { useState, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";

export default function FilterDropdown({
  title = "Filter",
  fields = [], // [{ key, label, options, placeholder }]
  selected = {},
  setSelected = () => {},
  darkMode = false,
  isOpen = false,
  onClose = () => {},
  onApply = () => {},
}) {
  const [openKey, setOpenKey] = useState(null); // which nested dropdown open
  const [tempValues, setTempValues] = useState({}); // temp filters

  // reset temp when open
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
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.key} className="relative">
            {/* Select button */}
            <button
              onClick={() =>
                setOpenKey(openKey === field.key ? null : field.key)
              }
              className={`w-full h-8 px-3 text-xs flex justify-between items-center border font-medium
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
             
                <span className="font-semibold">
                  {tempValues[field.key] || field.placeholder}
                
              </span>
              <BiChevronDown size={16} />
            </button>

            {/* Options */}
            {openKey === field.key && (
              <div
                className={`absolute bottom-full left-0 mb-1 w-full max-h-44 
                overflow-y-auto border shadow-lg z-50
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* All option */}
                <button
                  onClick={() => {
                    setTempValues((prev) => ({
                      ...prev,
                      [field.key]: "",
                    }));
                    setOpenKey(null);
                  }}
                  className={`w-full h-8 px-3 text-left text-xs
                  hover:bg-blue-400 hover:text-blue-600
                  ${
                    !tempValues[field.key]
                      ? "bg-blue-700 text-white font-semibold"
                      : darkMode
                      ? "text-gray-200"
                      : "text-gray-700"
                  }`}
                >
                  {field.placeholder}
                </button>

                {/* Dynamic options */}
                {field.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTempValues((prev) => ({
                        ...prev,
                        [field.key]: opt,
                      }));
                      setOpenKey(null);
                    }}
                    className={`w-full h-8 px-3 text-left text-xs
                    hover:bg-blue-50 hover:text-blue-600
                    ${
                      tempValues[field.key] === opt
                        ? "bg-blue-700 text-white font-semibold"
                        : darkMode
                        ? "text-gray-200"
                        : "text-gray-700"
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
        {/* Reset */}
        <button
          onClick={() => setTempValues({})}
          className={`flex-1 h-8 text-xs border
          ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "bg-gray-100 border-gray-300 text-gray-700"
          }`}
        >
          Reset
        </button>

        {/* Apply */}
        <button
          onClick={() => {
            setSelected(tempValues);
            onApply(tempValues);
            onClose();
          }}
          className="flex-1 h-8 text-xs text-white font-medium
          bg-gradient-to-r from-blue-500 to-indigo-600
          hover:from-blue-600 hover:to-indigo-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
