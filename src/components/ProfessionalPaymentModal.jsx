
import { useState, useRef, useEffect, useMemo } from "react";
import { FaMoneyBillWave, FaUniversity, FaCreditCard, FaMobileAlt } from "react-icons/fa";
export default function ProfessionalPaymentModal({ isOpen, onClose, payerType, darkMode = false, onSelect }) {
  const modalRef = useRef(null);
  const [selectedMethod, setSelectedMethod] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
        setSelectedMethod("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const allMethods = [
    { key: "cash", label: "Cash", icon: <FaMoneyBillWave />, availableFor: ["school"] },
    { key: "bank", label: "Bank", icon: <FaUniversity />, availableFor: ["school", "teacher", "student"] },
    { key: "card", label: "Card", icon: <FaCreditCard />, availableFor: ["school"] },
    { key: "mobile", label: "Mobile", icon: <FaMobileAlt />, availableFor: ["school"] },
  ];

  const paymentMethods = allMethods.filter((m) => m.availableFor.includes(payerType));

  const handleSelect = (method) => {
  setSelectedMethod(method);
  if (onSelect) onSelect(method); // Call parent handler (handlePayment)
};


  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div ref={modalRef} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md`}>
          <h2 className="text-xl font-semibold mb-5 text-center dark:text-gray-100">Select Payment Method</h2>

          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.key}
                onClick={() => handleSelect(method.key)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all text-sm
                  ${selectedMethod === method.key ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                    : darkMode ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                    : "bg-white text-gray-900 border-gray-300 hover:bg-blue-50"
                  }`}
              >
                <span className="text-2xl mb-2">{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => { onClose(); setSelectedMethod(""); }}
              className={`px-4 py-2 rounded border ${darkMode ? "border-gray-600 text-gray-100 hover:bg-gray-700" : "border-gray-300 text-gray-900 hover:bg-gray-100"}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
