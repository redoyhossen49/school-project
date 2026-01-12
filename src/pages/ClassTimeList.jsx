import { useState, useRef, useEffect } from "react";
import { classTimeData } from "../data/classTimeData";
import ClassTimeTable from "../components/student/ClassTimeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ClassTimeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [classTimes, setClassTimes] = useState(classTimeData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const classTimesPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  // Dropdowns
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);

  const sectionDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const sectionOptions = ["All Sections", "Morning", "Day", "Evening"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(e.target)
      )
        setSectionOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter + Sort + Search
  const filteredClassTimes = classTimes
    .filter((c) => c.className.toLowerCase().includes(search.toLowerCase()))
    .filter((c) =>
      selectedSection === "All Sections" ? true : c.section === selectedSection
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const totalClassTimes = filteredClassTimes.length;
  const totalPages = Math.ceil(totalClassTimes / classTimesPerPage);
  const indexOfLast = currentPage * classTimesPerPage;
  const indexOfFirst = indexOfLast - classTimesPerPage;
  const currentClassTimes = filteredClassTimes.slice(indexOfFirst, indexOfLast);

  // All buttons same width like TeacherList

  const buttonClass =
    "flex items-center  gap-2 w-28 rounded border border-gray-200 px-2 py-2 text-xs bg-white shadow-sm hover:bg-gray-100";

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* Header */}
      {/* ================= HEADER ================= */}
      <div className="space-y-4 rounded-md bg-white p-3">
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Class Time List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Class Time / Class Time List
            </p>
          </div>

          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setClassTimes(classTimeData);
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
                onClick={() => navigate("/school/dashboard/addclasstime")}
                className="flex items-center justify-center gap-1 w-28 rounded bg-blue-600 px-3 py-2 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                + Class Time
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setClassTimes(classTimeData);
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
              onClick={() => navigate("/school/dashboard/addclasstime")}
              className="flex items-center  gap-1 w-full rounded bg-blue-600 px-2 py-2 text-xs text-white shadow-sm"
            >
              + Class Time
            </button>
          )}
        </div>

        {/* Controls: Section, Filter, Sort + Search */}
        <div className="space-y-2 md:flex md:items-center  md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Section Dropdown */}
            <div className="relative " ref={sectionDropdownRef}>
              <button
                onClick={() => setSectionOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                {selectedSection} <BiChevronDown />
              </button>
              {sectionOpen && (
                <div
                  className={`absolute left-0 mt-2 w-28 shadow-lg z-30 flex flex-col ${
                    darkMode
                      ? "bg-gray-600 text-gray-100 border border-gray-700"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {sectionOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSection(opt);
                        setSectionOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-1 text-sm hover:bg-gray-100 flex justify-between items-center"
                    >
                      {opt} <BiChevronRight size={12} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative " ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                <FiFilter className="mr-1" /> Filter <BiChevronDown />
              </button>
              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 "
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`${
                      darkMode
                        ? "bg-gray-700 text-gray-100 border-gray-600"
                        : "bg-white text-gray-800 border-gray-200"
                    } w-8/12 md:w-96 p-6 max-h-[80vh] overflow-y-auto rounded shadow-lg border`}
                  >
                    <h2
                      className={`text-lg font-semibold mb-4 ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Filter Class Times
                    </h2>

                    <div className="flex flex-col gap-3">
                      {["Class", "Group", "Section"].map((field) => (
                        <div key={field} className="relative">
                          <label
                            className={`absolute -top-2 left-2 px-1 text-[10px] ${
                              darkMode
                                ? "bg-gray-700 text-blue-300"
                                : "bg-white text-blue-500"
                            }`}
                          >
                            {field}
                          </label>
                          <select
                            className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              darkMode
                                ? "bg-gray-600 border-gray-500 text-gray-100"
                                : "bg-white border-gray-300 text-gray-800"
                            }`}
                          >
                            <option>Select</option>
                            {[
                              ...new Set(
                                classTimes.map((c) =>
                                  field.toLowerCase() === "class"
                                    ? c.className
                                    : c[field.toLowerCase()]
                                )
                              ),
                            ].map((val) => (
                              <option key={val}>{val}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-2 justify-end mt-4">
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="flex-1 sm:flex-none px-3 py-1 text-xs rounded border bg-gray-200 hover:bg-gray-300"
                      >
                        Reset
                      </button>
                      <button className="flex-1 sm:flex-none px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative " ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                Sort By <BiChevronDown />
              </button>
              {sortOpen && (
                <div
                  className={`absolute left-0 mt-2 w-28 shadow-sm z-40 rounded border ${
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
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    First ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    Last ↓
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by class..."
              className={`w-full px-3 py-2 text-xs rounded border shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-300 bg-white text-gray-900"
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
      <div className={`p-2 ${darkMode ? "bg-gray-900" : "bg-white"} rounded`}>
        <ClassTimeTable data={currentClassTimes} setData={setClassTimes} />
      </div>
    </div>
  );
}
