import { useState, useRef, useEffect } from "react";

export default function Input({
  label,
  type = "text", // "text" | "select" | "date"
  name,
  value,
  onChange,
  options = [],
  error,
  inputClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeOption = (opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        label: opt.label ?? String(opt.value ?? ""),
        value: opt.value ?? opt.label,
      };
    }
    return { label: String(opt), value: opt };
  };

  const normalizedOptions = options.map(normalizeOption);
  const selectedLabel =
    normalizedOptions.find((o) => o.value === value)?.label || label;

  const SelectField = () => (
    <div className="relative w-full" ref={wrapperRef}>
      <div


        className={`w-full h-8 border px-3 text-xs flex items-center justify-between cursor-pointer
          ${
            error ? "border-red-500" : "border-gray-300 focus:border-indigo-600"
          }
          ${inputClassName}`}
        onClick={() => setOpen((p) => !p)}
      >
        <span className={`${value ? "text-gray-700" : "text-gray-400"}`}>
          {value || label}
        </span>
        <svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {open && (
        <ul className="absolute z-50 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto ">
          {options.map((opt, idx) => (
            <li
              key={idx}

              className="px-3 my-2 text-xs hover:bg-indigo-100 cursor-pointer text-gray-700"

              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  // Date input as normal text but dropdown options overlay
  if (type === "date") {
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <input
          type="text"
          name={name}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={onChange}
          placeholder="Select date"
          className={`w-full h-8 border px-3 text-xs ${inputClassName} 
            ${
              error
                ? "border-red-500"
                : "border-gray-300 focus:border-indigo-600"
            }`}
        />

        {open && (
          <div
            className={`absolute z-50 w-full border bg-white max-h-48 overflow-y-auto shadow-lg
              ${showDropdownTop ? "bottom-full mb-1" : "mt-1"}`}
          >
            {/* Example simple date options */}
            {["2026-01-18", "2026-01-19", "2026-01-20"].map((d, i) => (
              <div
                key={i}
                className="px-3 h-8 text-xs hover:bg-indigo-100 cursor-pointer"
                onClick={() => {
                  onChange({ target: { name, value: d } });
                  setOpen(false);
                }}
              >
                {d}
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  if (type === "select") return <SelectField />;

  // Normal text input
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" " // important for floating label
        className={`
          peer w-full border h-8 px-2 text-[12px]
          ${error ? "border-red-500" : "border-gray-300 focus:border-indigo-600"}
          focus:outline-none 
          ${inputClassName}
        `}
      />
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
          peer-not-placeholder-shown:text-gray-600
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
