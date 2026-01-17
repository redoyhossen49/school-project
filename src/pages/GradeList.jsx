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
  // Dynamic Class options
  // ===== CLASS OPTIONS =====
  const classOptions = useMemo(() => {
    return Array.from(new Set(data.map((i) => i.Class))).map((c) => ({
      label: c,
      value: c,
    }));
  }, [data]);

  // ===== GROUP OPTIONS (modal dependent) =====
  const groupOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((i) =>
            formValues.Class ? i.Class === formValues.Class : true
          )
          .map((i) => i.Group)
      )
    ).map((g) => ({ label: g, value: g }));
  }, [data, formValues.Class]);

  // ===== SUBJECT OPTIONS (modal dependent) =====
  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter(
            (i) =>
              (!formValues.Class || i.Class === formValues.Class) &&
              (!formValues.Group || i.Group === formValues.Group)
          )
          .map((i) => i.Subject)
      )
    ).map((s) => ({ label: s, value: s }));
  }, [data, formValues.Class, formValues.Group]);

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
          : true
      );

    temp.sort((a, b) =>
      sortOrder === "newest"
        ? b.Class.localeCompare(a.Class)
        : a.Class.localeCompare(b.Class)
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
    currentPage * perPage
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
    { key: "SL", label: "SL" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Subject", label: "Subject" },
    { key: "LetterGrade", label: "Grade" },
    { key: "MaxNumber", label: "Max Marks" },
    { key: "MinNumber", label: "Min Marks" },
    { key: "GradePoint", label: "Grade Point" },
  ];

  // -------------------- Add Class Modal --------------------
  const addGradeFields = [
    {
      name: "Class",
      label: "Select Class",
      type: "select",
      placeholder: "Choose a class",
      options: classOptions,
      required: true,
    },
    {
      name: "Group",
      label: "Select Group",
      type: "select",
      placeholder: "Choose a group",
      options: groupOptions,
      required: true,
    },
    {
      name: "Subject",
      label: "Select Subject",
      type: "select",
      placeholder: "Choose a subject",
      options: subjectOptions,
      required: true,
    },
    {
      name: "LetterGrade",
      label: "Letter Grade",
      type: "text",
      placeholder: "Type Grade",
      required: true,
    },
    {
      name: "MaxNumber",
      label: "Max Marks",
      type: "number",
      placeholder: "MaxMarks",
      required: true,
    },
    {
      name: "MinNumber",
      label: "Min Marks",
      type: "number",
      placeholder: "MinMarks",
      required: true,
    },
    {
      name: "GradePoint",
      label: "Grade Point",
      type: "number",
      placeholder: "Grade Point",
      required: true,
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
      <div className={`rounded-md p-3 space-y-3 ${cardBg}`}>
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
                onClick={() => setAddClassOpen(true)}
                className="w-full flex items-center gap-1 rounded bg-blue-600 text-white px-2 py-2 text-xs"
              >
                Add grade
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-3 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            <div ref={statusRef} className="relative flex-1">
              <button
                onClick={() => setStatusOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                {classFilter?.label || "Select Class"}
                <BiChevronDown
                  className={`${
                    statusOpen ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>

              {statusOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full rounded border shadow-md max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
                >
                  {classOptions.map((cls) => (
                    <button
                      key={cls.value}
                      onClick={() => {
                        setClassFilter(cls); // 🔹 filter apply instantly
                        setGroupFilter(""); // 🔹 reset dependent filter
                        setCurrentPage(1); // 🔹 pagination reset
                        setStatusOpen(false); // 🔹 close dropdown
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                        classFilter?.value === cls.value
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : darkMode
                          ? "text-gray-200"
                          : "text-gray-700"
                      }`}
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
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
                  className={`absolute top-full z-50 mt-1 w-52 rounded border left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 max-h-64 overflow-y-auto shadow-md py-4 px-6 space-y-2 ${borderClr} ${dropdownBg}`}
                >
                  <div className="flex flex-col gap-2">
                    {/* Class Filter */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setClassOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          classFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {tempClass?.label || "Select Class"}

                        <BiChevronDown
                          className={`${
                            classOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {classOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {classOptions.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => {
                                setTempClass(c); // 👈 only UI change
                                setTempGroup(null); // reset group
                                setClassOpen(false); // 👈 close class dropdown
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                tempClass?.value === c.value
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : darkMode
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Group Filter */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setGroupOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          groupFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {tempGroup?.label || "Select Group"}

                        <BiChevronDown
                          className={`${
                            groupOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {groupOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {groupOptions.map((g) => (
                            <button
                              key={g.value}
                              onClick={() => {
                                setTempGroup(g);
                                setGroupOpen(false); // 👈 close group dropdown
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                tempGroup?.value === g.value
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : darkMode
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Apply Filter */}
                    <button
                      onClick={() => {
                        setClassFilter(tempClass);
                        setGroupFilter(tempGroup);
                        setCurrentPage(1);

                        // 🔒 close everything
                        setFilterOpen(false);
                        setClassOpen(false);
                        setGroupOpen(false);
                      }}
                      className="w-full bg-blue-600 text-white text-xs py-1 rounded mt-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="flex-1">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${borderClr} ${inputBg}`}
              >
                Sort {sortOrder === "newest" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
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
