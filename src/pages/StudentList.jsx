import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData";
import StudentTable from "../components/student/StudentTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import EditStudentModal from "../components/student/EditStudentModal.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import { getCollectionsFromStorage } from "../utils/collectionUtils";
import { collectionData } from "../data/collectionData";

export default function StudentsList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Load students from localStorage or use static data
  const loadStudents = () => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      try {
        return JSON.parse(storedStudents);
      } catch (e) {
        console.error("Error loading students from localStorage:", e);
        return studentData;
      }
    }
    return studentData;
  };

  // Calculate feesDue for each student based on collections
  const calculateStudentFeesDue = (studentList) => {
    const storedCollections = getCollectionsFromStorage();
    const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
    
    return studentList.map((student) => {
      // Find all collections for this student
      const studentCollections = allCollections.filter(
        (collection) => collection.student_id?.toUpperCase() === student.studentId?.toUpperCase()
      );
      
      // Calculate total due from all collections
      const totalDue = studentCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);
      
      return {
        ...student,
        feesDue: totalDue, // Update feesDue based on collections
      };
    });
  };

  const [students, setStudents] = useState(() => {
    const loadedStudents = loadStudents();
    return calculateStudentFeesDue(loadedStudents);
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [view, setView] = useState("table");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    className: "",
    group: "",
    section: "",
    session: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [editingStudent, setEditingStudent] = useState(null);

  const dateDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  const sessionKeys = ["Session 1", "Session 2", "Session 3"];

  // ===== Close dropdowns on outside click =====
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

  // Listen for collectionsUpdated and studentsUpdated events to refresh feesDue
  useEffect(() => {
    const handleStudentsUpdate = () => {
      const loadedStudents = loadStudents();
      setStudents(calculateStudentFeesDue(loadedStudents));
    };

    const handleCollectionsUpdate = () => {
      // Recalculate feesDue when collections are updated
      const loadedStudents = loadStudents();
      setStudents(calculateStudentFeesDue(loadedStudents));
    };

    window.addEventListener('studentsUpdated', handleStudentsUpdate);
    window.addEventListener('collectionsUpdated', handleCollectionsUpdate);
    window.addEventListener('feeTypesUpdated', handleCollectionsUpdate);

    return () => {
      window.removeEventListener('studentsUpdated', handleStudentsUpdate);
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdate);
      window.removeEventListener('feeTypesUpdated', handleCollectionsUpdate);
    };
  }, []);

  // ===== Filter + Sort Logic =====
  const filteredStudents = students
    .filter((s) => s.student_name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      const today = new Date();
      const joinDate = new Date(s.joinDate); // raw ISO string, safe

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
      if (sessionKeys.includes(selectedDate)) return s.session === selectedDate;

      return true;
    })
    .filter((s) => {
      // Cumulative filtering: only apply if value is selected
      if (filters.className && s.className !== filters.className) return false;
      if (filters.group && s.group !== filters.group) return false;
      if (filters.section && s.section !== filters.section) return false;
      if (filters.session && s.session !== filters.session) return false;
      return true;
    })
    .sort((a, b) => {
      const d1 = new Date(a.joinDate);
      const d2 = new Date(b.joinDate);
      return sortOrder === "oldest" ? d1 - d2 : d2 - d1;
    });

  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );
  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((s, i) => ({
      Sl: i + 1,
      Name: s.student_name,
      Roll: s.roll,
      Class: s.className,
      Group: s.group,
      Section: s.section,
      Session: s.session,
      JoinDate: s.joinDate,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Students");
    writeFile(wb, "Students_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Name",
      "Roll",
      "Class",
      "Group",
      "Section",
      "Session",
      "Join Date",
    ];

    const rows = data.map((s, i) => [
      i + 1,
      s.student_name,
      s.roll,
      s.className,
      s.group,
      s.section,
      s.session,
      s.joinDate,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }, // blue
    });

    doc.save("Students_List.pdf");
  };

  const handleRefresh = () => {
    const loadedStudents = loadStudents();
    setStudents(calculateStudentFeesDue(loadedStudents));
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setTempFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setSelectedDate("Monthly");
    setCurrentPage(1);
  };
  // Generate dynamic options from studentData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Example usage in parent component
  const classOptions = getUniqueOptions(studentData, "className"); // ["I", "II", "III", ...]
  const groupOptions = getUniqueOptions(studentData, "group"); // ["N/A", "Science", ...]
  const sectionOptions = getUniqueOptions(studentData, "section"); // ["A", "B", "C", ...]
  const sessionOptions = getUniqueOptions(studentData, "session"); // ["2025-26", ...]

  const cardBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  const dropdownBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-900";

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Students List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/school/dashboard/studentlist")}
                className="hover:text-indigo-600"
              >
                / Student List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center   px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between  px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
              >
                Export 
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredStudents)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredStudents)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addstudent")}
                className="flex items-center w-28  bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Student
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full  flex items-center  px-3 h-8 text-sm   border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full " ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full  flex items-center   px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border   ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredStudents)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredStudents)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addstudent")}
              className="w-full flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Student
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Date Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              {/* Main Button */}
              <button
                onClick={() => setDateOpen((prev) => !prev)}
                className={`w-full flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
              >
                {selectedDate || "Select Date"}
              </button>

              {/* Main Dropdown */}
              {dateOpen && (
                <div
                  className={`absolute left-0 mt-2 py-2 w-full max-h-[60vh] overflow-y-auto space-y-2  z-40 ${
                    darkMode
                      ? "bg-gray-700 text-gray-100 border border-gray-600"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                >
                  {/* Date Options */}
                  {dateOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setSelectedDate(opt.label);
                        setDateOpen(false);
                        setShowSession(false);
                      }}
                      className="w-full cursor-pointer px-3 h-6 text-xs flex items-center justify-between   hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <span>{opt.label}</span>
                    </div>
                  ))}

                  {/* Session Button */}
                  <div
                    onClick={() => setShowSession(!showSession)}
                    className="w-full cursor-pointer px-3  text-xs flex items-center justify-between hover:bg-gray-100  transition"
                  >
                    <span>Session</span>
                  </div>

                  {/* Sub-options Overlay (CENTERED) */}
                  {showSession && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-10/12   overflow-y-auto pointer-events-auto ${
                          darkMode
                            ? "bg-gray-700 text-gray-100 border border-gray-600"
                            : "bg-white text-gray-900 border border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()} // sub-options click handle
                      >
                        {sessionKeys.map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setSelectedDate(s);
                              setDateOpen(false);
                              setShowSession(false);
                            }}
                            className="w-full cursor-pointer px-2 py-1  text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                          >
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative " ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Students"
                fields={[
                  {
                    key: "className",
                    label: "Class",
                    options: classOptions,
                    placeholder: "All Classes",
                  },
                  {
                    key: "group",
                    label: "Group",
                    options: groupOptions,
                    placeholder: "All Groups",
                  },
                  {
                    key: "section",
                    label: "Section",
                    options: sectionOptions,
                    placeholder: "All Sections",
                  },
                  {
                    key: "session",
                    label: "Session",
                    options: sessionOptions,
                    placeholder: "All Sessions",
                  },
                ]}
                selected={filters}
                setSelected={setFilters}
                darkMode={darkMode}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={() => setCurrentPage(1)}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs   border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    className="w-full px-3 h-6 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                  >
                    First
                  </button>
                  <button
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100 "
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                  >
                    Last
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
              className={`w-full md:w-64 ${borderClr} ${inputBg}  border  px-3 h-8  text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== STUDENT TABLE ===== */}
      <div
        className={` ${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <StudentTable
          data={currentStudents}
          setData={setStudents}
          view={view}
          canEdit={canEdit}
          onEdit={(student) => setEditingStudent(student)}
        />
      </div>

      {/* ===== EDIT MODAL ===== */}
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
    </div>
  );
}
