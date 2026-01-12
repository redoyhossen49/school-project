import { useState, useRef, useEffect } from "react";
import { classPermissionData } from "../data/classPermissionData";
import ClassPermissionTable from "../components/teacher/ClassPermissionTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ClassPermissionList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [permissions, setPermissions] = useState(classPermissionData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const permissionsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);

  const sectionRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const sectionOptions = ["All Sections", "Morning", "Day", "Evening"];

  useEffect(() => {
    const handler = (e) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target))
        setSectionOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter + Sort + Search
  const filteredPermissions = permissions
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) =>
      selectedSection === "All Sections" ? true : p.section === selectedSection
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const totalPages = Math.ceil(filteredPermissions.length / permissionsPerPage);
  const currentPermissions = filteredPermissions.slice(
    (currentPage - 1) * permissionsPerPage,
    currentPage * permissionsPerPage
  );

  // Button base class for exact StudentList style
  const buttonClass =
    "flex items-center justify-center gap-2 w-28 rounded border border-gray-200 px-3 py-2 text-xs bg-white shadow-sm hover:bg-gray-100";

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="space-y-4 rounded-md bg-white p-3">
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Class Permission List
            </h2>
            <p className="text-xs text-gray-500">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Class Permission / Permission List
            </p>
          </div>

          {/* Buttons (Desktop) */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setPermissions(classPermissionData);
                setSearch("");
              }}
              className={buttonClass}
            >
              <FiRefreshCw /> Refresh
            </button>

            <div className="relative w-28" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={buttonClass}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div className="absolute top-full left-0 mt-1 w-28 z-40 rounded border shadow-sm bg-white text-gray-900">
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export PDF
                  </button>
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addclasspermission")}
                className="flex items-center justify-center gap-1 w-28 rounded bg-blue-600 px-3 py-2 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                + Permission
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setPermissions(classPermissionData);
              setSearch("");
            }}
            className="flex items-center  gap-1 w-full rounded border border-gray-200 px-2 py-2 text-xs bg-white shadow-sm"
          >
            <FiRefreshCw className="text-sm" /> Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="flex items-center gap-1 w-full rounded border border-gray-200 px-2 py-2 text-xs bg-white shadow-sm"
            >
              Export <BiChevronDown className="text-sm" />
            </button>
            {exportOpen && (
              <div className="absolute top-full left-0 mt-1 w-full z-40 rounded border border-gray-200 shadow-sm bg-white text-gray-900">
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100">
                  Export PDF
                </button>
                <button className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100">
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addclasspermission")}
              className="flex items-center  gap-1 w-full rounded bg-blue-600 px-2 py-2 text-xs text-white shadow-sm"
            >
              + Permission
            </button>
          )}
        </div>

        {/* ================= CONTROLS: Section, Sort, Filter, Search + Pagination ================= */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Section */}
            <div className="relative " ref={sectionRef}>
              <button
                onClick={() => setSectionOpen((prev) => !prev)}
               className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                {selectedSection} <BiChevronDown />
              </button>
              {sectionOpen && (
                <div className="absolute mt-2 w-40 z-40 rounded border border-gray-200 shadow-sm bg-white">
                  {sectionOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSection(opt);
                        setSectionOpen(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between"
                    >
                      {opt} <BiChevronRight size={12} />
                    </div>
                  ))}
                </div>
              )}
            </div>
             {/* Filter */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
            >
              <FiFilter /> Filter
            </button>

            {/* Sort */}
            <div className="relative " ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-200 shadow-sm bg-white px-2 py-2 text-xs w-full md:px-3  md:w-28"
              >
                Sort By <BiChevronDown />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 w-28 z-40 rounded border border-gray-200 shadow-sm bg-white">
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    SL ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    SL ↓
                  </button>
                </div>
              )}
            </div>

           
          </div>

          {/* Right Controls: Search + Pagination */}
          <div className="flex items-center gap-2 md:w-auto w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full md:w-64 rounded border border-gray-200 px-3 py-2 text-xs shadow-sm focus:outline-none"
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
        <ClassPermissionTable
          data={currentPermissions}
          setData={setPermissions}
        />
      </div>

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
            } transition-all duration-300`}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              Filter Permissions
            </h2>
            <div className="flex flex-col gap-3">
              {["Class", "Section", "Session"].map((field) => (
                <div key={field} className="relative">
                  <label className="absolute -top-2 left-2 px-1 text-[10px] bg-white text-blue-500">
                    {field}
                  </label>
                  <select className="w-full px-2 py-1.5 text-xs rounded border bg-transparent border-gray-300 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option>Select</option>
                    {field === "Class" && (
                      <>
                        <option>One</option>
                        <option>Two</option>
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
  );
}
