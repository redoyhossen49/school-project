import { useTheme } from "../context/ThemeContext";

export default function ProfessionalPaymentModal({
  open,
  onClose,
  payerType,
  onSelect,
}) {
  const { darkMode } = useTheme();

  if (!open) return null;

  // 🔹 Role based payment methods
  const paymentMethods =
    payerType === "school"
      ? [
          { key: "cash", label: "Cash", color: "bg-indigo-600 hover:bg-indigo-700" },
          { key: "bank", label: "Bank", color: "bg-green-600 hover:bg-green-700" },
        ]
      : [
          { key: "bank", label: "Bank", color: "bg-green-600 hover:bg-green-700" },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

      {/* Modal */}
      <div
        className={`relative w-72 rounded-lg shadow-2xl p-8 z-50 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-2 left-1/2 -translate-x-1/2 text-sm ${
            darkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ✕
        </button>

        <h2
          className={`text-lg font-semibold text-center mb-6 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Payment Receive
        </h2>

        {/* Buttons */}
        <div
          className={`grid gap-3 ${
            paymentMethods.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {paymentMethods.map((method) => (
            <button
              key={method.key}
              onClick={() => {
                onSelect(method.key);
                onClose();
              }}
              className={`h-9 text-sm font-medium text-white rounded transition ${method.color}`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
