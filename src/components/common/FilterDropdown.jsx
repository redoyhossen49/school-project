import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({
  title = "Filter",
  fields = [], // [{ key, options, placeholder }]
  selected = {},
  setSelected = () => {},
  darkMode = false,
  isOpen = false,
  onClose = () => {},
  onApply = () => {},
  buttonRef,
}) {
  const [tempValues, setTempValues] = useState({});
  const [activeField, setActiveField] = useState(null);
  const containerRef = useRef(null);

  /* sync temp values when opened */
  useEffect(() => {
    if (isOpen) {
      setTempValues(selected || {});
      setActiveField(null);
    }
  }, [isOpen, selected]);

  /* outside click close */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, buttonRef]);

  if (!isOpen) return null;

  const activeFieldData = fields.find((f) => f.key === activeField);

  return (
    <div
      ref={containerRef}
       className="absolute z-40 mt-2 left-1/2 -translate-x-1/2 w-64 md:w-72 max-h-[80vh] min-h-[60vh] overflow-y-auto"
    >
      {/* ===== MAIN DROPDOWN ===== */}
      <div
        className={`border shadow-lg p-5 relative 
          ${darkMode
            ? "bg-gray-800 text-gray-100 border-gray-600"
            : "bg-white text-gray-900 border-gray-200"}`}
      >
        {/* Title */}
        <h3 className="text-sm text-center font-semibold mb-4">
          {title}
        </h3>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map((field) => (
            <button
              key={field.key}
              onClick={() =>
                setActiveField(
                  activeField === field.key ? null : field.key
                )
              }
              className={`w-full h-8 px-3 text-xs text-left border flex justify-between items-center
                ${darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"}`}
            >
              {tempValues[field.key] || field.placeholder}
              <span className="w-3 h-3">▼</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setTempValues({})}
            className={`w-1/2 h-8 text-xs border
              ${darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"}`}
          >
            Reset
          </button>

          <button
            onClick={() => {
              setSelected(tempValues);
              onApply(tempValues);
              onClose();
              setActiveField(null);
            }}
            className="w-1/2 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>

        {/* ===== CENTER OPTION MODAL ===== */}
        {activeField && (
          <div className="absolute inset-0 mt-2 z-50 flex items-center justify-center ">
            <div
              className={`w-8/12 max-h-30 text-xs overflow-y-auto border py-3
                ${darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"}`}
            >
              <ul>
                {/* All / placeholder */}
                <li>
                  <label className="flex items-center text-xs px-3   cursor-pointer hover:bg-blue-50 ">
                    <input
                      type="radio"
                      checked={!tempValues[activeField]}
                      onChange={() => {
                        setTempValues((p) => ({
                          ...p,
                          [activeField]: "",
                        }));
                        setActiveField(null);
                      }}
                      className="mr-2 hidden"
                    />
                    {activeFieldData?.placeholder}
                  </label>
                </li>

                {/* Options */}
                {activeFieldData?.options.map((opt) => (
                  <li key={opt}>
                    <label className="flex items-center text-xs px-3 mt-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600">
                      <input
                        type="radio"
                        checked={tempValues[activeField] === opt}
                        onChange={() => {
                          setTempValues((p) => ({
                            ...p,
                            [activeField]: opt,
                          }));
                          setActiveField(null);
                        }}
                        className="mr-2 hidden"
                      />
                      {opt}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
