import { useState, useEffect, useRef, useCallback } from "react";

export default function FormModal({
  open,
  title = "Form",
  fields = [],
  initialValues = {},
  onClose,
  onValuesChange,
  onSubmit,
  darkMode = false,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [activeField, setActiveField] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const fieldRefs = useRef({});

  /* Reset form when opened */
  useEffect(() => {
    if (open) {
      setFormData({ ...initialValues });
      setActiveField(null);
    }
  }, [open, initialValues]);

  /* Outside click close */
  useEffect(() => {
    const handler = (e) => {
      // Close dropdown if clicking outside both container and dropdown
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 🔹 Updated: handleFieldChange with examDay auto calc */
  const handleFieldChange = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // 1️⃣ Auto-calc examDay when examDate changes
      if (key === "examDate" && value) {
        const dateObj = new Date(value);
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        updated.examDay = days[dateObj.getDay()];
      }

      // 2️⃣ Auto-calc totalHour if startTime or endTime changed
      const start = key === "startTime" ? value : updated.startTime;
      const end = key === "endTime" ? value : updated.endTime;

      if (start && end) {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);

        let totalMinutes = (eh - sh) * 60 + (em - sm);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // handle overnight

        updated.totalHour = (totalMinutes / 60).toFixed(2); // show as decimal
      } else {
        updated.totalHour = ""; // clear if incomplete
      }

      onValuesChange?.(updated);
      return updated;
    });
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
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      {/* Modal */}
      <div
        ref={containerRef}
        className={`relative w-72 max-h-[70vh] overflow-y-auto p-6 text-xs border rounded
          ${
            darkMode
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          }`}
      >
        <h3 className="text-sm font-semibold text-center mb-4">{title}</h3>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="relative w-full">
              {/* Select field */}
              {field.type === "select" ? (
                <button
                  key={`btn-${field.key}-${formData[field.key]}`}
                  ref={(el) => (fieldRefs.current[field.key] = el)}
                  onClick={() => openDropdown(field.key)}
                  className={`w-full h-8 px-3 flex justify-between items-center border text-left
          ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-100"
              : "bg-white border-gray-300 text-gray-400"
          }`}
                >
                  <span>{formData[field.key] || field.placeholder}</span>
                  <span>▾</span>
                </button>
              ) : (
                /* Input field */
                <div className="relative">
                  <input
                    type={field.type || "text"}
                    id={field.key}
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder=" "
                    readOnly={field.readOnly || false}
                    className={`peer w-full h-8 px-3 border
            ${
              field.readOnly
                ? darkMode
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-400"
                : darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-400"
            }`}
                  />
                  <label
                    htmlFor={field.key}
                    className={`
          absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-400
          pointer-events-none transition-all duration-300

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-[12px]
          peer-placeholder-shown:text-gray-400
            peer-placeholder-shown:bg-white

          peer-focus:-top-0.5
          peer-focus:text-[12px]
          peer-focus:text-indigo-600
             ${darkMode ? "peer-focus:bg-gray-700" : "peer-focus:bg-white"}
          peer-focus:px-1

          peer-not-placeholder-shown:-top-1
          peer-not-placeholder-shown:text-[12px]
         ${darkMode ? "peer-not-placeholder-shown: bg-white text-gray-200" : "peer-not-placeholder-shown:bg-white"}
          
          peer-not-placeholder-shown:px-1
        `}
                  >
                    {field.label}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="w-1/2 h-8 border border-gray-300 text-xs"
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
        <div ref={dropdownRef} style={dropdownStyle}>
          <div
            className={`max-h-30 overflow-y-auto border text-xs z-50 rounded-md
              ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
          >
            <ul>
              <li
                className="px-3 h-8 flex items-center cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFieldChange(activeField, "");
                  setActiveField(null);
                }}
              >
                {fields.find((f) => f.key === activeField)?.placeholder}
              </li>

              {fields
                .find((f) => f.key === activeField)
                ?.options?.map((opt) => (
                  <li
                    key={opt}
                    className="px-3 h-8 flex items-center cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFormData((prev) => {
                        const updated = { ...prev, [activeField]: opt };
                        onValuesChange?.(updated); // ✅ ADD
                        return updated;
                      });
                      setActiveField(null);
                    }}
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
