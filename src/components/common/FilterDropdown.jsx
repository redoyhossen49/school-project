import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({
  title = "Filter",
  fields = [], // [{ key, label, options, placeholder }]
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
  const containerRef = useRef();

  // reset temp values when dropdown opens
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target) // ✅ button ke exclude korlam
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, buttonRef]);
  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-40 mt-2 left-1/2 -translate-x-1/2 w-64 md:w-72 max-h-[60vh] overflow-y-auto"
    >
      <div
        className={`border  shadow-lg p-6
          ${darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-200"}`}
      >
        {/* Title */}
        <h3 className={`text-sm text-center ${darkMode?"text-white":"text-gray-900"} font-semibold mb-3`}>{title}</h3>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="relative">
              {/* Select Button */}
              <button
                onClick={() =>
                  setActiveField(activeField === field.key ? null : field.key)
                }
                className={`w-full px-3 h-8 text-left text-xs border  flex justify-between items-center
                  ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
              >
                {tempValues[field.key] || field.placeholder}
                <span className="ml-2">&#9662;</span>
              </button>

              {/* Options Overlay */}
              {activeField === field.key && (
                <div
                  className={`absolute left-1/2 -top-20 -translate-x-1/2 z-50 mt-1 w-64 max-h-48 py-6 overflow-y-auto border text-xs shadow-lg
                    ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                >
                  <ul className="">
                    {/* All / Placeholder */}
                    <li>
                      <label
                        className="flex items-center px-3 h-8 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600"
                      >
                        <input
                          type="radio"
                          name={field.key}
                          value=""
                          checked={!tempValues[field.key]}
                          onChange={() => {
                            setTempValues((prev) => ({ ...prev, [field.key]: "" }));
                            setActiveField(null); // close overlay immediately
                          }}
                          className="mr-2"
                        />
                        {field.placeholder}
                      </label>
                    </li>

                    {/* Options */}
                    {field.options.map((opt) => (
                      <li key={opt}>
                        <label
                          className="flex items-center px-3 h-8 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600"
                        >
                          <input
                            type="radio"
                            name={field.key}
                            value={opt}
                            checked={tempValues[field.key] === opt}
                            onChange={() => {
                              setTempValues((prev) => ({ ...prev, [field.key]: opt }));
                              setActiveField(null); // close overlay immediately
                            }}
                            className="mr-2"
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

        {/* Actions */}
        <div className="flex  gap-2 mt-4">
          <button
            onClick={() => setTempValues({})}
            className={`px-3 h-8 text-sm  border w-1/2
              ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"}
              hover:bg-gray-300`}
          >
            Reset
          </button>
          <button
            onClick={() => {
              setSelected(tempValues);
              onApply(tempValues);
              onClose();
            }}
            className="px-3 h-8 text-sm w-1/2  bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
