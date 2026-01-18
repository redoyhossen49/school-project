import { useState, useEffect, useRef } from "react";

export default function FormModal({
  open,
  title = "Form",
  fields = [], // [{ key, placeholder, options, type }]
  initialValues = {},
  onClose,
  onSubmit,
  darkMode = false,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [activeField, setActiveField] = useState(null);
  const containerRef = useRef(null);

  /* Reset form when opened */
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setActiveField(null);
    }
  }, [open, initialValues]);

  /* Outside click to close dropdown */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setActiveField(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 " onClick={onClose}></div>

      {/* Main container */}
      <div
        ref={containerRef}
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      w-64 max-w-md p-6 max-h-[70vh] overflow-y-auto 
      ${
        darkMode
          ? "bg-gray-800 text-gray-100 border border-gray-600"
          : "bg-white text-gray-900 border border-gray-200"
      }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="text-sm font-semibold mb-4 text-center">{title}</h3>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="relative">
              {field.type === "select" ? (
                <button
                  onClick={() =>
                    setActiveField(activeField === field.key ? null : field.key)
                  }
                  className={`w-full px-3 h-8 text-sm text-left border flex justify-between items-center ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {formData[field.key] || field.placeholder}
                  <span className="w-3 h-3">▼</span>
                </button>
              ) : (
                <input
                  type={field.type || "text"}
                  value={formData[field.key] || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className={`w-full px-3 h-8 border text-xs ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              setFormData({}); // Form reset
              setActiveField(null); // Dropdown close
              onClose(); // Modal close
            }}
            className={`w-1/2 h-8 text-xs border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="w-1/2 h-8 text-xs  bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        {/* Centered Options Overlay */}
        {activeField && fields.find((f) => f.key === activeField)?.options && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 "
              onClick={() => setActiveField(null)}
            ></div>
            <div
              className={`relative w-full max-w-sm max-h-[70vh] overflow-y-auto bg-white border border-gray-300  p-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-2">
                {[
                  {
                    label: fields.find((f) => f.key === activeField)
                      ?.placeholder,
                    value: "",
                  },
                  ...fields
                    .find((f) => f.key === activeField)
                    ?.options.map((o) => ({ label: o, value: o })),
                ].map((opt) => (
                  <li key={opt.value}>
                    <label className="flex items-center px-3 h-8cursor-pointer hover:bg-blue-50 ">
                      <input
                        type="radio"
                        checked={formData[activeField] === opt.value}
                        onChange={() =>
                          handleFieldChange(activeField, opt.value)
                        }
                        className="hidden"
                      />
                      {opt.label}
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
