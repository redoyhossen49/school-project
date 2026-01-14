import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassPaymentTable from "../components/academic/ClassPaymentTable.jsx";
import { classPaymentData } from "../data/classPaymentData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";

export default function ClassListPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [classData, setClassData] = useState(classPaymentData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);

  const monthRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);

  const months = [
    "All","January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  const classOptions = Array.from(new Set(classData.map((c) => c.class)));

  // -------------------- Outside Click --------------------
  useEffect(() => {
    const handler = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Refresh --------------------
  const handleRefresh = () => {
    setSelectedMonth("All");
    setSearch("");
    setClassFilter("");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  // -------------------- Filter + Sort + Search --------------------
  const filteredData = useMemo(() => {
    let data = classData;

    if (classFilter) data = data.filter((item) => item.class === classFilter);
    if (search)
      data = data.filter((item) =>
        item.class.toLowerCase().includes(search.toLowerCase())
      );

    data = data.sort((a, b) =>
      sortOrder === "newest" ? a.sl - b.sl : b.sl - a.sl
    );

    // Month filter
    if (selectedMonth !== "All") {
      data = data
        .map((item) => {
          const monthData = item.monthly.find((m) => m.month === selectedMonth);
          return { ...item, monthly: monthData ? [monthData] : [] };
        })
        .filter((item) => item.monthly.length > 0);
    }

    return data;
  }, [search, classFilter, selectedMonth, sortOrder, classData]);

  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  // Auto-adjust currentPage if filteredData shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // -------------------- Export --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.flatMap((item) =>
      item.monthly.map((m) => ({
        SL: item.sl,
        Class: item.class,
        Month: m.month,
        Amount: m.amount || "",
      }))
    );
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Class List");
    writeFile(wb, "ClassList.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF("landscape", "pt", "a4");
    const tableColumn = ["SL", "Class", "Month", "Amount"];
    const tableRows = [];
    data.forEach((item) => {
      item.monthly.forEach((m) => {
        tableRows.push([item.sl, item.class, m.month, m.amount || ""]);
      });
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });
    doc.save("ClassList.pdf");
  };

  const addClassFields = [
    {
      name: "className",
      label: "Class Name",
      placeholder: "Enter class name",
      required: true,
    },
  ];

  const handleAddClass = (data) => {
    const exists = classData.some(
      (c) => c.class.toLowerCase() === data.className.toLowerCase()
    );
    if (exists) {
      alert("Class already exists");
      return;
    }
    setClassData((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        class: data.className,
        monthly: [],
      },
    ]);
    setCurrentPage(1);
  };

  // -------------------- Styles --------------------
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-200";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={`rounded-md p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Class List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Class List
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full flex items-center gap-1 rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredData)}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center gap-1 rounded bg-blue-600 text-white px-2 py-2 text-xs"
              >
                Add Class
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Class"
              fields={addClassFields}
              initialValues={{ className: "" }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={handleAddClass}
            />
          </div>
        </div>

        {/* Month / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            {/* Month Dropdown */}
            <div ref={monthRef} className="relative flex-1">
              <button
                onClick={() => setMonthOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                {selectedMonth}{" "}
                <BiChevronDown
                  className={`${monthOpen ? "rotate-180" : ""} transition-transform`}
                />
              </button>
              {monthOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
                >
                  {months.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setCurrentPage(1);
                        setMonthOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                        selectedMonth === m ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                Filter <BiChevronDown className={`${filterOpen ? "rotate-180" : ""} transition-transform`} />
              </button>
              {filterOpen && (
                <div
                  className={`absolute top-full z-50 mt-1 w-52 rounded border left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 max-h-56 overflow-y-auto shadow-md p-3 space-y-2 ${borderClr} ${dropdownBg}`}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setClassOpen((prev) => !prev)}
                      className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                        classFilter === "" ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      All Classes <BiChevronDown className={`${classOpen ? "rotate-180" : ""} transition-transform`} />
                    </button>
                    {classOpen && classOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setClassFilter(c);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                          classFilter === c ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setFilterOpen(false)} className="w-full bg-blue-600 text-white text-xs py-1 rounded mt-2">Apply</button>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="flex-1">
              <button
                onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                Sort {sortOrder === "newest" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search class..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs focus:outline-none ${borderClr} ${inputBg}`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={`rounded p-2 overflow-x-auto ${cardBg}`}>
        <ClassPaymentTable
          data={currentData.map((item, index) => ({
            ...item,
            sl: (currentPage - 1) * perPage + index + 1,
          }))}
          month={selectedMonth}
        />
      </div>
    </div>
  );
}
