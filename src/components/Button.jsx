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
      className={`bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition ${className}`}
    >
      {text}
    </button>
  );
}
