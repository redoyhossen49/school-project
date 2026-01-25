import { useState, useRef, useEffect, useMemo } from "react";
import { classPermissionData } from "../data/classPermissionData";
import ClassPermissionTable from "../components/teacher/ClassPermissionTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";

import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import AddClassPermissionPage from "./AddClassPermissionPage.jsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ClassPermissionList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  const [filterValues, setFilterValues] = useState({
    class: "",
    group: "",
    section: "",
  });

  const [permissions, setPermissions] = useState(classPermissionData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const permissionsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [exportOpenDesktop, setExportOpenDesktop] = useState(false);
const [exportOpenMobile, setExportOpenMobile] = useState(false);

  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOpenDesktop, setSortOpenDesktop] = useState(false);
  const [sortOpenMobile, setSortOpenMobile] = useState(false);

  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);

  const sectionRef = useRef(null);
  // Separate refs
  const exportRefDesktop = useRef(null);
  const exportRefMobile = useRef(null);

  const sortRefDesktop = useRef(null);
  const sortRefMobile = useRef(null);

  const filterRef = useRef(null);

  const normalize = (v) => (v ? v.toString().trim().toLowerCase() : "");

  const getUniqueOptions = (data, key) =>
    Array.from(new Set(data.map((item) => item[key]).filter(Boolean)));

  const classOptions = getUniqueOptions(classPermissionData, "class");
  const groupOptions = getUniqueOptions(classPermissionData, "group");
  const sectionOptions = getUniqueOptions(classPermissionData, "section");

  // ===== Close dropdowns on outside click =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Desktop dropdown
     if (exportRefDesktop.current && !exportRefDesktop.current.contains(e.target)) {
      setExportOpenDesktop(false);
    }
    // Mobile export
    if (exportRefMobile.current && !exportRefMobile.current.contains(e.target)) {
      setExportOpenMobile(false);
    }

      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      if (
        sortRefDesktop.current &&
        !sortRefDesktop.current.contains(e.target)
      ) {
        setSortOpenDesktop(false);
      }
      if (sortRefMobile.current && !sortRefMobile.current.contains(e.target)) {
        setSortOpenMobile(false);
      }
      if (sectionRef.current && !sectionRef.current.contains(e.target)) {
        setSectionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== FILTER + SEARCH + SORT =====
  const filteredPermissions = useMemo(() => {
    return permissions
      .filter((p) => {
        const q = normalize(search);
        if (!q) return true;
        return (
          normalize(p.name).includes(q) ||
          normalize(p.teacherName).includes(q) ||
          normalize(p.idNumber).includes(q)
        );
      })
      .filter((p) =>
        !filterValues.class
          ? true
          : normalize(p.class) === normalize(filterValues.class),
      )
      .filter((p) =>
        !filterValues.group
          ? true
          : normalize(p.group) === normalize(filterValues.group),
      )
      .filter((p) =>
        !filterValues.section
          ? true
          : normalize(p.section) === normalize(filterValues.section),
      )
      .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));
  }, [permissions, search, filterValues, sortOrder]);

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredPermissions.length / permissionsPerPage);
  const currentPermissions = filteredPermissions.slice(
    (currentPage - 1) * permissionsPerPage,
    currentPage * permissionsPerPage,
  );

  // ===== HANDLERS =====
  const handleRefresh = () => {
    setPermissions(classPermissionData);
    setSearch("");
    setSortOrder("asc");
    setCurrentPage(1);
    setFilterValues({ class: "", group: "", section: "" });
  };

  const handleCreatePermission = (data) => {
    const maxSl = permissions.reduce((m, r) => Math.max(m, r.sl || 0), 0);
    const nextSl = maxSl + 1;
    const idNumber =
      data?.idNumber?.trim() || `CP${String(1000 + nextSl).padStart(4, "0")}`;

    setPermissions((prev) => [
      ...prev,
      {
        sl: nextSl,
        teacherName: data.teacherName || "",
        idNumber,
        class: data.class || "",
        group: data.group || "",
        section: data.section || "",
        subject: data.subject || "",
      },
    ]);
    setAddPermissionOpen(false);
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const wsData = filteredPermissions.map(
      ({
        sl,
        name,
        teacherName,
        idNumber,
        class: cls,
        group,
        section,
        subject,
      }) => ({
        SL: sl,
        Name: name,
        Teacher: teacherName,
        ID: idNumber,
        Class: cls,
        Group: group,
        Section: section,
        Subject: subject,
      }),
    );

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassPermissions");
    XLSX.writeFile(wb, "ClassPermissions.xlsx");
  };

  // EXPORT PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [
        ["SL", "Name", "Teacher", "ID", "Class", "Group", "Section", "Subject"],
      ],
      body: filteredPermissions.map(
        ({
          sl,
          name,
          teacherName,
          idNumber,
          class: cls,
          group,
          section,
          subject,
        }) => [sl, name, teacherName, idNumber, cls, group, section, subject],
      ),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("ClassPermissions.pdf");
  };

  // Button base class for exact StudentList style
  const buttonClass = `flex items-center  w-28  border px-3 h-8 text-xs  ${
    darkMode
      ? "border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
      : "border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
  }`;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-700"
      } p-3 min-h-screen space-y-3`}
    >
      {/* ========== HEADER ========== */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-3 space-y-3`}>
        <div className="md:flex md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Class permission</h2>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-500"
              } text-xs`}
            >
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Class permission
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <div className="relative flex-1" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter class permission"
                fields={[
                  {
                    key: "class",
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
                ]}
                selected={filterValues}
                setSelected={setFilterValues}
                darkMode={darkMode}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setFilterValues(values);
                  setCurrentPage(1);
                  setFilterOpen(false);
                }}
              />
            </div>

            <div className="relative w-28"  ref={exportRefDesktop}>
              <button
                onClick={() => setExportOpenDesktop((p) => !p)}
                className={buttonClass}
              >
                Export
              </button>
              {exportOpenDesktop && (
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } absolute top-full left-0 mt-2 w-28  border md:z-50 `}
                >
                  <button onClick={handleExportPDF}  className="w-full px-3 py-1 text-left text-xs hover:bg-blue-50">
                    PDF
                  </button>
                  <button onClick={handleExportExcel} className="w-full px-3 py-1 text-left text-xs hover:bg-blue-50">
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit ? (
              <button
                onClick={() => setAddPermissionOpen(true)}
                className="flex items-center w-28 px-3 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
              >
                Permission
              </button>
            ) : (
              <div className="relative w-28" ref={sortRefDesktop}>
                <button
                  onClick={() => setSortOpenDesktop((p) => !p)}
                  className={`flex items-center w-28 border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
                >
                  Sort By
                </button>
                {sortOpenDesktop && (
                  <div
                    className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
                  >
                    <button
                      onClick={() => {
                        setSortOrder("asc");
                        setSortOpenDesktop(false);
                      }}
                      className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                    >
                      First
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("desc");
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
          <div className="relative flex-1" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${
                darkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              Filter
            </button>

            <FilterDropdown
              title="Filter class permission"
              fields={[
                {
                  key: "class",
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
              ]}
              selected={filterValues}
              setSelected={setFilterValues}
              darkMode={darkMode}
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              onApply={(values) => {
                setFilterValues(values);
                setCurrentPage(1);
                setFilterOpen(false);
              }}
            />
          </div>

          <div className="relative" ref={exportRefMobile}>
            <button
              onClick={() => setExportOpenMobile((p) => !p)}
              className={buttonClass + " w-full"}
            >
              Export
            </button>
            {exportOpenMobile && (
              <div
                className={`${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                } absolute top-full left-0 mt-1 z-50 w-full  border `}
              >
                <button
                  onClick={handleExportPDF}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-blue-50"
                >
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-blue-50"
                >
                  Excel
                </button>
              </div>
            )}
          </div>
          {canEdit ? (
            <button
              onClick={() => setAddPermissionOpen(true)}
              className="flex items-center justify-center gap-1 w-full px-3 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
            >
              Permission
            </button>
          ) : (
            <div className="relative w-full" ref={sortRefMobile}>
              <button
                onClick={() => setSortOpenMobile((p) => !p)}
                className={`flex items-center w-full border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
              >
                Sort By
              </button>
              {sortOpenMobile && (
                <div
                  className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpenMobile(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
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

        {/* ========== CONTROLS: Section, Sort, Filter, Search + Pagination ========== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          {/* Search + Pagination */}
          <div className="flex items-center gap-2  md:justify-between  w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
              } w-full md:w-64 px-3 h-8 border text-xs  focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ========== TABLE ========== */}
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        }  p-3 overflow-x-auto`}
      >
        <ClassPermissionTable
          data={currentPermissions}
          setData={setPermissions}
          darkMode={darkMode}
        />
      </div>

      {/* ========== ADD PERMISSION MODAL ========== */}
      <AddClassPermissionPage
        open={addPermissionOpen}
        onClose={() => setAddPermissionOpen(false)}
        onSubmit={handleCreatePermission}
      />
    </div>
  );
}
