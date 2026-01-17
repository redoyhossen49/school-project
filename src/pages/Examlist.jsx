import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassPaymentTable from "../components/academic/ClassPaymentTable.jsx";
import { examData } from "../data/examData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";

export default function Examlist() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [classData, setClassData] = useState(examData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [groupFilter, setGroupFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  // Add these states at the top
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);

// Dynamically generate status options from examData
const statusOptions = ["All", ...Array.from(new Set(examData.map(item => item.status)))];


  const monthRef = useRef(null);
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

 const classOptions = Array.from(new Set(examData.map((c) => c.Class)));

const groupOptions = Array.from(
  new Set(
    examData
      .filter((item) => (classFilter ? item.Class === classFilter : true))
      .map((item) => item.Group)
  )
);

const sessionOptions = Array.from(
  new Set(
    examData
      .filter((item) => (classFilter ? item.Class === classFilter : true))
      .map((item) => item.Session)
  )
);

const examOptions = Array.from(
  new Set(
    examData
      .filter((item) => (classFilter ? item.Class === classFilter : true))
      .map((item) => item["Exam Name"])
  )
);


  // -------------------- Outside Click --------------------
  useEffect(() => {
    const handler = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Refresh --------------------
 
  // -------------------- Columns --------------------
const columns = [
  { key: "SL", label: "SL" },
  { key: "Class", label: "Class" },
  { key: "Group", label: "Group" },
  { key: "Section", label: "Section" },
  { key: "Session", label: "Session" },
  { key: "Exam Name", label: "Exam Name" },
  { key: "Total Exam", label: "Total Exam" },
  { key: "Upcoming Exam Fee", label: "Upcoming Exam Fee" },
  { key: "Exam Fee Due", label: "Exam Fee Due" },
  { key: "Action", label: "Action" },
];

  // -------------------- Filter + Sort + Search --------------------
 const filteredData = useMemo(() => {
  let data = examData
    .filter(item => (classFilter ? item.Class === classFilter : true))
    .filter(item => (groupFilter ? item.Group === groupFilter : true))
    .filter(item => (sessionFilter ? item.Session === sessionFilter : true))
    .filter(item => (examFilter ? item["Exam Name"] === examFilter : true))
    .filter(item => (statusFilter && statusFilter !== "All" ? item.Status === statusFilter : true))
    .filter(item => search 
      ? item["Exam Name"].toLowerCase().includes(search.toLowerCase()) 
      : true
    );

  // Sort by SL
  data.sort((a, b) => sortOrder === "newest" ? b.SL - a.SL : a.SL - b.SL);

  return data;
}, [classFilter, groupFilter, sessionFilter, examFilter, statusFilter, search, sortOrder]);




  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  // Auto-adjust currentPage if filteredData shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

 const exportExcel = (data) => {
  if (!data.length) return;

  const wsData = data.map(item => ({
    SL: item.SL,
    Class: item.Class,
    Group: item.Group,
    Section: item.Section,
    Session: item.Session,
    "Exam Name": item["Exam Name"],
    "Total Exam": item["Total Exam"],
    "Upcoming Exam Fee": item["Upcoming Exam Fee"],
    "Exam Fee Due": item["Exam Fee Due"],
    Action: item.Action,
  }));

  const ws = utils.json_to_sheet(wsData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Exam List");
  writeFile(wb, "ExamList.xlsx");
};
const exportPDF = (data) => {
  if (!data.length) {
    alert("No data to export");
    return;
  }

  const doc = new jsPDF("landscape", "pt", "a4");

  const tableColumn = [
    "SL","Class","Group","Section","Session","Exam Name",
    "Total Exam","Upcoming Exam Fee","Exam Fee Due","Action"
  ];

  const tableRows = data.map(item => [
    item.SL,
    item.Class,
    item.Group,
    item.Section,
    item.Session,
    item["Exam Name"],
    item["Total Exam"],
    item["Upcoming Exam Fee"],
    item["Exam Fee Due"],
    item.Action
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


  const addExamFields = [
  {
    name: "class",
    label: "Select Class",
    type: "select",
    options: Array.from(new Set(examData.map((e) => e.Class))),
    placeholder: "Select Class",
    required: true,
  },
  {
    name: "group",
    label: "Select Group",
    type: "select",
    options: [], // will be set dynamically based on selected class
    placeholder: "Select Group",
    required: true,
  },
  {
    name: "section",
    label: "Select Section",
    type: "select",
    options: [], // will be set dynamically based on class & group
    placeholder: "Select Section",
    required: true,
  },
  {
    name: "session",
    label: "Select Session",
    type: "select",
    options: Array.from(new Set(examData.map((e) => e.Session))),
    placeholder: "Select Session",
    required: true,
  },
  {
    name: "examName",
    label: "Type Exam Name",
    type: "text",
    placeholder: "Enter Exam Name",
    required: true,
  },
];

  const handleRefresh = () => {
  setClassFilter("");   
  setGroupFilter("");  
  setSessionFilter(""); 
  setExamFilter("");    
  setStatusFilter("All");
  setSearch("");       
  setSortOrder("newest");
  setCurrentPage(1);
};



  const handleAddClass = (data) => {
    const exists = classData.some(
      (c) => c.class.toLowerCase() === data.className.toLowerCase()
    );
    if (exists) {
      alert("Class already exists");
      return;
    }
    setClassData((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        class: data.className,
        monthly: [],
      },
    ]);
    setCurrentPage(1);
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
            <h2 className="text-base font-semibold">Class List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Class List
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
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center gap-1 rounded bg-blue-600 text-white px-2 py-2 text-xs"
              >
                Add Class
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Class"
              fields={ addExamFields}
              initialValues={{ className: "" }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={handleAddClass}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
              
            {/* Month Dropdown */}
           <div ref={statusRef} className="relative flex-1">
  <button
    onClick={() => setStatusOpen(prev => !prev)}
    className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
  >
    {examFilter || " Exam"} 
    <BiChevronDown className={`${statusOpen ? "rotate-180" : ""} transition-transform`} />
  </button>

  {statusOpen && (
    <div
      className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
    >
      {examOptions.map((exam) => (
        <button
          key={exam}
          onClick={() => {
            setExamFilter(exam);
            setCurrentPage(1);
            setStatusOpen(false); // still closes dropdown
          }}
          className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
            examFilter === exam ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {exam}
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
                    {/* Class Filter */}
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
                                setSessionFilter("");
                                setExamFilter("");
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

                    {/* Group Filter */}
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
                              onClick={() => setGroupFilter(g)}
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

                    {/* Session Filter */}
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
                              onClick={() => setSessionFilter(s)}
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

                    {/* Exam Filter */}
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
                              onClick={() => setExamFilter(e)}
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

                    {/* Apply Filter */}
                    <button
                      onClick={() => {
                        setCurrentPage(1); // Reset pagination
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
          }))}
          showActionKey={canEdit}
        />
      </div>
    </div>
  );
}
