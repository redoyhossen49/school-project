import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { darkMode } = useTheme();

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Colors
  const baseBg = darkMode ? "bg-gray-700" : "bg-white";
  const baseBorder = darkMode ? "border-gray-500" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100";
  const activeBg = darkMode
    ? "bg-blue-500 text-white border-blue-500"
    : "bg-blue-600 text-white border-blue-600";

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center space-x-1 md:space-x-3 py-2"
    >
      {/* Back Button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
        className={`h-8 px-3 text-xs border shadow-sm ${baseBorder} ${baseBg} disabled:opacity-50 disabled:cursor-not-allowed ${hoverBg} transition-colors duration-150 flex items-center justify-center select-none`}
      >
        Back
      </button>

      {/* Current Page Indicator */}
      <span
        className={`h-8 px-4 text-xs border  shadow-sm flex items-center justify-center select-none ${activeBg}`}
      >
        {totalPages === 0 ? 0 : currentPage} 
      </span>

      {/* Next Button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`h-8 px-3 text-xs border  shadow-sm ${baseBorder} ${baseBg} disabled:opacity-50 disabled:cursor-not-allowed ${hoverBg} transition-colors duration-150 flex items-center justify-center select-none`}
      >
        Next
      </button>
    </nav>
  );
}
