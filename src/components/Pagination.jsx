import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { darkMode } = useTheme();

  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
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
      className="flex justify-center items-center space-x-1 md:space-x-3"
    >
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`h-7 px-2 md:px-3 text-xs border ${baseBorder} ${baseBg} disabled:opacity-50 disabled:cursor-not-allowed ${hoverBg} transition-colors duration-150 flex items-center justify-center select-none`}
      >
        Prev
      </button>

      <span
        className={`h-7 px-2 md:px-3 text-xs border ${activeBg} border-b-2 border-r-2 flex items-center justify-center select-none`}
      >
        {currentPage}
      </span>

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`h-7 px-2 md:px-3 text-xs border ${baseBorder} ${baseBg} disabled:opacity-50 disabled:cursor-not-allowed ${hoverBg} transition-colors duration-150 flex items-center justify-center select-none`}
      >
        Next
      </button>
    </nav>
  );
}
