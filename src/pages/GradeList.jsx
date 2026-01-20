import { useState, useRef, useEffect, useMemo } from "react";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import FormModal from "../components/FormModal.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { gradeData } from "../data/gradeData.js";
import { Link } from "react-router-dom";
import FilterDropdown from "../components/common/FilterDropdown.jsx";

export default function GradeList() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  const [formValues, setFormValues] = useState({
    Class: "",
    Group: "",
    Subject: "",
    LetterGrade: "",
    MaxNumber: "",
    MinNumber: "",
    GradePoint: "",
  });

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,

      // 🔁 dependency reset
      ...(name === "Class" ? { Group: "", Subject: "" } : {}),
      ...(name === "Group" ? { Subject: "" } : {}),
    }));
  };

  // -------------------- State --------------------

  const [filters, setFilters] = useState({
    class: "",
    group: "",
  });
  const [data, setData] = useState(gradeData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  // Temporary (UI selection only)
  const [tempClass, setTempClass] = useState(null);
  const [tempGroup, setTempGroup] = useState(null);

  // -------------------- Dropdown states --------------------
  const [classOpen, setClassOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  // -------------------- Dropdowns --------------------

  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Add these states at the top

  const [statusOpen, setStatusOpen] = useState(false);

  const classRef = useRef(null);
  const groupRef = useRef(null);
  const exportRef = useRef(null);

  const filterRef = useRef(null);
  const statusRef = useRef(null);
  const sortRef = useRef(null);

  // -------------------- Outside Click --------------------
  useEffect(() => {
    const handler = (e) => {
      if (classRef.current && !classRef.current.contains(e.target))
        setClassOpen(false);
      if (groupRef.current && !groupRef.current.contains(e.target))
        setGroupOpen(false);
      if (!filterRef.current?.contains(e.target)) {
        setFilterOpen(false);
        setClassOpen(false);
        setGroupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Filter Options --------------------
  const classOptions = useMemo(() => {
    return Array.from(new Set(data.map((i) => i.Class)));
  }, [data]);

  // ===== GROUP OPTIONS (modal dependent) =====
  const groupOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((i) =>
            formValues.class ? i.Class === formValues.class : true,
          )
          .map((i) => i.Group),
      ),
    );
  }, [data, formValues.class]);

  // ===== SUBJECT OPTIONS (modal dependent) =====
  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter(
            (i) =>
              (!formValues.class || i.Class === formValues.class) &&
              (!formValues.group || i.Group === formValues.group),
          )
          .map((i) => i.Subject),
      ),
    );
  }, [data, formValues.class, formValues.group]);

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
  ];

  const exportExcel = (data) => {
    if (!data.length) return;

    const wsData = data.map((item, idx) => ({
      SL: idx + 1,
      Class: item.Class,
      Group: item.Group,
      Subject: item.Subject,
      Grade: item.LetterGrade,
      "Max Marks": item.MaxNumber,
      "Min Marks": item.MinNumber,
      "Grade Point": item.GradePoint,
    }));

    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Grades");
    writeFile(wb, "GradeData.xlsx");
  };
  const exportPDF = (data) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF("landscape", "pt", "a4");

    const tableColumn = [
      "SL",
      "Class",
      "Group",
      "Subject",
      "Grade",
      "Max Marks",
      "Min Marks",
      "Grade Point",
    ];

    const tableRows = data.map((item, idx) => [
      idx + 1,
      item.Class,
      item.Group,
      item.Subject,
      item.LetterGrade,
      item.MaxNumber,
      item.MinNumber,
      item.GradePoint,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });

    doc.save("GradeData.pdf");
  };
  // -------------------- Filter + Search + Sort --------------------
  const filteredData = useMemo(() => {
    let temp = data
      .filter((item) => (classFilter ? item.Class === classFilter.value : true))
      .filter((item) => (groupFilter ? item.Group === groupFilter.value : true))
      .filter((item) =>
        search
          ? item.Subject.toLowerCase().includes(search.toLowerCase())
          : true,
      );

    temp.sort((a, b) =>
      sortOrder === "newest"
        ? b.Class.localeCompare(a.Class)
        : a.Class.localeCompare(b.Class),
    );

    return temp;
  }, [data, classFilter, groupFilter, search, sortOrder]);

  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // -------------------- Refresh --------------------
  const handleRefresh = () => {
    setClassFilter("");
    setGroupFilter("");
    setSearch("");
    setSortOrder("newest");
    setCurrentPage(1);
    setExportOpen("");
    setFilterOpen("");
  };

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "Sl" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Subject", label: "Subject" },
    { key: "LetterGrade", label: "Grade" },
    { key: "MaxNumber", label: "Max mark" },
    { key: "MinNumber", label: "Min mark" },
    { key: "GradePoint", label: " Point no" },
  ];

  // -------------------- Add Class Modal --------------------
  const addGradeFields = [
    {
      key: "class",
      type: "select",
      placeholder: "Class",
      options: classOptions,
    },
    {
      key: "group",
      type: "select",
      placeholder: "Group",
      options: groupOptions,
    },
    {
      key: "subject",
      type: "select",
      placeholder: "Subject",
      options: subjectOptions,
    },
    {
      key: "letterGrade",
      type: "text",
      placeholder: " Grade name",
    },
    {
      key: "maxNumber",
      type: "number",
      placeholder: "Max mark",
    },
    {
      key: "minNumber",
      type: "number",
      placeholder: "Min mark",
    },
    {
      key: "gradePoint",
      type: "number",
      placeholder: " Point no",
    },
  ];

  const handleAddClass = (newEntry) => {
    setData((prev) => [...prev, newEntry]);
    setAddClassOpen(false);
    setCurrentPage(1);
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
      <div className={` p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Grade List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Grade List
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
             <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Grade list"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");
                 

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
                className={`w-full flex items-center border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border  ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => exportPDF(filteredData)}
                    className="block w-full px-3 py-1  text-left text-xs hover:bg-blue-50"
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
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Grade
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Grade"
              fields={addGradeFields}
              initialValues={{
                Class: "",
                Group: "",
                Subject: "",
                LetterGrade: "",
                MaxNumber: "",
                MinNumber: "",
                GradePoint: "",
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={(newEntry) => {
                setData((prev) => [...prev, newEntry]);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between  gap-2 md:gap-0">
          

          
           

            {/* Sort Button 
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
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
        <ReusableTable
          columns={columns}
          data={currentData.map((item, idx) => ({
            ...item,
            id: (currentPage - 1) * perPage + idx + 1,
            SL: (currentPage - 1) * perPage + idx + 1,
          }))}
          showActionKey={canEdit}
        />
      </div>
    </div>
  );
}
