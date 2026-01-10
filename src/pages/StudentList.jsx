import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { FiRefreshCw, FiFilter } from "react-icons/fi";

import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function StudentList() {
  const {darkMode}=useTheme();
  const [students, setStudents] = useState(studentData);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table"); // "table" or "grid"
  const [sort, setSort] = useState("A-Z"); // Sorting option placeholder

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // --- Date Dropdown ---
  const [selectedDate, setSelectedDate] = useState("Today"); // default
  const [dateOpen, setDateOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const dateDropdownRef = useRef(null);

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "weekly" },
    { label: "This Month", value: "monthly" },
  ];

  const sessionKeys = ["Session 1", "Session 2", "Session 3"]; // example sessions

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setDateOpen(false);
        setShowSession(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filter and sort ---
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedStudents = filteredStudents; // Add sorting logic here if needed

  const totalStudents = sortedStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  return (
    <div className="space-y-5 my-8">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${darkMode?"text-gray-100":"text-gray-900"}`}>
        <div>
          <h1 className="text-2xl font-bold ">
            Students List
          </h1>
          <nav className="text-sm  mt-1">
            Dashboard / Students / All Students
          </nav>
        </div>

        <div className="flex flex-wrap items-center just gap-2">
          <button
            title="Refresh"
            className="flex items-center justify-center  p-2 border border-gray-300 hover:bg-gray-100 "
            onClick={() => {
              setStudents(studentData);
              setSearch("");
            }}
          >
            <FiRefreshCw className="w-4 h-4  " />
          </button>

          <button className="flex items-center justify-center px-3 py-2 border border-gray-300  text-xs md:text-sm   hover:bg-gray-200 ">
            Export <BiChevronDown className="ml-1 w-4 h-3" />
          </button>

          <button
            className="flex items-center justify-center px-4 py-2 text-xs md:text-sm bg-blue-600 text-white  hover:bg-blue-700"
            onClick={() => alert("Open Add Student form/modal")}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="flex flex-wrap justify-between items-center  gap-4">
        {/* Left controls */}
        <div className="flex items-center space-x-3">
          {/* Date Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => setDateOpen(!dateOpen)}
              className="flex items-center px-1 py-2 border border-gray-300  text-xs md:text-sm hover:bg-gray-100 "
            >
              {selectedDate}
              <BiChevronDown className="ml-1 w-5 h-5" />
            </button>

            {dateOpen && (
              <div
                className="absolute left-0 mt-2 w-48  shadow-lg z-30 overflow-hidden
                  bg-white border "
              >
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedDate(opt.label);
                      setDateOpen(false);
                      setShowSession(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm transition hover:bg-gray-100 "
                  >
                    {opt.label}
                    <BiChevronRight size={12} />
                  </button>
                ))}

                {/* Session button */}
                <button
                  onClick={() => setShowSession(!showSession)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm font-medium transition hover:bg-gray-100 "
                >
                  Session
                  <BiChevronRight
                    size={14}
                    className={`transition-transform ${showSession ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Session options */}
                {showSession && (
                  <div className="bg-gray-50 ">
                    {sessionKeys.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedDate(s);
                          setDateOpen(false);
                          setShowSession(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm transition hover:bg-blue-50 dark:hover:bg-blue-900"
                      >
                        {s}
                        <BiChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button className="flex items-center px-1 py-2 border border-gray-300 text-xs md:text-sm hover:bg-gray-100 ">
            <FiFilter className="mr-1 w-4 h-4 md:w-5 md:h-5" />
            Filter
            <BiChevronDown className="ml-[2px] w-5 h-5" />
          </button>
            <button className="flex items-center px-1 py-2 border border-gray-300 text-xs md:text-sm hover:bg-gray-100">
              Sort by 
              <BiChevronDown className="ml-[2px] w-5 h-5" />
            </button>
        </div>

       {/* Search input */}
      <div className="">
        <input
          type="text"
          placeholder="Search by student name..."
          className="w-full max-w-sm px-4 py-2 border  focus:outline-none   placeholder:text-sm text-sm focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      </div>

     

      {/* Student Table */}
      <StudentTable data={currentStudents} view={view} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
