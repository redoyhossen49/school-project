import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";

export default function FormModal({
  open,
  title,
  fields,
  initialValues = {},
  onClose,
  onSubmit,
  onChange, // 🔹 new prop to notify parent on field change
}) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState(initialValues);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRef = useRef({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
      setDropdownOpen({});
    }
  }, [open, initialValues]);

  // Handle field change
  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Notify parent if onChange is provided
      onChange?.(name, value, updated, setFormData);

      return updated;
    });
  };

  // Save handler
  const handleSave = () => {
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
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {fields.map((field) => (
          <div key={field.name} className="relative">
            {field.type === "select" ? (
              <div
                ref={(el) => (dropdownRef.current[field.name] = el)}
                className={`w-full border rounded shadow-sm px-3 py-2 text-sm cursor-pointer relative ${
                  darkMode
                    ? "border-gray-400 bg-gray-700 text-gray-100"
                    : "border-gray-300 bg-white text-gray-800"
                }`}
              >
                {/* Selected Value */}
                <div
                  onClick={() =>
                    setDropdownOpen((prev) => ({
                      ...prev,
                      [field.name]: !prev[field.name],
                    }))
                  }
                  className="flex justify-between items-center"
                >
                  <span>
                    {(() => {
                      const opts = (field.options || []).map((o) =>
                        typeof o === "string" ? { label: o, value: o } : o
                      );
                      const selected = opts.find(
                        (opt) => opt.value === formData[field.name]
                      );
                      return selected
                        ? selected.label
                        : field.placeholder || "Select";
                    })()}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen[field.name] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>

                {/* Dropdown Options */}
                {dropdownOpen[field.name] && (
                  <ul
                    className={`absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded border shadow-lg z-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${
                      darkMode
                        ? "bg-gray-700 border-gray-400 scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {(field.options || []).map((opt) => {
                      const option =
                        typeof opt === "string" ? { label: opt, value: opt } : opt;
                      const isSelected = formData[field.name] === option.value;
                      return (
                        <li
                          key={option.value}
                          onClick={() => {
                            handleChange(field.name, option.value);
                            setDropdownOpen((prev) => ({
                              ...prev,
                              [field.name]: false,
                            }));
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                            isSelected
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-100"
                              : "text-gray-800"
                          }`}
                        >
                          {option.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <input
                type={field.type || "text"}
                value={formData[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly || false}
                className={`w-full border shadow-sm px-3 py-2 text-sm rounded ${
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
