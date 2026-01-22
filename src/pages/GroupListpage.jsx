import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import { classGroupData } from "../data/classGroupData";
import ClassGroupTable from "../components/academic/ClassGroupTable.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function GroupListPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [groupFilter, setGroupFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [monthOpen, setMonthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  // import করা data থেকে state বানাও
  const [data, setData] = useState(classGroupData);

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const monthRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const buttonRef = useRef(null);

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

  const groupOptions = ["All Groups", "Group A", "Group B"];

  // Click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setMonthOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // New group form state (optional if you want to prefill)
 const groupFormFields = [
  {
    key: "class",
    label: "Class",
    type: "select",
    options: ["Class 1", "Class 2"],
    placeholder: "Select Class",
    required: true,
  },
  {
    key: "groupName",
    label: "Group Name",
    type: "text",
    placeholder: "Enter Group Name",
    required: true,
  },
];

  const handleAddGroup = (formData) => {
    const { class: selectedClass, groupName } = formData;

    // যদি class আগের data তে না থাকে, নতুন class create করে add করা
    const classExists = data.some((cls) => cls.class === selectedClass);

    if (classExists) {
      setData((prevData) =>
        prevData.map((cls) => {
          if (cls.class === selectedClass) {
            return {
              ...cls,
              groups: [
                ...cls.groups,
                {
                  name: groupName,
                  subjects: "",
                  totalStudents: 0,
                  monthly: [],
                },
              ],
            };
          }
          return cls;
        }),
      );
    } else {
      setData((prevData) => [
        ...prevData,
        {
          sl: prevData.length + 1,
          class: selectedClass,
          groups: [
            {
              name: groupName,
              subjects: "",
              totalStudents: 0,
              monthly: [],
            },
          ],
        },
      ]);
    }

    setIsAddGroupModalOpen(false); // modal close
    setCurrentPage(1); // pagination reset
  };

  // Refresh
  const handleRefresh = () => {
    setSelectedMonth("All");
    setSearch("");
    setGroupFilter("");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Filter + Sort + Month
  const filteredData = data
    .map((item) => {
      let groups = item.groups.filter((g) =>
        search ? g.name.toLowerCase().includes(search.toLowerCase()) : true,
      );

      if (groupFilter && groupFilter !== "All Groups") {
        groups = groups.filter((g) => g.name === groupFilter);
      }

      if (selectedMonth && selectedMonth !== "All") {
        groups = groups.map((g) => ({
          ...g,
          monthly: g.monthly.filter((m) => m.month === selectedMonth),
        }));
      }

      // Sort groups by name based on sortOrder
      groups.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });

      return { ...item, groups };
    })
    .filter((item) => item.groups.length > 0);

  // Pagination
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // Export Excel
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.flatMap((item) =>
      item.groups.flatMap((g) =>
        g.monthly.map((m) => ({
          Class: item.class,
          Group: g.name,
          Month: m.month,
          Subjects: g.subjects,
          TotalStudents: g.totalStudents,
        })),
      ),
    );
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Group List");
    writeFile(wb, "GroupList.xlsx");
  };

  // Export PDF
  const exportPDF = (data) => {
    if (!data.length) return;
    const doc = new jsPDF("landscape", "pt", "a4");
    const tableColumn = [
      "Sl",
      "Class",
      "Group",
      "Month",
      "Subjects",
      "Total Students",
    ];
    const tableRows = data.flatMap((item, i) =>
      item.groups.flatMap((g) =>
        g.monthly.map((m) => [
          i + 1,
          item.class,
          g.name,
          m.month,
          g.subjects,
          g.totalStudents,
        ]),
      ),
    );
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
      margin: { top: 20, left: 10, right: 10 },
    });
    doc.save("GroupList.pdf");
  };

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
      <div
        className={` p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-700"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Group list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>
              / Group list
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
           <div className="relative  flex-1 w-full md:w-28" ref={buttonRef}>
              <button
                ref={buttonRef}
                onClick={() => setIsOpen((p) => !p)}
                className={`px-3 h-8 text-xs border flex items-center justify-between w-full
          ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-100"
              : "bg-white border-gray-300 text-gray-700"
          }`}
              >
                Filter
              </button>

              {/* FilterDropdown */}
              <FilterDropdown
                title="Filter Sections"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                selected={groupFilter}
                setSelected={setGroupFilter}
                darkMode={darkMode}
                buttonRef={buttonRef}
                onApply={(filters) => console.log("Applied Filters:", filters)}
                fields={[
                  {
                    key: "class",
                    placeholder: "Select Class",
                    options: ["Class 1", "Class 2", "Class 3"],
                  },
                  {
                    key: "group",
                    placeholder: "Select Group",
                    options: ["Science", "Commerce", "Arts"],
                  },
                ]}
              />
            </div>

            {/* Export */}
            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center  border px-3 h-8 text-xs ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
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
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredData)}
                    className="block w-full px-3  py-1 text-left text-xs hover:bg-blue-50"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {/* Add Class */}
            {canEdit && (
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="w-full md:w-28 flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Add Group
              </button>
            )}
            <FormModal
              open={isAddGroupModalOpen}
              title="Add New Group"
              fields={groupFormFields}
              initialValues={{ class: "", groupName: "" }}
              onClose={() => setIsAddGroupModalOpen(false)}
              onSubmit={handleAddGroup}
            />
          </div>
        </div>

        {/* FILTER / SORT / MONTH */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 ">
        
           

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
          </div> */}

          {/* Right: Search + Pagination */}
          <div className="flex items-center gap-2 md:mt-0 w-full md:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search group..."
              className={`w-full md:w-64  border px-3 h-8 text-xs focus:outline-none ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100"
                  : "border-gray-200 bg-white text-gray-800"
              }`}
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
      <div
        className={` p-3 overflow-x-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <ClassGroupTable
          data={currentData}
          month={selectedMonth}
          groupFilter={groupFilter}
        />
      </div>
    </div>
  );
}
