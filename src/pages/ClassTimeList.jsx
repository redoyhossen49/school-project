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
import AddClassTimeModal from "../components/student/AddClassTimeModal.jsx";

export default function ClassTimeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const loadClassTimes = () => {
    const stored = localStorage.getItem("classTimes");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return classTimeData;
      }
    }
    return classTimeData;
  };

  const [classTimes, setClassTimes] = useState(() => loadClassTimes());
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
  const [addOpen, setAddOpen] = useState(false);
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
    .filter((c) => c.className.toLowerCase().includes(search.toLowerCase()))

    // Class filter
    .filter((c) =>
      filters.className ? c.className === filters.className : true,
    )

    // Group filter
    .filter((c) => (filters.group ? c.group === filters.group : true))

    // Section filter
    .filter((c) => (filters.section ? c.section === filters.section : true))

    // Session filter

    // Old section dropdown (optional)

    // Sort
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

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

  const saveClassTimesToStorage = (next) => {
    localStorage.setItem("classTimes", JSON.stringify(next));
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
  const buttonClass = `flex items-center  w-28  px-3 h-8 text-xs hover:bg-gray-100 ${
    darkMode
      ? "border bg-gray-700 border-gray-500 text-gray-100"
      : "border bg-white border-gray-200 text-gray-900"
  }`;

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* Header */}
      <div
        className={` p-3 space-y-3 ${
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
              / Class Time
            </p>
          </div>

          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center  w-full md:w-28  border px-3 h-8 text-xs  ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                Filter
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

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={buttonClass}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 z-50 top-full mt-1 w-28  border  ${
                    darkMode
                      ? "border-gray-500 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredClassTimes)}
                    className="w-full px-3 py-1  text-left text-xs hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredClassTimes)}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center text-white   w-28  bg-blue-600 px-3 h-8 text-xs text-whitehover:bg-blue-700"
              >
                Class Time
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center  w-full md:w-28  border px-3 h-8 text-xs  ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              Filter
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

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={`flex items-center w-full  border px-3 h-8 text-xs  ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute left-0 z-50 top-full mt-1 w-full  border  ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredClassTimes)}
                  className="w-full px-3 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredClassTimes)}
                  className="w-full px-3 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center  w-full  bg-blue-600 px-3 h-8 text-xs text-white "
            >
              Class Time
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          
          
                {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:justify-between md:mt-0">
            <input
              type="text"
              placeholder="Search by class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 px-3  w-full md:w-64 text-xs  border  ${
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
      <div className={`p-3 ${darkMode ? "bg-gray-900" : "bg-white"} `}>
        <ClassTimeTable data={currentClassTimes} setData={setClassTimes} />
      </div>

      {canEdit && (
        <AddClassTimeModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSave={(values) => {
            const base = loadClassTimes();
            const maxSl = base.reduce((m, r) => Math.max(m, Number(r.sl) || 0), 0);
            const newRow = { sl: maxSl + 1, ...values };
            const next = [newRow, ...base];
            setClassTimes(next);
            saveClassTimesToStorage(next);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
