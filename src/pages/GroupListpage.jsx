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

  const monthRef = useRef(null);
  const exportRef = useRef(null);
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
      name: "class",
      label: "Class",
      type: "select",
      options: classGroupData.map((c) => ({ value: c.class, label: c.class })),
      required: true,
      placeholder: "Select Class",
    },
    {
      name: "groupName",
      label: "Group Name",
      type: "text",
      required: true,
      placeholder: "Enter Group Name",
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
        })
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
        search ? g.name.toLowerCase().includes(search.toLowerCase()) : true
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
    currentPage * perPage
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
        }))
      )
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
        ])
      )
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
        className={`rounded shadow-sm p-3 space-y-3 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Group List</h2>
            <p className="text-xs text-blue-400">
              <Link to="/school/dashboard" className="hover:text-blue-700">
                Dashboard
              </Link>
              / Group List
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${
                darkMode
                  ? "border-gray-500 bg-gray-700"
                  : "border-gray-200 bg-white"
              }`}
            >
              Refresh
            </button>

            {/* Export */}
            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center justify-between gap-1 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
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

            {/* Add Class */}
            {canEdit && (
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="w-full md:w-28 flex items-center rounded bg-blue-600 text-white px-2 py-2 text-xs"
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
          {/* Left: Month / Group / Sort */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            {/* Month */}
            <div ref={monthRef} className="relative w-full md:w-28">
              <button
                onClick={() => setMonthOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
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

            {/* Group Filter */}
            {/* Group Filter with custom icon */}
            <div className="relative w-full md:w-28">
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`appearance-none w-full border outline-0 shadow-sm rounded pl-2 py-2 pr-8  text-xs ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                {groupOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {/* Custom down icon */}
              <BiChevronDown
                className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                }`}
              />
            </div>

            {/* Sort */}
            <div ref={sortRef} className="relative w-full md:w-28">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className={`w-full flex items-center justify-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort {sortOrder === "asc" ? "↑" : "↓"}
              </button>
              {/*  <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${
                  darkMode
                    ? "border-gray-500 bg-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                Sort By{" "}
                <BiChevronDown
                  className={`${
                    sortOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {sortOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full md:w-28 rounded border shadow-md bg-white dark:bg-gray-700">
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                      sortOrder === "asc"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    First ↑
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                      sortOrder === "desc"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Last ↓
                  </button>
                </div>
              )} */}
            </div>
          </div>

          {/* Right: Search + Pagination */}
          <div className="flex items-center gap-2 md:mt-0 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search group..."
              className={`w-full md:w-64 rounded border px-3 py-2 text-xs focus:outline-none shadow-sm ${
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
        className={`rounded p-2 overflow-x-auto ${
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
