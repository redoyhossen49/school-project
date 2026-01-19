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
  const [overlayDirection, setOverlayDirection] = useState("down"); // up or down
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

  /* Calculate dropdown direction */
  const handleOpenDropdown = (fieldKey) => {
    setActiveField(activeField === fieldKey ? null : fieldKey);
    setTimeout(() => {
      const button = document.getElementById(`fd-btn-${fieldKey}`);
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOverlayDirection(spaceBelow < 200 && spaceAbove > spaceBelow ? "up" : "down");
    }, 0);
  };

  if (!isOpen) return null;

  const activeFieldData = fields.find((f) => f.key === activeField);

  return (
    <div ref={containerRef} className="absolute z-40 mt-2 left-1/2 -translate-x-1/2 w-64 md:w-72">
      <div
        className={`border shadow-lg p-5 relative
          ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-200"}`}
      >
        <h3 className="text-sm text-center font-semibold mb-4">{title}</h3>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="relative">
              <button
                id={`fd-btn-${field.key}`}
                onClick={() => handleOpenDropdown(field.key)}
                className={`w-full px-4 h-8 text-left text-xs border flex justify-between items-center
                  ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
              >
                {tempValues[field.key] || field.placeholder}
                <span className="ml-2">&#9662;</span>
              </button>

              {activeField === field.key && (
                <div
                  className={`absolute left-0 w-full max-h-30 overflow-y-auto border z-50 text-xs
                    ${overlayDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"}
                    ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <ul>
                    {/* Placeholder */}
                    <li>
                      <label className="flex items-center px-3 h-8 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600">
                        <input
                          type="radio"
                          checked={!tempValues[field.key]}
                          onChange={() => {
                            setTempValues((p) => ({ ...p, [field.key]: "" }));
                          }}
                          className="mr-2 hidden"
                        />
                        {field.placeholder}
                      </label>
                    </li>

                    {/* Options */}
                    {field.options.map((opt) => (
                      <li key={opt}>
                        <label className="flex items-center px-3 h-8 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600">
                          <input
                            type="radio"
                            checked={tempValues[field.key] === opt}
                            onChange={() => {
                              setTempValues((p) => ({ ...p, [field.key]: opt }));
                            }}
                            className="mr-2 hidden"
                          />
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

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setTempValues({})}
            className={`w-1/2 h-8 text-xs border
              ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
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
