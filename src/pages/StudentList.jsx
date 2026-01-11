import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import AddStudentModal from "../components/student/AddStudentModal.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import EditStudentModal from "../components/student/EditStudentModal.jsx";

export default function StudentList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [students, setStudents] = useState(studentData);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const filteredStudents = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      const today = new Date();
      const joinDate = new Date(s.joinDate);

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
      if (sessionKeys.includes(selectedDate)) return s.session === selectedDate;
      return true;
    })
    .sort((a, b) => {
      const d1 = new Date(a.joinDate);
      const d2 = new Date(b.joinDate);
      return sortOrder === "oldest" ? d1 - d2 : d2 - d1;
    });

  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const buttonBaseClasses = `flex-1 flex items-center justify-center py-1.5 rounded shadow-sm text-xs md:text-sm border transition`;

  return (
    <div
      className={`space-y-3 py-2 px-2 min-h-screen ${
        darkMode ? "text-gray-100" : "text-gray-600"
      }`}
    >
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-900" : "bg-white"} p-3 rounded`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title + Breadcrumb */}
          <div className="md:mb-3">
            <h1 className="text-base font-bold">Students List</h1>
            <nav className="text-sm w-full truncate">
              <Link
                to="/school/dashboard"
                className="hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              <span className="mx-1">/</span>
              <Link to="/student" className="hover:text-indigo-600 transition">
                Students
              </Link>
              <span className="mx-1">/</span>
              <Link to="/students" className="hover:text-indigo-600 transition">
                Student List
              </Link>
            </nav>
          </div>

          {/* Top Buttons */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            
            <button
              title="Refresh"
              className={`${buttonBaseClasses}  px-0.5 md:px-2  ${
                darkMode
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => {
                setStudents(studentData);
                setSearch("");
              }}
            >
              <FiRefreshCw />
            </button>

            <div className="relative flex-1 md:flex-none" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`${buttonBaseClasses}  px-1 md:px-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } w-full`}
              >
                Export <BiChevronDown className="ml-1" />
              </button>

              {exportOpen && (
                <div
                  className={`absolute mt-2 w-32 z-40 border rounded ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } shadow-sm`}
                >
                  <button
                    onClick={() => setExportOpen(false)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => setExportOpen(false)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                className="flex-1 md:flex-none flex items-center justify-center px-0.5 md:px-2 py-1.5 text-xs md:text-sm rounded shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => navigate("/school/dashboard/addstudent")}
              >
                + Add Student
              </button>
            )}
          </div>
        </div>

        {/* Controls: Date, Filter, Sort + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 mt-3">
          <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto gap-2 md:gap-3">
            {/* Date */}
            <div className="relative flex-1 md:flex-none" ref={dateDropdownRef}>
              <button
                onClick={() => setDateOpen(!dateOpen)}
                className={`${buttonBaseClasses} md:px-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } w-full`}
              >
                {selectedDate} <BiChevronDown className="ml-1" />
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
                      className={`w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition`}
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
                onClick={() => setFilterOpen(!filterOpen)}
                className={`${buttonBaseClasses} md:px-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } w-full`}
              >
                <FiFilter className="mr-1" /> Filter{" "}
                <BiChevronDown className="ml-1" />
              </button>

              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex md:mb-20 items-center justify-center md:-left-[78px] p-4"
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`${
                      darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-white text-gray-800"
                    } w-10/12 md:w-96 p-3 md:p-5 max-h-[80vh] overflow-y-auto rounded-md shadow-sm border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    } transition-all duration-300`}
                  >
                    <h2
                      className={`text-lg md:text-xl font-semibold mb-3 text-left ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Filter Students
                    </h2>
                    {/* Filter selects here */}
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Class
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>One</option>
                          <option>Two</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Group
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>Science</option>
                          <option>Arts</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Section
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>A</option>
                          <option>B</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Session
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>2024-25</option>
                          <option>2025-26</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2 mt-1">
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="flex-1 sm:flex-none px-3 py-1 text-xs font-medium border rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Reset
                      </button>
                      <button className="flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white">
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
                onClick={() => setSortOpen(!sortOpen)}
                className={`${buttonBaseClasses} md:px-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } w-full`}
              >
                Sort By <BiChevronDown className="ml-1" />
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-[106px] z-40 border rounded ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } shadow-sm left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 mt-2 md:mt-0">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 px-2 md:px-3 w-full text-xs rounded border shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                  : "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex items-center flex-1">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`p-2 ${darkMode ? "bg-gray-900" : "bg-white"} rounded`}>
        <StudentTable
          data={currentStudents}
          setData={setStudents}
          view={view}
          canEdit={canEdit}
          onEdit={(student) => setEditingStudent(student)}
        />
      </div>

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(updatedStudent) => {
            setStudents((prev) =>
              prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
            );
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
}
