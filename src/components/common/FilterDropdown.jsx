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
      className="absolute z-50 mt-2 left-0  w-[170px] md:w-72 lg:w-72 max-h-[80vh] overflow-y-auto hide-scrollbar"
    >
      {/* ===== MAIN DROPDOWN ===== */}
      <div
        className={`border shadow-lg  p-5 relative 
          ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          }`}
      >
        {/* Title */}
        <h3 className="text-sm text-center font-semibold mb-4">{title}</h3>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="relative">
              {/* Select Button */}
              <button
                onClick={() =>
                  setActiveField(activeField === field.key ? null : field.key)
                }
                className={`w-full px-3 h-8 text-left text-xs border flex justify-between items-center
                  ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
              >
                {tempValues[field.key] || "All"}
                <span className="ml-2">&#9662;</span>
              </button>

              {/* Options Dropdown - Attached to button */}
              {activeField === field.key && (
                <div className={`absolute top-full left-0 right-0 mt-1 z-50 border shadow-lg max-h-48 overflow-y-auto hide-scrollbar ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}>
                  <ul>
                    {/* All option */}
                    <li>
                      <label 
                        onClick={() => {
                          setTempValues((p) => ({
                            ...p,
                            [field.key]: "",
                          }));
                          setActiveField(null);
                        }}
                        className={`flex items-center text-xs px-3 py-2 cursor-pointer ${
                          darkMode
                            ? "hover:bg-gray-600 text-gray-100"
                            : "hover:bg-blue-50 text-gray-900"
                        }`}
                      >
                        All
                      </label>
                    </li>

                    {/* Options */}
                    {field.options?.map((opt) => (
                      <li key={opt}>
                        <label 
                          onClick={() => {
                            setTempValues((p) => ({
                              ...p,
                              [field.key]: opt,
                            }));
                            setActiveField(null);
                          }}
                          className={`flex items-center text-xs px-3 py-2 cursor-pointer ${
                            darkMode
                              ? "hover:bg-gray-600 text-gray-100"
                              : "hover:bg-blue-50 text-gray-900"
                          }`}
                        >
                          {opt}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setTempValues({});
              setSelected({});
              onApply({});
              onClose();
              setActiveField(null);
            }}
            className={`w-1/2 h-8 text-xs border
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
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
      </div>
    </div>
  );
}
