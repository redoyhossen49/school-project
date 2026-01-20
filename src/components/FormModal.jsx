import { useState, useEffect, useRef } from "react";

export default function FormModal({
  open,
  title = "Form",
  fields = [],
  initialValues = {},
  onClose,
  onSubmit,
  darkMode = false,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [activeField, setActiveField] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const fieldRefs = useRef({});

  /* Reset form when opened */
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setActiveField(null);
    }
  }, [open, initialValues]);

  /* Outside click close */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setActiveField(null);
  };

  const openDropdown = (key) => {
    const el = fieldRefs.current[key];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const dropdownHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const style = {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 50,
    };

    if (spaceBelow < dropdownHeight && spaceAbove > rect.height) {
      // open above input
      style.bottom = window.innerHeight - rect.top + 4;
    } else {
      // open below input
      style.top = rect.bottom + 4;
    }

    setDropdownStyle(style);
    setActiveField(key);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      {/* Modal */}
      <div
        ref={containerRef}
        className={`relative w-64 max-h-[70vh] overflow-y-auto p-6 text-xs border
          ${darkMode
            ? "bg-gray-800 border-gray-600 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"}`}
      >
        <h3 className="text-sm font-semibold text-center mb-4">{title}</h3>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              {field.type === "select" ? (
                <button
                  ref={(el) => (fieldRefs.current[field.key] = el)}
                  onClick={() =>
                    activeField === field.key
                      ? setActiveField(null)
                      : openDropdown(field.key)
                  }
                  className={`w-full h-8 px-3 flex justify-between items-center border text-left
                    ${darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"}`}
                >
                  {formData[field.key] || field.placeholder}
                  <span>▾</span>
                </button>
              ) : (
                <input
                  type={field.type || "text"}
                  value={formData[field.key] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    handleFieldChange(field.key, e.target.value)
                  }
                  className={`w-full h-8 px-3 border
                    ${darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="w-1/2 h-8 border text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="w-1/2 h-8 bg-blue-600 text-white text-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Select dropdown */}
      {activeField && (
        <div style={dropdownStyle}>
          <div
            className={`max-h-60 overflow-y-auto border text-xs
              ${darkMode
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"}`}
          >
            <ul>
              <li
                className="px-3 h-8 flex items-center cursor-pointer hover:bg-blue-50"
                onClick={() => handleFieldChange(activeField, "")}
              >
                {fields.find((f) => f.key === activeField)?.placeholder}
              </li>

              {fields
                .find((f) => f.key === activeField)
                ?.options?.map((opt) => (
                  <li
                    key={opt}
                    className="px-3 h-8 flex items-center cursor-pointer hover:bg-blue-50"
                    onClick={() => handleFieldChange(activeField, opt)}
                  >
                    {opt}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
