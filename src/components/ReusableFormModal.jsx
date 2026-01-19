import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";
import Input from "./Input";

export default function ReusableFormModal({
  open,
  title,
  fields = [],
  initialValues = {},
  onClose,
  onSubmit,
  submitText = "Save",
  closeText = "Close",
  width = "w-full max-w-2xl",
}) {
  const { darkMode } = useTheme();
  
  const [formData, setFormData] = useState(initialValues);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
    } else {
      setFormData({});
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name] === "") {
        alert(`${field.label || field.name} is required`);
        return;
      }
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";
  const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600";

  const customFooter = (
    <div className="flex gap-2 justify-end">
      <button
        onClick={onClose}
        className={`px-6 py-1.5 text-sm border rounded ${
          darkMode
            ? "border-gray-400 text-gray-200 hover:bg-gray-600 bg-gray-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
        }`}
      >
        {closeText}
      </button>
      <button
        onClick={handleSubmit}
        className="px-6 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
      >
        {submitText}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      title=""
      onClose={onClose}
      hideFooter={true}
      customFooter={customFooter}
      width={width}
    >
      <div className="space-y-4">
        {/* Title */}
        {title && (
          <h2 className={`text-lg font-bold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}>
            {title}
          </h2>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            // Handle grid layout for side-by-side fields
            if (field.grid && field.grid === 2) {
              // Group next 2 fields together
              const field1 = fields[index];
              const field2 = fields[index + 1];
              if (index % 2 === 0) {
                return (
                  <div key={`grid-${index}`} className="grid grid-cols-2 gap-4">
                    {renderField(field1, formData, handleChange, borderClr, inputBg, readOnlyBg, darkMode)}
                    {field2 && renderField(field2, formData, handleChange, borderClr, inputBg, readOnlyBg, darkMode)}
                  </div>
                );
              }
              return null;
            }

            return renderField(field, formData, handleChange, borderClr, inputBg, readOnlyBg, darkMode, index);
          })}
        </div>
      </div>
    </Modal>
  );
}

// Helper function to render individual fields
function renderField(field, formData, handleChange, borderClr, inputBg, readOnlyBg, darkMode, index) {
  if (!field) return null;

  const commonProps = {
    key: field.name || index,
    name: field.name,
    value: formData[field.name] || "",
    onChange: handleChange,
    label: field.label,
    placeholder: field.placeholder,
    type: field.type || "text",
    required: field.required,
    readOnly: field.readOnly,
    options: field.options || [],
  };

  // Render based on field type
  if (field.type === "select") {
    return (
      <div className="relative w-full" key={commonProps.key}>
        <label className="block text-sm font-medium mb-1">{field.label}</label>
        <select
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
          required={field.required}
          disabled={field.readOnly}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="relative w-full" key={commonProps.key}>
        <label className="block text-sm font-medium mb-1">{field.label}</label>
        <textarea
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className={`w-full border px-2 py-1 text-sm ${borderClr} ${field.readOnly ? readOnlyBg : inputBg}`}
          required={field.required}
          readOnly={field.readOnly}
        />
      </div>
    );
  }

  if (field.type === "checkbox" || field.type === "checkboxes") {
    if (field.options && field.options.length > 0) {
      // Multiple checkboxes
      return (
        <div className="relative w-full" key={commonProps.key}>
          <label className="block text-xs font-medium mb-2 text-gray-500">
            {field.label}
          </label>
          <div className="space-y-2">
            {field.options.map((option) => {
              const isSelected = Array.isArray(formData[field.name])
                ? formData[field.name].includes(option)
                : false;
              
              return (
                <div key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentValues = Array.isArray(formData[field.name]) 
                        ? formData[field.name] 
                        : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleChange({ target: { name: field.name, value: newValues } });
                    }}
                    className={`w-4 h-4 cursor-pointer rounded border-2 transition-all ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : darkMode
                        ? "border-gray-500 bg-transparent"
                        : "border-gray-400 bg-white"
                    } focus:ring-2 focus:ring-blue-500 focus:ring-offset-0`}
                  />
                  <label
                    className={`text-sm cursor-pointer ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Single checkbox
    return (
      <div className="flex items-center gap-2" key={commonProps.key}>
        <input
          type="checkbox"
          name={field.name}
          checked={formData[field.name] || false}
          onChange={(e) => handleChange({ target: { name: field.name, value: e.target.checked } })}
          className={`w-4 h-4 cursor-pointer rounded border-2 transition-all ${
            formData[field.name]
              ? "bg-blue-600 border-blue-600"
              : darkMode
              ? "border-gray-500 bg-transparent"
              : "border-gray-400 bg-white"
          } focus:ring-2 focus:ring-blue-500 focus:ring-offset-0`}
        />
        <label className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          {field.label}
        </label>
      </div>
    );
  }

  // Default: text, number, date, email, etc.
  return (
    <div className="relative w-full" key={commonProps.key}>
      {field.type !== "hidden" && (
        <label className="block text-sm font-medium mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {field.readOnly ? (
        <input
          type={field.type || "text"}
          name={field.name}
          value={formData[field.name] || ""}
          readOnly
          className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
        />
      ) : (
        <Input
          label={field.label}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          type={field.type || "text"}
          placeholder={field.placeholder}
          inputClassName={inputBg}
        />
      )}
    </div>
  );
}
