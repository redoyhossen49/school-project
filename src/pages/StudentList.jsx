import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import AddStudentModal from "../components/student/AddStudentModal.jsx";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { Link } from "react-router-dom";

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
      className={`space-y-3 py-2 px-1 min-h-screen  ${
        darkMode ? "text-gray-100" : "text-gray-600"
      }`}
    >
      {/* Header */}
      <div className={`${darkMode? "bg-gray-900":"bg-white"} p-2 rounded `}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* LEFT SIDE: Title + Breadcrumb */}
          <div className="md:mb-3">
            <h1 className="text-base font-bold">Students List</h1>
            <nav className="text-sm w-full  truncate">
             
          <Link to="/school/dashboard" className="hover:text-indigo-600 transition">
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

          {/* RIGHT SIDE: Buttons (UNCHANGED DESIGN) */}
          <div className="flex flex-wrap md:flex-nowrap mb-3 items-center w-full md:w-auto gap-[6px] md:gap-3">
            {/* Refresh */}
            <button
              title="Refresh"
              className={`flex-1 flex items-center rounded shadow-sm justify-center px-1 py-[6px] md:px-2 ${
                darkMode
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
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
                className={`w-full flex items-center justify-center px-1 py-[6px] rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                Export
                <BiChevronDown className="ml-[2px]" />
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
                className="flex-none flex items-center justify-center px-1 py-[6px] text-xs md:text-sm rounded shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => navigate("/school/dashboard/addstudent")}
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
                className={`w-full flex items-center justify-center px-1 py-[6px] rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
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
                className={`w-full flex items-center justify-center px-1 py-[6px]  rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                <FiFilter className="mr-1" /> Filter
                <BiChevronDown className="ml-[2px]" />
              </button>
              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex mt-36 md:mb-20 items-center justify-center md:-left-[78px]  p-4"
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
        ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-800"}
        w-10/12 md:w-96
        p-3 md:p-5
        max-h-[80vh] overflow-y-auto
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

                    <div className="flex flex-col gap-3">
                      {/* Class */}
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px]
              ${
                darkMode
                  ? "bg-gray-700 text-blue-300"
                  : "bg-white text-blue-500"
              }
            `}
                        >
                          Class
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent
              ${
                darkMode
                  ? "border-gray-400 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-400
            `}
                        >
                          <option className="text-xs">Select</option>
                          <option>One</option>
                          <option>Two</option>
                        </select>
                      </div>

                       <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px]
              ${
                darkMode
                  ? "bg-gray-700 text-blue-300"
                  : "bg-white text-blue-500"
              }
            `}
                        >
                          Group
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent
              ${
                darkMode
                  ? "border-gray-400 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-400
            `}
                        >
                          <option className="text-xs">Select</option>
                          <option>Science</option>
                          <option>Arts</option>
                        </select>
                      </div>

                      {/* Section */}
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px]
              ${
                darkMode
                  ? "bg-gray-700 text-blue-300"
                  : "bg-white text-blue-500"
              }
            `}
                        >
                          Section
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent
              ${
                darkMode
                  ? "border-gray-400 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-400
            `}
                        >
                          <option className="text-xs">Select</option>
                          <option>A</option>
                          <option>B</option>
                        </select>
                      </div>

                      {/* Name */}
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px]
              ${
                darkMode
                  ? "bg-gray-700 text-blue-300"
                  : "bg-white text-blue-500"
              }
            `}
                        >
                          Session
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent
              ${
                darkMode
                  ? "border-gray-400 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }
              focus:outline-none focus:ring-1 focus:ring-blue-400
            `}
                        >
                          <option className="text-xs">Select</option>
                          <option>2024-25</option>
                          <option>2025-26</option>
                        </select>
                      </div>

                    
                    
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-2 mt-1">
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
                className={`w-full flex items-center justify-center px-1 py-[6px]  rounded shadow-sm md:px-2 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } text-xs md:text-sm hover:bg-gray-200`}
              >
                Sort By
                <BiChevronDown className="ml-[2px]" />
              </button>

              {sortOpen && (
                <div
                  className={`absolute mt-2 w-[106px]  z-40 border rounded ${
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
              placeholder="Search by name..."
              className={`h-8 px-2 py-2  md:px-3 text-xs border rounded shadow-sm   w-full 
          ${
            darkMode
              ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
              : "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400"
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

      <div className={`p-2  ${darkMode? "bg-gray-900":"bg-white"} rounded`}>
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

     
     
    </div>
  );
}
