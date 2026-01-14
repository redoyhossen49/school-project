import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassRoutineTable from "../components/academic/ClassRoutineTable.jsx";
import { classRoutineData } from "../data/classRoutineData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";

export default function ClassRoutinePage() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- Filter / Search / Sort --------------------
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // -------------------- Dropdown States --------------------
  const [allDropdownOpen, setAllDropdownOpen] = useState(false);
  const [timeStart, setTimeStart] = useState(""); // e.g. "08:00 AM"
  const [timeEnd, setTimeEnd] = useState(""); // e.g. "10:00 AM"

  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [addRoutineOpen, setAddRoutineOpen] = useState(false);
  const [routineData, setRoutineData] = useState(classRoutineData); // start with original data

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
        setClassOpen(false);
        setGroupOpen(false);
        setSectionOpen(false);
      }

      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Dynamic Filter Options --------------------
  const classOptions = Array.from(
    new Set(classRoutineData.map((s) => s.class))
  );
  const groupOptions = Array.from(
    new Set(
      classRoutineData
        .filter((s) => !classFilter || s.class === classFilter)
        .map((s) => s.group)
        .filter(Boolean)
    )
  );
  const sectionOptions = Array.from(
    new Set(
      classRoutineData
        .filter((s) => !classFilter || s.class === classFilter)
        .filter((s) => !groupFilter || s.group === groupFilter)
        .map((s) => s.section)
    )
  );
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [time, modifier] = timeStr.split(" "); // e.g., "08:00 AM"
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

  // -------------------- Filter + Search + Sort --------------------
 const filteredData = routineData
  .filter((s) => s.subject.toLowerCase().includes(search.toLowerCase()))
  .filter((s) => (classFilter ? s.class === classFilter : true))
  .filter((s) => (groupFilter ? s.group === groupFilter : true))
  .filter((s) => (sectionFilter ? s.section === sectionFilter : true))
  .filter((s) => {
    const classStartMinutes = timeToMinutes(s.classStartTime);
    const classEndMinutes = timeToMinutes(s.classEndTime);
    const startFilter = timeStart ? timeToMinutes(timeStart) : null;
    const endFilter = timeEnd ? timeToMinutes(timeEnd) : null;

    if (startFilter !== null && classStartMinutes < startFilter) return false;
    if (endFilter !== null && classEndMinutes > endFilter) return false;
    return true;
  })
  .sort((a, b) =>
    sortOrder === "asc"
      ? a.subject.localeCompare(b.subject)
      : b.subject.localeCompare(a.subject)
  );

  const handleAddRoutine = (newRoutine) => {
    // Optionally, assign an ID for deletion/editing
    const id = routineData.length + 1;
    setRoutineData([...routineData, { id, ...newRoutine }]);
  };

  const routineFields = [
    {
      name: "class",
      label: "Class",
      type: "select",
      required: true,
      options: classOptions,
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      required: false,
      options: groupOptions,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      required: false,
      options: sectionOptions,
    },
    {
      name: "subject",
      label: "Subject",
      type: "text",
      required: true,
      placeholder: "Enter Subject",
    },
    {
      name: "teacher",
      label: "Teacher",
      type: "text",
      required: true,
      placeholder: "Enter Teacher",
    },
    {
      name: "classStartTime",
      label: "Class Start Time",
      type: "text",
      required: true,
      placeholder: "08:00 AM",
    },
    {
      name: "classEndTime",
      label: "Class End Time",
      type: "text",
      required: true,
      placeholder: "10:00 AM",
    },
    {
      name: "dayStart",
      label: "Day Start",
      type: "text",
      required: true,
      placeholder: "Monday",
    },
    {
      name: "dayEnd",
      label: "Day End",
      type: "text",
      required: true,
      placeholder: "Friday",
    },
  ];

  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((row) => ({
      Class: row.class,
      Group: row.group,
      Section: row.section,
      Subject: row.subject,
      Teacher: row.teacher,
      "Class Start": row.classStartTime,
      "Class End": row.classEndTime,
      DayStart: row.dayStart,
      DayEnd: row.dayEnd,
    }));

    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Class Routine");
    writeFile(wb, "ClassRoutine.xlsx");
  };

  // --- PDF Export
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
      "Subject",
      "Teacher",
      "Class Start",
      "Class End",
      "Day Start",
      "Day End",
      "Action", // Optional, can be empty
    ];

    const tableRows = data.map((row, index) => [
      index + 1, // Sl
      row.class,
      row.group,
      row.section,
      row.subject,
      row.teacher,
      row.classStartTime,
      row.classEndTime,
      row.dayStart,
      row.dayEnd,
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

    doc.save("ClassRoutine.pdf");
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // -------------------- Actions --------------------
  const handleView = (row) => console.log(row);
  const handleEdit = (row) => alert("Edit " + row.subject);
  const handleDelete = (id) => alert("Delete row " + id);
  const handleRefresh = () => {
  setSearch("");
  setClassFilter("");
  setGroupFilter("");
  setSectionFilter("");
  setSortOrder("asc");
  setCurrentPage(1);
  setTimeStart(""); // reset Start Time
  setTimeEnd("");   // reset End Time
};


  // ===================== RENDER =====================
  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div
        className={`rounded shadow-sm ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        } p-3 space-y-3`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Class Routine</h2>
            <p className="text-xs text-blue-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>
              / Class Routine list
            </p>
          </div>

          {/* -------------------- 1st row: Refresh | Export | Add Routine -------------------- */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full flex items-center shadow-sm rounded border   px-2 py-2 text-xs ${
                darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
              }`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between  shadow-sm rounded border   px-2 py-2 text-xs ${
                  darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
                }`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${
                    darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
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
                onClick={() => setAddRoutineOpen(true)}
                className="w-full flex items-center  rounded bg-blue-600 text-white px-2 py-2 text-xs"
              >
                Routine
              </button>
            )}
            <FormModal
              open={addRoutineOpen}
              title="Add Class Routine"
              fields={routineFields}
              initialValues={{}}
              onClose={() => setAddRoutineOpen(false)}
              onSubmit={(data) => {
                handleAddRoutine(data);
                setAddRoutineOpen(false);
              }}
            />
          </div>
        </div>

        {/* -------------------- 2nd row: All | Filter | Sort -------------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mt-2">
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            <div className="relative ">
              <button
                onClick={() => setAllDropdownOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between  rounded border  px-2 py-2 text-xs  shadow-sm ${
                  darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
                }`}
              >
                All <BiChevronDown />
              </button>

              {allDropdownOpen && (
                <div
                  className={`absolute z-50 mt-1 w-44  border rounded p-3 space-y-2 shadow-sm ${
                    darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200 bg-white"
                  }`}
                >
                  <div>
                    <label className="text-xs">Start Time</label>
                    <input
                      type="text"
                      placeholder="08:00 AM"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      className="w-full border px-2 py-1 text-xs rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs">End Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      className="w-full border px-2 py-1 text-xs rounded"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAllDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Filter */}
            <div ref={filterRef} className="relative ">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-1 rounded border  px-2 py-2 text-xs shadow-sm ${
                  darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200"
                }`}
              >
                Filter <BiChevronDown />
              </button>

              {filterOpen && (
                <div
                  className={`absolute z-50 mt-1 w-52 border rounded p-3 space-y-2 shadow-sm
    left-1/2 -translate-x-1/2
    md:left-0 md:translate-x-0 max-h-40 overflow-y-auto
    ${darkMode ? "border-gray-500 bg-gray-700" : "border-gray-200 bg-white"}
  `}
                >
                  {/* Class */}
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded  flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "border-gray-500 bg-gray-700"
                          : "border-gray-200 bg-white"
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
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "border-gray-500 bg-gray-700"
                          : "border-gray-200 bg-white"
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
                          className={`w-full text-left px-2 py-1 text-xs
  hover:bg-blue-50 hover:text-blue-600
  ${
    groupFilter === g
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
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center shadow-sm ${
                        darkMode
                          ? "border-gray-500 bg-gray-700"
                          : "border-gray-200 bg-white"
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
                          className={`w-full text-left px-2 py-1 text-xs
  hover:bg-blue-50 hover:text-blue-600
  ${
    sectionFilter === s
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
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`w-full md:w-28 flex items-center  rounded border  px-2 py-2 text-xs shadow-sm ${
                darkMode ? "border-gray-500  bg-gray-700" : "border-gray-200"
              }`}
            >
              Sort By {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* -------------------- 3rd row: Search + Pagination -------------------- */}
          <div className="flex items-center md:justify-between gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs focus:outline-none shadow-sm ${
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

      {/* CLASS ROUTINE TABLE */}
      <div
        className={` rounded p-2 overflow-x-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <ClassRoutineTable
          data={currentData}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
