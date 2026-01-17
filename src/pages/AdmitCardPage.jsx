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

export default function AdmitCardPage() {
  const canEdit = localStorage.getItem("role") === "school";
  const { darkMode } = useTheme();
  // -------------------- State --------------------
  const [data, setData] = useState([]);
  const [classData, setClassData] = useState(studentExamData);

  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");

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

  const [sortOrder, setSortOrder] = useState("newest");
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
    new Set(studentExamData.map((d) => d.Section || ""))
  );
  const sessionOptions = Array.from(
    new Set(studentExamData.map((d) => d.Session))
  );
  const examOptions = Array.from(
    new Set(studentExamData.map((d) => d.ExamName))
  );

  const examNameOptions = Array.from(
    new Set(studentExamData.map((d) => d.ExamName))
  );
  const studentOptions = studentExamData.map((d) => ({
    label: d.StudentName,
    value: d.IDNumber,
  }));
  const subjectOptions = Array.from(
    new Set(studentExamData.map((d) => d.SubjectName))
  );

  const classRef = useRef(null);
  const groupRef = useRef(null);
  const exportRef = useRef(null);

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
      }))
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
    return studentExamData
      .filter((d) => {
        return (
          (appliedFilters.class ? d.Class === appliedFilters.class : true) &&
          (appliedFilters.group ? d.Group === appliedFilters.group : true) &&
          (appliedFilters.section
            ? d.Section === appliedFilters.section
            : true) &&
          (appliedFilters.session
            ? d.Session === appliedFilters.session
            : true) &&
          (appliedFilters.exam ? d.ExamName === appliedFilters.exam : true) &&
          (search
            ? d.StudentName.toLowerCase().includes(search.toLowerCase())
            : true)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.ExamStartDate);
        const dateB = new Date(b.ExamStartDate);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [appliedFilters, search, sortOrder]);

  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
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

  const getAdmitCardFields = [
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classOptions,
      placeholder: "Select Class",
      required: true,
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      options: groupOptions,
      placeholder: "Select Group",
      required: true,
    },
    {
      name: "session",
      label: "Session",
      type: "select",
      options: sessionOptions,
      placeholder: "Select Session",
      required: true,
    },
    {
      name: "examName",
      label: "Exam Name",
      type: "select",
      options: examNameOptions,
      placeholder: "Select Exam",
      required: true,
    },
    {
      name: "examYear",
      label: "Exam Year",
      type: "number",
      placeholder: "Enter Exam Year",
      required: true,
    },
    {
      name: "studentName",
      label: "Student Name",
      type: "select",
      options: studentOptions,
      placeholder: "Select Student",
      required: true,
    },
    {
      name: "idNumber",
      label: "ID Number",
      type: "text",
      placeholder: "Auto from Student",
      required: true,
      readOnly: true,
    },
    {
      name: "rollNo",
      label: "Roll No",
      type: "text",
      placeholder: "Auto from Student",
      required: true,
      readOnly: true,
    },
    {
      name: "fathersName",
      label: "Father's Name",
      type: "text",
      placeholder: "Auto from Student",
      required: true,
      readOnly: true,
    },
    {
      name: "admitCardNo",
      label: "Admit Card No",
      type: "text",
      placeholder: "Auto-generated",
      required: true,
    },
    {
      name: "subjectName",
      label: "Subject Name",
      type: "select",
      options: subjectOptions,
      placeholder: "Select Subject",
      required: true,
    },
    {
      name: "examStartDate",
      label: "Exam Start Date",
      type: "date",
      placeholder: "Select Exam Date",
      required: true,
    },
    {
      name: "startTime",
      label: "Start Time",
      type: "time",
      placeholder: "Select Start Time",
      required: true,
    },
    {
      name: "endTime",
      label: "End Time",
      type: "time",
      placeholder: "Select End Time",
      required: true,
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
    : "bg-white text-gray-800";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-200";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={`rounded-md p-3 space-y-3 ${cardBg}`}>
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
              className={`w-full flex items-center gap-1 rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => {
                      exportPDF(filteredData); // download
                      setExportOpen(false); // close dropdown
                    }}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() =>{ exportExcel(filteredData);
                        setExportOpen(false); 
                    }}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center gap-1 rounded bg-blue-600 text-white px-2 py-2 text-xs"
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            <div ref={statusRef} className="relative flex-1">
              <button
                onClick={() => setStatusOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                {classFilter || "Select Class"}
                <BiChevronDown
                  className={`${
                    statusOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>

              {statusOpen &&
                Array.isArray(classOptions) &&
                classOptions.length > 0 && (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
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
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
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
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
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
                  className={`absolute top-full z-50 mt-1 w-52 rounded border left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 max-h-64 overflow-y-auto shadow-md py-4 px-6 space-y-2 ${borderClr} ${dropdownBg}`}
                >
                  <div className="flex flex-col gap-2">
                    {/* -------- Class Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setClassOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          classFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {classFilter || "Select Class"}{" "}
                        <BiChevronDown
                          className={`${
                            classOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {classOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {classOptions.map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                setClassFilter(c);
                                setGroupFilter(""); // reset dependent filters
                                setSectionFilter("");
                                setSessionFilter("");
                                setExamFilter("");
                                setClassOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
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
                      )}
                    </div>

                    {/* -------- Group Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setGroupOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          groupFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {groupFilter || "Select Group"}{" "}
                        <BiChevronDown
                          className={`${
                            groupOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {groupOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {groupOptions.map((g) => (
                            <button
                              key={g}
                              onClick={() => {
                                setGroupFilter(g);
                                setSectionFilter(""); // reset dependent filters
                                setSessionFilter("");
                                setExamFilter("");
                                setGroupOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
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
                      )}
                    </div>

                    {/* -------- Session Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSessionOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          sessionFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {sessionFilter || "Select Session"}{" "}
                        <BiChevronDown
                          className={`${
                            sessionOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {sessionOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {sessionOptions.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSessionFilter(s);
                                setSessionOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                sessionFilter === s
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
                      )}
                    </div>

                    {/* -------- Exam Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setExamOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          examFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {examFilter || "Select Exam"}{" "}
                        <BiChevronDown
                          className={`${
                            examOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {examOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {examOptions.map((e) => (
                            <button
                              key={e}
                              onClick={() => {
                                setExamFilter(e);
                                setExamOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                examFilter === e
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : darkMode
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* -------- Apply Filter -------- */}
                    <button
                      onClick={() => {
                        setAppliedFilters({
                          class: classFilter,
                          group: groupFilter,
                          section: sectionFilter,
                          session: sessionFilter,
                          exam: examFilter,
                        });

                        setCurrentPage(1);
                        setFilterOpen(false);
                      }}
                      className="w-full bg-blue-600 text-white text-xs py-1 rounded mt-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="flex-1">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                Sort {sortOrder === "newest" ? "↑" : "↓"}
              </button>
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
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs focus:outline-none ${borderClr} ${inputBg}`}
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
      <div className={`rounded p-2 overflow-x-auto ${cardBg}`}>
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
