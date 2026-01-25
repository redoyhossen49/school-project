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
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [sortOpenDesktop, setSortOpenDesktop] = useState(false);
  const [sortOpenMobile, setSortOpenMobile] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportOpenDesktop, setExportOpenDesktop] = useState(false);
  const [exportOpenMobile, setExportOpenMobile] = useState(false);

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
  const sortRefDesktop = useRef(null);
  const sortRefMobile = useRef(null);

  const exportRefDesktop = useRef(null);
  const exportRefMobile = useRef(null);
  const filterButtonRef = useRef(); // filter button er ref

  const attendanceOptions = ["Presence", "Absence", "Late", "Leave"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attendanceRef.current && !attendanceRef.current.contains(e.target))
        setAttendanceOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
      if (
        sortRefDesktop.current &&
        !sortRefDesktop.current.contains(e.target)
      ) {
        setSortOpenDesktop(false);
      }
      if (sortRefMobile.current && !sortRefMobile.current.contains(e.target)) {
        setSortOpenMobile(false);
      }
      if (
        exportRefDesktop.current &&
        !exportRefDesktop.current.contains(e.target)
      )
        setExportOpenDesktop(false);
      if (
        exportRefMobile.current &&
        !exportRefMobile.current.contains(e.target)
      )
        setExportOpenMobile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open only one dropdown at a time
  const handleDropdownClick = (type) => {
  setAttendanceOpen(type === "attendance" ? (prev) => !prev : false);
  setFilterOpen(type === "filter" ? (prev) => !prev : false);
  setSortOpenDesktop(type === "sortDesktop" ? (prev) => !prev : false);
  setSortOpenMobile(type === "sortMobile" ? (prev) => !prev : false);

  if (type === "exportDesktop") {
    setExportOpenDesktop((prev) => !prev);
    setExportOpenMobile(false);
  } else if (type === "exportMobile") {
    setExportOpenMobile((prev) => !prev);
    setExportOpenDesktop(false);
  }
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
      const getNum = (idNumber) => {
        const match = idNumber.match(/\d+$/); // numeric part at the end
        return match ? parseInt(match[0], 10) : 0;
      };

      if (sortOrder === "newest") {
        return getNum(b.idNumber) - getNum(a.idNumber); // highest ID first
      }
      if (sortOrder === "oldest") {
        return getNum(a.idNumber) - getNum(b.idNumber); // lowest ID first
      }
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

  // -------------------- Export Functions --------------------
  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(26, 160, 176);
    const title = "Teachers List";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);
    doc.setTextColor(0, 0, 0);

    const tableColumn = [
      "ID",
      "Name",
      "Designation",
      "Phone",
      "Email",
      "Present",
      "Absence",
      "Late",
      "Leave",
    ];
    const tableRows = filteredTeachers.map((t) => [
      t.id,
      t.teacherName,
      t.designation,
      t.phone || "N/A",
      t.email || "N/A",
      t.present || 0,
      t.absence || 0,
      t.late || 0,
      t.leave || 0,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [26, 160, 176],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
    });

    doc.save("TeachersList.pdf");
    setExportOpen(false);
  };

  const exportToExcel = () => {
    const excelData = filteredTeachers.map((t) => ({
      ID: t.id,
      Name: t.teacherName,
      Designation: t.designation,
      Phone: t.phone || "N/A",
      Email: t.email || "N/A",
      Present: t.present || 0,
      Absence: t.absence || 0,
      Late: t.late || 0,
      Leave: t.leave || 0,
    }));

    const ws = utils.json_to_sheet(excelData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Teachers");
    writeFile(wb, "TeachersList.xlsx");
    setExportOpen(false);
  };

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

            <div className="relative" ref={exportRefDesktop}>
              <button
                onClick={() => handleDropdownClick("exportDesktop")}
                className={`w-28 flex items-center z-30  border  ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                } px-3 h-8 text-xs`}
              >
                Export
              </button>
              {exportOpenDesktop && (
                <div
                  className={`absolute top-full left-0 mt-2 w-28 z-40 border   ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={exportToPDF}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit ? (
              <button
                onClick={() => setIsAddTeacherModalOpen(true)}
                className="w-28 flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
              >
                Add Teacher
              </button>
            ) : (
              <div className="relative flex-1" ref={sortRefDesktop}>
                <button
                  onClick={() => setSortOpenDesktop((prev) => !prev)}
                  className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
                    darkMode
                      ? "border-gray-500 bg-gray-700 text-gray-100"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  Sort By
                </button>
                {sortOpenDesktop && (
                  <div
                    className={`absolute mt-2 w-full z-40 border  ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-200 text-gray-900"
                    }  left-0`}
                  >
                    <button
                      onClick={() => {
                        setSortOrder("newest");
                        setSortOpenDesktop(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      First
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("oldest");
                        setSortOpenDesktop(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
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

          <div className="relative w-full" ref={exportRefMobile}>
            <button
             onClick={() => handleDropdownClick("exportMobile")}
              className={`w-full flex items-center   border ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              }  px-3 h-8 text-xs`}
            >
              Export
            </button>
            {exportOpenMobile && (
              <div
                className={`absolute top-full left-0 mt-2 w-full z-40 border  ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={exportToPDF}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit ? (
            <button
              onClick={() => setIsAddTeacherModalOpen(true)}
              className="w-full flex items-center   bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Teacher
            </button>
          ) : (
            <div className="relative w-full" ref={sortRefMobile}>
              <button
                onClick={() => setSortOpenMobile((prev) => !prev)}
                className={`w-full flex items-center border px-3 h-8 text-xs ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort By
              </button>
              {sortOpenMobile && (
                <div
                  className={`absolute mt-2 w-full z-40 border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpenMobile(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpenMobile(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
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
            id:
              teachers.length > 0
                ? Math.max(...teachers.map((t) => t.id)) + 1
                : 1,
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
