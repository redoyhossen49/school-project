import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Input from "../Input";

export default function ReusableEditModal({
  open,
  title,
  item,
  onClose,
  onSubmit,
  fields = [],
  getInitialValues = null, // Optional function to transform item data
}) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({});

  // Initialize form data from item or getInitialValues function
  useEffect(() => {
    if (open && item) {
      if (getInitialValues) {
        setFormData(getInitialValues(item));
      } else {
        // Default: map fields to item properties
        const initialData = {};
        fields.forEach((field) => {
          initialData[field.name] = item[field.name] || "";
        });
        setFormData(initialData);
      }
    }
  }, [open, item, fields, getInitialValues]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save handler
  const handleSubmit = () => {
    // Validate required fields
    for (let field of fields) {
      if (field.required && !formData[field.name]) {
        alert(`${field.label || field.name} is required`);
        return;
      }
    }

    onSubmit(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-none shadow-2xl transition-transform transform scale-100 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-lg font-semibold mb-6 text-center text-blue-700">
          {title}
        </h2>

        {/* Inputs: SINGLE COLUMN */}
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <Input
              key={field.name}
              label={field.label}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              type={field.type || "text"}
              options={field.options || []}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 h-8 border w-full md:w-auto shadow-sm transition ${
              darkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-600"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white shadow-sm hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
