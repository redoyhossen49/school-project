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

export default function StudentsList() {
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

  return (
    <div className="p-3 space-y-4">
      {/* ================= TOP SECTION ================= */}
      <div className="space-y-4 rounded-md bg-white p-3">
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Students List
            </h2>
            <p className="text-xs text-gray-500">
              Dashboard / Students / Student List
            </p>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setStudents(studentData)}
              className="flex items-center gap-1  w-24 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className="flex items-center gap-1 w-28 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs"
              >
                Export
                <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border rounded shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    Export PDF
                  </button>
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addstudent")}
                className="flex items-center gap-1 rounded w-28 shadow-sm bg-blue-600 px-3 py-2 text-xs text-white"
              >
                + Add Student
              </button>
            )}
          </div>
        </div>

        {/* MOBILE buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {/* Refresh */}
          <button
            onClick={() => setStudents(studentData)}
            className="w-full flex items-center  gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs"
          >
            <FiRefreshCw className="text-sm" />
            Refresh
          </button>

          {/* Export Dropdown */}
          <div className="relative w-full">
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="w-full flex items-center  gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs"
            >
              Export
              <BiChevronDown className="text-sm" />
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border rounded shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  Export PDF
                </button>
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  Export Excel
                </button>
              </div>
            )}
          </div>


          {/* Add Student */}
          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addstudent")}
              className="w-full flex items-center  gap-1 rounded shadow-sm bg-blue-600 px-2 py-2 text-xs text-white"
            >
              + Add Student
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Monthly Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setDateOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-24"
              >
                {selectedDate}
                <BiChevronDown className="text-sm" />
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

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-24"
            >
              <FiFilter className="text-sm" />
              Filter
            </button>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-24"
              >
                Sort By
                <BiChevronDown className="text-sm" />
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border rounded shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                  >
                    Newest
                  </button>
                  <button
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                  >
                    Oldest
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full md:w-64 rounded border border-gray-200 shadow-sm bg-white px-3 py-2 text-xs focus:outline-none"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-md bg-white p-2 overflow-x-auto">
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
          onSave={(updated) => {
            setStudents(
              students.map((s) => (s.id === updated.id ? updated : s))
            );
            setEditingStudent(null);
          }}
        />
      )}

      {/* ================= FILTER MODAL ================= */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-800"
            } w-8/12 md:w-96 p-6 max-h-[80vh] overflow-y-auto rounded shadow-sm border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            } transition-all duration-300  md:fixed md:top-48 md:left-100  `}
          >
            <h2
              className={`text-lg md:text-xl mx-2 font-semibold mb-3 text-left ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Filter Students
            </h2>
            <div className="flex flex-col gap-3 mx-2">
              {["Class", "Group", "Section", "Session"].map((field) => (
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
                    className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                      darkMode
                        ? "border-gray-400 text-gray-100"
                        : "border-gray-300 text-gray-800"
                    } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  >
                    <option>Select</option>
                    {field === "Class" && (
                      <>
                        <option>One</option>
                        <option>Two</option>
                      </>
                    )}
                    {field === "Group" && (
                      <>
                        <option>Science</option>
                        <option>Arts</option>
                      </>
                    )}
                    {field === "Section" && (
                      <>
                        <option>A</option>
                        <option>B</option>
                      </>
                    )}
                    {field === "Session" && (
                      <>
                        <option>2024-25</option>
                        <option>2025-26</option>
                      </>
                    )}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-end pt-2 mt-1 mx-2">
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
  );
}
