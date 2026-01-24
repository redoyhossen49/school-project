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
  submitLabel = "Update",
  closeLabel = "Close",
}) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({});
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);

  // Handle modal opening animation
  useEffect(() => {
    if (open) {
      setIsModalClosing(false);
      // Trigger opening animation after a small delay to ensure DOM is ready
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [open]);

  // Initialize form data from item or getInitialValues function
  useEffect(() => {
    if (open) {
      // Get fields array (handle both function and array)
      const fieldsArray = typeof fields === "function" ? fields({}) : fields;

      if (item) {
        if (getInitialValues) {
          setFormData(getInitialValues(item));
        } else {
          // Default: map fields to item properties
          const initialData = {};
          fieldsArray.forEach((field) => {
            initialData[field.name] = item[field.name] || "";
          });
          setFormData(initialData);
        }
      } else {
        // For add mode (no item), reset form to empty values
        const emptyData = {};
        fieldsArray.forEach((field) => {
          emptyData[field.name] = "";
        });
        setFormData(emptyData);
      }
    }
  }, [open, item, fields, getInitialValues]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset dependent fields when parent changes
      if (name === "class") {
        // Reset group and section when class changes
        updated.group = "";
        updated.section = "";
      } else if (name === "group") {
        // Reset section when group changes
        updated.section = "";
      }

      return updated;
    });
  };

  // Handle close with animation
  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
    }, 300);
  };

  // Save handler
  const handleSubmit = () => {
    // Validate required fields
    const fieldsArray =
      typeof fields === "function" ? fields(formData) : fields;
    for (let field of fieldsArray) {
      if (field.required && !formData[field.name]) {
        alert(`${field.label || field.name} is required`);
        return;
      }
    }

    onSubmit(formData);
    handleClose();
  };

  if (!open && !isModalClosing) return null;

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode
    ? "bg-gray-800 text-white"
    : "bg-white text-gray-800";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ${
        isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} ${textColor} w-72 rounded border ${borderClr} p-6 max-h-[90vh] overflow-y-auto hide-scrollbar transition-all duration-300 transform ${
          isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <h2 className="text-lg font-semibold text-center mb-6">{title}</h2>

        {/* Inputs: SINGLE COLUMN */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {(typeof fields === "function" ? fields(formData) : fields).map(
            (field) => (
              <div key={field.name}>
                {field.type === "date" ? (
                  <>
                    <div className="relative">
                      <input
                        type="date"
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className={`w-full h-8 border ${borderClr} ${inputBg} px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Input
                      label={field.label}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      type={field.type || "text"}
                      options={
                        typeof field.options === "function"
                          ? field.options(formData)
                          : field.options || []
                      }
                      inputClassName={inputBg}
                    />
                  </>
                )}
              </div>
            ),
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 text-sm h-8 border ${borderClr} ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              } transition `}
            >
              {closeLabel}
            </button>

            <button
              type="submit"
              className="flex-1 text-sm h-8 bg-green-600 text-white hover:bg-green-700 transition "
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
