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

export default function GuardianList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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
  const buttonClass = `flex items-center   w-28 rounded   px-3 py-2 text-xs shadow-sm hover:bg-gray-100 ${
    darkMode
      ? " border bg-gray-700 border-gray-500"
      : "border  bg-white border-gray-200"
  }`;

  return (
    <div className="p-3 space-y-4 min-h-screen">
      {/* ================= HEADER ================= */}

      <div
        className={`rounded-md p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-700"
        }`}
      >
        {/* Title */}
        <div className="md:flex md:items-center md:justify-between gap-3">
          {/* Title + Breadcrumb */}
          <div className="md:mb-3">
            <h1 className="text-base font-bold">Guardians List</h1>
            <nav className="text-sm w-full truncate">
              <Link
                to="/school/dashboard"
                className="hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              / Guardian List
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
                <div  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${
                    darkMode
                      ? "border-gray-500 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}>
                  <button onClick={() => exportPDF(filteredGuardians)} className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export PDF
                  </button>
                  <button onClick={() => exportPDF(filteredGuardians)} className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100">
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/addguardian")}
                className="flex items-center justify-center gap-1 w-28 rounded bg-blue-600 px-3 py-2 text-xs text-white shadow-sm hover:bg-blue-700"
              >
                + Add Guardian
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
            className={`flex items-center  gap-1 w-full rounded border  px-2 py-2 text-xs  shadow-sm ${
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
              className={`flex items-center justify-between   w-full rounded border  px-2 py-2 text-xs  shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-800"
              }`}
            >
              Export <BiChevronDown />
            </button>
            {exportOpen && (
              <div
                className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredGuardians)}
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredGuardians)}
                  className="w-full px-2 py-1 text-left text-xs hover:bg-gray-100"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/addguardian")}
              className="flex items-center  gap-1 w-full rounded bg-blue-600 px-2 py-2 text-xs text-white shadow-sm"
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
                onClick={() => setDateOpen(!dateOpen)}
                className={`flex items-center  md:w-28 justify-between w-full rounded border  px-2 py-2 text-xs  shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                {selectedDate} <BiChevronDown className="ml-1" />
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
                      className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                    >
                      <span>{opt.label}</span>
                      <BiChevronRight size={12} />
                    </div>
                  ))}
                  <div
                    onClick={() => setShowSession(!showSession)}
                    className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                  >
                    <span>Session</span>
                    <BiChevronRight
                      size={14}
                      className={`${
                        showSession ? "rotate-90" : ""
                      } transition-transform`}
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
                        className="w-full cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 transition"
                      >
                        <span>{s}</span>
                        <BiChevronRight size={14} />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative " ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center  md:w-28 justify-between w-full rounded border  px-2 py-2 text-xs  shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Filter <BiChevronDown />
              </button>

              {filterOpen && (
                <div
                  className="fixed inset-0 z-50 flex mt-4 md:mb-20 items-center justify-center md:-left-[78px] p-6"
                  onClick={() => setFilterOpen(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`${
                      darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-white text-gray-800"
                    } w-8/12 md:w-96 p-3 md:p-5 max-h-[80vh] overflow-y-auto rounded-md shadow-sm border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    } transition-all duration-300`}
                  >
                    <h2
                      className={`text-lg md:text-xl mx-2 font-semibold mb-3 text-left ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Filter Guardians
                    </h2>
                    {/* Example Filter selects */}
                    <div className="flex mx-2 flex-col gap-3">
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Class
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>One</option>
                          <option>Two</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Group
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>Science</option>
                          <option>Arts</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Section
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>A</option>
                          <option>B</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label
                          className={`absolute -top-2 left-2 px-1 text-[10px] ${
                            darkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-white text-blue-500"
                          }`}
                        >
                          Session
                        </label>
                        <select
                          className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent ${
                            darkMode
                              ? "border-gray-400 text-gray-100"
                              : "border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        >
                          <option>Select</option>
                          <option>2024-25</option>
                          <option>2025-26</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex mx-2 flex-wrap gap-2 justify-end pt-2 mt-1">
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

            {/* Sort */}
            <div className="relative " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28 justify-between w-full rounded border  px-2 py-2 text-xs  shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort By <BiChevronDown className="ml-1" />
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-[106px] z-40 border rounded ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  } shadow-sm left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 mt-2 md:mt-0">
            <input
              type="text"
              placeholder="Search by guardian name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-8 px-2 md:px-3 w-full text-xs rounded border shadow-sm ${
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
      <div className={`p-2 ${darkMode ? "bg-gray-900" : "bg-white"} rounded`}>
        <GuardianTable data={currentGuardians} setData={setGuardians} />
      </div>
    </div>
  );
}
