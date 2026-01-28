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
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function Examlist() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
  });
  const [examList, setExamList] = useState(examData);
 
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
 
  const [classFilter, setClassFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("oldest");
  const [sortOpen, setSortOpen] = useState(false);

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const [groupFilter, setGroupFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  // Add these states at the top
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);

  // Dynamically generate status options from examData
  const statusOptions = [
    "All",
    ...Array.from(new Set(examData.map((item) => item.status))),
  ];

  const monthRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);
  const sortRef = useRef(null);


  const classOptions = Array.from(new Set(examData.map((c) => c.Class)));

  const groupOptions = Array.from(
    new Set(
      examData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Group),
    ),
  );

  const sessionOptions = Array.from(
    new Set(
      examData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Session),
    ),
  );
  const sectionOptions = Array.from(
    new Set(
      examData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item.Section),
    ),
  );

  const examOptions = Array.from(
    new Set(
      examData
        .filter((item) => (classFilter ? item.Class === classFilter : true))
        .map((item) => item["Exam Name"]),
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
      options: groupOptions,
    },
    {
      key: "section",
      placeholder: "Select section",
      options: sectionOptions,
    },
    {
      key: "session",
      placeholder: "Select session",
      options: sessionOptions,
    },
  ];

  // -------------------- State --------------------
  const [addExamOpen, setAddExamOpen] = useState(false); // Add Exam modal
  const [selectedExam, setSelectedExam] = useState(null); // For editing if needed

  // -------------------- Handle Add Exam --------------------

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
    { key: "SL", label: "Sl" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Section", label: "Section" },
    { key: "Session", label: "Session" },
    { key: "Exam Name", label: "Exam name" },
    { key: "Total Exam", label: "Total exam" },
    { key: "Upcoming Exam Fee", label: "Upcoming exam fee" },
    { key: "Exam Fee Due", label: "Exam fee due" },
  ];

  // -------------------- Filter + Sort + Search --------------------
  const filteredData = useMemo(() => {
    return examList
      .filter((item) => (classFilter ? item.Class === classFilter : true))
      .filter((item) => (groupFilter ? item.Group === groupFilter : true))
      .filter((item) => (sectionFilter ? item.Section === sectionFilter : true))
      .filter((item) => (sessionFilter ? item.Session === sessionFilter : true))
      .filter((item) => (examFilter ? item["Exam Name"] === examFilter : true))
      .filter((item) =>
        statusFilter && statusFilter !== "All" ? item.Status === statusFilter : true
      )
      .filter((item) =>
        search ? item["Exam Name"].toLowerCase().includes(search.toLowerCase()) : true
      )
      .sort((a, b) => a.SL - b.SL);
  }, [
    examList,
    classFilter,
    groupFilter,
    sectionFilter,
    sessionFilter,
    examFilter,
    statusFilter,
    search,
  ]);


  // -------------------- Pagination --------------------
  const perPage = 20;
 const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  // Auto-adjust currentPage if filteredData shrinks
 useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const exportExcel = (data) => {
    if (!data.length) return;

    const wsData = data.map((item) => ({
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
      "SL",
      "Class",
      "Group",
      "Section",
      "Session",
      "Exam Name",
      "Total Exam",
      "Upcoming Exam Fee",
      "Exam Fee Due",
      "Action",
    ];

    const tableRows = data.map((item) => [
      item.SL,
      item.Class,
      item.Group,
      item.Section,
      item.Session,
      item["Exam Name"],
      item["Total Exam"],
      item["Upcoming Exam Fee"],
      item["Exam Fee Due"],
      item.Action,
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
  const editExamFields = [
    { name: "Class", label: "Class", type: "text", required: true },
    { name: "Group", label: "Group", type: "text" },
    { name: "Section", label: "Section", type: "text" },
    { name: "Session", label: "Session", type: "text" },
    { name: "Exam Name", label: "Exam Name", type: "text", required: true },
    { name: "Total Exam", label: "Total Exam", type: "number" },
    { name: "Upcoming Exam Fee", label: "Upcoming Exam Fee", type: "number" },
    { name: "Exam Fee Due", label: "Exam Fee Due", type: "number" },
  ];

  const addExamFields = [
    {
      key: "class",
      type: "select",
      placeholder: "Select class",
      options: classOptions,
    },
    {
      key: "group",
      type: "select",
      placeholder: "Select group",
      options: groupOptions,
    },
    {
      key: "section",
      type: "select",
      placeholder: "Select section",
      options: sectionOptions,
    },
    {
      key: "session",
      type: "select",
      placeholder: "Select session",
      options: sessionOptions,
    },
    {
      key: "examName",
      type: "text",
      label: "Exam name",
      placeholder: "Exam name",
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
    const exists = examList.some(
      (e) =>
        e.Class.toLowerCase() === (data.class || "").toLowerCase() &&
        e["Exam Name"].toLowerCase() === (data.examName || "").toLowerCase()
    );
    if (exists) return alert("This class and exam already exists");

    const newSL = examList.length ? Math.max(...examList.map((e) => e.SL)) + 1 : 1;

    const newExam = {
      SL: newSL,
      Class: data.class || "",
      Group: data.group || "",
      Section: data.section || "",
      Session: data.session || "",
      "Exam Name": data.examName || "",
      "Total Exam": 0,
      "Upcoming Exam Fee": 0,
      "Exam Fee Due": 0,
      Status: "Pending",
    };

    setExamList((prev) => [...prev, newExam]);

    // Reset filters so new row shows
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setExamFilter("");
    setStatusFilter("All");
    setSearch("");

    setAddClassOpen(false);
    setCurrentPage(Math.ceil((examList.length + 1) / perPage));
  };
  // -------------------- Styles --------------------
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

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={` p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Exam list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Exam list
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter exam"
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
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border  ${borderClr} ${dropdownBg}`}
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
                onClick={() => setAddClassOpen(true)}
                className="w-full md:w-28 flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Exam
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
              open={addClassOpen}
              title="Add exam"
              fields={addExamFields}
              initialValues={{
                class: "",
                group: "",
                section: "",
                session: "",
                examName: "",
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={handleAddClass}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          {/* Filter Dropdown */}

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
          <div className="flex items-center md:justify-between gap-2 w-full ">
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
          data={currentData}
          setData={setExamList}
          showActionKey={canEdit}
          modalFields={editExamFields} // 👈 THIS LINE
        />
      </div>
    </div>
  );
}
