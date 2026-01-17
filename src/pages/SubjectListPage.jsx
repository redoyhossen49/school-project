import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import SubjectTable from "../components/academic/SubjectTable.jsx";
import { subjectData } from "../data/subjectData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";

export default function SubjectListPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [subjects, setSubjects] = useState(subjectData);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const perPage = 10;

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const monthRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const exportRef = useRef(null);

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

  // -------------------- Dynamic Filter Options --------------------
  const classOptions = Array.from(new Set(subjects.map((s) => s.class)));
  const groupOptions = (selectedClass) =>
    Array.from(
      new Set(
        subjects
          .filter((s) => !selectedClass || s.class === selectedClass)
          .map((s) => s.group)
          .filter(Boolean)
      )
    );
  const sectionOptions = (selectedClass, selectedGroup) =>
    Array.from(
      new Set(
        subjects
          .filter((s) => !selectedClass || s.class === selectedClass)
          .filter((s) => !selectedGroup || s.group === selectedGroup)
          .map((s) => s.section)
          .filter(Boolean)
      )
    );

  // -------------------- Outside click handler --------------------
  useEffect(() => {
    const handler = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Actions --------------------
  const handleRefresh = () => {
    setSubjects(subjectData);
    setSearch("");
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSelectedMonth("All");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // -------------------- Filter, Sort, Search --------------------
  const filtered = subjects
    .filter((s) => s.subjectName.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => (classFilter ? s.class === classFilter : true))
    .filter((s) => (groupFilter ? s.group === groupFilter : true))
    .filter((s) => (sectionFilter ? s.section === sectionFilter : true))
    .filter((s) =>
      selectedMonth === "All" ? true : s.month === selectedMonth
    );

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === "asc"
      ? a.subjectName.localeCompare(b.subjectName)
      : b.subjectName.localeCompare(a.subjectName)
  );

  const totalPages = Math.ceil(sorted.length / perPage);
  const currentSubjects = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

 const modalFields = [
  {
    name: "class",
    label: "Class",
    type: "select",
    placeholder: "Select Class",
    options: classOptions.map((c) => ({ label: c, value: c })),
    required: true,
  },
  {
    name: "group",
    label: "Group",
    type: "select",
    placeholder: "Select Group",
    options: groupOptions(classFilter).map((g) => ({ label: g, value: g })),
    required: false,
  },
  {
    name: "section",
    label: "Section",
    type: "select",
    placeholder: "Select Section",
    options: sectionOptions(classFilter, groupFilter).map((s) => ({
      label: s,
      value: s,
    })),
    required: false,
  },
  {
    name: "subjectName",
    label: "Subject Name",
    type: "text",
    placeholder: "Enter Subject Name",
    required: true,
  },
  {
    name: "subjectType",
    label: "Subject Type",
    type: "select",
    placeholder: "Select Type",
    options: [
      { label: "Theory", value: "theory" },
      { label: "Practical", value: "practical" },
      { label: "Theory + Practical", value: "both" },
    ],
    required: true,
  },
  // Theory Marks
  {
    name: "theoryFullMark",
    label: "Theory Full Mark",
    type: "number",
    placeholder: "Enter Full Mark (Theory)",
    required: true,
  },
  {
    name: "theoryPassMark",
    label: "Theory Pass Mark",
    type: "number",
    placeholder: "Enter Pass Mark (Theory)",
    required: true,
  },
  {
    name: "theoryFailMark",
    label: "Theory Fail Mark",
    type: "number",
    placeholder: "Enter Fail Mark (Theory)",
    required: true,
  },
  // Practical Marks — optional, show only if type has practical
  {
    name: "practicalFullMark",
    label: "Practical Full Mark",
    type: "number",
    placeholder: "Enter Full Mark (Practical)",
    required: false,
    dependsOn: "subjectType", // custom logic in FormModal to show if type === 'practical' or 'both'
  },
  {
    name: "practicalPassMark",
    label: "Practical Pass Mark",
    type: "number",
    placeholder: "Enter Pass Mark (Practical)",
    required: false,
    dependsOn: "subjectType",
  },
  {
    name: "practicalFailMark",
    label: "Practical Fail Mark",
    type: "number",
    placeholder: "Enter Fail Mark (Practical)",
    required: false,
    dependsOn: "subjectType",
  },
];

  const handleAddSubject = (data) => {
    const newSubject = {
      ...data,
      id: subjects.length + 1, // optional unique id
      month: "All", // default month
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  // -------------------- Export --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const ws = utils.json_to_sheet(
      data.map((row, index) => ({
        Sl: index + 1,
        Class: row.class,
        Group: row.group,
        Section: row.section,
        Subject: row.subjectName,
        Month: row.month || "-",
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Subjects");
    writeFile(wb, "Subjects.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return alert("No data to export");
    const doc = new jsPDF("landscape", "pt", "a4");
    const columns = ["Sl", "Class", "Group", "Section", "Subject", "Month"];
    const rows = data.map((row, i) => [
      i + 1,
      row.class,
      row.group,
      row.section,
      row.subjectName,
      row.month || "-",
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
    });
    doc.save("Subjects.pdf");
  };

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div
        className={`${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        } rounded p-3 space-y-3`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Subject List</h2>
            <p className="text-xs text-blue-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>{" "}
              / Subject List
            </p>
          </div>

          {/* Refresh | Export | Add */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              className={`w-full md:w-28 flex items-center   rounded border px-2 py-2 text-xs shadow-sm ${
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
                className={`w-full flex items-center justify-between px-2 py-2 text-xs shadow-sm rounded border ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-sm ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(sorted)}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(sorted)}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="w-full md:w-28 flex items-center  bg-blue-600 text-white rounded px-2 py-2 text-xs shadow-sm"
              >
                Subject
              </button>
            )}
            <FormModal
              open={addModalOpen}
              title="Add Subject"
              fields={modalFields}
              initialValues={{}}
              onClose={() => setAddModalOpen(false)}
              onSubmit={handleAddSubject}
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mt-2">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            {/* Month */}
            <div ref={monthRef} className="relative">
              <button
                onClick={() => setMonthOpen(!monthOpen)}
                className={`w-full md:w-28 flex items-center justify-between px-3 py-2 text-xs rounded border shadow-sm ${
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
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                        selectedMonth === m
                          ? "bg-blue-100 text-blue-700 font-medium"
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
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full md:w-28 flex items-center justify-between px-3 py-2 text-xs rounded border shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Filter <BiChevronDown />
              </button>
              {filterOpen && (
                <div
                  className={`absolute z-50 mt-1 w-52   left-1/2 -translate-x-1/2
    md:left-0 md:translate-x-0 max-h-40 overflow-y-auto p-3 space-y-2 rounded border shadow-md ${
      darkMode ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"
    }`}
                >
                  {/* Class */}
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen(!classOpen)}
                      className={`w-full border text-xs  px-2 py-1 rounded flex justify-between items-center shadow-sm ${
                        darkMode ? "border-gray-500" : "border-gray-200"
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
                              ? "bg-blue-100 text-blue-700 font-medium"
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
                      className={`w-full border text-xs  px-2 py-1 rounded flex justify-between items-center shadow-sm ${
                        darkMode ? "border-gray-500" : "border-gray-200"
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
                              ? "bg-blue-100 text-blue-700 font-medium"
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
                      className={`w-full border text-xs  px-2 py-1 rounded flex justify-between items-center shadow-sm ${
                        darkMode ? "border-gray-500" : "border-gray-200"
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
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {s}
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
              className={`w-full md:w-28 flex items-center  px-3 py-2 text-xs rounded border shadow-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              }`}
            >
              Sort {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs shadow-sm focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-100"
                  : "bg-white border-gray-200 text-gray-800"
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

      {/* TABLE */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } rounded p-2 overflow-x-auto`}
      >
        <SubjectTable
          data={currentSubjects}
          setData={setSubjects}
          onEdit={(s) => alert("Edit " + s.subjectName)}
        />
      </div>
    </div>
  );
}
