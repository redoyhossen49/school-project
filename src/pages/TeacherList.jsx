import { useState, useRef, useEffect } from "react";
import { teacherData } from "../data/teacherData";
import TeacherTable from "../components/teacher/TeacherTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function TeacherList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // All Teachers
  const [teachers, setTeachers] = useState(teacherData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 20;

  // User Role
  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  // Dropdown states
  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter values
  const [filterValues, setFilterValues] = useState({
    designation: "",
    session: "",
  });

  const dateDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "weekly" },
    { label: "This Month", value: "monthly" },
  ];

  const sessionKeys = ["Session 1", "Session 2", "Session 3"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target)
      ) {
        setDateOpen(false);
        setShowSession(false);
      }
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

  // Open only one dropdown at a time
  const handleDropdownClick = (type) => {
    setDateOpen(false);
    setFilterOpen(false);
    setSortOpen(false);

    if (type === "date") setDateOpen(true);
    if (type === "filter") setFilterOpen(true);
    if (type === "sort") setSortOpen(true);
  };

  // Filter + Sort + Search logic
  const filteredTeachers = teachers
    .filter((t) => t.teacherName.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      // Filter modal
      if (
        filterValues.designation &&
        t.designation !== filterValues.designation
      )
        return false;
      if (filterValues.session && t.session !== filterValues.session)
        return false;

      // Date filter
      const today = new Date();
      const joinDate = new Date(t.joinDate);
      if (selectedDate === "Today")
        return joinDate.toDateString() === today.toDateString();
      if (selectedDate === "Last 7 Days") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return joinDate >= weekAgo && joinDate <= today;
      }
      if (selectedDate === "This Month")
        return (
          joinDate.getMonth() === today.getMonth() &&
          joinDate.getFullYear() === today.getFullYear()
        );
      if (sessionKeys.includes(selectedDate)) return t.session === selectedDate;

      return true;
    })
    .sort((a, b) => {
      const d1 = new Date(a.joinDate);
      const d2 = new Date(b.joinDate);
      return sortOrder === "oldest" ? d1 - d2 : d2 - d1;
    });

  const totalTeachers = filteredTeachers.length;
  const totalPages = Math.ceil(totalTeachers / teachersPerPage);
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );

  return (
    <div
      className={`p-3 space-y-4 min-h-screen ${
        darkMode ? "text-gray-100" : "text-gray-700"
      }`}
    >
      {/* Header */}
      <div
        className={`space-y-4 rounded-md p-3 ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Title + Desktop Buttons */}
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold">Teachers List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Teachers / Teacher List
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setTeachers(teacherData)}
              className="w-24 flex items-center justify-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
            >
              <FiRefreshCw /> Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className="w-28 flex items-center justify-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border rounded shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
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
                onClick={() => navigate("/school/dashboard/addteacher")}
                className="w-28 flex items-center justify-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs text-white"
              >
                + Add Teacher
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => setTeachers(teacherData)}
            className="w-full flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
          >
            <FiRefreshCw /> Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="w-full flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
            >
              Export <BiChevronDown />
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border rounded shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
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
              onClick={() => navigate("/school/dashboard/addteacher")}
              className="w-full flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs text-white"
            >
              + Add Teacher
            </button>
          )}
        </div>

        {/* Controls: Date, Filter, Sort + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 mt-3">
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            {/* Date Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={dateDropdownRef}>
              <button
                onClick={() => handleDropdownClick("date")}
                className={`w-full flex items-center rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {selectedDate} <BiChevronDown className="ml-4" />
              </button>
              {dateOpen && (
                <div
                  className={`absolute left-0 mt-2 w-36 shadow-lg z-30 overflow-hidden ${
                    darkMode
                      ? "bg-gray-600 text-gray-100 border border-gray-700"
                      : "bg-white text-gray-900 border border-gray-200"
                  } flex flex-col`}
                >
                  {dateOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setSelectedDate(opt.label);
                        setDateOpen(false);
                        setShowSession(false);
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                    >
                      <span>{opt.label}</span>
                      <BiChevronRight size={12} />
                    </div>
                  ))}
                  <div
                    onClick={() => setShowSession(!showSession)}
                    className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                  >
                    <span>Session</span>
                    <BiChevronRight
                      size={14}
                      className={`${
                        showSession ? "rotate-90" : ""
                      } transition-transform`}
                    />
                  </div>
                  {showSession &&
                    sessionKeys.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setSelectedDate(s);
                          setDateOpen(false);
                          setShowSession(false);
                        }}
                        className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                      >
                        <span>{s}</span>
                        <BiChevronRight size={14} />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                onClick={() => handleDropdownClick("filter")}
                className={`w-full flex items-center rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                <FiFilter className="mr-1" /> Filter{" "}
                <BiChevronDown className="ml-4" />
              </button>

              {/* Filter Modal */}
              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`${
                      darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-white text-gray-800"
                    } w-8/12 md:w-96 p-6 max-h-[80vh] overflow-y-auto rounded shadow-sm border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    } transition-all duration-300 md:fixed md:top-48 md:left-102`}
                  >
                    <h2
                      className={`text-lg md:text-xl mx-2 font-semibold mb-3 text-left ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Filter Teachers
                    </h2>

                    <div className="flex flex-col gap-3 mx-2">
                      {["Designation", "Session"].map((field) => (
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
                            value={
                              field === "Designation"
                                ? filterValues.designation
                                : filterValues.session
                            }
                            onChange={(e) =>
                              setFilterValues((prev) => ({
                                ...prev,
                                [field === "Designation"
                                  ? "designation"
                                  : "session"]: e.target.value,
                              }))
                            }
                            className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                              darkMode
                                ? "border-gray-400 text-gray-100"
                                : "border-gray-300 text-gray-800"
                            } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                          >
                            <option value="">Select</option>
                            {field === "Designation" && (
                              <>
                                <option value="Teacher">Teacher</option>
                                <option value="Head Teacher">
                                  Head Teacher
                                </option>
                              </>
                            )}
                            {field === "Session" && (
                              <>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                              </>
                            )}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2 mt-1 mx-2">
                      <button
                        onClick={() =>
                          setFilterValues({ designation: "", session: "" })
                        }
                        className="flex-1 sm:flex-none px-3 py-1 text-xs font-medium border rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => handleDropdownClick("sort")}
                className={`w-full flex items-center rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sort By <BiChevronDown className="ml-4" />
              </button>
              {sortOpen && (
                <div
                  className={`absolute left-0 mt-2 w-36 shadow-sm z-40 rounded border ${
                    darkMode
                      ? "bg-gray-800 text-gray-100 border-gray-700"
                      : "bg-white text-gray-900 border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSortOpen(false);
                      setSortOrder("newest");
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortOpen(false);
                      setSortOrder("oldest");
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100"
                  >
                    Oldest
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
              placeholder="Search by name..."
              className={`w-full px-3 py-2 text-xs rounded border shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
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
      <div
        className={`rounded-md p-2 ${darkMode ? "bg-gray-900" : "bg-white"}`}
      >
        <TeacherTable
          data={currentTeachers}
          setData={setTeachers}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
