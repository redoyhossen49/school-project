import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import SessionTable from "../components/academic/SessionTable.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

// Dummy session data
const sessionData = Array.from({ length: 30 }, (_, i) => ({
  sl: i + 1,
  class: `Class ${(i % 5) + 1}`,
  group: `Group ${(i % 3) + 1}`,
  section: `Section ${(i % 4) + 1}`,
  sessionStart: `01/0${(i % 9) + 1}/2025`,
  sessionEnd: `31/0${(i % 9) + 1}/2026`,
  sessionYear: "2025-2026",
  totalDays: 200 + (i % 10),
}));

export default function SessionListPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";
  const [formData, setFormData] = useState({
    class: "",
    group: "",
    section: "",
    sessionStart: "",
    sessionEnd: "",
    showSession: "",
    totalDays: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [sessions, setSessions] = useState(sessionData); // make sessionData reactive

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const exportRef = useRef(null);
  const monthRef = useRef(null);

  // Dropdown options
  const classOptions = Array.from(new Set(sessionData.map((s) => s.class)));
  const groupOptions = Array.from(new Set(sessionData.map((s) => s.group)));
  const sectionOptions = Array.from(new Set(sessionData.map((s) => s.section)));
  const sessionOptions = Array.from(
    new Set(sessionData.map((s) => s.sessionYear)),
  );
  const filterFields = [
    {
      key: "class",
      placeholder: "Select class",
      options: classOptions,
    },
    {
      key: "group",
      placeholder: "Select group",
      options: groupOptions,
    },
    {
      key: "section",
      placeholder: "Select section",
      options: sectionOptions,
    },
    {
      key: "session",
      placeholder: "Select session",
      options: sessionOptions,
    },
  ];
  const months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Refresh all filters
  const handleRefresh = () => {
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setSortOrder("asc");
    setCurrentPage(1);
    setSearch("");
    setSelectedMonth("All");
  };

  const filteredData = sessions
    .filter((item) => (classFilter ? item.class === classFilter : true))
    .filter((item) => (groupFilter ? item.group === groupFilter : true))
    .filter((item) => (sectionFilter ? item.section === sectionFilter : true))
    .filter((item) =>
      sessionFilter ? item.sessionYear === sessionFilter : true,
    )
    .filter((item) =>
      search ? item.class.toLowerCase().includes(search.toLowerCase()) : true,
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage); // <-- declare here
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const addSessionFields = [
    {
      key: "class",
      name: "class",
      label: "Class",
      type: "select",
      placeholder: " Class",
      options: classOptions,
      required: true,
    },
    {
      key: "group",
      name: "group",
      label: "Group",
      type: "select",
      placeholder: " Group",
      options: groupOptions,
    },
    {
      key: "section",
      name: "section",
      label: "Section",
      type: "select",
      placeholder: " Section",
      options: sectionOptions,
    },
    {
      key: "sessionStart",
      name: "sessionStart",
      label: "Session Start",
      type: "date",
      placeholder: " Start",
      required: true,
    },
    {
      key: "sessionEnd",
      name: "sessionEnd",
      label: "Session End",
      type: "date",
      placeholder: " End",
      required: true,
    },
    {
      key: "showSession",
      name: "showSession",
      label: "Session",
      type: "text",
      placeholder: "Session Start - End",
      readOnly: true,
    },
    {
      key: "totalDays",
      name: "totalDays",
      label: "Total Days",
      type: "number",
      placeholder: "Total Days",
      readOnly: true,
    },
  ];

  const initialValues = {
    class: "",
    group: "",
    section: "",
    sessionStart: "",
    sessionEnd: "",
    showSession: "",
    totalDays: "",
  };

  const handleAddSession = (data) => {
    const start = new Date(data.sessionStart);
    const end = new Date(data.sessionEnd);
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const newSession = {
      sl: sessions.length + 1,
      class: data.class,
      group: data.group,
      section: data.section,
      sessionStart: data.sessionStart,
      sessionEnd: data.sessionEnd,
      sessionYear: `${startYear}-${endYear}`,
      totalDays: totalDays > 0 ? totalDays : 0,
      showSession: `${data.sessionStart} - ${data.sessionEnd}`,
    };

    setSessions((prev) => [...prev, newSession]);
    setAddSessionModalOpen(false);
    setFormData({
      class: "",
      group: "",
      section: "",
      sessionStart: "",
      sessionEnd: "",
      showSession: "",
      totalDays: "",
    });
  };

  // -------------------- Export Functions --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((row) => ({
      Sl: row.sl,
      Class: row.class,
      Group: row.group,
      Section: row.section,
      "Session Start": row.sessionStart,
      "Session End": row.sessionEnd,
      "Session Year": row.sessionYear,
      "Total Days": row.totalDays,
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sessions");
    writeFile(wb, "Sessions.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return alert("No data to export");
    const doc = new jsPDF("landscape", "pt", "a4");
    const tableColumn = [
      "Sl",
      "Class",
      "Group",
      "Section",
      "Session Start",
      "Session End",
      "Session Year",
      "Total Days",
    ];
    const tableRows = data.map((row) => [
      row.sl,
      row.class,
      row.group,
      row.section,
      row.sessionStart,
      row.sessionEnd,
      row.sessionYear,
      row.totalDays,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      headStyles: { fillColor: [30, 144, 255] },
      styles: { fontSize: 8 },
      margin: { top: 20, left: 10, right: 10 },
    });
    doc.save("Sessions.pdf");
  };

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div
        className={` p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Session list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>{" "}
              / Session list
            </p>
          </div>

          {/* Buttons: Refresh / Export / Add */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            {/* Filter */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Filter
              </button>
              <FilterDropdown
                title="Filter session"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");
                  setSectionFilter(values.section || "");
                  setSessionFilter(values.session || "");
                  setCurrentPage(1);
                  setFilterOpen(false);
                }}
                darkMode={darkMode}
                buttonRef={filterRef}
              />
            </div>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center  border px-3 h-8 text-xs ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-300"
                }`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border  ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredData)}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit ? (
              <button
                onClick={() => setAddSessionModalOpen(true)}
                className="w-full md:w-28 flex items-center bg-blue-600 px-2 h-8 text-xs text-white"
              >
                Session
              </button>
            ) : (
              <div className="relative flex-1 w-full md:w-28" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center md:w-28 w-full border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
                >
                  Sort By
                </button>
                {sortOpen && (
                  <div
                    className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
                  >
                    <button
                      onClick={() => {
                        setSortOrder("asc");
                        setSortOpen(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      First
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("desc");
                        setSortOpen(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}
            <FormModal
              open={addSessionModalOpen}
              title="Add Session"
              initialValues={formData}
              onClose={() => setAddSessionModalOpen(false)}
              onSubmit={handleAddSession}
              fields={addSessionFields}
              onValuesChange={(updatedFormData) => {
                if (
                  updatedFormData.sessionStart &&
                  updatedFormData.sessionEnd
                ) {
                  const start = new Date(updatedFormData.sessionStart);
                  const end = new Date(updatedFormData.sessionEnd);

                  const diffTime = end - start;
                  const diffDays =
                    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                  const startYear = start.getFullYear(); // 2025
                  const endYearShort = String(end.getFullYear()).slice(-2); // 26

                  setFormData({
                    ...updatedFormData,
                    showSession: `${startYear}-${endYearShort}`, // ✅ 2025-26
                    totalDays: diffDays > 0 ? diffDays : 0,
                  });
                } else {
                  setFormData(updatedFormData);
                }
              }}
            />
          </div>
        </div>

        {/* Filters / Month / Sort / Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* Sort 
            <div className="relative flex-1 " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-full z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }  left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>*/}

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:justify-between w-full ">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search class..."
              className={`w-full md:w-64  border px-3 h-8 text-xs focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-200"
                  : "bg-white border-gray-300"
              }`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* SESSION TABLE */}
      <div
        className={`  p-3 overflow-x-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <SessionTable data={currentData} month={selectedMonth} />
      </div>
    </div>
  );
}
