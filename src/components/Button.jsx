export default function Button({
  text,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-1/2 bg-blue-500 text-white py-3  font-semibold
                   hover:bg-slate-800 transition ${className}`}
    >
      {text}
    </button>
  );
}
