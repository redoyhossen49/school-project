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
import FilterDropdown from "../components/common/FilterDropdown.jsx";

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
  const [sortOpen, setSortOpen] = useState(false);
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
  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
  });

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
          .filter(Boolean),
      ),
    );
  const sectionOptions = (selectedClass, selectedGroup) =>
    Array.from(
      new Set(
        subjects
          .filter((s) => !selectedClass || s.class === selectedClass)
          .filter((s) => !selectedGroup || s.group === selectedGroup)
          .map((s) => s.section)
          .filter(Boolean),
      ),
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
      options: groupOptions(filters.class), // selected class diye filter
    },
    {
      key: "section",
      placeholder: "Select section",
      options: sectionOptions(filters.class, filters.group), // selected class & group
    },
  ];

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
      selectedMonth === "All" ? true : s.month === selectedMonth,
    );

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === "asc"
      ? a.subjectName.localeCompare(b.subjectName)
      : b.subjectName.localeCompare(a.subjectName),
  );

  const totalPages = Math.ceil(sorted.length / perPage);
  const currentSubjects = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const modalFields = [
    {
      key: "class",
      name: "class",
      label: "Class",
      type: "select",
      placeholder: "Select Class",
      options: classOptions, // ✅ just strings
      required: true,
    },
    {
      key: "group",
      name: "group",
      label: "Group",
      type: "select",
      placeholder: "Select Group",
      options: groupOptions(classFilter), // ✅ just strings
      required: false,
    },
    {
      key: "section",
      name: "section",
      label: "Section",
      type: "select",
      placeholder: "Select Section",
      options: sectionOptions(classFilter, groupFilter), // ✅ just strings
      required: false,
    },
    {
      key: "subjectName",
      name: "subjectName",
      label: "Subject name",
      type: "text",
      placeholder: " Subject name",
      required: true,
    },
    {
      key: "subjectType",
      name: "subjectType",
      label: "Subject Type",
      type: "select",
      placeholder: "Sbuject Type",
      options: ["Theory", "Practical", "Theory + Practical"], // ✅ strings
      required: true,
    },
    // Theory Marks
    {
      key: "theoryFullMark",
      name: "theoryFullMark",
      label: "Full mark",
      type: "number",
      placeholder: " Full Mark ",
      required: true,
    },
    {
      key: "theoryPassMark",
      name: "theoryPassMark",
      label: " Pass mark",
      type: "number",
      placeholder: " Pass Mark ",
      required: true,
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
      })),
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
        }  p-3 space-y-3`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Subject list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>{" "}
              / Subject list
            </p>
          </div>

          {/* Refresh | Export | Add */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            {/* Filter */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full md:w-28 flex items-center px-3 h-8 text-xs  border  ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                }`}
              >
                Filter
              </button>
              <FilterDropdown
                title="Filter subject"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class === "" ? "" : values.class);
                  setGroupFilter(values.group === "" ? "" : values.group);
                  setSectionFilter(values.section === "" ? "" : values.section);
                }}
                darkMode={darkMode}
                buttonRef={filterRef}
              />
            </div>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center px-3 h-8 text-xs border ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-300"
                }`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full  border  ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(sorted)}
                    className="block w-full text-left px-3 py-1 text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(sorted)}
                    className="block w-full text-left px-3 py-1 text-xs hover:bg-blue-50"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="w-full md:w-28 flex items-center  bg-blue-600 text-white px-3 h-8 text-xs "
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between  md:gap-0 ">
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64  border px-3 h-8 text-xs focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-100"
                  : "bg-white border-gray-300 text-gray-800"
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
        }  p-3 overflow-x-auto`}
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
