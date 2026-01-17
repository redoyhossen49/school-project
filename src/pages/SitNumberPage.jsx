import { useState, useRef, useEffect, useMemo } from "react";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import FormModal from "../components/FormModal.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { seatNumberData } from "../data/seatNumberData.js";
import { Link } from "react-router-dom";

export default function SitNumberPage() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [data, setData] = useState(seatNumberData); // ✅ seatNumberData
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(false);

  // Temporary UI selection
  const [tempClass, setTempClass] = useState(null);
  const [tempGroup, setTempGroup] = useState(null);

  // -------------------- Dropdown states --------------------
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sessionFilter, setSesionFilter] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [examFilter, setExamFilter] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

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
  const classOptions = Array.from(
    new Set(seatNumberData.map((i) => i.className))
  );
  // সব unique group seatNumberData থেকে
const groupOptions = Array.from(new Set(seatNumberData.map((i) => i.group)));


  const sessionOptions = Array.from(
    new Set(seatNumberData.map((i) => i.session))
  );

  const examOptions = Array.from(
    new Set(seatNumberData.map((i) => i.examName))
  );

  // -------------------- Filter + Search + Sort --------------------
  const filteredData = useMemo(() => {
    return data
      .filter((item) => (classFilter ? item.className === classFilter : true))
      .filter((item) => (groupFilter ? item.group === groupFilter : true))
      .filter((item) => (sessionFilter ? item.session === sessionFilter : true))
      .filter((item) => (examFilter ? item.examName === examFilter : true))
      .filter((item) =>
        search
          ? item.studentName.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.className.localeCompare(a.className)
          : a.className.localeCompare(b.className)
      );
  }, [
    data,
    classFilter,
    groupFilter,
    sessionFilter,
    examFilter,
    search,
    sortOrder,
  ]);

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
    setExportOpen(false);
    setFilterOpen(false);
  };

  // -------------------- Export --------------------
  const exportExcel = (data) => {
    if (!data.length) return;
    const wsData = data.map((item, idx) => ({
      SL: idx + 1,
      Class: item.className,
      Group: item.group,
      "Exam Name": item.examName,
      "Exam Year": item.examYear,
      "Student Name": item.studentName,
      "ID Number": item.idNumber,
      "Roll No": item.rollNo,
      "Father's Name": item.fathersName,
      "Seat Number": item.seatNumber,
    }));
    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "SeatNumberData");
    writeFile(wb, "SeatNumberData.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return alert("No data to export");
    const doc = new jsPDF("landscape", "pt", "a4");
    const tableColumn = [
      "SL",
      "Class",
      "Group",
      "Exam Name",
      "Exam Year",
      "Student Name",
      "ID Number",
      "Roll No",
      "Father's Name",
      "Seat Number",
    ];
    const tableRows = data.map((item, idx) => [
      idx + 1,
      item.className,
      item.group,
      item.examName,
      item.examYear,
      item.studentName,
      item.idNumber,
      item.rollNo,
      item.fathersName,
      item.seatNumber,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8 },
    });

    doc.save("SeatNumberData.pdf");
  };

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "SL" },
    { key: "className", label: "Class" },
    { key: "group", label: "Group" },
    { key: "examName", label: "Exam Name" },
    { key: "examYear", label: "Exam Year" },
    { key: "studentName", label: "Student Name" },
    { key: "idNumber", label: "ID Number" },
    { key: "rollNo", label: "Roll No" },
    { key: "fathersName", label: "Father's Name" },
    { key: "seatNumber", label: "Seat Number" },
  ];

  const addSeatNumberFields = [
    {
      name: "Class",
      label: "Select Class",
      type: "select",
      placeholder: "Choose a class",
      options: classOptions, // dynamic from seatNumberData
      required: true,
    },
    {
      name: "Group",
      label: "Select Group",
      type: "select",
      placeholder: "Choose a group",
      options:Array.from(new Set(seatNumberData.map((i) => i.group))), // dynamic based on selected Class
      required: true,
    },
    {
      name: "Session",
      label: "Select Session Year",
      type: "select",
      placeholder: "Choose Session Year",
      options: sessionOptions, // dynamic from seatNumberData
      required: true,
    },
    {
      name: "ExamName",
      label: "Select Exam",
      type: "select",
      placeholder: "Choose Exam",
      options: examOptions, // dynamic from seatNumberData
      required: true,
    },
    {
      name: "TotalStudents",
      label: "Show Total Students",
      type: "number",
      placeholder: "Enter total students",
      required: true,
    },
    {
      name: "SetNumberStart",
      label: "Start Seat Number",
      type: "number",
      placeholder: "Start from 1",
      required: true,
      helperText: "Roll numbers will start from this number and auto-generate",
    },
  ];

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
              fields={addSeatNumberFields}
              initialValues={{
                Class: "",
                Group: "",
                Session: "",
                ExamName: "",
                TotalStudents: 0,
                seatNumberStart:1,
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={(newEntry) => {
                // Auto generate seat numbers
                const newData = [];
                const startNumber = Number(newEntry.SetNumberStart || 1);
                for (let i = 0; i < newEntry.TotalStudents; i++) {
                  newData.push({
                    ...newEntry,
                    studentName: `Student ${i + 1}`,
                    idNumber: `ID${i + 1}`,
                    rollNo: i + 1,
                    seatNumber: startNumber + i,
                  });
                }
                setData((prev) => [...prev, ...newData]);
                setCurrentPage(1);
                setAddClassOpen(false);
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
                {classFilter || "Select Class"}
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
                  {classOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setClassFilter(c); // 🔹 filter apply instantly
                        setGroupFilter(""); // 🔹 reset dependent filter
                        setCurrentPage(1); // 🔹 pagination reset
                        setStatusOpen(false); // 🔹 close dropdown
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                        classFilter === c
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : darkMode
                          ? "text-gray-200"
                          : "text-gray-700"
                      }`}
                    >
                      {c} {/* ✅ c is a string */}
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
                        {tempClass || "Select Class"}
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
                              key={c}
                              onClick={() => {
                                setTempClass(c); // UI selection
                                setTempGroup(""); // reset group
                                setClassOpen(false); // close dropdown
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                tempClass === c
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
                      )}
                    </div>

                    {/* Group Filter */}
                   <div className="flex flex-col gap-1">
  <button
    onClick={() => setGroupOpen((prev) => !prev)}
    className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
      groupFilter === "" ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
    }`}
  >
    {groupFilter || "Select Group"}
    <BiChevronDown className={`${groupOpen ? "rotate-180" : ""} transition-transform`} />
  </button>

  {groupOpen && (
    <div className="max-h-40 overflow-y-auto">
      {groupOptions.map((g) => (
        <button
          key={g}
          onClick={() => {
            setGroupFilter(g); // ✅ group select হলে filter state update হবে
            setGroupOpen(false); // dropdown close
          }}
          className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
            groupFilter === g ? "bg-blue-100 text-blue-700 font-medium" : darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {g} {/* g is a string */}
        </button>
      ))}
    </div>
  )}
</div>


                    {/* -------- Session Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSessionOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          sessionFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {sessionFilter || "Select Session"}{" "}
                        <BiChevronDown
                          className={`${
                            sessionOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {sessionOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {sessionOptions.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSessionFilter(s);
                                setSessionOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                sessionFilter === s
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
                      )}
                    </div>
                    {/* -------- Exam Filter -------- */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setExamOpen((prev) => !prev)}
                        className={`w-full text-left px-2 py-1 text-xs rounded flex justify-between items-center hover:bg-blue-50 hover:text-blue-600 ${
                          examFilter === ""
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                            ? "text-gray-200"
                            : "text-gray-700"
                        }`}
                      >
                        {examFilter || "Select Exam"}{" "}
                        <BiChevronDown
                          className={`${
                            examOpen ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                      {examOpen && (
                        <div className="max-h-40 overflow-y-auto">
                          {examOptions.map((e) => (
                            <button
                              key={e}
                              onClick={() => {
                                setExamFilter(e);
                                setExamOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 hover:text-blue-600 ${
                                examFilter === e
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : darkMode
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {e}
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
