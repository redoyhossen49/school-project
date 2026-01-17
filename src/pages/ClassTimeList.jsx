import { useState, useRef, useEffect } from "react";
import { classTimeData } from "../data/classTimeData";
import ClassTimeTable from "../components/student/ClassTimeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function ClassTimeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [classTimes, setClassTimes] = useState(classTimeData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const classTimesPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedSection, setSelectedSection] = useState("All");
  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);
   const [filters, setFilters] = useState({
      className: "",
      group: "",
      section: "",
      session: "",
    });

  const sectionDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(e.target)
      )
        setSectionOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter + Sort + Search
const filteredClassTimes = classTimes
  // Search
  .filter((c) =>
    c.className.toLowerCase().includes(search.toLowerCase())
  )

  // Class filter
  .filter((c) =>
    filters.className ? c.className === filters.className : true
  )

  // Group filter
  .filter((c) =>
    filters.group ? c.group === filters.group : true
  )

  // Section filter
  .filter((c) =>
    filters.section ? c.section === filters.section : true
  )

  // Session filter
  

  // Old section dropdown (optional)
  
  // Sort
  .sort((a, b) =>
    sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl
  );


  const totalClassTimes = filteredClassTimes.length;
  const totalPages = Math.ceil(totalClassTimes / classTimesPerPage);
  const indexOfLast = currentPage * classTimesPerPage;
  const indexOfFirst = indexOfLast - classTimesPerPage;
  const currentClassTimes = filteredClassTimes.slice(indexOfFirst, indexOfLast);

  // ---------- Export ----------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((c, i) => ({
      Sl: i + 1,
      Class: c.className,
      Section: c.section,
      Subject: c.subject || "-",
      Time: c.time || "-",
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ClassTimes");
    writeFile(wb, "ClassTimes.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return;
    const doc = new jsPDF("landscape", "pt", "a4");
    const columns = ["Sl", "Class", "Section", "Subject", "Time"];
    const rows = data.map((c, i) => [
      i + 1,
      c.className,
      c.section,
      c.subject || "-",
      c.time || "-",
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
    });
    doc.save("ClassTimes.pdf");
  };

   // Generate dynamic options from studentData
    const getUniqueOptions = (data, key) => {
      return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
    };
  
    // Example usage in parent component
    const classOptions = getUniqueOptions(classTimeData, "className"); // ["I", "II", "III", ...]
    const groupOptions = getUniqueOptions(classTimeData, "group"); // ["N/A", "Science", ...]
    const sectionOptions = getUniqueOptions(classTimeData, "section"); // ["A", "B", "C", ...]
    const sessionOptions = getUniqueOptions(classTimeData, "session"); // ["2025-26", ...]
  

  // Button base class
  const buttonClass = `flex items-center justify-between w-28 rounded px-3 py-2 text-xs shadow-sm hover:bg-gray-100 ${
    darkMode
      ? "border bg-gray-700 border-gray-500 text-gray-100"
      : "border bg-white border-gray-200 text-gray-900"
  }`;

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* Header */}
      <div
        className={`rounded-md p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-700"
        }`}
      >
        <div className="md:flex md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Class Time List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Class Time / Class Time List
            </p>
          </div>

          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setClassTimes(classTimeData);
                setSearch("");
              }}
              className={buttonClass}
            >
             Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={buttonClass}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 z-50 top-full mt-1 w-28 rounded border shadow-sm ${
                    darkMode
                      ? "border-gray-500 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredClassTimes)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredClassTimes)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addclasstime")}
                className="flex items-center  gap-1 w-28 rounded bg-blue-600 px-3 py-2 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                Class Time
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setClassTimes(classTimeData);
              setSearch("");
            }}
            className={`flex items-center  w-full rounded border px-2 py-2 text-xs shadow-sm ${
              darkMode
                ? "border-gray-500 bg-gray-700 text-gray-100"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            Refresh
          </button>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={`flex items-center justify-between w-full rounded border px-2 py-2 text-xs shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              Export <BiChevronDown />
            </button>
            {exportOpen && (
              <div
                className={`absolute left-0 z-50 top-full mt-1 w-full rounded border shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredClassTimes)}
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredClassTimes)}
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addclasstime")}
              className="flex items-center  w-full rounded bg-blue-600 px-2 py-2 text-xs text-white shadow-sm"
            >
               Class Time
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Section Dropdown */}
            <div className="relative" ref={sectionDropdownRef}>
              <button
                onClick={() => setSectionOpen(!sectionOpen)}
                className={`flex items-center justify-between w-full md:w-28 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                {selectedSection} <BiChevronDown />
              </button>
              {sectionOpen && (
                <div
                  className={`absolute left-0 mt-2 w-28 shadow-lg z-30 flex flex-col ${
                    darkMode
                      ? "bg-gray-600 text-gray-100 border border-gray-700"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {sectionOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSection(opt);
                        setSectionOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-1 text-sm hover:bg-gray-100 flex justify-between items-center"
                    >
                      {opt} <BiChevronRight size={12} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center justify-between w-full md:w-28 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                Filter <BiChevronDown />
              </button>
              
                            <FilterDropdown
                              title="Filter Students"
                              fields={[
                                {
                                  key: "className",
                                  label: "Class",
                                  options: classOptions,
                                  placeholder: "All Classes",
                                },
                                {
                                  key: "group",
                                  label: "Group",
                                  options: groupOptions,
                                  placeholder: "All Groups",
                                },
                                {
                                  key: "section",
                                  label: "Section",
                                  options: sectionOptions,
                                  placeholder: "All Sections",
                                },
                               
                              ]}
                              selected={filters}
                              setSelected={setFilters}
                              darkMode={darkMode}
                              isOpen={filterOpen}
                              onClose={() => setFilterOpen(false)}
                              onApply={() => setCurrentPage(1)}
                            />
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center justify-between w-full md:w-28 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                Sort By <BiChevronDown />
              </button>
              {sortOpen && (
                <div
                  className={`absolute left-0 mt-2 w-28 rounded border shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    First ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    Last ↓
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 mt-2 md:mt-0">
            <input
              type="text"
              placeholder="Search by class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 px-2 md:px-3 w-full text-xs rounded border shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`p-2 ${darkMode ? "bg-gray-900" : "bg-white"} rounded`}>
        <ClassTimeTable data={currentClassTimes} setData={setClassTimes} />
      </div>
    </div>
  );
}
