import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassGroupTable from "../components/academic/ClassGroupTable.jsx";
import { classGroupData } from "../data/classGroupData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";

export default function SectionListPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [data, setData] = useState(classGroupData);
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
const [newSectionDefaults, setNewSectionDefaults] = useState({
  class: "",
  group: "",
  section: "",
});



  const monthRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);

  const months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // -------------------- Dynamic Options --------------------
  const classOptions = Array.from(new Set(classGroupData.map((c) => c.class)));
  const groupOptions = Array.from(
    new Set(classGroupData.flatMap((c) => c.groups.map((g) => g.name)))
  );
  const sectionOptions = Array.from(
    new Set(classGroupData.flatMap((c) => c.groups.map((g) => g.section)))
  );

  // -------------------- Outside Click --------------------
  useEffect(() => {
    const handler = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Refresh --------------------
  const handleRefresh = () => {
    setSelectedMonth("All");
    setSearch("");
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // -------------------- Filter + Sort + Search --------------------
 const filteredData = useMemo(() => {
  return data
    .filter((item) => (classFilter ? item.class === classFilter : true))
    .map((item) => {
      const groups = item.groups
        .map((g) => {
          if (groupFilter && g.name !== groupFilter) return null;
          if (sectionFilter && g.section !== sectionFilter) return null;
          let monthly = g.monthly;
          if (selectedMonth !== "All")
            monthly = g.monthly.filter((m) => m.month === selectedMonth);
          return { ...g, monthly };
        })
        .filter((g) => g && g.monthly.length > 0);
      return { ...item, groups };
    })
    .filter((item) => item.groups.length > 0)
    .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl))
    .filter((item) =>
      item.class.toLowerCase().includes(search.toLowerCase())
    );
}, [
  data,
  search,
  classFilter,
  groupFilter,
  sectionFilter,
  selectedMonth,
  sortOrder,
]);


  const handleAddSection = (formData) => {
  const { class: cls, group, section } = formData;

  // Check if class already exists
  const existingClassIndex = data.findIndex((c) => c.class === cls);

  const newGroup = {
    name: group,
    section: section,
    monthly: [], // initially empty
  };

  let newData = [...data];

  if (existingClassIndex > -1) {
    // Add to existing class
    newData[existingClassIndex].groups.push(newGroup);
  } else {
    // Add new class
    newData.push({
      sl: data.length + 1,
      class: cls,
      groups: [newGroup],
    });
  }

  setData(newData);       // update state
  setCurrentPage(1);      // reset pagination
};


  // -------------------- Pagination --------------------
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // -------------------- Export --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.flatMap((item) =>
      item.groups.map((g) => ({
        Class: item.class,
        Group: g.name,
        Section: g.section,
        Month: g.monthly.map((m) => m.month).join(", "),
        Details: JSON.stringify(g.monthly),
      }))
    );
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Section List");
    writeFile(wb, "SectionList.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF("landscape", "pt", "a4");
    const tableColumn = ["Sl", "Class", "Group", "Section", "Month"];
    const tableRows = [];
    data.forEach((item, index) => {
      item.groups.forEach((g) => {
        tableRows.push([
          index + 1,
          item.class,
          g.name,
          g.section,
          g.monthly.map((m) => m.month).join(", "),
        ]);
      });
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });
    doc.save("SectionList.pdf");
  };

  // -------------------- Styles --------------------
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-200";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={`rounded-md p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Section List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
               / Section List
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full flex items-center gap-1 rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between rounded border px-2 py-2 text-xs ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-sm ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredData)}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddSectionModalOpen(true)}
                className="w-full flex items-center gap-1 rounded bg-blue-600 text-white px-2 py-2 text-xs"
              >
                 Add section
              </button>
            )}
            <FormModal
  open={addSectionModalOpen}
  title="Add Section"
  initialValues={newSectionDefaults}
  onClose={() => setAddSectionModalOpen(false)}
  onSubmit={(formData) => {
    handleAddSection(formData);
    setAddSectionModalOpen(false);
  }}
  fields={[
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classOptions.map((c) => ({ label: c, value: c })),
      required: true,
      placeholder: "Select Class",
    },
    {
      name: "group",
      label: "Group",
      type: "text",
      required: true,
      placeholder: "Group Name",
    },
    {
      name: "section",
      label: "Section",
      type: "text",
      required: true,
      placeholder: "Section Name",
    },
  ]}
/>

          </div>
        </div>

        {/* Filters + Sort + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            {/* Month Dropdown */}
            <div ref={monthRef} className="relative flex-1">
              <button
                onClick={() => setMonthOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                {selectedMonth}{" "}
                <BiChevronDown
                  className={`${
                    monthOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {monthOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
                >
                  {months.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setCurrentPage(1);
                        setMonthOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                        selectedMonth === m
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : darkMode
                          ? "text-gray-200"
                          : "text-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                Filter{" "}
                <BiChevronDown
                  className={`${
                    filterOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {filterOpen && (
                <div
                  className={`absolute top-full z-50 mt-1 w-52 rounded border   left-1/2 -translate-x-1/2
    md:left-0 md:translate-x-0 max-h-40 overflow-y-auto shadow-md p-3 space-y-2 ${borderClr} ${dropdownBg}`}
                >
                  {/* Class */}
                  <div className="relative">
                    <button
                      onClick={() => setClassOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${borderClr} ${inputBg}`}
                    >
                      {classFilter || "All Classes"} <BiChevronDown />
                    </button>
                    {classOpen &&
                      classOptions.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setClassFilter(c);
                            setClassOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            classFilter === c
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                  </div>

                  {/* Group */}
                  <div className="relative">
                    <button
                      onClick={() => setGroupOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${borderClr} ${inputBg}`}
                    >
                      {groupFilter || "All Groups"} <BiChevronDown />
                    </button>
                    {groupOpen &&
                      groupOptions.map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setGroupFilter(g);
                            setGroupOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            groupFilter === g
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                  </div>

                  {/* Section */}
                  <div className="relative">
                    <button
                      onClick={() => setSectionOpen((prev) => !prev)}
                      className={`w-full border px-2 py-1 text-xs rounded flex justify-between items-center ${borderClr} ${inputBg}`}
                    >
                      {sectionFilter || "All Sections"} <BiChevronDown />
                    </button>
                    {sectionOpen &&
                      sectionOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSectionFilter(s);
                            setSectionOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-600 ${
                            sectionFilter === s
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                  </div>
                   <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
                
              )}
            </div>

            {/* Sort */}
           <div className="flex-1">
             <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`w-full md:w-28 flex items-center  gap-1 rounded border px-2 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
            >
              Sort {sortOrder === "asc" ? "↑" : "↓"}
            </button>
           </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search class..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs focus:outline-none ${borderClr} ${inputBg}`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={`rounded p-2 overflow-x-auto ${cardBg}`}>
        <ClassGroupTable data={currentData} month={selectedMonth} />
      </div>
    </div>
  );
}
