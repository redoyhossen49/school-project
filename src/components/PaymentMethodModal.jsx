import { useTheme } from "../context/ThemeContext";

export default function PaymentMethodModal({ open, onClose, onSelect }) {
  const { darkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

      {/* Modal */}
      <div
        className={`relative w-72 shadow-2xl  h-44 text-center rounded p-8 z-50 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-sm bg-gray-300 text-white rounded-full h-5 w-5 leading-none transition ${
            darkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ✕
        </button>

        <h2
          className={`text-lg font-semibold text-center my-6 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Payment Receive
        </h2>

        <div className="flex gap-3">
          {/* Cash Button */}
          <button
            onClick={() => {
              onSelect("cash");
              onClose();
            }}
            className="flex-1 px-3 h-8 bg-indigo-600 text-white font-medium text-sm  hover:bg-indigo-700 transition active:bg-indigo-800"
          >
            Cash
          </button>

          {/* Bank Button */}
          <button
            onClick={() => {
              onSelect("bank");
              onClose();
            }}
            className="flex-1 px-3 h-8 bg-green-600 text-white font-medium text-sm  hover:bg-green-700 transition active:bg-green-800"
          >
            Bank
          </button>
        </div>
      </div>
    </div>
  );
}
