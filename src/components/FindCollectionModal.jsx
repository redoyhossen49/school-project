import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function FindCollectionModal({
  open,
  onClose,
  collections = [],
  filterType,
  setFilterType,
  onApplyFilters,
}) {
  const { darkMode } = useTheme();
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);

  // Handle modal opening animation
  useEffect(() => {
    if (open) {
      setIsModalClosing(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [open]);

  // Handle close with animation
  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
      setFilterType("");
    }, 300);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        filterType,
        filters: {},
      });
    }
    handleClose();
  };


  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";

  if (!open && !isModalClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
        isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} ${textColor} w-full max-w-[250px] border ${borderClr} p-4 transition-all duration-300 transform ${
          isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Title */}
        <h2 className="text-base font-semibold text-center mb-4">Finding</h2>

        <div className="space-y-3">
          {/* Button Options */}
          <div className="space-y-2">
            {/* Paid Option */}
            <button
              type="button"
              onClick={() => setFilterType("Paid")}
              className={`w-full flex items-center justify-left gap-2 py-2 px-3 border transition ${
                filterType === "Paid"
                  ? darkMode
                    ? "border-blue-500 bg-blue-900/30 text-blue-300"
                    : "border-blue-600 bg-blue-50 text-blue-600"
                  : darkMode
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
              }`}
            >
              <span className="font-semibold text-xs">
                Paid
              </span>
            </button>

            {/* Due Option */}
            <button
              type="button"
              onClick={() => setFilterType("Due")}
              className={`w-full flex items-center justify-left gap-2 py-2 px-3 border transition ${
                filterType === "Due"
                  ? darkMode
                    ? "border-red-500 bg-red-900/30 text-red-300"
                    : "border-red-600 bg-red-50 text-red-600"
                  : darkMode
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "border-gray-300 bg-white hover:bg-gray-50 text-red-600"
              }`}
            >
              <span className="font-semibold text-xs">
                Due
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className={`w-[50%] text-xs py-2 border ${borderClr} ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              } transition font-medium`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={!filterType}
              className={`w-[50%] text-xs py-2 transition font-semibold uppercase ${
                filterType
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : darkMode
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Finding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
