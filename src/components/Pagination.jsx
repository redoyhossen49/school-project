// src/components/common/Pagination.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
     const {darkMode}=useTheme();
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
   
    if (page !== currentPage) onPageChange(page);
  };

  // Generate page numbers with simple truncation for large page counts
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <nav aria-label="Pagination" className="flex justify-center space-x-1 mt-4">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 disabled:opacity-50 hover:bg-gray-100 "
        aria-label="Previous Page"
      >
        Prev
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="px-3 py-1 text-gray-500 select-none"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1 border border-gray-200 hover:bg-gray-200  ${
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                :  `${darkMode
          ? "bg-gray-500 text-gray-100 "
          : "bg-white text-gray-900 "}`
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-gray-300 disabled:opacity-50 hover:bg-gray-100 "
        aria-label="Next Page"
      >
        Next
      </button>
    </nav>
  );
}
