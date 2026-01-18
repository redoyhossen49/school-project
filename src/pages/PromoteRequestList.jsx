import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import PromoteRequestTable from "../components/student/PromoteRequestTable.jsx";
import { promoteRequestData } from "../data/promoteRequestData";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import PromoteFormModal from "../components/PromoteFormModal.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function PromoteRequestList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
  });

  const [requests, setRequests] = useState(promoteRequestData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [classFilter, setClassFilter] = useState(""); // All Classes by default
  const [groupFilter, setGroupFilter] = useState(""); // All Groups by default
  const [sectionFilter, setSectionFilter] = useState(""); // All Sections by default

  /* Dropdown open states */
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const sectionRef = useRef(null);
  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);

  // Filter states

  const [appliedClass, setAppliedClass] = useState("");
  const [appliedGroup, setAppliedGroup] = useState("");
  const [appliedSection, setAppliedSection] = useState("");
  const [appliedSession, setAppliedSession] = useState("");

  // Section + sort

  const [selectedSection, setSelectedSection] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

  // Get unique values from data
  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key]))].sort();
  };

  // Dynamic options
  const classOptions = getUniqueValues(promoteRequestData, "fromClass");
  const groupOptions = getUniqueValues(promoteRequestData, "fromGroup");
  const sectionOptions = getUniqueValues(promoteRequestData, "fromSection");
  const sessionOptions = getUniqueValues(promoteRequestData, "fromSession");

  // FilterDropdown fields
  const filterFields = [
    { key: "class", placeholder: "All Classes", options: classOptions },
    { key: "group", placeholder: "All Groups", options: groupOptions },
    { key: "section", placeholder: "All Sections", options: sectionOptions },
    { key: "session", placeholder: "All Sessions", options: sessionOptions },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target))
        setSectionOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filtered & sorted data
  const filteredRequests = requests
    .filter((r) => r.studentName.toLowerCase().includes(search.toLowerCase()))
    .filter((r) =>
      selectedSection === "All" ? true : r.fromSection === selectedSection
    )

    .filter((r) => (appliedClass ? r.fromClass === appliedClass : true))
    .filter((r) => (appliedGroup ? r.fromGroup === appliedGroup : true))
    .filter((r) => (appliedSection ? r.fromSection === appliedSection : true))
    .filter((r) => (appliedSession ? r.fromSession === appliedSession : true))
    .sort((a, b) => {
      if (sortOrder === "asc") return a.sl - b.sl;
      else return b.sl - a.sl;
    });

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const currentData = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  );
  const promoteFormFields = [
    // From
    {
      name: "fromClass",
      label: "From Class",
      type: "select",
      options: classOptions.map((c) => ({ label: c, value: c })),
      required: true,
    },
    {
      name: "fromGroup",
      label: "From Group",
      type: "select",
      options: groupOptions.map((g) => ({ label: g, value: g })),
      required: false,
    },
    {
      name: "fromSection",
      label: "From Section",
      type: "select",
      options: sectionOptions.map((s) => ({ label: s, value: s })),
      required: false,
    },
    {
      name: "fromSession",
      label: "From Session",
      type: "select",
      options: sessionOptions.map((s) => ({ label: s, value: s })),
      required: true,
    },

    // To
    {
      name: "toClass",
      label: "To Class",
      type: "select",
      options: classOptions.map((c) => ({ label: c, value: c })),
      required: true,
    },
    {
      name: "toGroup",
      label: "To Group",
      type: "select",
      options: groupOptions.map((g) => ({ label: g, value: g })),
      required: false,
    },
    {
      name: "toSection",
      label: "To Section",
      type: "select",
      options: sectionOptions.map((s) => ({ label: s, value: s })),
      required: false,
    },
    {
      name: "toSession",
      label: "To Session",
      type: "select",
      options: sessionOptions.map((s) => ({ label: s, value: s })),
      required: true,
    },

    // Payment info
    {
      name: "paymentRequired",
      label: "Payment Required",
      type: "text",
      required: true,
      placeholder: "Yes/No",
    },
  ];

  // Export
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((r, i) => ({
      Sl: i + 1,
      Student: r.studentName,
      FromGroup: r.fromGroup,
      ToGroup: r.toGroup,
      Status: r.status,
      Date: r.date,
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "PromoteRequests");
    writeFile(wb, "PromoteRequests.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return;
    const doc = new jsPDF("landscape", "pt", "a4");
    const columns = ["Sl", "Student", "FromGroup", "ToGroup", "Status", "Date"];
    const rows = data.map((r, i) => [
      i + 1,
      r.studentName,
      r.fromGroup,
      r.toGroup,
      r.status,
      r.date,
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });
    doc.save("PromoteRequests.pdf");
  };

  const buttonClass = `flex items-center  w-28  px-3 h-8 text-xs ${
    darkMode
      ? "border bg-gray-700 border-gray-500 text-gray-100"
      : "border bg-white border-gray-200 text-gray-800"
  }`;

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* Header */}
      <div
        className={` p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-700"
        }`}
      >
        <div className="md:flex md:items-center md:justify-between gap-3">
          <div className="md:mb-3">
            <h1 className="text-base font-semibold">Promote Request </h1>
            <nav className="text-xs w-full truncate">
              <Link
                to="/school/dashboard"
                className="hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>{" "}
              / Promote Requests
            </nav>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setRequests(promoteRequestData); // মূল data reload
                setSearch(""); // search clear
                setAppliedClass(""); // applied filters clear
                setAppliedGroup("");
                setAppliedSection("");
                setAppliedSession("");
                setSelectedFilters({
                  // filter dropdown reset
                  class: "",
                  group: "",
                  section: "",
                  session: "",
                });
                setSortOrder("asc");
                setSelectedSection("All"); // section dropdown reset
                setCurrentPage(1); // page reset
              }}
              className={buttonClass}
            >
              Refresh
            </button>
            <div className="relative w-28" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={buttonClass}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full  border ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredRequests)}
                    className="w-full px-2 h-6 text-left text-sm hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredRequests)}
                    className="w-full px-2 h-61 text-left text-sm hover:bg-gray-100"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setPromoteModalOpen(true)}
                className="flex items-center w-28 bg-blue-600 px-3 h-8 text-xs text-white  hover:bg-blue-700"
              >
                Promote
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setRequests(promoteRequestData); // মূল data reload
              setSearch(""); // search clear
              setAppliedClass(""); // applied filters clear
              setAppliedGroup("");
              setAppliedSection("");
              setAppliedSession("");
              setSelectedFilters({
                // filter dropdown reset
                class: "",
                group: "",
                section: "",
                session: "",
              });
              setSortOrder("asc");
              setSelectedSection("All"); // section dropdown reset
              setCurrentPage(1); // page reset
            }}
            className={`flex items-center  w-full  border px-3 h-8 text-xs  ${
              darkMode
                ? "border-gray-500 bg-gray-700 text-gray-100"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            Refresh
          </button>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className={`flex items-center w-full border px-3 h-8 text-xs ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute left-0 z-50 top-full mt-1 w-full border  ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredRequests)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredRequests)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
             onClick={() => navigate("/school/dashboard/addpromoterequest")}
              className="flex items-center  w-full  bg-blue-600 px-3 h-8 text-xs text-white "
            >
              Promote
            </button>
          )}
         
        </div>

        {/* Controls */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Section */}
            <div className="relative" ref={sectionRef}>
              <button
                onClick={() => setSectionOpen((prev) => !prev)}
                className={buttonClass + " w-full md:w-28 justify-between"}
              >
                {selectedSection || "All Sections"}
              </button>

              {sectionOpen && (
                <div
                  className={`absolute mt-2 w-full z-40  border  max-h-48 overflow-y-auto ${
                    darkMode
                      ? "bg-gray-700 border-gray-500 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  {["All", ...sectionOptions].map((s) => (
                    <div
                      key={s}
                      onClick={() => {
                        setSelectedSection(s); // table filter state
                        setSectionOpen(false);
                      }}
                      className={`px-3 h-8 flex items-center  text-xs cursor-pointer hover:bg-blue-50 `}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={buttonClass + " w-full md:w-28 justify-between"}
              >
                Filter
              </button>

              <FilterDropdown
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                darkMode={darkMode}
                fields={filterFields}
                selected={selectedFilters}
                setSelected={setSelectedFilters}
                onApply={(values) => {
                  // IMPORTANT: Use the correct keys from your data
                  setAppliedClass(values.class); // values.class corresponds to fromClass
                  setAppliedGroup(values.group); // values.group -> fromGroup
                  setAppliedSection(values.section); // values.section -> fromSection
                  setAppliedSession(values.session); // values.session -> fromSession
                  setCurrentPage(1);
                }}
                buttonRef={filterRef}
                title="Filter Options"
              />
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={buttonClass + " w-full md:w-28 justify-between"}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-full z-40  border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-sm hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-sm hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96  md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className={`h-8 px-3 w-full text-xs  border  ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-100 placeholder:text-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`p-2  ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <PromoteRequestTable data={currentData} setData={setRequests} />
      </div>

      {/*

      // Dummy filter options
const classOptions = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
const groupOptions = ["Group A", "Group B", "Group C"];
const sectionOptions = ["Section 1", "Section 2", "Section 3"];
const sessionOptions = ["Session 2023", "Session 2024", "Session 2025"];

       {filterOpen && (
                <div
                  className={`absolute top-full z-50 mt-1 w-52 rounded border left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 max-h-40 overflow-y-auto shadow-md p-3 space-y-2 ${
                    darkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${
                        darkMode
                          ? "border-gray-500 bg-gray-700 text-gray-100"
                          : "border-gray-200 bg-white text-gray-800"
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
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
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

                
                  <div className="relative">
                    <button
                      onClick={() => setGroupOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${
                        darkMode
                          ? "border-gray-500 bg-gray-700 text-gray-100"
                          : "border-gray-200 bg-white text-gray-800"
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
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
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

                 
                  <div className="relative">
                    <button
                      onClick={() => setSectionOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${
                        darkMode
                          ? "border-gray-500 bg-gray-700 text-gray-100"
                          : "border-gray-200 bg-white text-gray-800"
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
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            sectionFilter === s
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

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              )} */}
    </div>
  );
}
