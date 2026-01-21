import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import Pagination from "../components/Pagination.jsx";
import ClassGroupTable from "../components/academic/ClassGroupTable.jsx";
import { sectionData } from "../data/sectionData.js";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormModal from "../components/FormModal.jsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";

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
  const [data, setData] = useState(sectionData);
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
  const classOptions = Array.from(
    new Set(sectionData.map((item) => item.class)),
  );
  const groupOptions = Array.from(
    new Set(sectionData.map((item) => item.group)),
  );
  const sectionOptions = Array.from(
    new Set(sectionData.map((item) => item.section)),
  );

  const filterFields = [
    { key: "class", placeholder: "Select Class", options: classOptions },
    { key: "group", placeholder: "Select Group", options: groupOptions },
    { key: "section", placeholder: "Select Section", options: sectionOptions },
  ];

  // -------------------- Table columns --------------------
  const columns = [
    { key: "sl", label: "SL" },
    { key: "class", label: "Class" },
    { key: "group", label: "Group" },
    { key: "section", label: "Section" },
    { key: "totalStudents", label: "Total Students" },
    { key: "totalPayable", label: "Total Payable" },
    { key: "payableDue", label: "Payable Due" },
  ];

  // -------------------- Edit modal fields --------------------
  const modalFields = [
    { key: "class", placeholder: "Class" },
    { key: "group", placeholder: "Group" },
    { key: "section", placeholder: "Section" },
    { key: "totalStudents", placeholder: "Total Students", type: "number" },
    { key: "totalPayable", placeholder: "Total Payable", type: "number" },
    { key: "payableDue", placeholder: "Payable Due", type: "number" },
  ];

  // -------------------- Filtered + searched + sorted data --------------------
  const filteredData = useMemo(() => {
    return data
      .filter((item) => (classFilter ? item.class === classFilter : true))
      .filter((item) => (groupFilter ? item.group === groupFilter : true))
      .filter((item) => (sectionFilter ? item.section === sectionFilter : true))
      .filter(
        (item) =>
          item.class.toLowerCase().includes(search.toLowerCase()) ||
          item.group.toLowerCase().includes(search.toLowerCase()) ||
          item.section.toLowerCase().includes(search.toLowerCase()),
      )

      .filter((item) => item.class.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (sortOrder === "asc" ? a.sl - b.sl : b.sl - a.sl));
  }, [data, search, classFilter, groupFilter, sectionFilter, sortOrder]);

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
  const wsData = data.map((item) => ({
    SL: item.sl,
    Class: item.class,
    Group: item.group,
    Section: item.section,
    TotalStudents: item.totalStudents,
    TotalPayable: item.totalPayable,
    PayableDue: item.payableDue,
  }));

  const ws = utils.json_to_sheet(wsData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Section List");
  writeFile(wb, "SectionList.xlsx");
};

const exportPDF = (data, filters = {}) => {
  if (!data.length) return alert("No data to export");

  const doc = new jsPDF("portrait", "pt", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------------- SCHOOL INFO ----------------
  const schoolName = "ABC High School";
  const schoolAddress = "Dhaka, Bangladesh";
  const reportTitle = "Section List Report";

  const schoolLogo = "/logo.png";
  const watermarkLogo = "/logo.png";
  const signatureImg = "/sign.png";

  const themeColor = [38, 166, 154]; // same as admit badge

  // ---------------- PAGE BORDER (ADMIT STYLE) ----------------
  doc.setDrawColor(...themeColor);
  doc.setLineWidth(1.5);
  doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 10, 10);

  // ---------------- WATERMARK ----------------
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.addImage(
    watermarkLogo,
    "PNG",
    pageWidth / 2 - 150,
    pageHeight / 2 - 150,
    300,
    300
  );
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ---------------- HEADER ----------------
  doc.addImage(schoolLogo, "PNG", 35, 35, 60, 60);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(schoolName, pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(schoolAddress, pageWidth / 2, 65, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, pageWidth / 2, 90, { align: "center" });

  // ---------------- FILTER INFO ----------------
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const filterText = `
Class: ${filters.class || "All"}    Group: ${filters.group || "All"}    Section: ${filters.section || "All"}
Generated Date: ${new Date().toLocaleDateString()}
`;

  doc.text(filterText.trim(), 40, 115);

  // ---------------- TABLE ----------------
  const tableColumn = [
    "SL",
    "Class",
    "Group",
    "Section",
    "Total Students",
    "Total Payable",
    "Payable Due",
  ];

  const tableRows = data.map((item) => [
    item.sl,
    item.class,
    item.group,
    item.section,
    item.totalStudents,
    item.totalPayable,
    item.payableDue,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 150,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 6,
      halign: "center",
    },
    headStyles: {
      fillColor: themeColor,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 40, right: 40 },
  });

  // ---------------- SIGNATURE FOOTER ----------------
  const finalY = doc.lastAutoTable.finalY + 40;

  if (finalY < pageHeight - 100) {
    doc.addImage(signatureImg, "PNG", pageWidth - 180, finalY, 120, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature", pageWidth - 120, finalY + 55, {
      align: "center",
    });
  }

  // ---------------- FOOTER PAGE NUMBER ----------------
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 25,
      { align: "center" }
    );
  }

  doc.save("Section_List_A4.pdf");
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
                  label:"Type section",
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
        <ReusableTable
  columns={columns}
  data={currentData}
  setData={setData}
  showActionKey={true} 
  modalFields={modalFields}
/>

      </div>
    </div>
  );
}
