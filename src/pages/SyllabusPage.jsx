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
      }))
    );
  }, []);

  // -------------------- Filter / Search / Sort --------------------
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // -------------------- Dropdown States --------------------
  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
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
        .filter(Boolean)
    )
  );
  const sectionOptions = Array.from(
    new Set(
      tableData
        .filter((s) => !classFilter || s.class === classFilter)
        .filter((s) => !groupFilter || s.group === groupFilter)
        .map((s) => s.section)
    )
  );

  // -------------------- Filter + Search + Sort --------------------
  const filteredData = tableData
    .filter((s) => s.subjectName.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => (classFilter ? s.class === classFilter : true))
    .filter((s) => (groupFilter ? s.group === groupFilter : true))
    .filter((s) => (sectionFilter ? s.section === sectionFilter : true))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.subjectName.localeCompare(b.subjectName)
        : b.subjectName.localeCompare(a.subjectName)
    );

  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const syllabusFields = [
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classOptions.map((c) => ({ label: c, value: c })),
      required: true,
      placeholder: "Select Class",
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      options: groupOptions.map((g) => ({ label: g, value: g })),
      required: true,
      placeholder: "Select Group",
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: sectionOptions.map((s) => ({ label: s, value: s })),
      required: false,
      placeholder: "Select Section",
    },
    {
      name: "session",
      label: "Session",
      type: "select",
      options: Array.from(new Set(tableData.map((s) => s.session))).map(
        (s) => ({ label: s, value: s })
      ),
      required: true,
      placeholder: "Select Session",
    },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      options: Array.from(new Set(tableData.map((s) => s.subjectName))).map(
        (s) => ({ label: s, value: s })
      ),
      required: true,
      placeholder: "Select Subject",
    },
    {
      name: "exam",
      label: "Exam",
      type: "select",
      options: [
        { label: "Mid Term", value: "Mid Term" },
        { label: "Final", value: "Final" },
      ],
      required: true,
      placeholder: "Select Exam",
    },
    {
      name: "pageStart",
      label: "Page Start No",
      type: "number",
      required: true,
      placeholder: "Start Page",
    },
    {
      name: "pageEnd",
      label: "Page End No",
      type: "number",
      required: true,
      placeholder: "End Page",
    },
  ];

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
    setSortOrder("asc");
    setCurrentPage(1);
  };
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

  // ===================== RENDER =====================
  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={`rounded-md p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Syllabus List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>{" "}
              / Syllabus
            </p>
          </div>

          {/* -------------------- 1st row: Refresh | Export | Add Syllabus -------------------- */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full md:w-28 flex items-center   rounded border  px-2 py-2 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex rounded border  items-center justify-between shadow-sm px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border  shadow-sm  ${borderClr} ${dropdownBg}
  `}
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
                onClick={() => setAddModalOpen(true)}
                className="w-full md:w-28 flex items-center  rounded bg-blue-600 text-white px-2 py-2 text-xs"
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mt-2 ">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            <div className="flex-1">
              <button
                onClick={handleRefresh}
                className={`w-full md:w-28 flex items-center  rounded border shadow-sm px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                All
              </button>
            </div>

            {/* Filter */}
            <div ref={filterRef} className="relative w-full">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between  rounded border shadow-sm px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                Filter <BiChevronDown />
              </button>

              {filterOpen && (
                <div
                  className={`absolute z-50 mt-1 space-y-2 w-52 rounded shadow-md p-3
      left-1/2 -translate-x-1/2
    md:left-0 md:translate-x-0 max-h-40 overflow-y-auto
    ${borderClr} ${dropdownBg}
  `}
                >
                  {/* Class */}
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded gap-1  flex justify-between
                         ${borderClr}  items-center `}
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
                          className={`w-full text-left px-2 py-1 text-xs
  hover:bg-blue-50 hover:text-blue-600
  ${
    classFilter === c
      ? darkMode
        ? "bg-blue-600 text-white font-medium"
        : "bg-blue-100 text-blue-700 font-medium"
      : darkMode
      ? "text-gray-200"
      : "text-gray-700"
  }
`}
                        >
                          {c}
                        </button>
                      ))}
                  </div>

                  {/* Group */}
                  <div className="relative">
                    <button
                      onClick={() => setGroupOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded  flex justify-between items-center ${borderClr}`}
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
                          className={`w-full text-left px-2 py-1 text-xs
  hover:bg-blue-50 hover:text-blue-600
  ${
    classFilter === g
      ? darkMode
        ? "bg-blue-600 text-white font-medium"
        : "bg-blue-100 text-blue-700 font-medium"
      : darkMode
      ? "text-gray-200"
      : "text-gray-700"
  }
`}
                        >
                          {g}
                        </button>
                      ))}
                  </div>

                  {/* Section */}
                  <div className="relative">
                    <button
                      onClick={() => setSectionOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${borderClr}`}
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
                          className={`w-full text-left px-2 py-1 text-xs
  hover:bg-blue-50 hover:text-blue-600
  ${
    classFilter === s
      ? darkMode
        ? "bg-blue-600 text-white font-medium"
        : "bg-blue-100 text-blue-700 font-medium"
      : darkMode
      ? "text-gray-200"
      : "text-gray-700"
  }
`}
                        >
                          {s}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className={`w-full md:w-28 flex items-center rounded border  px-2 py-2 text-xs shadow-sm ${
                  darkMode ? "border-gray-500  bg-gray-700" : "border-gray-200"
                }`}
              >
                Sort By {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* -------------------- 3rd row: Search + Pagination -------------------- */}
          <div className="flex items-center md:justify-between gap-2 ">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64 rounded border  px-3 py-2 text-xs focus:outline-none shadow-sm ${
                darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
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
        className={` rounded p-2 overflow-x-auto ${
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
