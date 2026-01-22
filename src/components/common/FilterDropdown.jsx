import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function FilterDropdown({
  title = "Filter",
  fields = [], // [{ key, type: "select"|"text"|"date", placeholder, options }]
  selected = {},
  setSelected = () => {},
  darkMode = false,
  isOpen = false,
  onClose = () => {},
  onApply = () => {},
}) {
  const [tempValues, setTempValues] = useState({});
  const [activeField, setActiveField] = useState(null);
  const containerRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  // Copy selected when open
  useEffect(() => {
    if (isOpen) {
      setTempValues(selected || {});
      setActiveField(null);
    }
  }, [isOpen, selected]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle field click (safe bounding rect)
  const handleFieldClick = (e, fieldKey) => {
    const rect = e.currentTarget.getBoundingClientRect(); // safer than e.target
    if (!rect) return; // safety

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const direction =
      spaceBelow < 200 && spaceAbove > spaceBelow ? "up" : "down";

    setDropdownRect({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      direction,
    });

    setActiveField(activeField === fieldKey ? null : fieldKey);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0  " />

      {/* Centered modal */}
      <div
        className="fixed 
      inset-0 z-50  flex items-center justify-center px-2"
      >
        <div
          ref={containerRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={`relative w-64 max-w-md rounded border  p-5
            ${
              darkMode
                ? "bg-gray-800 text-gray-100 border-gray-600"
                : "bg-white text-gray-900 border-gray-100"
            }`}
        >
          {/* Title */}
          <h3 className="text-sm text-center font-semibold mb-4">{title}</h3>

          {/* Fields */}
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {fields.map((field) => (
              <div key={field.key} className="relative">
                {field.type === "text" || field.type === "date" ? (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={tempValues[field.key] || ""}
                    onChange={(e) =>
                      setTempValues((p) => ({
                        ...p,
                        [field.key]: e.target.value,
                      }))
                    }
                    className={`w-full px-3 h-8 text-xs border 
                      ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleFieldClick(e, field.key)}
                    className={`w-full px-3 h-8 text-left text-xs border flex justify-between items-center 
                      ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                  >
                    {tempValues[field.key] !== "" &&
                    tempValues[field.key] !== undefined
                      ? tempValues[field.key]
                      : field.placeholder}
                    <span>▾</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
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
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => {
                setSelected(tempValues);
                onApply(tempValues);
                onClose();
                setActiveField(null);
              }}
              className="w-1/2 h-8 text-xs bg-blue-600 text-white  hover:bg-blue-700"
            >
              Apply
            </button>
          </div>

          {/* Options Dropdown */}
          {activeField &&
            dropdownRect &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  width: dropdownRect.width,
                  maxHeight: 100,
                  overflowY: "auto",
                  zIndex: 9999,
                  top:
                    dropdownRect.direction === "down"
                      ? dropdownRect.bottom + 4
                      : undefined,
                  bottom:
                    dropdownRect.direction === "up"
                      ? window.innerHeight - dropdownRect.top + 4
                      : undefined,
                  left: dropdownRect.left,
                }}
                className={`rounded  border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <ul className="flex flex-col text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setTempValues((p) => ({ ...p, [activeField]: "" }));
                        setActiveField(null);
                      }}
                      className={`w-full text-left px-3  py-1  transition-colors
                        ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}
                    >
                      All
                    </button>
                  </li>
                  {fields
                    .find((f) => f.key === activeField)
                    ?.options?.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setTempValues((p) => ({
                              ...p,
                              [activeField]: opt,
                            }));
                            setActiveField(null);
                          }}
                          className={`w-full text-left px-3 py-1 transition-colors
                            ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </>
  );
}
