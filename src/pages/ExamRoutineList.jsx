import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassPaymentTable from "../components/academic/ClassPaymentTable.jsx";
import { examRoutineData } from "../data/examRoutineData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function ExamRoutineList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [classData, setClassData] = useState(examRoutineData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");

  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");

  // -------------------- Dropdowns --------------------
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Add these states at the top
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);

  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  // Dynamically generate status options from examData

  // -------------------- Dropdowns --------------------
  const sortRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);

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

  // Class Options
  const classOptions = Array.from(new Set(examRoutineData.map((c) => c.Class)));

  // Group Options (dependent on selected class)
  const groupOptions = Array.from(
    new Set(
      examRoutineData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Group),
    ),
  );

  // Section Options (dependent on selected class & group)
  const sectionOptions = Array.from(
    new Set(
      examRoutineData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .filter((item) => (groupFilter ? item.Group === groupFilter : true))
        .map((item) => item.Section),
    ),
  );

  // Session Options (dependent on selected class)
  const sessionOptions = Array.from(
    new Set(
      examRoutineData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Session),
    ),
  );

  const subjectOptions = Array.from(
    new Set(
      examRoutineData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Subject),
    ),
  );

  // Exam Options (dependent on selected class)
  const examOptions = Array.from(
    new Set(
      examRoutineData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item["Exam Name"]),
    ),
  );

  const exportExcel = (data) => {
    if (!data.length) return;

    const wsData = data.map((item, idx) => ({
      SL: idx + 1,
      Class: item.Class,
      Group: item.Group,
      Section: item.Section,
      Session: item.Session,
      "Exam Name": item["Exam Name"],
      Subject: item.Subject,
      "Exam Date": item["Exam Date"],
      "Exam Day": item["Exam Day"],
      "Start Time": item["Start Time"],
      "End Time": item["End Time"],
      "Total Hour": item["Total Hour"],
      "Total Mark": item["Total Mark"],
      Status: item.Status,
    }));

    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Exam List");
    writeFile(wb, "ExamList.xlsx");
  };

  // -------------------- Export PDF --------------------
  const exportPDF = (data) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF("landscape", "pt", "a4");

    const tableColumn = [
      "SL",
      "Class",
      "Group",
      "Section",
      "Session",
      "Exam name",
      "Subject",
      "Exam date",
      "Exam day",
      "Start time",
      "End time",
      "Total hour",
      "Total mark",
      "Status",
    ];

    const tableRows = data.map((item, idx) => [
      idx + 1,
      item.Class,
      item.Group,
      item.Section,
      item.Session,
      item["Exam Name"],
      item.Subject,
      item["Exam Date"],
      item["Exam Day"],
      item["Start Time"],
      item["End Time"],
      item["Total Hour"],
      item["Total Mark"],
      item.Status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });

    doc.save("ExamList.pdf");
  };
  // Status Options
  const statusOptions = [
    "All",
    ...Array.from(new Set(examRoutineData.map((item) => item.Status))),
  ];

  // -------------------- Filtered + Sorted Data --------------------
  const filteredData = useMemo(() => {
    // 1️⃣ Apply filters first
    const data = examRoutineData.filter(
      (d) =>
        (classFilter ? d.Class === classFilter : true) &&
        (groupFilter ? d.Group === groupFilter : true) &&
        (sectionFilter ? d.Section === sectionFilter : true) &&
        (sessionFilter ? d.Session === sessionFilter : true) &&
        (examFilter ? d["Exam Name"] === examFilter : true) &&
        (statusFilter && statusFilter !== "All"
          ? d.Status === statusFilter
          : true),
    );

    // 2️⃣ Apply sorting by Exam Date
    return data.sort((a, b) => {
      const dateA = new Date(a["Exam Date"]);
      const dateB = new Date(b["Exam Date"]);

      if (sortOrder === "newest") return dateB - dateA; // newest first
      return dateA - dateB; // oldest first
    });
  }, [
    classFilter,
    groupFilter,
    sectionFilter,
    sessionFilter,
    examFilter,
    statusFilter,
    sortOrder,
  ]);

  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
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

    {
      key: "session",

      placeholder: "Select session",
      options: sessionOptions,
    },
    {
      key: "exam",

      placeholder: "Select exam",
      options: examOptions,
    },
  ];
  // -------------------- Add Exam Fields --------------------
  // Form field definitions
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const addExamRoutineFields = [
    {
      key: "class",
      label: "Class",
      type: "select",
      placeholder: "Select Class",
      options: ["All", ...classOptions],
    },
    {
      key: "group",
      label: "Group",
      type: "select",
      placeholder: "Select Group",
      options: ["All", ...groupOptions], // dynamic
    },
    {
      key: "section",
      label: "Section",
      type: "select",
      placeholder: "Select Section",
      options: ["All", ...sectionOptions], // dynamic
    },
    {
      key: "session",
      label: "Session",
      type: "select",
      placeholder: "Select Session",
      options: ["All", ...sessionOptions],
    },
    {
      key: "examName",
      label: "Exam Name",
      type: "select",
      placeholder: "Select Exam",
      options: ["All", ...examOptions],
    },
    {
      key: "subject",
      label: "Subject",
      type: "select",
      placeholder: "Select Subject",
      options: ["All", ...subjectOptions],
    },
    {
      key: "examDate",
      label: "Exam date",
      type: "date",
      placeholder: " Exam date",
    },
    {
      key: "examDay",
      label: "Exam day",
      type: "text", // ✅ dropdown for 7 days
      placeholder: "Exam day",
      options: weekDays,
    },
    {
      key: "startTime",
      label: "Start time",
      type: "time",
      placeholder: " Start time",
    },
    {
      key: "endTime",
      label: "End time",
      type: "time",
      placeholder: " End time",
    },
    {
      key: "totalHour",
      label: "Total hour",
      type: "text",
      placeholder: "Total hour",
      readOnly: true,
    },
    {
      key: "totalMark",
      label: "Total mark",
      type: "text",
      placeholder: "Total mark",
      readOnly: true,
    },
  ];

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "Sl" }, // Serial number
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Section", label: "Section" },
    { key: "Session", label: "Session" },
    { key: "Exam Name", label: "Exam name" },
    { key: "Subject", label: "Subject" },
    { key: "Exam Date", label: "Exam date" },
    { key: "Exam Day", label: "Exam day" },
    { key: "Start Time", label: "Start time" },
    { key: "End Time", label: "End time" },
    { key: "Total Hour", label: "Total hour" },
    { key: "Total Mark", label: "Total mark" },
    { key: "Status", label: "Status" },
  ];

  // -------------------- Refresh --------------------
  const handleRefresh = () => {
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setExamFilter("");
    setStatusFilter("All");
    setSearch("");
    setSortOrder("newest");
    setCurrentPage(1);
    setFilterOpen("");
  };

  // -------------------- Add Class Handler --------------------
  const handleAddClass = (data) => {
    const exists = classData.some(
      (c) => c.class.toLowerCase() === data.class.toLowerCase(),
    );
    if (exists) {
      alert("Class already exists");
      return;
    }
    setClassData((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        class: data.class,
        monthly: [],
      },
    ]);
    setCurrentPage(1);
  };

  // -------------------- Styles --------------------
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-700";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-300";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={` p-3 space-y-4 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Exam Routine</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Exam Routine
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                Filter
              </button>
              <FilterDropdown
                title="Filter exam routine"
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
                  setExamFilter(values.exam || "");

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
                className={`w-full flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border ${borderClr} ${dropdownBg}`}
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
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Routine
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Routine"
              fields={addExamRoutineFields}
              initialValues={{
                class: "",
                group: "",
                section: "",
                session: "",
                examName: "",
                subject: "",
                examDate: "",
                examDay: "",
                startTime: "",
                endTime: "",
                totalHour: "",
                totalMark: "",
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={handleAddClass}
              onChange={(field, value, formValues, setFormValues) => {
                // 1️⃣ Update the field normally
                setFormValues({ ...formValues, [field]: value });

                // 2️⃣ Auto-calc Exam Day only when examDate changes
                if (field === "examDate" && value) {
                  const dateObj = new Date(value);
                  const days = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ];
                  setFormValues((prev) => ({
                    ...prev,
                    examDay: days[dateObj.getDay()],
                  }));
                }
              }}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between  gap-2 md:gap-0">
          {/* Sort Button 
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
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search class..."
              className={`w-full md:w-64 border px-3 h-8 text-xs focus:outline-none ${borderClr} ${inputBg}`}
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
      <div className={` p-3 overflow-x-auto ${cardBg}`}>
        <ReusableTable
          columns={columns}
          data={currentData.map((item, idx) => ({
            ...item,
            id: (currentPage - 1) * perPage + idx + 1,
            SL: (currentPage - 1) * perPage + idx + 1,
          }))}
          showActionKey={canEdit}
        />
      </div>
    </div>
  );
}
