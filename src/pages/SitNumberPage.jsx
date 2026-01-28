import { useState, useRef, useEffect, useMemo } from "react";

import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import FormModal from "../components/FormModal.jsx";

import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { seatNumberData } from "../data/seatNumberData.js";
import { Link } from "react-router-dom";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import SeatPlanModal from "../components/seatPlan/SeatPlanModal.jsx";
import SitNumberTable from "../components/exam/SitNumberTable.jsx";
import schoolLogo from "../assets/images/sidebar-logo.avif";

export default function SitNumberPage() {
  const { darkMode } = useTheme();
  const canEdit = localStorage.getItem("role") === "school";

  // -------------------- State --------------------
  const [data, setData] = useState(seatNumberData); // ✅ seatNumberData
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const [addClassOpen, setAddClassOpen] = useState(false);
  const [seatPlanModalOpen, setSeatPlanModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  // -------------------- Dropdown states --------------------
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState(false);
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
  const sortRef = useRef(null);

  // -------------------- Outside Click --------------------
  useEffect(() => {
    const handler = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target))
        setStatusOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------- Filter Options --------------------
  const classOptions = Array.from(
    new Set(seatNumberData.map((i) => i.className)),
  );
  // সব unique group seatNumberData থেকে
  const groupOptions = Array.from(new Set(seatNumberData.map((i) => i.group)));

  const sectionOptions = Array.from(
    new Set(seatNumberData.map((i) => i.section)),
  );

  const sessionOptions = Array.from(
    new Set(seatNumberData.map((i) => i.session)),
  );

  const examOptions = Array.from(
    new Set(seatNumberData.map((i) => i.examName)),
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
      key: "session",

      placeholder: "Select session",
      options: sessionOptions,
    },
    {
      key: "exam",

      placeholder: "Select exam",
      options: examOptions,
    },
  ];

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
          : true,
      )
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.className.localeCompare(a.className)
          : a.className.localeCompare(b.className),
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
    currentPage * perPage,
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

    const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
    const schoolName = schoolInfo.schoolName || "School Name";

    // Create worksheet with title and school info
    const ws = utils.json_to_sheet([]);

    // Add title rows
    ws["A1"] = { v: schoolName, t: "s" };
    ws["A2"] = { v: "Seat Number Data Report", t: "s" };
    ws["A3"] = { v: "", t: "s" };

    // Add data starting from row 5
    const wsData = data.map((item, idx) => ({
      SL: idx + 1,
      Class: item.className,
      Group: item.group,
      Session: item.session,
      "Exam Name": item.examName,
      "Exam Year": item.examYear,
      "Student Name": item.studentName,
      "ID Number": item.idNumber,
      "Roll No": item.rollNo,
      "Father's Name": item.fathersName,
      "Seat Number": item.seatNumber,
    }));

    const dataWs = utils.json_to_sheet(wsData);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, dataWs, "SeatNumberData");
    writeFile(wb, "SeatNumberData.xlsx");
  };

  const exportPDF = (data) => {
    if (!data.length) return alert("No data to export");

    const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
    const schoolName = schoolInfo.schoolName || "School Name";
    const schoolAddress = schoolInfo.address || "";

    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Add school logo (centered)
    try {
      const logoUrl =
        typeof schoolLogo === "string"
          ? schoolLogo.startsWith("/")
            ? window.location.origin + schoolLogo
            : window.location.origin + "/" + schoolLogo
          : window.location.origin + "/src/assets/images/sidebar-logo.avif";

      const logoSize = 40;
      const logoX = (pageWidth - logoSize) / 2;
      doc.addImage(logoUrl, "JPEG", logoX, yPosition, logoSize, logoSize);
      yPosition += 50;
    } catch (e) {
      console.warn("Could not load logo:", e);
    }

    // Add school name (centered)
    doc.setFontSize(16);
    doc.setTextColor(26, 160, 176);
    const schoolNameWidth = doc.getTextWidth(schoolName);
    doc.text(schoolName, (pageWidth - schoolNameWidth) / 2, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    // Add address if available (centered)
    if (schoolAddress) {
      doc.setFontSize(10);
      const addressWidth = doc.getTextWidth(schoolAddress);
      doc.text(schoolAddress, (pageWidth - addressWidth) / 2, yPosition);
      yPosition += 10;
    }

    // Add report title (centered)
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    const reportTitle = "Seat Number Data Report";
    const reportWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (pageWidth - reportWidth) / 2, yPosition);
    doc.setFont(undefined, "normal");
    yPosition += 15;

    // Add table
    const tableColumn = [
      "SL",
      "Class",
      "Group",
      "Session",
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
      item.session,
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
      startY: yPosition,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [26, 160, 176],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
    });

    doc.save("SeatNumberData.pdf");
  };

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "Sl" },
    { key: "className", label: "Class" },
    { key: "group", label: "Group" },
    { key: "section", label: "Section" },
    { key: "session", label: "Session" },
    { key: "examName", label: "Exam name" },
    { key: "examYear", label: "Exam year" },
    { key: "studentName", label: "Student name" },
    { key: "idNumber", label: "ID number" },
    { key: "rollNo", label: "Roll no" },

    { key: "seatNumber", label: "Seat number" },
  ];

  const addSeatNumberFields = [
    {
      key: "class",
      type: "select",
      placeholder: "Choose a class",
      options: classOptions, // dynamic from seatNumberData
    },
    {
      key: "group",
      type: "select",
      placeholder: "Choose a group",
      options: groupOptions, // dynamic based on selected class
    },
    {
      key: "session",
      type: "select",
      placeholder: "Choose Session Year",
      options: sessionOptions, // dynamic
    },
    {
      key: "examName",
      type: "select",
      placeholder: "Choose Exam",
      options: examOptions, // dynamic
    },
    {
      key: "totalStudents",
      type: "number",
      placeholder: "Enter total students",
    },
    {
      key: "setNumberStart",
      type: "number",
      placeholder: "Start from 1",
      helperText: "Roll numbers will start from this number and auto-generate",
    },
  ];

  // -------------------- Styles --------------------
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-300";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={` p-3 space-y-3 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Seat number list</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / seat number
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            {/*  <button
              onClick={handleRefresh}
              className={`w-full flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>*/}
            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter seat number"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");
                  setSectionFilter(values.section || "");
                  setSessionFilter(values.session || "");
                  setExamFilter(values.exam || "");

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
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28  border  ${borderClr} ${dropdownBg}`}
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

            {canEdit ? (
              <>
                <button
                  onClick={() => setSeatPlanModalOpen(true)}
                  className="w-full md:w-28 flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
                >
                  Seat plan
                </button>
              </>
            ) : (
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
            )}

            <FormModal
              open={addClassOpen}
              title="Add seat number"
              fields={addSeatNumberFields}
              initialValues={{
                class: "",
                group: "",
                session: "",
                examName: "",
                totalStudents: "",
                setNumberStart: 1,
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={(newEntry) => {
                const total = parseInt(newEntry.totalStudents, 10);
                const start = parseInt(newEntry.setNumberStart, 10) || 1;

                if (!total || total <= 0) {
                  alert("Total students must be greater than 0");
                  return;
                }

                const newData = Array.from({ length: total }, (_, i) => ({
                  className: newEntry.class,
                  group: newEntry.group,
                  session: newEntry.session,
                  examName: newEntry.examName,
                  examYear: new Date().getFullYear(),

                  studentName: `Student ${i + 1}`,
                  idNumber: `ID-${i + 1}`,
                  rollNo: i + 1,
                  fathersName: "N/A",
                  seatNumber: `S-${start + i}`,
                }));

                setData((prev) => [...prev, ...newData]);
                setCurrentPage(1);
                setAddClassOpen(false);
              }}
            />
          </div>
        </div>

        {/* Seat Plan Modal */}
        <SeatPlanModal
          open={seatPlanModalOpen}
          onClose={() => setSeatPlanModalOpen(false)}
        />

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          {/*<div className="flex gap-2 md:gap-2 w-full md:w-auto">
           <div ref={statusRef} className="relative flex-1">
              <button
                onClick={() => setStatusOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center  border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                {classFilter || " Class"}
              </button>

              {statusOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full  border  max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
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
                      className={`block w-full px-3 h-8 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
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
              )}
            </div>

          

           
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
          <div className="flex items-center md:justify-between gap-2 w-full ">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search class..."
              className={`w-full md:w-64 border px-3 h-8 text-xs focus:outline-none ${borderClr} ${inputBg}`}
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
      <div className={` overflow-x-auto ${cardBg}`}>
        <SitNumberTable
          columns={columns}
          data={currentData.map((item, idx) => ({
            ...item,
            SL: (currentPage - 1) * perPage + idx + 1,
          }))}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
