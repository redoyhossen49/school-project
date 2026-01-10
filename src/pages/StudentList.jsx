import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import AddStudentModal from "../components/student/AddStudentModal.jsx";

import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function StudentList() {
  const { darkMode } = useTheme();
  const [students, setStudents] = useState(studentData);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Dropdown states
  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

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
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
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

      if (selectedDate === "Today") {
        return joinDate.toDateString() === today.toDateString();
      }
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
      if (sessionKeys.includes(selectedDate)) {
        return s.session === selectedDate;
      }
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
    <div className="space-y-5 my-8">
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <div>
          <h1 className="text-xl font-bold ">Students List</h1>
          <nav className="text-sm w-full mt-1 truncate">
            Dashboard / Students / All Students
          </nav>
        </div>

        {/* Buttons: Refresh, Export, Add Student */}
        <div className="flex items-center w-full md:w-auto gap-2">
          <button
            title="Refresh"
            className="flex-1 flex items-center justify-center p-1 border border-gray-300 hover:bg-gray-100"
            onClick={() => {
              setStudents(studentData);
              setSearch("");
            }}
          >
            <FiRefreshCw />
          </button>

          {/* Export Dropdown */}
          <div className="relative flex-1 md:flex-none" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="w-full flex items-center justify-center p-1 border border-gray-300 text-xs md:text-sm hover:bg-gray-200"
            >
              Export
              <BiChevronDown className="ml-[2px]" />
            </button>

            {exportOpen && (
              <div className={`absolute mt-2 w-40 z-40  border border-gray-100 ${darkMode? "bg-gray-800 text-gray-100":"bg-white text-gray-900"} shadow-lg left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0`}>
                <button
                  onClick={() => {
                    setExportOpen(false);
                    alert("Export as PDF");
                  }}
                  className="w-full px-4 py-2 text-left text-sm "
                >
                  Export as PDF
                </button>

                <button
                  onClick={() => {
                    setExportOpen(false);
                    alert("Export as Excel");
                  }}
                  className="w-full px-4 py-2 text-left text-sm "
                >
                  Export as Excel
                </button>
              </div>
            )}
          </div>

          {/* Add Student */}
          <button
            className="flex-none flex items-center justify-center p-1 text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
        {/* Left controls: Date, Filter, Sort */}
        <div className="flex w-full md:w-auto gap-2">
          {/* Date Dropdown */}
          <div className="relative flex-1 md:flex-none" ref={dateDropdownRef}>
            <button
              onClick={() => setDateOpen(!dateOpen)}
              className="w-full flex items-center justify-between p-1 border border-gray-300 text-xs md:text-sm hover:bg-gray-500"
            >
              {selectedDate}
              <BiChevronDown className="ml-[2px]" />
            </button>

            {dateOpen && (
              <div className={`absolute left-0 mt-2 w-48 shadow-lg z-30 overflow-hidden ${darkMode? "bg-gray-600 text-gray-100":"bg-white text-gray-900"} border`}>
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedDate(opt.label);
                      setDateOpen(false);
                      setShowSession(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm hover:bg-gray-500"
                  >
                    {opt.label}
                    <BiChevronRight size={12} />
                  </button>
                ))}

                {/* Session button */}
                <button
                  onClick={() => setShowSession(!showSession)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm font-medium hover:bg-gray-500"
                >
                  Session
                  <BiChevronRight
                    size={14}
                    className={`${showSession ? "rotate-90" : ""}`}
                  />
                </button>

                {showSession &&
                  sessionKeys.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedDate(s);
                        setDateOpen(false);
                        setShowSession(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs md:text-sm hover:bg-blue-50"
                    >
                      {s}
                      <BiChevronRight size={14} />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex-1 md:flex-none" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full flex items-center justify-center p-1 border border-gray-300 text-xs md:text-sm hover:bg-gray-500"
            >
              <FiFilter className="mr-1" /> Filter
              <BiChevronDown className="ml-1" />
            </button>

            {filterOpen && (
              <div className={`absolute left-1/2 -translate-x-[50%] md:left-0 md:translate-x-0 mt-2 w-60 md:w-80 ${darkMode? "bg-gray-600 text-gray-100":"bg-white text-gray-900"} border border-gray-200 shadow-lg z-40 p-4`}>
                <h3 className="font-semibold text-sm mb-3">Filter</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Class */}
                  <div>
                    <label className="block mb-1 text-sm md:text-base">Class</label>
                    <select className="w-full border text-sm md:text-base px-2 py-1 ">
                      <option>Select</option>
                      <option>One</option>
                      <option>Two</option>
                    </select>
                  </div>
                  {/* Section */}
                  <div>
                    <label className="block mb-1 text-sm md:text-base">Section</label>
                    <select className="w-full border px-2 py-1 text-sm md:text-base">
                      <option>Select</option>
                      <option>A</option>
                      <option>B</option>
                    </select>
                  </div>
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block mb-1 text-sm md:text-base">Name</label>
                    <select className="w-full border px-2 py-1 text-sm md:text-base">
                      <option>Select</option>
                    </select>
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block mb-1 text-sm md:text-base">Gender</label>
                    <select className="w-full border px-2 py-1 text-sm md:text-base">
                      <option>Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block mb-1 text-sm md:text-base">Status</label>
                    <select className="w-full border px-2 py-1 text-sm md:text-base">
                      <option>Select</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="px-4 py-1 text-sm border   hover:bg-gray-200"
                  >
                    Reset
                  </button>
                  <button className="px-4 py-1 text-sm  bg-blue-600 text-white hover:bg-blue-700">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 md:flex-none" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className=" w-full flex items-center p-1 border border-gray-300 text-xs md:text-sm hover:bg-gray-100"
            >
              Sort By
              <BiChevronDown className="ml-[2px]" />
            </button>

           {sortOpen && (
  <div
   className={`absolute mt-2 w-40 shadow-lg z-30 overflow-hidden ${darkMode? "bg-gray-600 text-gray-100":"bg-white text-gray-900"} border border-gray-200 left-1/2 -translate-x-[80%] md:left-0 md:translate-x-0`}
  >
    <button
      onClick={() => {
        setSortOrder("oldest");
        setSortOpen(false);
      }}
      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
    >
      First
    </button>
    <button
      onClick={() => {
        setSortOrder("newest");
        setSortOpen(false);
      }}
      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
    >
      Last
    </button>
  </div>
)}

          </div>
        </div>

        {/* Search input */}
        <div className="w-full md:w-44 mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search by student name..."
            className="w-full px-4 py-1 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-sm"
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

      {/* Add Student Modal */}
      <AddStudentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(newStudent) => {
          setStudents((prev) => [newStudent, ...prev]);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
