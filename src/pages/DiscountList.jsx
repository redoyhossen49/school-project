import { useState, useRef, useEffect } from "react";
import { discountData } from "../data/discountData.js";
import DiscountTable from "../components/discount/DiscountTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";

export default function DiscountList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [discounts, setDiscounts] = useState(discountData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const discountsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    className: "",
    group: "",
    section: "",
    session: "",
  });
  const [editingDiscount, setEditingDiscount] = useState(null);

  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // ===== Close dropdowns on outside click =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Filter + Sort Logic =====
  const filteredDiscounts = discounts
    .filter((d) => 
      d.group_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.class?.toLowerCase().includes(search.toLowerCase()) ||
      d.group?.toLowerCase().includes(search.toLowerCase()) ||
      d.fees_type?.toLowerCase().includes(search.toLowerCase()) ||
      d.student_name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => {
      // Cumulative filtering: only apply if value is selected
      if (filters.className && d.class !== filters.className) return false;
      if (filters.group && d.group !== filters.group) return false;
      if (filters.section && d.section !== filters.section) return false;
      if (filters.session && d.session !== filters.session) return false;
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalDiscounts = filteredDiscounts.length;
  const totalPages = Math.ceil(totalDiscounts / discountsPerPage);
  const currentDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * discountsPerPage,
    currentPage * discountsPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((d, i) => ({
      Sl: i + 1,
      "Group Name": d.group_name,
      Class: d.class,
      Group: d.group,
      Section: d.section,
      Session: d.session,
      "Student Name": d.student_name,
      "Fees Type": d.fees_type,
      Regular: d.regular,
      "Discount Amount": d.discount_amount,
      "Start Date": d.start_date,
      "End Date": d.end_date,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Discounts");
    writeFile(wb, "Discount_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Group Name",
      "Class",
      "Group",
      "Section",
      "Session",
      "Student Name",
      "Fees Type",
      "Regular",
      "Discount Amount",
      "Start Date",
      "End Date",
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.group_name,
      d.class,
      d.group,
      d.section,
      d.session,
      d.student_name,
      d.fees_type,
      d.regular,
      d.discount_amount,
      d.start_date,
      d.end_date,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Discount_List.pdf");
  };

  const handleRefresh = () => {
    setDiscounts(discountData);
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setCurrentPage(1);
  };

  // Generate dynamic options from discountData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(discountData, "class");
  const groupOptions = getUniqueOptions(discountData, "group");
  const sectionOptions = getUniqueOptions(discountData, "section");
  const sessionOptions = getUniqueOptions(discountData, "session");
  const feesTypeOptions = getUniqueOptions(discountData, "fees_type");
  const studentNameOptions = getUniqueOptions(discountData, "student_name");

  // Discount form fields for ReusableEditModal
  const discountFields = [
    {
      name: "group_name",
      label: "Group Name",
      type: "text",
      required: true,
    },
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classOptions,
      required: true,
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      options: groupOptions,
      required: true,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: sectionOptions,
      required: true,
    },
    {
      name: "session",
      label: "Session",
      type: "select",
      options: sessionOptions,
      required: true,
    },
    {
      name: "student_name",
      label: "Student Name",
      type: "select",
      options: studentNameOptions,
      required: true,
    },
    {
      name: "fees_type",
      label: "Fees Type",
      type: "select",
      options: feesTypeOptions,
      required: true,
    },
    {
      name: "regular",
      label: "Regular Amount",
      type: "number",
      required: true,
    },
    {
      name: "discount_amount",
      label: "Discount Amount",
      type: "number",
      required: true,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      label: "End Date",
      type: "date",
      required: true,
    },
  ];

  const cardBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Discount List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/school/dashboard/discountlist")}
                className="hover:text-indigo-600"
              >
                / Discount List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center   px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between  px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
              >
                Export 
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredDiscounts)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredDiscounts)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => navigate("/school/dashboard/fee/adddiscount")}
                className="flex items-center w-28  bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Discount
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full  flex items-center  px-3 h-8 text-sm   border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full " ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full  flex items-center   px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border   ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredDiscounts)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredDiscounts)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => navigate("/school/dashboard/fee/adddiscount")}
              className="w-full flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Discount
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto items-center">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Discounts"
                fields={[
                  {
                    key: "className",
                    label: "Class",
                    options: classOptions,
                    placeholder: "Select Class",
                  },
                  {
                    key: "group",
                    label: "Group",
                    options: groupOptions,
                    placeholder: "Select Group",
                  },
                  {
                    key: "section",
                    label: "Section",
                    options: sectionOptions,
                    placeholder: "Select Section",
                  },
                  {
                    key: "session",
                    label: "Session",
                    options: sessionOptions,
                    placeholder: "Select Session",
                  },
                ]}
                selected={filters}
                setSelected={setFilters}
                darkMode={darkMode}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={() => setCurrentPage(1)}
                buttonRef={filterRef}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    className="w-full px-3 h-6 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                  >
                    First
                  </button>
                  <button
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by group name, class, student name, fees type..."
              className={`w-full md:w-64 ${borderClr} ${inputBg}  border  px-3 h-8  text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== DISCOUNT TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <DiscountTable
          data={currentDiscounts}
          setData={setDiscounts}
          onEdit={(discount) => setEditingDiscount(discount)}
        />
      </div>

      {/* Edit Discount Modal */}
      <ReusableEditModal
        open={editingDiscount !== null}
        title="Edit Discount"
        item={editingDiscount}
        onClose={() => setEditingDiscount(null)}
        onSubmit={(formData) => {
          if (editingDiscount) {
            const updatedDiscount = {
              ...editingDiscount,
              group_name: formData.group_name,
              class: formData.class,
              group: formData.group,
              section: formData.section,
              session: formData.session,
              student_name: formData.student_name,
              fees_type: formData.fees_type,
              regular: parseFloat(formData.regular) || 0,
              discount_amount: parseFloat(formData.discount_amount) || 0,
              start_date: formData.start_date,
              end_date: formData.end_date,
            };
            setDiscounts(discounts.map((d) => (d.sl === editingDiscount.sl ? updatedDiscount : d)));
            setEditingDiscount(null);
            alert("Discount updated successfully ✅");
          }
        }}
        fields={discountFields}
      />
    </div>
  );
}
