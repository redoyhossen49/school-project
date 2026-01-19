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
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
        isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} ${textColor} w-full max-w-lg rounded-lg shadow-xl border ${borderClr} p-6 transition-all duration-300 transform ${
          isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-6">Finding</h2>

        <div className="space-y-4">
          {/* Radio Button Options */}
          <div className="space-y-2">
            {/* Paid Option */}
            <label
              className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${
                filterType === "Paid"
                  ? "border-blue-600 bg-blue-50"
                  : darkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="filterType"
                value="Paid"
                checked={filterType === "Paid"}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-4 h-4 cursor-pointer"
                style={{
                  accentColor: "#2563eb",
                }}
              />
              <span className={`font-semibold text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                Paid
              </span>
            </label>

            {/* Due Option */}
            <label
              className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${
                filterType === "Due"
                  ? "border-blue-600 bg-blue-50"
                  : darkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="filterType"
                value="Due"
                checked={filterType === "Due"}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-4 h-4 cursor-pointer"
                style={{
                  accentColor: "#2563eb",
                }}
              />
              <span className="font-semibold text-sm text-red-600">Due</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 text-sm py-[8px] border ${borderClr} ${
                darkMode
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } transition rounded font-medium`}
            >
              Close
            </button>
            {filterType && (
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 text-sm py-[8px] bg-blue-600 text-white hover:bg-blue-700 transition rounded font-semibold uppercase"
              >
                FINDING
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
