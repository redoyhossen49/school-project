import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import PromoteRequestTable from "../components/student/PromoteRequestTable.jsx";
import { promoteRequestData } from "../data/promoteRequestData";

export default function PromoteRequestList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [requests, setRequests] = useState(promoteRequestData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  /* ================= Dropdown States ================= */
  const [sectionOpen, setSectionOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const sectionRef = useRef(null);
  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);

  /* ================= Filters ================= */
  const sectionOptions = ["All Sections", "Science", "Commerce", "Arts"];
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [sortOrder, setSortOrder] = useState("asc");

  /* ================= Outside Click ================= */
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

  /* ================= Data Logic ================= */
  const filteredRequests = requests
    .filter((r) => r.studentName.toLowerCase().includes(search.toLowerCase()))
    .filter((r) =>
      selectedSection === "All Sections"
        ? true
        : r.fromGroup === selectedSection
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const currentData = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  );

  /* ================= Button Base ================= */
  const buttonBaseClasses =
    "flex-1 md:flex-none flex items-center justify-center gap-1 h-8 px-1 rounded text-xs md:text-sm border shadow-sm transition";
  // Button base class for exact StudentList style
  const buttonClass =
    "flex items-center justify-center gap-2 w-28 rounded border border-gray-200 px-3 py-2 text-xs bg-white shadow-sm hover:bg-gray-100";

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="space-y-4 rounded-md bg-white p-3">
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between gap-3">
          {/* Title */}
          <div>
            <h1 className="text-base font-bold">Promote Request List</h1>
            <nav className="text-sm truncate">
              <Link to="/school/dashboard">Dashboard</Link>
              <span className="mx-1">/</span>
              <span className="text-gray-400">Promote Requests</span>
            </nav>
          </div>

          {/* Buttons (Desktop) */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setRequests(promoteRequestData);
                setSearch("");
              }}
              className={buttonClass}
            >
              <FiRefreshCw /> Refresh
            </button>

            <div className="relative w-28" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={buttonClass}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div className="absolute top-full left-0 mt-1 w-28 z-40 rounded border shadow-sm bg-white text-gray-900">
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export PDF
                  </button>
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/promote")}
                className="flex items-center justify-center gap-1 w-28 rounded bg-blue-600 px-3 py-2 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                + Promote
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setRequests(promoteRequestData);
              setSearch("");
            }}
            className="flex items-center  gap-1 w-full rounded border border-gray-200 px-2 py-2 text-xs bg-white shadow-sm"
          >
            <FiRefreshCw className="text-sm" /> Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="flex items-center gap-1 w-full rounded border border-gray-200 px-2 py-2 text-xs bg-white shadow-sm"
            >
              Export <BiChevronDown className="text-sm" />
            </button>
            {exportOpen && (
              <div className="absolute top-full left-0 mt-1 w-full z-40 rounded border border-gray-200 shadow-sm bg-white text-gray-900">
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100">
                  Export PDF
                </button>
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100">
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/promote")}
              className="flex items-center  gap-1 w-full rounded bg-blue-600 px-2 py-2 text-xs text-white shadow-sm"
            >
              + Promote
            </button>
          )}
        </div>

        {/* ================= Controls Row ================= */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Section */}
            <div className="relative " ref={sectionRef}>
              <button
                onClick={() => setSectionOpen(!sectionOpen)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                {selectedSection} <BiChevronDown />
              </button>

              {sectionOpen && (
                <div
                  className={`absolute mt-2 w-40 z-40 rounded border shadow ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {sectionOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSection(opt);
                        setSectionOpen(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between"
                    >
                      {opt} <BiChevronRight size={12} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                <FiFilter /> Filter <BiChevronDown />
              </button>

              {filterOpen && (
                <div
                  className={`absolute mt-2 w-64 z-40 p-3 rounded border shadow ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold mb-2">
                    Filter Placeholder
                  </p>
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
            <div className="relative " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                Sort By <BiChevronDown />
              </button>

              {sortOpen && (
                <div
                  className={`absolute mt-2 w-24 z-40 rounded border shadow ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-sm hover:bg-gray-100"
                  >
                  First ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-sm hover:bg-gray-100"
                  >
                    Last ↓
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 w-full md:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className={`h-8 px-3 w-full text-xs rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-500 text-gray-100"
                  : "bg-white border-gray-300"
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

      {/* ================= Table ================= */}
      <div className={`${darkMode ? "bg-gray-900" : "bg-white"} p-2 rounded`}>
        <PromoteRequestTable data={currentData} setData={setRequests} />
      </div>
    </div>
  );
}
