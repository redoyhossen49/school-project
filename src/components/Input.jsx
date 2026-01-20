import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Input({
  label,
  type = "text", // "text" | "select"
  name,
  value,
  onChange,
  options = [], // for select
  error,
  inputClassName = "",
  step,
  ...restProps
}) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Custom Select Option component
  const SelectField = () => {
    const isDisabled = restProps.disabled;
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div
          className={`
            w-full h-8 border px-2 text-[12px] flex items-center justify-between
            ${isDisabled ? "cursor-not-allowed opacity-50 bg-gray-100" : "cursor-pointer"}
            ${error ? "border-red-500" : "border-gray-300 focus:border-indigo-600"}
            ${inputClassName}
          `}
          onClick={() => !isDisabled && setOpen(!open)}
        >
          <span className={`${value ? "text-gray-400" : "text-gray-400"}`}>
            {value || label}
          </span>
          <svg
            className="w-3 h-3 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Options dropdown */}
        {open && !isDisabled && (
          <ul className={`absolute z-50 w-full border mt-1 max-h-48 overflow-y-auto hide-scrollbar ${
            darkMode 
              ? "bg-gray-700 border-gray-600" 
              : "bg-white border-gray-300"
          }`}>
            {options.map((opt, idx) => (
              <li
                key={idx}
                className={`px-2 py-1 text-[12px] cursor-pointer ${
                  darkMode
                    ? "hover:bg-gray-600 text-gray-200"
                    : "hover:bg-indigo-100 text-gray-700"
                }`}
                onClick={() => {
                  onChange({ target: { name, value: opt } });
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  };

  // Render
  if (type === "select") return <SelectField />;

  // Regular input
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" " // important for floating label
        step={step}
        {...restProps}
        className={`
          peer w-full border h-8 px-2 text-[12px]
          ${error ? "border-red-500" : "border-gray-300 focus:border-indigo-600"}
          focus:outline-none 
          ${inputClassName}
        `}
      />

      {/* Floating Label */}
      <label
        className={`
          absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-gray-400
          pointer-events-none transition-all duration-300

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-[12px]
          peer-placeholder-shown:text-gray-400

          peer-focus:-top-0.5
          peer-focus:text-[12px]
          peer-focus:text-indigo-600
          peer-focus:bg-white
          peer-focus:px-1

          peer-not-placeholder-shown:-top-1
          peer-not-placeholder-shown:text-[12px]
         
          peer-not-placeholder-shown:bg-white
          peer-not-placeholder-shown:px-1
        `}
      >
        {label}
      </label>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
