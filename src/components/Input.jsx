export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  inputClassName = "",
}) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`
          peer w-full border px-4
          ${inputClassName || "py-2"}   /* ✅ default fallback */
          focus:outline-none
          focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]
          placeholder:text-transparent
          ${
            error
              ? "border-red-500"
              : "border-gray-300 focus:border-indigo-600"
          }
        `}
      />

      <label
        className="
          absolute left-4 top-2 text-gray-400
          text-sm pointer-events-none
          transition-all duration-300
          peer-placeholder-shown:top-2
          peer-placeholder-shown:text-sm
          md:peer-placeholder-shown:text-base
          peer-placeholder-shown:text-gray-400
          peer-focus:-top-3
          peer-focus:text-xs
          peer-focus:text-indigo-600
          peer-focus:bg-white
          peer-not-placeholder-shown:-top-2
          peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:text-gray-600
          peer-not-placeholder-shown:bg-white
          peer-not-placeholder-shown:px-1
          peer-focus:px-1
        "
      >
        {label}
      </label>
    </div>
  );
}
