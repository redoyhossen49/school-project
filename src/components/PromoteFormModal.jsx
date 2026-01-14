import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal"; // your existing Modal wrapper

export default function PromoteFormModal({
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

  // Reset form on open
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
    // Validation
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

  // Group fields by From / To / Payment
  const fromFields = fields.filter(f => f.name.startsWith("from"));
  const toFields = fields.filter(f => f.name.startsWith("to"));
  const paymentFields = fields.filter(f => f.name === "paymentRequired");

  return (
    <Modal open={open} title={title} onClose={onClose} onSave={handleSave}>
      <div className="space-y-4  max-h-80 overflow-y-auto px-2">
        {/* From Section */}
        {fromFields.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-xs font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              From Class (Current Info)
            </h4>
            {fromFields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={formData[field.name]}
                handleChange={handleChange}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* To Section */}
        {toFields.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-xs font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              To Class (Target Info)
            </h4>
            {toFields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={formData[field.name]}
                handleChange={handleChange}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* Payment Section */}
        {paymentFields.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-xs font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              Payment
            </h4>
            {paymentFields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={formData[field.name]}
                handleChange={handleChange}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ----- FieldInput Component -----
function FieldInput({ field, value, handleChange, dropdownOpen, setDropdownOpen, dropdownRef, darkMode }) {
  if (field.type === "select") {
    return (
      <div
        ref={(el) => (dropdownRef.current[field.name] = el)}
        className={`relative cursor-pointer`}
      >
        <div
          onClick={() =>
            setDropdownOpen((prev) => ({ ...prev, [field.name]: !prev[field.name] }))
          }
          className={`w-full border rounded shadow-sm px-3 py-2 text-xs ${
            darkMode ? "border-gray-400 bg-gray-700 text-gray-100" : "border-gray-300 bg-white text-gray-800"
          }`}
        >
          {value || field.placeholder || "Select"}
        </div>
        {dropdownOpen[field.name] && (
          <ul
            className={`absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded shadow-md z-50 ${
              darkMode ? "bg-gray-700 border-gray-400" : "bg-white border-gray-300"
            }`}
          >
            {field.options?.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleChange(field.name, opt.value)}
                className="px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <input
      type={field.type || "text"}
      value={value || ""}
      onChange={(e) => handleChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      className={`w-full border shadow-sm px-3 py-2 text-xs rounded ${
        darkMode ? "border-gray-400 bg-gray-700 text-gray-100" : "border-gray-300 bg-white text-gray-800"
      }`}
    />
  );
}
