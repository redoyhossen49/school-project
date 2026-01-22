import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Input({
  label,
  type = "text", // text | select
  name,
  value = "",
  onChange,
  options = [],
  error,
  disabled = false,
  className = "",
  step,
  ...rest
}) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const selectRef = useRef(null);

  /* close select dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= SELECT ================= */
  if (type === "select") {

    const updateDropdownPosition = () => {
      if (!selectRef.current) return;
      const rect = selectRef.current.getBoundingClientRect();
      const dropdownHeight = 192; // max-h-48 = 12rem = 192px
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
    };

    useEffect(() => {
      if (open) {
        updateDropdownPosition();
        window.addEventListener("scroll", updateDropdownPosition);
        window.addEventListener("resize", updateDropdownPosition);
        return () => {
          window.removeEventListener("scroll", updateDropdownPosition);
          window.removeEventListener("resize", updateDropdownPosition);
        };
      }
    }, [open]);

    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div
          ref={selectRef}
          onClick={() => {
            if (!disabled) {
              setOpen(!open);
            }
          }}
          className={`
            h-8 px-2 text-[12px] flex items-center justify-between border
            ${darkMode
              ? "bg-gray-700 text-gray-200 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${error ? "border-red-500" : ""}
            ${className}
          `}
        >
          <span className={value ? "" : "text-gray-400"}>
            {value || label}
          </span>
           <span className="h-4 w-4">&#9662;</span>
        </div>

        {open && !disabled && (
          <ul
            style={dropdownStyle}
            className={`
              w-full max-h-48 overflow-y-auto border
              ${darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"}
            `}
          >
            {options.map((opt, i) => (
              <li
                key={i}
                onClick={() => {
                  onChange({ target: { name, value: opt } });
                  setOpen(false);
                }}
                className={`
                  px-2 py-1 text-[12px] cursor-pointer
                  ${darkMode
                    ? "hover:bg-gray-600 text-gray-200"
                    : "hover:bg-indigo-100 text-gray-700"}
                `}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  /* ================= INPUT ================= */
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        step={step}
        autoComplete="off"
        disabled={disabled}
        {...rest}
        className={`
          peer h-8 w-full px-2 text-[12px] border focus:outline-none
          ${darkMode
            ? "bg-gray-500 text-white border-gray-600 focus:border-indigo-500"
            : "bg-white text-gray-900 border-gray-300 focus:border-indigo-600"}
          ${error ? "border-red-500" : ""}
          ${className}
        `}
      />

      {/* Floating Label */}
      <label
        className={`
          absolute left-2 top-1/2 -translate-y-1/2 text-[12px]
          pointer-events-none transition-all duration-200
          ${darkMode ? "text-white" : "text-gray-400"}

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2

          peer-focus:-top-1
          peer-focus:px-1
          peer-focus:text-indigo-600
          ${darkMode ? "peer-focus:bg-gray-700" : "peer-focus:bg-white"}

          peer-not-placeholder-shown:-top-1
          peer-not-placeholder-shown:px-1
          ${darkMode
            ? "peer-not-placeholder-shown:bg-gray-700 peer-not-placeholder-shown:text-white"
            : "peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:text-indigo-600"}
        `}
      >
        {label}
      </label>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
