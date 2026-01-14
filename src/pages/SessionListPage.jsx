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

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

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
    new Set(sessionData.map((s) => s.sessionYear))
  );
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
      sessionFilter ? item.sessionYear === sessionFilter : true
    )
    .filter((item) =>
      search ? item.class.toLowerCase().includes(search.toLowerCase()) : true
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const handleAddSession = (formData) => {
    const sessionYear = `${new Date(
      formData.sessionStart
    ).getFullYear()}-${new Date(formData.sessionEnd).getFullYear()}`;

    const newSession = {
      sl: sessions.length + 1,
      class: formData.class,
      group: formData.group || "",
      section: formData.section || "",
      sessionStart: formData.sessionStart,
      sessionEnd: formData.sessionEnd,
      sessionYear,
      totalDays:
        Math.ceil(
          (new Date(formData.sessionEnd) - new Date(formData.sessionStart)) /
            (1000 * 60 * 60 * 24)
        ) || 0,
    };

    setSessions((prev) => [...prev, newSession]);
    setAddSessionModalOpen(false);
    setCurrentPage(1); // reset page
  };

  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const addSessionFields = [
    {
      name: "class",
      label: "Class",
      type: "select",
      options: Array.from(new Set(sessionData.map((s) => s.class))).map(
        (c) => ({
          label: c,
          value: c,
        })
      ),
      required: true,
      placeholder: "Select Class",
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      options: Array.from(new Set(sessionData.map((s) => s.group))).map(
        (g) => ({
          label: g,
          value: g,
        })
      ),
      required: false,
      placeholder: "Select Group ",
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: Array.from(new Set(sessionData.map((s) => s.section))).map(
        (s) => ({
          label: s,
          value: s,
        })
      ),
      required: false,
      placeholder: "Select Section ",
    },
    {
      name: "sessionStart",
      label: "Session Start",
      type: "date",
      required: true,
    },
    {
      name: "sessionEnd",
      label: "Session End",
      type: "date",
      required: true,
    },
    {
      name: "sessionYear",
      label: "Session Year",
      type: "text",
      required: false,
      placeholder: "Auto-calculated",
      disabled: true,
    },
  ];

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
        className={`rounded-md p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Session List</h2>
            <p className="text-xs text-blue-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>{" "}
              / Session List
            </p>
          </div>

          {/* Buttons: Refresh / Export / Add */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              }`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between gap-1 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-200"
                  }`}
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
                onClick={() => setAddSessionModalOpen(true)}
                className="w-full md:w-28 flex items-center gap-1 rounded bg-blue-600 px-2 py-2 text-xs text-white"
              >
                Add Session
              </button>
            )}
            <FormModal
              open={addSessionModalOpen}
              title="Add Session"
              initialValues={{
                class: "",
                group: "",
                section: "",
                sessionStart: "",
                sessionEnd: "",
              }}
              onClose={() => setAddSessionModalOpen(false)}
              onSubmit={handleAddSession}
              fields={addSessionFields}
            />
          </div>
        </div>

        {/* Filters / Month / Sort / Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            {/* Month Dropdown */}
            <div ref={monthRef} className="relative flex-1">
              <button
                onClick={() => setMonthOpen(!monthOpen)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                {selectedMonth}{" "}
                <BiChevronDown
                  className={`${
                    monthOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {monthOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {months.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setCurrentPage(1);
                        setMonthOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                        selectedMonth === m
                          ? darkMode
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-blue-100 text-blue-700 font-medium"
                          : darkMode
                          ? "text-gray-200"
                          : "text-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Filter{" "}
                <BiChevronDown
                  className={`${
                    filterOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {filterOpen && (
                <div
                  className={`absolute  z-50 mt-1 w-52 rounded border p-3 space-y-2 left-1/2 -translate-x-1/2
    md:left-0 md:translate-x-0 max-h-40 overflow-y-autoshadow-sm ${
      darkMode ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"
    }`}
                >
                  {/* Class */}
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen(!classOpen)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "bg-gray-700 border-gray-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {classFilter || "All Classes"} <BiChevronDown />
                    </button>
                    {classOpen &&
                      classOptions.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setClassFilter(c);
                            setClassOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            classFilter === c
                              ? darkMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                  </div>

                  {/* Group */}
                  <div className="relative">
                    <button
                      onClick={() => setGroupOpen(!groupOpen)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "bg-gray-700 border-gray-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {groupFilter || "All Groups"} <BiChevronDown />
                    </button>
                    {groupOpen &&
                      groupOptions.map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setGroupFilter(g);
                            setGroupOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            groupFilter === g
                              ? darkMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                  </div>

                  {/* Section */}
                  <div className="relative">
                    <button
                      onClick={() => setSectionOpen(!sectionOpen)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "bg-gray-700 border-gray-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {sectionFilter || "All Sections"} <BiChevronDown />
                    </button>
                    {sectionOpen &&
                      sectionOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSectionFilter(s);
                            setSectionOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            sectionFilter === s
                              ? darkMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                  </div>

                  {/* Session Year */}
                  <div className="relative">
                    <button
                      onClick={() => setSessionOpen(!sessionOpen)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "bg-gray-700 border-gray-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {sessionFilter || "All Sessions"} <BiChevronDown />
                    </button>
                    {sessionOpen &&
                      sessionOptions.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSessionFilter(y);
                            setSessionOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            sessionFilter === y
                              ? darkMode
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => {
                      setFilterOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`w-full md:w-28 flex items-center rounded border px-2 py-2 text-xs shadow-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              }`}
            >
              Sort {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:mt-0 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search class..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs shadow-sm focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-200"
                  : "bg-white border-gray-200"
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
        className={` rounded-md p-2 overflow-x-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <SessionTable data={currentData} month={selectedMonth} />
      </div>
    </div>
  );
}
