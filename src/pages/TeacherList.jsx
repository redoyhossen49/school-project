import { useState, useRef, useEffect } from "react";
import { teacherData } from "../data/teacherData";
import TeacherTable from "../components/teacher/TeacherTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import ClassPaymentTable from "../components/academic/ClassPaymentTable.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import AddTeacherModal from "../components/teacher/AddTeacherModal.jsx";

export default function TeacherList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // All Teachers
  const [teachers, setTeachers] = useState(teacherData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 20;
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);

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
    new Set(teachers.map((t) => t.designation)),
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
  const filterButtonRef = useRef(); // filter button er ref

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
    setAttendanceOpen((prev) => (type === "attendance" ? !prev : false));
    setFilterOpen((prev) => (type === "filter" ? !prev : false));
    setSortOpen((prev) => (type === "sort" ? !prev : false));
    setExportOpen((prev) => (type === "export" ? !prev : false));
  };

  const filteredTeachers = teachers

    .filter((t) =>
      designationFilter ? t.designation === designationFilter : true,
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
    new Set(teacherData.map((t) => t.designation)),
  );

  const totalTeachers = filteredTeachers.length;
  const totalPages = Math.ceil(totalTeachers / teachersPerPage);
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher,
  );

  return (
    <div
      className={`p-3 space-y-4 min-h-screen ${
        darkMode ? "text-gray-100" : "text-gray-700"
      }`}
    >
      {/* Header */}
      <div
        className={`space-y-3  p-3 ${darkMode ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Title + Desktop Buttons */}
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold">Teachers list</h2>
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
              className={`w-28 flex items-center   border   ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              } px-3 h-8 text-xs`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => handleDropdownClick("export")}
                className={`w-28 flex items-center   border  ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                } px-3 h-8 text-xs`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border   ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100">
                    Export PDF
                  </button>
                  <button className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setIsAddTeacherModalOpen(true)}
                className="w-28 flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
              >
                Add Teacher
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Teacher"
                fields={[
                  {
                    key: "designation", // state key
                    label: "Designation", // optional, just for clarity
                    options: designationOptions, // ["Math Teacher", "Science Teacher", ...]
                    placeholder: "All Designations",
                  },
                ]}
                selected={{ designation: designationFilter }} // pass as object
                setSelected={(value) => setDesignationFilter(value.designation)} // update parent
                darkMode={darkMode}
                isOpen={filterOpen}
                buttonRef={filterButtonRef}
                onClose={() => setFilterOpen(false)}
                onApply={(value) => console.log("Applied:", value.designation)}
              />
            </div>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => handleDropdownClick("export")}
              className={`w-full flex items-center   border ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              }  px-3 h-8 text-xs`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border  ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100">
                  PDF
                </button>
                <button className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100">
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setIsAddTeacherModalOpen(true)}
              className="w-full flex items-center   bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Teacher
            </button>
          )}
        </div>

        {/* Controls: Attendance Dropdown, Filter, Sort + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 ">
          

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className={`w-full px-3 h-8 text-xs md:w-56  border  ${
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
      <div className={` p-3 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <TeacherTable
          data={filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher)}
          setData={setTeachers}
          canEdit={canEdit}
        />
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        open={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onAdd={(teacherData) => {
          // Add the new teacher to the list
          const newTeacher = {
            id: teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
            ...teacherData,
            present: 0,
            absence: 0,
            late: 0,
            leave: 0,
          };
          setTeachers([...teachers, newTeacher]);
        }}
      />
    </div>
  );
}
