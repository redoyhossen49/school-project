import { useState, useRef, useEffect } from "react";
import { teacherData } from "../data/teacherData";
import TeacherTable from "../components/teacher/TeacherTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import ClassPaymentTable from "../components/academic/ClassPaymentTable.jsx";

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

 

 
const [designationOpen, setDesignationOpen] = useState(false);

const [designationFilter, setDesignationFilter] = useState("");


  // Dropdown states
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  // Get all unique designations dynamically from teacherData
  const uniqueDesignations = Array.from(
    new Set(teachers.map((t) => t.designation))
  );

  // Modal-এর temporary values
  const [tempFilterValues, setTempFilterValues] = useState({
    designation: "",
  });

  const [attendanceFilter, setAttendanceFilter] = useState(""); // selected attendance filter
  const [filterValues, setFilterValues] = useState({
    designation: "",
  });

  const attendanceRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const exportRef = useRef(null);

  const attendanceOptions = ["Presence", "Absence", "Late", "Leave"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attendanceRef.current && !attendanceRef.current.contains(e.target))
        setAttendanceOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open only one dropdown at a time
  const handleDropdownClick = (type) => {
    setAttendanceOpen(false);
    setFilterOpen(false);
    setSortOpen(false);
    setExportOpen(false);

    if (type === "attendance") setAttendanceOpen(true);
    if (type === "filter") setFilterOpen(true);
    if (type === "sort") setSortOpen(true);
    if (type === "export") setExportOpen(true);
  };

  const filteredTeachers = teachers

  .filter((t) =>
    designationFilter ? t.designation === designationFilter : true
  )
    // 1️⃣ Search by name
    .filter((t) => t.teacherName.toLowerCase().includes(search.toLowerCase()))

    // 2️⃣ Filter by designation
    .filter((t) => {
      if (
        filterValues.designation &&
        t.designation !== filterValues.designation
      )
        return false;

      // Attendance filter
      if (attendanceFilter) {
        switch (attendanceFilter) {
          case "Presence":
            return t.present > 0;
          case "Absence":
            return t.absence > 0;
          case "Late":
            return t.late > 0;
          case "Leave":
            return t.leave > 0;
          default:
            return true;
        }
      }

      return true;
    })

    // 3️⃣ Sort
    .sort((a, b) => {
      if (sortOrder === "newest") return b.id - a.id; // newest = higher ID first
      if (sortOrder === "oldest") return a.id - b.id; // oldest = lower ID first
      return 0;
    });

     const designationOptions = Array.from(
    new Set(teacherData.map((t) => t.designation))
  );

 

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
              </Link>
              / Teacher List
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => {
                setTeachers(teacherData); // reset teacher list
                setFilterValues({ designation: "" }); // reset applied filter
                setTempFilterValues({ designation: "" }); // reset modal temp
                setAttendanceFilter(""); // reset attendance filter
                setSearch(""); // optional: reset search too
                setCurrentPage(1); // optional: go back to first page
              }}
              className={`w-28 flex items-center  gap-1 rounded border  shadow-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              } px-3 py-2 text-xs`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => handleDropdownClick("export")}
                className={`w-28 flex items-center justify-between   rounded border  shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                } px-3 py-2 text-xs`}
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
                className="w-28 flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Add Teacher
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setTeachers(teacherData); // reset teacher list
              setFilterValues({ designation: "" }); // reset applied filter
              setTempFilterValues({ designation: "" }); // reset modal temp
              setAttendanceFilter(""); // reset attendance filter
              setSearch(""); // optional: reset search too
              setCurrentPage(1); // optional: go back to first page
            }}
            className={`w-full flex items-center gap-2 rounded border ${
              darkMode
                ? "bg-gray-700 border-gray-500"
                : "bg-white border-gray-200"
            } shadow-sm  px-3 py-2 text-xs`}
          >
            Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => handleDropdownClick("export")}
              className={`w-full flex items-center justify-between gap-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              } shadow-sm  px-3 py-2 text-xs`}
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
              Teacher
            </button>
          )}
        </div>

        {/* Controls: Attendance Dropdown, Filter, Sort + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 mt-3">
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            {/* Attendance Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={attendanceRef}>
              <button
                onClick={() => handleDropdownClick("attendance")}
                className={`w-full md:w-28 flex items-center justify-between rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {attendanceFilter || "Attendance"} <BiChevronDown className="" />
              </button>

              {attendanceOpen && (
                <div
                  className={`absolute left-0 mt-2 w-36 shadow-lg z-40 overflow-hidden flex flex-col ${
                    darkMode
                      ? "bg-gray-800 text-gray-100 border border-gray-700"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {attendanceOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setAttendanceFilter(opt);
                        setAttendanceOpen(false);
                      }}
                      className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                    >
                      <span>{opt}</span>
                      <BiChevronRight size={12} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                onClick={() => handleDropdownClick("filter")}
                className={`w-full md:w-28 flex items-center justify-between rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Filter <BiChevronDown />
              </button>

              {filterOpen && (
                <div
                  className={`absolute top-full z-50 mt-2 w-56 rounded border
    left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0
    max-h-60 overflow-y-auto shadow-md p-3 space-y-2
    ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
                >
                  {/* Designation */}
                  <div className="relative">
                    <button
                      onClick={() => setDesignationOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center
        ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-gray-100"
            : "bg-white border-gray-200"
        }`}
                    >
                      {designationFilter || "All Designations"}{" "}
                      <BiChevronDown />
                    </button>

                    {designationOpen &&
                      designationOptions.map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDesignationFilter(d);
                            setDesignationOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600
            ${
              designationFilter === d
                ? "bg-blue-100 text-blue-700 font-medium"
                : darkMode
                ? "text-gray-200"
                : "text-gray-700"
            }`}
                        >
                          {d}
                        </button>
                      ))}
                  </div>

                  {/* Apply */}
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => handleDropdownClick("sort")}
                className={`w-full md:w-28 flex items-center justify-between rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sort By <BiChevronDown />
              </button>
              {sortOpen && (
                <div
                  className={`absolute left-0 mt-2 w-25 md:w-36 shadow-sm z-40 rounded border ${
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
                    className="w-full px-3 py-1 text-xs text-left hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOpen(false);
                      setSortOrder("oldest");
                    }}
                    className="w-full px-3 py-1 text-xs text-left hover:bg-gray-100"
                  >
                    Last
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
          data={filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher)}
          setData={setTeachers}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
