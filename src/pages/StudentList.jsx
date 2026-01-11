import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import AddStudentModal from "../components/student/AddStudentModal.jsx";

import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import EditStudentModal from "../components/student/EditStudentModal.jsx";

export default function StudentList() {
  const { darkMode } = useTheme();
  const [students, setStudents] = useState(studentData);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  // Role-based access
  const userRole = localStorage.getItem("role"); // "school", "teacher", "student", etc.
  const canEdit = userRole === "school"; // only school can edit/add/delete

  // Dropdown states
  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  // StudentList.jsx er shuru te
  const [editingStudent, setEditingStudent] = useState(null);

  // Filter dropdown state
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

  // Close dropdowns if clicked outside
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

  // Filter + Search + Sort
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
      if (selectedDate === "This Month") {
        return (
          joinDate.getMonth() === today.getMonth() &&
          joinDate.getFullYear() === today.getFullYear()
        );
      }
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
    <div
      className={`space-y-3 p-2 min-h-screen  ${
        darkMode ? "text-gray-100" : "text-gray-600"
      }`}
    >
      {/* Header */}
      <div className="bg-white p-3 rounded ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* LEFT SIDE: Title + Breadcrumb */}
          <div>
            <h1 className="text-xl font-bold">Students List</h1>
            <nav className="text-sm w-full mb-2 truncate">
              Dashboard / Student / Student List
            </nav>
          </div>

          {/* RIGHT SIDE: Buttons (UNCHANGED DESIGN) */}
          <div className="grid grid-cols-3 items-center w-full md:w-auto mb-3 gap-[6px]">
            {/* Refresh */}
            <button
              title="Refresh"
              className={`flex-1 flex items-center rounded shadow-sm justify-center px-1 py-2 md:px-2 ${
                darkMode
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                  : "border-gray-200 bg-white hover:bg-gray-100"
              } border hover:bg-gray-100`}
              onClick={() => {
                setStudents(studentData);
                setSearch("");
              }}
            >
              <FiRefreshCw />
            </button>

            {/* Export */}
            <div className="relative flex-1 md:flex-none" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center px-1 py-2 rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-200 bg-white hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                Export
                <BiChevronDown className="ml-[2px]" />
              </button>

              {exportOpen && (
                <div
                  className={`absolute mt-2 w-24 z-40 border rounded ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } shadow-sm`}
                >
                  <button
                    onClick={() => setExportOpen(false)}
                    className={`w-full px-2 py-1 text-left text-sm ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Export PDF
                  </button>

                  <button
                    onClick={() => setExportOpen(false)}
                    className={`w-full px-2 py-1 text-left text-sm ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {/* Add Student */}
            {canEdit && (
              <button
                className="flex-none flex items-center justify-center px-1 py-2 text-xs md:text-sm rounded shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setAddOpen(true)}
              >
                + Add Student
              </button>
            )}
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 ">
          {/* Left controls: Date, Filter, Sort */}
          <div className="flex w-full md:w-auto gap-[6px] ">
            {/* Date Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={dateDropdownRef}>
              <button
                onClick={() => setDateOpen(!dateOpen)}
                className={`w-full flex items-center justify-center px-1 py-2 rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-200 bg-white hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                {selectedDate}
                <BiChevronDown className="ml-[2px]" />
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
                      className={`w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between ${
                        darkMode ? "hover:bg-gray-500" : "hover:bg-gray-100"
                      } transition-colors duration-150`}
                    >
                      <span>{opt.label}</span>
                      <BiChevronRight size={12} />
                    </div>
                  ))}

                  <div
                    onClick={() => setShowSession(!showSession)}
                    className={`w-full cursor-pointer px-4 py-2 text-sm font-medium flex items-center justify-between ${
                      darkMode ? "hover:bg-gray-500" : "hover:bg-gray-100"
                    } transition-colors duration-150`}
                  >
                    <span>Session</span>
                    <BiChevronRight
                      size={14}
                      className={`${
                        showSession ? "rotate-90" : ""
                      } transition-transform duration-200`}
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
                        className={`w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between ${
                          darkMode ? "hover:bg-gray-500" : "hover:bg-gray-100"
                        } transition-colors duration-150`}
                      >
                        <span>{s}</span>
                        <BiChevronRight size={14} />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full flex items-center justify-center px-1 py-2  rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-200 bg-white hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                <FiFilter className="mr-1" /> Filter
                <BiChevronDown className="ml-[2px]" />
              </button>
              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex mt-20 md:mb-28 items-center justify-center md:justify-end p-4"
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
          ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-800"}
          w-3/4 md:w-96
          p-5 md:p-6
          max-h-[75vh] overflow-y-auto
          rounded-md shadow-sm
          border ${darkMode ? "border-gray-600" : "border-gray-200"}
          transition-all duration-300
        `}
                  >
                    <h2
                      className={`text-lg md:text-xl font-semibold mb-3 text-left
          ${darkMode ? "text-gray-200" : "text-gray-700"}
        `}
                    >
                      Filter Students
                    </h2>

                    <div className="flex flex-col gap-1">
                      {/* Class */}
                      <div>
                        <label className="block mb-1 font-medium">Class</label>
                        <select
                          className={`w-full px-2 py-1.5 rounded border shadow-sm bg-transparent
              ${
                darkMode
                  ? "border-gray-500 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
                        >
                          <option>Select</option>
                          <option>One</option>
                          <option>Two</option>
                        </select>
                      </div>

                      {/* Section */}
                      <div>
                        <label className="block mb-1 font-medium">
                          Section
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 rounded border shadow-sm bg-transparent
              ${
                darkMode
                  ? "border-gray-500 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
                        >
                          <option>Select</option>
                          <option>A</option>
                          <option>B</option>
                        </select>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <select
                          className={`w-full px-2 py-1.5 rounded border shadow-sm bg-transparent
              ${
                darkMode
                  ? "border-gray-500 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
                        >
                          <option>Select</option>
                        </select>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block mb-1 font-medium">Gender</label>
                        <select
                          className={`w-full px-2 py-1.5 rounded border shadow-sm bg-transparent
              ${
                darkMode
                  ? "border-gray-500 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
                        >
                          <option>Select</option>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block mb-1 font-medium">Status</label>
                        <select
                          className={`w-full px-2 py-1.5 rounded border shadow-sm bg-transparent
              ${
                darkMode
                  ? "border-gray-500 text-gray-100"
                  : "border-gray-300 text-gray-600"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
                        >
                          <option>Select</option>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-3 mt-3">
                      <button
                        onClick={() => setFilterOpen(false)}
                        className={`w-full sm:w-auto px-3 py-1 text-xs font-medium border rounded
            ${
              darkMode
                ? "border-gray-500 text-gray-200 hover:bg-gray-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-gray-200"
            }
            transition
          `}
                      >
                        Reset
                      </button>
                      <button
                        className={`w-full sm:w-auto px-3 py-1 text-xs font-medium rounded
            ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
            shadow-md transition
          `}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`w-full flex items-center justify-center px-1 py-2  rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-200 bg-white hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                Sort By
                <BiChevronDown className="ml-[2px]" />
              </button>

              {sortOpen && (
                <div
                  className={`absolute mt-2 w-24 z-40 border rounded ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } shadow-sm left-0  md:left-0 md:translate-x-0 animate-fade-in`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                    className={`w-full px-2 py-1 text-left text-sm flex items-center  ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } rounded-t-lg`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                    className={`w-full px-2 py-1 text-left text-sm flex items-center  ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } rounded-t-lg`}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 mt-0">
            <input
              type="text"
              placeholder="Search by student name..."
              className={`h-9 px-2 py-2  md:px-3 text-xs border rounded shadow-sm   w-full 
          ${
            darkMode
              ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
              : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      <div className="p-3 bg-white rounded">
        {/* Student Table */}
        <StudentTable
          data={currentStudents}
          setData={setStudents}
          view={view}
          canEdit={canEdit}
          onEdit={(student) => setEditingStudent(student)} // ✅ Add this
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

      {/* Pagination 
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /> */}

      {/* Add Student Modal */}
      {canEdit && (
        <AddStudentModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={(newStudent) => {
            setStudents((prev) => [newStudent, ...prev]);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
