import { useState, useMemo, useRef } from "react";
import { BiChevronDown } from "react-icons/bi";
import { studentExamData } from "../data/studentExamData.js";
import Pagination from "../components/Pagination.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import FormModal from "../components/FormModal.jsx";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function AdmitCardPage() {
  const canEdit = localStorage.getItem("role") === "school";
  const { darkMode } = useTheme();
  // -------------------- State --------------------
  const [data, setData] = useState([]);
  const [classData, setClassData] = useState(studentExamData);

  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [filters, setFilters] = useState({
    class: "",
    group: "",

    session: "",
    exam: "",
  });

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);

  // Add these states at the top

  const [statusFilter, setStatusFilter] = useState("All");

  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
const [sortOrder, setSortOrder] = useState("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  // -------------------- Filters ------------  const [data, setData] = useState(gradeData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // Temporary (UI selection only)
  const [tempClass, setTempClass] = useState(null);
  const [tempGroup, setTempGroup] = useState(null);

  // Add these states at the top

  const [filterSelections, setFilterSelections] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  // -------------------- Options --------------------
  const classOptions = Array.from(new Set(studentExamData.map((d) => d.Class)));
  const groupOptions = Array.from(new Set(studentExamData.map((d) => d.Group)));
  const sectionOptions = Array.from(
    new Set(studentExamData.map((d) => d.Section || "")),
  );
  const sessionOptions = Array.from(
    new Set(studentExamData.map((d) => d.Session)),
  );
  const examOptions = Array.from(
    new Set(studentExamData.map((d) => d.ExamName)),
  );

  const studentOptions = studentExamData.map((d) => d.StudentName);
  const subjectOptions = Array.from(
    new Set(studentExamData.map((d) => d.SubjectName)),
  );

  const classRef = useRef(null);
  const groupRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);

  const exportPDF = (rows) => {
    const doc = new jsPDF();

    doc.text("Admit Card List", 14, 10);

    autoTable(doc, {
      startY: 16,
      head: [
        [
          "Class",
          "Group",
          "Session",
          "Exam",
          "Student",
          "Roll",
          "Admit Card No",
        ],
      ],
      body: rows.map((r) => [
        r.Class,
        r.Group,
        r.Session,
        r.ExamName,
        r.StudentName,
        r.RollNo,
        r.AdmitCardNo,
      ]),
    });

    doc.save("admit-card-list.pdf");
  };

  const exportExcel = (rows) => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Class: r.Class,
        Group: r.Group,
        Session: r.Session,
        Exam: r.ExamName,
        Student: r.StudentName,
        Roll: r.RollNo,
        AdmitCardNo: r.AdmitCardNo,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdmitCards");

    XLSX.writeFile(workbook, "admit-card-list.xlsx");
  };
  // -------------------- Handlers --------------------
  const handleSelectFilter = (field, value) => {
    setFilterSelections((prev) => {
      let updated = { ...prev, [field]: value };

      // Reset dependent filters
      if (field === "class") {
        updated.group = "";
        updated.section = "";
        updated.session = "";
        updated.exam = "";
      } else if (field === "group") {
        updated.section = "";
        updated.session = "";
        updated.exam = "";
      }

      return updated;
    });

    // Close dropdown
    switch (field) {
      case "class":
        setClassOpen(false);
        break;
      case "group":
        setGroupOpen(false);
        break;
      case "section":
        setSectionOpen(false);
        break;
      case "session":
        setSessionOpen(false);
        break;
      case "exam":
        setExamOpen(false);
        break;
      default:
        break;
    }
  };

  const applyFilter = () => {
    setAppliedFilters({ ...filterSelections });
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // -------------------- Filtered + Sorted Data --------------------
 const filteredData = useMemo(() => {
  const source = data.length ? data : studentExamData;

  return source
    .filter((d) => {
      return (
        (appliedFilters.class ? d.Class === appliedFilters.class : true) &&
        (appliedFilters.group ? d.Group === appliedFilters.group : true) &&
        (appliedFilters.section ? d.Section === appliedFilters.section : true) &&
        (appliedFilters.session ? d.Session === appliedFilters.session : true) &&
        (appliedFilters.exam ? d.ExamName === appliedFilters.exam : true) &&
        (search ? d.StudentName.toLowerCase().includes(search.toLowerCase()) : true)
      );
    })
    .sort((a, b) => {
      // Sorting by IDNumber (or SL if exists)
      if (sortOrder === "asc") {
        return a.IDNumber - b.IDNumber; // oldest first
      } else {
        return b.IDNumber - a.IDNumber; // newest first
      }
    });
}, [data, appliedFilters, search, sortOrder]);



  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "SL" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },

    { key: "Session", label: "Session" },
    { key: "ExamName", label: "Exam Name" },
    { key: "ExamYear", label: "Exam Year" },
    { key: "StudentName", label: "Student Name" },
    { key: "IDNumber", label: "ID Number" },
    { key: "RollNo", label: "Roll No" },
    { key: "FathersName", label: "Father's Name" },
    { key: "AdmitCardNo", label: "Admit Card No" },
    { key: "SubjectName", label: "Subject Name" },
    { key: "ExamStartDate", label: "Exam Start Date" },
    { key: "StartTime", label: "Start Time" },
    { key: "EndTime", label: "End Time" },
  ];

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
  const getAdmitCardFields = [
    {
      key: "class",
      type: "select",
      placeholder: "Select Class",
      options: classOptions,
    },
    {
      key: "group",
      type: "select",
      placeholder: "Select Group",
      options: groupOptions,
    },
    {
      key: "session",
      type: "select",
      placeholder: "Select Session",
      options: sessionOptions,
    },
    {
      key: "examName",
      type: "select",
      placeholder: "Select Exam",
      options: examOptions,
    },
    {
      key: "examYear",
      type: "number",
      placeholder: "Enter Exam Year",
    },
    {
      key: "studentName",
      type: "select",
      placeholder: "Select Student",
      options: studentOptions,
    },
    {
      key: "idNumber",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "rollNo",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "fathersName",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "admitCardNo",
      type: "text",
      placeholder: "Auto-generated",
    },
    {
      key: "subjectName",
      type: "select",
      placeholder: "Select Subject",
      options: subjectOptions,
    },
    {
      key: "examStartDate",
      type: "date",
      placeholder: "Select Exam Date",
    },
    {
      key: "startTime",
      type: "time",
      placeholder: "Select Start Time",
    },
    {
      key: "endTime",
      type: "time",
      placeholder: "Select End Time",
    },
  ];

  const handleRefresh = () => {
    // UI filter states
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setExamFilter("");

    // Applied filter reset
    setAppliedFilters({
      class: "",
      group: "",
      section: "",
      session: "",
      exam: "",
    });

    // Other states
    setSearch("");
    setSortOrder("newest");
    setCurrentPage(1);

    // Close all dropdowns
    setFilterOpen(false);
    setClassOpen(false);
    setGroupOpen(false);
    setSectionOpen(false);
    setSessionOpen(false);
    setExamOpen(false);
    setExportOpen(false);
    setStatusOpen(false);
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
            <h2 className="text-base font-semibold">Admit Card</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Admit Card
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center   border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border  ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => {
                      exportPDF(filteredData); // download
                      setExportOpen(false); // close dropdown
                    }}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      exportExcel(filteredData);
                      setExportOpen(false);
                    }}
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
                className="w-full flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Admit Card
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Admit Card"
              fields={getAdmitCardFields}
              initialValues={{
                Class: "",
                Group: "",
                Subject: "",
                LetterGrade: "",
                MaxNumber: "",
                MinNumber: "",
                GradePoint: "",
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={(newEntry) => {
                setData((prev) => [...prev, newEntry]);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            <div ref={statusRef} className="relative flex-1">
              <button
                onClick={() => setStatusOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center gap-2 border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                {classFilter || " Class"}
              </button>

              {statusOpen &&
                Array.isArray(classOptions) &&
                classOptions.length > 0 && (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 w-full  border  max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
                  >
                    {classOptions.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setClassFilter(cls); // select class
                          setGroupFilter(""); // reset dependent filter
                          setCurrentPage(1); // reset pagination
                          setStatusOpen(false); // close dropdown
                        }}
                        className={`block w-full px-3 h-8 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                          classFilter === cls
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Filter Dropdown */}
            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
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

                  setSessionFilter(values.session || "");
                  setExamFilter(values.exam || "");

                  setCurrentPage(1);
                  setFilterOpen(false);
                }}
                darkMode={darkMode}
                buttonRef={filterRef}
              />
            </div>

            {/* Sort Button */}
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
