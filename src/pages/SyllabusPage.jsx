import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import { schoolSyllabusData } from "../data/schoolSyllabusData.js";
import SyllabusTable from "../components/academic/SyllabusTable.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function SyllabusPage() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- Flatten Syllabus Data --------------------
  const tableData = useMemo(() => {
    let sl = 1;
    return schoolSyllabusData.flatMap((cls) =>
      cls.subjects.map((sub) => ({
        sl: sl++,
        class: cls.class,
        group: cls.group,
        section: cls.section,
        session: cls.session,
        subjectName: sub.subjectName,
        fullMarks: sub.fullMarks,
        passMarks: sub.passMarks,
        chapters: sub.chapters,
      })),
    );
  }, []);

  // -------------------- Filter / Search / Sort --------------------
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // -------------------- Dropdown States --------------------
  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
        setClassOpen(false);
        setGroupOpen(false);
        setSectionOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Dynamic Filter Options --------------------
  const classOptions = Array.from(new Set(tableData.map((s) => s.class)));
  const groupOptions = Array.from(
    new Set(
      tableData
        .filter((s) => !classFilter || s.class === classFilter)
        .map((s) => s.group)
        .filter(Boolean),
    ),
  );
  const sectionOptions = Array.from(
    new Set(
      tableData
        .filter((s) => !classFilter || s.class === classFilter)
        .filter((s) => !groupFilter || s.group === groupFilter)
        .map((s) => s.section),
    ),
  );
  // -------------------- Session Options --------------------
  const sessionOptions = Array.from(
    new Set(
      tableData
        .filter(
          (s) =>
            (!classFilter || s.class === classFilter) &&
            (!groupFilter || s.group === groupFilter) &&
            (!sectionFilter || s.section === sectionFilter),
        )
        .map((s) => s.session)
        .filter(Boolean),
    ),
  );

  // -------------------- Subject Options --------------------
  const subjectOptions = Array.from(
    new Set(
      tableData
        .filter(
          (s) =>
            (!classFilter || s.class === classFilter) &&
            (!groupFilter || s.group === groupFilter) &&
            (!sectionFilter || s.section === sectionFilter) &&
            (!sessionFilter || s.session === sessionFilter),
        )
        .map((s) => s.subjectName)
        .filter(Boolean),
    ),
  );

  const examOptions = Array.from(
    new Set(
      tableData
        .filter((s) => !classFilter || s.class === classFilter)
        .filter((s) => !groupFilter || s.group === groupFilter)
        .filter((s) => !sectionFilter || s.section === sectionFilter)
        .flatMap((s) => s.exams || ["Mid Term", "Final"]),
    ),
  );
  const filterFields = [
    {
      key: "class",
      placeholder: "Select Class",
      options: classOptions,
    },
    {
      key: "group",
      placeholder: "Select Group",
      options: groupOptions,
    },
    {
      key: "section",
      placeholder: "Select Section",
      options: sectionOptions,
    },
  ];

  const syllabusFields = [
    {
      key: "class",
      label: "Class",
      type: "select",
      placeholder: "Select Class",
      required: true,
      options: classOptions,
    },
    {
      key: "group",
      label: "Group",
      type: "select",
      placeholder: "Select Group",
      required: true,
      options: groupOptions,
    },
    {
      key: "section",
      label: "Section",
      type: "select",
      placeholder: "Select Section",
      required: false,
      options: sectionOptions,
    },
    {
      key: "session",
      label: "Session",
      type: "select",
      placeholder: "Select Session",
      required: true,
      options: sessionOptions,
    },
    {
      key: "subject",
      label: "Subject",
      type: "select",
      placeholder: "Select Subject",
      required: true,
      options: subjectOptions,
    },
    {
      key: "exam",
      label: "Exam",
      type: "select",
      placeholder: "Select Exam",
      required: true,
      options: examOptions,
    },
    {
      key: "pageStart",
      label: "Page Start No",
      type: "number",
      placeholder: "Start Page",
      required: true,
    },
    {
      key: "pageEnd",
      label: "Page End No",
      type: "number",
      placeholder: "End Page",
      required: true,
    },
  ];

  // -------------------- Filter + Search + Sort --------------------
  const filteredData = tableData
    .filter((s) => s.subjectName.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => (classFilter ? s.class === classFilter : true))
    .filter((s) => (groupFilter ? s.group === groupFilter : true))
    .filter((s) => (sectionFilter ? s.section === sectionFilter : true))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.subjectName.localeCompare(b.subjectName)
        : b.subjectName.localeCompare(a.subjectName),
    );

  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // -------------------- Export Functions --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((row, index) => ({
      Sl: index + 1,
      Class: row.class,
      Group: row.group,
      Section: row.section,
      Session: row.session,
      Subject: row.subjectName,
      "Full Marks": row.fullMarks,
      "Pass Marks": row.passMarks,
      Chapters: row.chapters,
      Action: "-", // placeholder for Action column
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Syllabus");
    writeFile(wb, "Syllabus.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF("landscape", "pt", "a4");

    const tableColumn = [
      "Sl",
      "Class",
      "Group",
      "Section",
      "Session",
      "Subject",
      "Full Marks",
      "Pass Marks",
      "Chapters",
      "Action",
    ];

    const tableRows = data.map((row, index) => [
      index + 1,
      row.class,
      row.group,
      row.section,
      row.session,
      row.subjectName,
      row.fullMarks,
      row.passMarks,
      row.chapters,
      "-", // Action column placeholder
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
      margin: { top: 20, left: 10, right: 10 },
    });

    doc.save("Syllabus.pdf");
  };
  // -------------------- Actions --------------------
  const handleView = (row) => console.log(row.chapters);
  const handleEdit = (row) => alert("Edit " + row.subjectName);
  const handleDelete = (sl) => alert("Delete row " + sl);
  const handleRefresh = () => {
    setSearch("");
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setSortOrder("asc");
    setCurrentPage(1);
  };
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-300";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";

  // ===================== RENDER =====================
  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={`p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Syllabus list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>{" "}
              / Syllabus list
            </p>
          </div>

          {/* -------------------- 1st row: Refresh | Export | Add Syllabus -------------------- */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            {/* Filter */}
            <div ref={filterRef} className="relative w-full">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter syllabus"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");
                  setSectionFilter(values.section || "");

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
                className={`w-full flex border  items-center justify-between px-3 h-8  text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28  border   ${borderClr} ${dropdownBg}
  `}
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

            {canEdit && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="w-full md:w-28 flex items-center   bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Syllabus
              </button>
            )}
            <FormModal
              open={addModalOpen}
              title="Add Syllabus"
              fields={syllabusFields}
              initialValues={{}}
              onClose={() => setAddModalOpen(false)}
              onSubmit={(data) => {
                console.log("New Syllabus Data:", data);
                alert("Syllabus added successfully!");
                setAddModalOpen(false);
                // Here you can add your API call or state update logic
              }}
            />
          </div>
        </div>

        {/* Filters + Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0  ">
          

           

            {/* Sort 
            <div className="relative flex-1 " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-300 bg-white text-gray-800"
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

          {/* -------------------- 3rd row: Search + Pagination -------------------- */}
          <div className="flex items-center md:justify-between gap-2 ">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64  border  px-3 h-8 text-xs focus:outline-none ${
                darkMode ? "border-gray-500 bg-gray-700" : "border-gray-300"
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

      {/* SYLLABUS TABLE */}
      <div
        className={`  p-3 overflow-x-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <SyllabusTable
          data={currentData}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
