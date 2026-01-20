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
import FilterDropdown from "../components/common/FilterDropdown.jsx";

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
  const [filterValues, setFilterValues] = useState({
    class: "",
    group: "",
    section: "",
  });

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
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
  const sortRef = useRef(null);

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
    new Set(classGroupData.flatMap((c) => c.groups.map((g) => g.name))),
  );
  const sectionOptions = Array.from(
    new Set(classGroupData.flatMap((c) => c.groups.map((g) => g.section))),
  );
  const filterFields = [
    {
      key: "class",
      placeholder: "Select Class",
      options: classOptions,
    },
    {
      key: "group",
      placeholder: "Select Group",
      options: groupOptions,
    },
    {
      key: "section",
      placeholder: "Select Section",
      options: sectionOptions,
    },
  ];

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
        item.class.toLowerCase().includes(search.toLowerCase()),
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

    setData(newData); // update state
    setCurrentPage(1); // reset pagination
  };

  // -------------------- Pagination --------------------
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
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
      })),
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
      <div className={`p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Section list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Section
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                Filter{" "}
              </button>

              <FilterDropdown
                title="Filter section"
                fields={filterFields}
                selected={filterValues}
                setSelected={setFilterValues}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");
                  setSectionFilter(values.section || "");
                  setCurrentPage(1);
                  setFilterOpen(false);
                }}
                darkMode={darkMode}
                buttonRef={filterRef}
              />
            </div>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredData)}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAddSectionModalOpen(true)}
                className="w-full flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                section
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
                  key: "class",
                  placeholder: "Select Class",
                  type: "select",
                  options: classOptions,
                },
                {
                  key: "group",
                  placeholder: "Select Group",
                  type: "select",
                  options: groupOptions,
                },
                {
                  key: "section",
                  placeholder: "Section Name",
                  type: "text",
                },
              ]}
            />
          </div>
        </div>

        {/* Filters + Sort + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
         
           

            {/* Sort 
            <div className="relative flex-1 " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
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
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>*/}

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search class..."
              className={`w-full md:w-64  border px-3 h-8 text-xs focus:outline-none ${borderClr} ${inputBg}`}
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
      <div className={` p-3 overflow-x-auto ${cardBg}`}>
        <ClassGroupTable data={currentData} month={selectedMonth} />
      </div>
    </div>
  );
}
