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
import PageModal from "../components/common/PageModal.jsx";
import AddPromoteRequestPage from "./AddPromoteRequestPage.jsx";

export default function PromoteRequestList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
  });

  const loadRequests = () => {
    const stored = localStorage.getItem("promoteRequests");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return promoteRequestData;
      }
    }
    return promoteRequestData;
  };

  const [requests, setRequests] = useState(() => loadRequests());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [classFilter, setClassFilter] = useState(""); // All Classes by default
  const [groupFilter, setGroupFilter] = useState(""); // All Groups by default
  const [sectionFilter, setSectionFilter] = useState(""); // All Sections by default

  /* Dropdown open states */
  const [sortOpenDesktop, setSortOpenDesktop] = useState(false);
  const [sortOpenMobile, setSortOpenMobile] = useState(false);

  const [promoteModalOpen, setPromoteModalOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportOpenDesktop, setExportOpenDesktop] = useState(false);
  const [exportOpenMobile, setExportOpenMobile] = useState(false);

  const [sortOpen, setSortOpen] = useState(false);

  const sectionRef = useRef(null);
  const filterRef = useRef(null);
  const exportRefDesktop = useRef(null);
  const exportRefMobile = useRef(null);
  const sortRefDesktop = useRef(null);
  const sortRefMobile = useRef(null);

  // Filter states

  const [appliedClass, setAppliedClass] = useState("");
  const [appliedGroup, setAppliedGroup] = useState("");
  const [appliedSection, setAppliedSection] = useState("");
  const [appliedSession, setAppliedSession] = useState("");

  // Section + sort

  const [selectedSection, setSelectedSection] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

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
      if (
        exportRefDesktop.current &&
        !exportRefDesktop.current.contains(e.target)
      ) {
        setExportOpenDesktop(false);
      }
      // Mobile export
      if (
        exportRefMobile.current &&
        !exportRefMobile.current.contains(e.target)
      ) {
        setExportOpenMobile(false);
      }
      if (
        sortRefDesktop.current &&
        !sortRefDesktop.current.contains(e.target)
      ) {
        setSortOpenDesktop(false);
      }
      if (sortRefMobile.current && !sortRefMobile.current.contains(e.target)) {
        setSortOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filtered & sorted data
  const filteredRequests = requests
    .filter((r) => r.studentName.toLowerCase().includes(search.toLowerCase()))
    .filter((r) =>
      selectedSection === "All" ? true : r.fromSection === selectedSection,
    )

    .filter((r) => (appliedClass ? r.fromClass === appliedClass : true))
    .filter((r) => (appliedGroup ? r.fromGroup === appliedGroup : true))
    .filter((r) => (appliedSection ? r.fromSection === appliedSection : true))
    .filter((r) => (appliedSession ? r.fromSession === appliedSession : true))
    .sort((a, b) => {
      if (sortOrder === "newest") return b.sl - a.sl; // latest first
      if (sortOrder === "oldest") return a.sl - b.sl; // oldest first
      return 0;
    });

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const currentData = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage,
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

  const saveRequestsToStorage = (next) => {
    localStorage.setItem("promoteRequests", JSON.stringify(next));
  };

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
            <nav className="text-xs w-full truncate text-gray-400">
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

            <div className="relative w-28" ref={exportRefDesktop}>
              <button
                onClick={() => setExportOpenDesktop(!exportOpenDesktop)}
                className={buttonClass}
              >
                Export
              </button>
              {exportOpenDesktop && (
                <div
                  className={`absolute left-0 top-full z-50 mt-2 w-full  border ${
                    darkMode
                      ? "bg-gray-700 border-gray-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredRequests)}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredRequests)}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit ? (
              <button
                onClick={() => setPromoteModalOpen(true)}
                className="flex items-center w-28 bg-blue-600 px-3 h-8 text-xs text-white hover:bg-blue-700"
              >
                Promote
              </button>
            ) : (
              <div className="relative w-28" ref={sortRefDesktop}>
                <button
                  onClick={() => setSortOpenDesktop((prev) => !prev)}
                  className={`flex items-center w-28 border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
                >
                  Sort By
                </button>
                {sortOpenDesktop && (
                  <div
                    className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
                  >
                    <button
                      onClick={() => {
                        setSortOrder("oldest");
                        setSortOpenDesktop(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      First
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("newest");
                        setSortOpenDesktop(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
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

          <div className="relative" ref={exportRefMobile}>
            <button
              onClick={() => setExportOpenMobile(!exportOpenMobile)}
              className={`flex items-center w-full border px-3 h-8 text-xs ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              Export
            </button>
            {exportOpenMobile && (
              <div
                className={`absolute left-0 z-50 top-full mt-2 w-full border  ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredRequests)}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredRequests)}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit ? (
            <button
              onClick={() => setPromoteModalOpen(true)}
              className="flex items-center w-full bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Promote
            </button>
          ) : (
            <div className="relative w-full" ref={sortRefMobile}>
              <button
                onClick={() => setSortOpenMobile((prev) => !prev)}
                className={`flex items-center w-full border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
              >
                Sort By
              </button>
              {sortOpenMobile && (
                <div
                  className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpenMobile(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpenMobile(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:justify-between md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className={`h-8 px-3 w-full md:w-64 text-xs  border  ${
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
      <div className={`p-3  ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <PromoteRequestTable data={currentData} setData={setRequests} />
      </div>

      {/* ===== ADD MODAL ===== */}
      {canEdit && (
        <PageModal
          open={promoteModalOpen}
          onClose={() => setPromoteModalOpen(false)}
        >
          <AddPromoteRequestPage
            modal
            onClose={() => setPromoteModalOpen(false)}
            onSave={(values) => {
              const base = loadRequests();
              const maxSl = base.reduce(
                (m, r) => Math.max(m, Number(r.sl) || 0),
                0,
              );
              const newRow = {
                sl: maxSl + 1,
                idNumber: "ID" + Date.now(),
                studentName: "New Student",
                fatherName: "-",
                payment: values.payment ? "Yes" : "No",
                status: "Pending",
                ...values,
              };
              const next = [newRow, ...base];
              setRequests(next);
              saveRequestsToStorage(next);
              setPromoteModalOpen(false);
            }}
          />
        </PageModal>
      )}

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
