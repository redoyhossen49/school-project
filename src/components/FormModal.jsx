import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";

export default function FormModal({
  open,
  title,
  fields = [],
  initialValues = {},
  onClose,
  onSubmit,
}) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRef = useRef({});

  // Open modal resets form
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setDropdownOpen({});
    }
  }, [open, initialValues]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDropdownOpen((prev) => ({ ...prev, [name]: false }));
  };

  const handleSave = () => {
    // validation
    for (let field of fields) {
      if (field.required && !formData[field.name]) {
        alert(`${field.label} is required`);
        return;
      }
    }
    onSubmit(formData);
    onClose();
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      fields.forEach((f) => {
        if (
          dropdownRef.current[f.name] &&
          !dropdownRef.current[f.name].contains(e.target)
        ) {
          setDropdownOpen((prev) => ({ ...prev, [f.name]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fields]);

  return (
    <Modal open={open} title={title} onClose={onClose} onSave={handleSave}>
      <div className="space-y-3  max-h-80 overflow-y-auto">
        {fields.map((field) => (
          <div key={field.name} className="relative">
            {field.type === "select" ? (
              <div
                ref={(el) => (dropdownRef.current[field.name] = el)}
                className={`w-full border rounded shadow-sm px-3 py-2 text-xs cursor-pointer ${
                  darkMode
                    ? "border-gray-400 bg-gray-700 text-gray-100"
                    : "border-gray-300 bg-white text-gray-800"
                }`}
              >
                <div
                  onClick={() =>
                    setDropdownOpen((prev) => ({
                      ...prev,
                      [field.name]: !prev[field.name],
                    }))
                  }
                >
                  {formData[field.name] || field.placeholder || "Select"}
                </div>
                {dropdownOpen[field.name] && (
                  <ul
                    className={`absolute left-0 top-8 right-0 mt-1 h-30 overflow-y-auto border rounded shadow-md z-50 ${
                      darkMode
                        ? "bg-gray-700 border-gray-400"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {field.options?.map((opt) => (
                      <li
                        key={opt.value}
                        onClick={() => handleChange(field.name, opt.value)}
                        className="px-6 py-2 text-xs   cursor-pointer"
                      >
                        <p className="border border-gray-200 px-3 py-1 rounded">{opt.label}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <input
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full border shadow-sm px-3 py-2 text-xs rounded ${
                  darkMode
                    ? "border-gray-400 bg-gray-700 text-gray-100"
                    : "border-gray-300 bg-white text-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}