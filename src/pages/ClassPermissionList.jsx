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

  const [selectedSection, setSelectedSection] = useState("All"); // <-- corrected initial value
  const [sectionOpen, setSectionOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOpen, setFilterOpen] = useState(false);

  const sectionRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const sectionOptions = ["All", "Morning", "Day", "Evening"];

  // ===== Close dropdowns on outside click =====
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

  // ===== Filter + Sort + Search =====
  const filteredPermissions = classPermissionData
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) =>
      selectedSection === "All" ? true : p.section === selectedSection
    )
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));

  const totalPages = Math.ceil(filteredPermissions.length / permissionsPerPage);
  const currentPermissions = filteredPermissions.slice(
    (currentPage - 1) * permissionsPerPage,
    currentPage * permissionsPerPage
  );

  // ===== Refresh Handler =====
  const handleRefresh = () => {
    setPermissions(classPermissionData); // Reset to full data
    setSearch(""); // Clear search
    setCurrentPage(1); // Reset page
    setSelectedSection("All"); // Reset section
    setSortOrder("asc"); // Reset sort
    setFilterOpen(false); // Close filter modal
  };

  // Button base class for exact StudentList style
  const buttonClass = `flex items-center justify-between w-28 rounded border px-3 py-2 text-xs shadow-sm ${
    darkMode
      ? "border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
      : "border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
  }`;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      } p-3 min-h-screen space-y-4`}
    >
      {/* ========== HEADER ========== */}
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-md p-3 space-y-4`}
      >
        <div className="md:flex md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{`Class Permission List`}</h2>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-500"
              } text-xs`}
            >
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>{" "}
              / Class Permission List
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button onClick={handleRefresh} className={buttonClass}>
              Refresh
            </button>

            <div className="relative w-28" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={buttonClass}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } absolute top-full left-0 mt-1 w-28 rounded border shadow-sm`}
                >
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-blue-50">
                    Export PDF
                  </button>
                  <button className="w-full px-2 py-1 text-left text-sm hover:bg-blue-50">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addclasspermission")}
                className="flex items-center justify-center gap-1 w-28 rounded px-3 py-2 text-xs shadow-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Permission
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button onClick={handleRefresh} className={buttonClass + " w-full"}>
            Refresh
          </button>
          <button
            onClick={() => setExportOpen((prev) => !prev)}
            className={buttonClass + " w-full"}
          >
            Export <BiChevronDown />
          </button>
          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addclasspermission")}
              className="flex items-center justify-center gap-1 w-full rounded px-3 py-2 text-xs shadow-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              Permission
            </button>
          )}
        </div>

        {/* ========== CONTROLS: Section, Sort, Filter, Search + Pagination ========== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            {/* Section Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={sectionRef}>
              <button
                onClick={() => setSectionOpen((prev) => !prev)}
                 className={`w-full md:w-28 flex items-center justify-between rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {selectedSection} <BiChevronDown />
              </button>
              {sectionOpen && (
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } absolute mt-2 w-40 z-40 rounded border shadow-sm`}
                >
                  {sectionOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSection(opt);
                        setSectionOpen(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex justify-between"
                    >
                      {opt} <BiChevronRight size={12} className="ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>

           <div className="relative flex-1 md:flex-none">
             {/* Filter Button */}
            <button onClick={() => setFilterOpen(true)}  className={`w-full md:w-28 flex items-center justify-between rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}>
              Filter <BiChevronDown size={12}  />
            </button>
           </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                 className={`w-full md:w-28 flex items-center justify-between rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sort By <BiChevronDown  />
              </button>
              {sortOpen && (
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } absolute top-full left-0 mt-1 w-28 z-40 rounded border shadow-sm`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-blue-50"
                  >
                    SL ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-blue-50"
                  >
                    SL ↓
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:w-auto w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } w-full md:w-64 rounded px-3 py-2 text-xs shadow-sm focus:outline-none`}
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
        } rounded-md p-2 overflow-x-auto`}
      >
        <ClassPermissionTable
          data={currentPermissions}
          setData={setPermissions}
          darkMode={darkMode}
        />
      </div>

      {/* ========== FILTER MODAL ========== */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-white text-gray-800 border-gray-200"
            } w-8/12 md:w-96 p-6 max-h-[80vh] overflow-y-auto rounded shadow-sm transition-all duration-300`}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              Filter Permissions
            </h2>
            <div className="flex flex-col gap-3">
              {["Class", "Section", "Session"].map((field) => (
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
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    } w-full px-2 py-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  >
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
                className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium border rounded ${darkMode?"bg-gray-700 border-gray-500":"border-gray-200 bg-white"} hover:bg-gray-300`}
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
