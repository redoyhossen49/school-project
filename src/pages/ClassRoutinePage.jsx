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
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function ClassRoutinePage() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- Filter / Search / Sort --------------------
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // -------------------- Dropdown States --------------------
  const [allDropdownOpen, setAllDropdownOpen] = useState(false);
  const [timeStart, setTimeStart] = useState(""); // e.g. "08:00 AM"
  const [timeEnd, setTimeEnd] = useState(""); // e.g. "10:00 AM"
  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
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
    new Set(classRoutineData.map((s) => s.class)),
  );
  const groupOptions = Array.from(
    new Set(
      classRoutineData
        .filter((s) => !classFilter || s.class === classFilter)
        .map((s) => s.group)
        .filter(Boolean),
    ),
  );
  const sectionOptions = Array.from(
    new Set(
      classRoutineData
        .filter((s) => !classFilter || s.class === classFilter)
        .filter((s) => !groupFilter || s.group === groupFilter)
        .map((s) => s.section),
    ),
  );
  const teacherOptions = Array.from(
    new Set(classRoutineData.map((item) => item.teacher)),
  );
  // -------------------- Dynamic Subject Options --------------------
  const getSubjectOptions = (selectedClass, selectedGroup, selectedSection) => {
    return Array.from(
      new Set(
        classRoutineData
          .filter((s) => !selectedClass || s.class === selectedClass)
          .filter((s) => !selectedGroup || s.group === selectedGroup)
          .filter((s) => !selectedSection || s.section === selectedSection)
          .map((s) => s.subject),
      ),
    );
  };

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
        : b.subject.localeCompare(a.subject),
    );

  const handleAddRoutine = (newRoutine) => {
    // Optionally, assign an ID for deletion/editing
    const id = routineData.length + 1;
    setRoutineData([...routineData, { id, ...newRoutine }]);
  };
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const routineFields = [
    {
      key: "class",
      name: "class",
      label: "Class",
      type: "select",
      required: true,
      options: classOptions,
      placeholder: "Select Class",
    },
    {
      key: "group",
      name: "group",
      label: "Group",
      type: "select",
      required: false,
      options: groupOptions,
      placeholder: "Select Group",
    },
    {
      key: "section",
      name: "section",
      label: "Section",
      type: "select",
      required: false,
      options: sectionOptions,
      placeholder: "Select Section",
    },
    {
      key: "teacher",
      name: "teacher",
      label: "Teacher",
      type: "select",
      required: true,
      options: teacherOptions,
      placeholder: "Select Teacher",
    },
    {
      key: "subject",
      name: "subject",
      label: "Subject",
      type: "select",
      required: true,
      options: getSubjectOptions(filters.class, filters.group, filters.section), // dynamic
      placeholder: "Select Subject",
    },
    {
      key: "classStartTime",
      name: "classStartTime",
      label: "Class Start Time",
      type: "time",
      required: true,
      placeholder: "Start time",
    },
    {
      key: "classEndTime",
      name: "classEndTime",
      label: "Class End Time",
      type: "time",
      required: true,
      placeholder: "End  time",
    },
    {
      key: "dayStart",
      name: "dayStart",
      label: "Day Start",
      type: "select", // ✅ select type
      required: true,
      placeholder: "Select start day",
      options: weekDays, // ✅ dropdown options
    },
    {
      key: "dayEnd",
      name: "dayEnd",
      label: "Day End",
      type: "select", // ✅ select type
      required: true,
      placeholder: "Select end day",
      options: weekDays, // ✅ dropdown options
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
    currentPage * perPage,
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
    setTimeEnd(""); // reset End Time
  };
  const initialRoutineValues = {
    class: "",
    group: "",
    section: "",
    subject: "",
    teacher: "",
    classStartTime: "",
    classEndTime: "",
    dayStart: "",
    dayEnd: "",
  };

  // ===================== RENDER =====================
  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div
        className={`${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        } p-3 space-y-3`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Class Routine</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>
              / Class Routine list
            </p>
          </div>

          {/* -------------------- 1st row: Refresh | Export | Add Routine -------------------- */}
          <div className="grid grid-cols-3 gap-2">
            {/* Filter */}
            <div ref={filterRef} className="relative ">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center   border  px-3 h-8 text-xs  ${
                  darkMode ? "border-gray-500 bg-gray-700" : "border-gray-300"
                }`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter class  routine"
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
                className={`w-full flex items-center  border   px-3 h-8 text-xs ${
                  darkMode ? "border-gray-500 bg-gray-700" : "border-gray-300"
                }`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute mt-2 w-full z-40 border  ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-200 text-gray-900"
                    }  left-0`}
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
                onClick={() => setAddRoutineOpen(true)}
                className="w-full flex items-center   bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Routine
              </button>
            ) : (
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
            )}
            <FormModal
              open={addRoutineOpen}
              title="Add Class Routine"
              fields={routineFields}
              initialValues={initialRoutineValues}
              onClose={() => setAddRoutineOpen(false)}
              onSubmit={(data) => {
                handleAddRoutine(data);
                setAddRoutineOpen(false);
              }}
            />
          </div>
        </div>

        {/* -------------------- 2nd row: All | Filter | Sort -------------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 ">
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
          </div> */}

          {/* -------------------- 3rd row: Search + Pagination -------------------- */}
          <div className="flex items-center md:justify-between gap-2 w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className={`w-full md:w-64  border px-3 h-8 text-xs focus:outline-none  ${
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

      {/* CLASS ROUTINE TABLE */}
      <div
        className={`  p-3 overflow-x-auto ${
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
