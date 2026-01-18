import { useState, useRef, useEffect } from "react";
import { studentData } from "../data/studentData"; // guardian info is inside studentData
import GuardianTable from "../components/guardian/GuardianTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FiRefreshCw, FiFilter } from "react-icons/fi";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function GuardianList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [appliedFilters, setAppliedFilters] = useState({
    className: "",
    group: "",
    section: "",
    session: "",
    guardianDivision: "",
    guardianDistrict: "",
  });

  const [guardians, setGuardians] = useState(studentData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const guardiansPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
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

  // unique value extractor
  const getUniqueValues = (data, path) => {
    return [
      ...new Set(
        data
          .map((item) => path.split(".").reduce((acc, key) => acc?.[key], item))
          .filter(Boolean)
      ),
    ];
  };
  const classOptions = getUniqueValues(studentData, "className");
  const groupOptions = getUniqueValues(studentData, "group");
  const sectionOptions = getUniqueValues(studentData, "section");
  const sessionOptions = getUniqueValues(studentData, "session");

  // guardian based
  const guardianDivisionOptions = getUniqueValues(
    studentData,
    "guardian.division"
  );
  const guardianDistrictOptions = getUniqueValues(
    studentData,
    "guardian.district"
  );

  // Close dropdowns on outside click
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

  // Filtering and sorting guardians
  const filteredGuardians = guardians
    .filter((g) =>
      g.guardian?.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((g) => {
      if (!g.joinDate) return true;
      const today = new Date();
      const joinDate = new Date(g.joinDate);

      if (selectedDate === "Today")
        return joinDate.toDateString() === today.toDateString();
      if (selectedDate === "Last 7 Days") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return joinDate >= weekAgo && joinDate <= today;
      }
      if (selectedDate === "This Month")
        return (
          joinDate.getMonth() === today.getMonth() &&
          joinDate.getFullYear() === today.getFullYear()
        );
      if (sessionKeys.includes(selectedDate)) return g.session === selectedDate;
      return true;
    })
    .sort((a, b) => {
      const d1 = new Date(a.joinDate || 0);
      const d2 = new Date(b.joinDate || 0);
      return sortOrder === "oldest" ? d1 - d2 : d2 - d1;
    });

  const totalGuardians = filteredGuardians.length;
  const totalPages = Math.ceil(totalGuardians / guardiansPerPage);
  const indexOfLastGuardian = currentPage * guardiansPerPage;
  const indexOfFirstGuardian = indexOfLastGuardian - guardiansPerPage;
  const currentGuardians = filteredGuardians.slice(
    indexOfFirstGuardian,
    indexOfLastGuardian
  );

  const filterFields = [
    {
      key: "className",
      placeholder: "All Classes",
      options: classOptions,
    },
    {
      key: "group",
      placeholder: "All Groups",
      options: groupOptions,
    },
    {
      key: "section",
      placeholder: "All Sections",
      options: sectionOptions,
    },
    {
      key: "session",
      placeholder: "All Sessions",
      options: sessionOptions,
    },
  ];

  // ---------- Export ----------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((g, i) => ({
      Sl: i + 1,
      Guardian: g.guardian?.name,
      Phone: g.guardian?.phone || "-",
      Email: g.guardian?.email || "-",
      Class: g.class || "-",
      Section: g.section || "-",
      Session: g.session || "-",
      JoinDate: g.joinDate || "-",
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Guardians");
    writeFile(wb, "Guardians.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return;
    const doc = new jsPDF("landscape", "pt", "a4");
    const columns = [
      "Sl",
      "Guardian",
      "Phone",
      "Email",
      "Class",
      "Section",
      "Session",
      "Join Date",
    ];
    const rows = data.map((g, i) => [
      i + 1,
      g.guardian?.name,
      g.guardian?.phone || "-",
      g.guardian?.email || "-",
      g.class || "-",
      g.section || "-",
      g.session || "-",
      g.joinDate || "-",
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
    });
    doc.save("Guardians.pdf");
  };

  // Button base class for exact StudentList style
  const buttonClass = `flex items-center   w-28   px-3 h-8 text-xs hover:bg-gray-100 ${
    darkMode
      ? " border bg-gray-700 border-gray-500"
      : "border  bg-white border-gray-200"
  }`;
  const cardBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* ================= HEADER ================= */}

      <div
        className={` p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-700"
        }`}
      >
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between gap-3">
          {/* Title + Breadcrumb */}
          <div className="md:mb-3">
            <h1 className="text-base font-semibold">Guardians List</h1>
            <nav className="text-sm w-full truncate">
              <Link
                to="/school/dashboard"
                className="hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              / Guardian
            </nav>
          </div>

          {/* Buttons (Desktop) */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setGuardians(studentData);
                setSearch("");
              }}
              className={buttonClass}
            >
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
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28  border  ${
                    darkMode
                      ? "border-gray-500 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredGuardians)}
                    className="w-full px-3 h-6  text-left text-xs hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportPDF(filteredGuardians)}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addguardian")}
                className="flex items-center justify-center  w-28  bg-blue-600 px-3 h-8 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                Guardian
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={() => {
              setGuardians(studentData);
              setSearch("");
            }}
            className={`flex items-center   w-full  border  px-2 py-2 text-xs   ${
              darkMode
                ? "border-gray-500 bg-gray-700 text-gray-100"
                : "border-gray-200 bg-white text-gray-800"
            }`}
          >
            Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`flex items-center justify-between   w-full  border  px-3 h-8 text-xs  ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-800"
              }`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28  border  ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredGuardians)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredGuardians)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addguardian")}
              className="flex items-center  w-full bg-blue-600 px-3 h-8 text-xs text-white "
            >
              Guardian
            </button>
          )}
        </div>

        {/* Controls: Date, Filter, Sort + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto items-center">
            {/* Date */}
            <div className="relative " ref={dateDropdownRef}>
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
                    className="w-full cursor-pointer px-3  text-xs flex items-center hover:bg-gray-100  transition"
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
                            className="w-full cursor-pointer px-3 py-1  text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
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

            {/* Filter */}
            <div className="relative " ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Guardians"
                fields={filterFields}
                selected={appliedFilters}
                setSelected={setAppliedFilters}
                darkMode={darkMode}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setAppliedFilters(values);
                }}
                buttonRef={filterRef}
              />
            </div>

            {/* Sort */}
            <div className="relative " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28 justify-between w-full  border  px-3 h-8 text-xs   ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-full z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }  left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96  md:mt-0">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 px-3 w-full text-xs  border  ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

      {/* Table */}
      <div className={`p-2 ${darkMode ? "bg-gray-900" : "bg-white"} `}>
        <GuardianTable data={currentGuardians} setData={setGuardians} />
      </div>
    </div>
  );
}
