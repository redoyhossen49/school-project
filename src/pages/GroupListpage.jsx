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
  const [groupFilter, setGroupFilter] = useState({
    className: "",
    group: "",
  });

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
  const classOptions = [...new Set(data.map((item) => item.class))].filter(
    Boolean,
  );

  const groupFormFields = [
    {
      key: "selectedClass", // ✅ use key
      label: "Class",
      type: "select",
      options: classOptions, // no need for fallback here
      placeholder: "Select Class",
      required: true,
    },
    {
      key: "groupName", // ✅ use key
      label: "Group Name",
      type: "text",
      placeholder: "Enter Group Name",
      required: true,
    },
  ];

  const handleAddGroup = (formData) => {
    const selectedClass = formData.selectedClass;
    const groupName = formData.groupName;

    if (!selectedClass || !groupName) {
      alert("Please fill all required fields");
      return;
    }

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
                  section: "", // you can set empty or default
                  subjects: "",
                  totalStudents: 0,
                  totalPayable: 0,
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
          class: selectedClass, // 👍 Use `class`
          groups: [
            {
              name: groupName,
              section: "",
              subjects: "",
              totalStudents: 0,
              totalPayable: 0,
              monthly: [],
            },
          ],
        },
      ]);
    }

    setIsAddGroupModalOpen(false); // modal close
    setCurrentPage(1); // pagination reset
    alert("Group added successfully ✅");
  };

  // Filter + Sort + Month
  const filteredData = data
    .map((item) => {
      // class filter
      if (groupFilter.className) {
        if (item.class !== groupFilter.className) return null;
      }

      let groups = [...item.groups];

      // group filter
      if (groupFilter.group) {
        groups = groups.filter((g) => g.name === groupFilter.group);
      }

      // search
      if (search) {
        groups = groups.filter((g) =>
          g.name.toLowerCase().includes(search.toLowerCase()),
        );
      }

      return groups.length ? { ...item, groups } : null;
    })
    .filter(Boolean);

  // Pagination
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter, search]);

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
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                selected={groupFilter}
                setSelected={setGroupFilter}
                onApply={() => setIsOpen(false)}
                fields={[
                  {
                    key: "className",
                    placeholder: "Select Class",
                    options: classGroupData.map((d) => d.class),
                  },
                  {
                    key: "group",
                    placeholder: "Select Group",
                    options: ["Group A", "Group B"],
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

            {/* Add Class / Sort By */}
            {canEdit ? (
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="w-full md:w-28 flex items-center bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Add Group
              </button>
            ) : (
              <div className="relative flex-1 w-full md:w-28" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center md:w-28 w-full border px-3 h-8 text-xs ${darkMode ? "border-gray-500 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
                >
                  Sort By
                </button>
                {sortOpen && (
                  <div
                    className={`absolute mt-2 w-full z-40 border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"} left-0`}
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
            )}
            <FormModal
              open={isAddGroupModalOpen}
              title="Add New Group"
              fields={groupFormFields}
              initialValues={{ selectedClass: "", groupName: "" }}
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
