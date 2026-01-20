import { useTheme } from "../../context/ThemeContext.jsx";

export default function ReusableInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  options = [],
  error,
  required = false,
  disabled = false,
  className = "",
  ...restProps
}) {
  const { darkMode } = useTheme();

  const inputBg = darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-700";
  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const labelColor = darkMode ? "text-gray-200" : "text-gray-700";

  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className={`block text-xs font-medium mb-1 ${labelColor}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-8 px-3 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error ? "border-red-500" : borderClr
          } ${inputBg} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...restProps}
        >
          <option value="">{placeholder || `Select ${label || name}`}</option>
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className={`block text-xs font-medium mb-1 ${labelColor}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={restProps.rows || 3}
          className={`w-full px-3 py-2 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error ? "border-red-500" : borderClr
          } ${inputBg} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...restProps}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-xs font-medium mb-1 ${labelColor}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full h-8 px-3 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? "border-red-500" : borderClr
        } ${inputBg} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        {...restProps}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
