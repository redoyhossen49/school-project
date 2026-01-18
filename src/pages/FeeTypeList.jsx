import { useState, useRef, useEffect } from "react";
import { feeTypeData } from "../data/feeTypeData.js";
import FeeTypeTable from "../components/fee/FeeTypeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import FormModal from "../components/FormModal.jsx";

export default function FeeTypeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [fees, setFees] = useState(feeTypeData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const feesPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
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
  const [editingFee, setEditingFee] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeFormData, setFeeFormData] = useState({
    group_name: "",
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: "",
    fees_amount: "",
  });

  const dateDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  // ===== Close dropdowns on outside click =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target)
      ) {
        setDateOpen(false);
      }
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
  const filteredFees = fees
    .filter((f) => 
      f.group_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.class?.toLowerCase().includes(search.toLowerCase()) ||
      f.group?.toLowerCase().includes(search.toLowerCase()) ||
      f.fees_type?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((f) => {
      // Cumulative filtering: only apply if value is selected
      if (filters.className && f.class !== filters.className) return false;
      if (filters.group && f.group !== filters.group) return false;
      if (filters.section && f.section !== filters.section) return false;
      if (filters.session && f.session !== filters.session) return false;
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalFees = filteredFees.length;
  const totalPages = Math.ceil(totalFees / feesPerPage);
  const currentFees = filteredFees.slice(
    (currentPage - 1) * feesPerPage,
    currentPage * feesPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((f, i) => ({
      Sl: i + 1,
      "Group Name": f.group_name,
      Class: f.class,
      Group: f.group,
      Section: f.section,
      Session: f.session,
      "Fees Type": f.fees_type,
      "Fees Amount": f.fees_amount,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Fee Types");
    writeFile(wb, "Fee_Types_List.xlsx");
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
      "Fees Type",
      "Fees Amount",
    ];

    const rows = data.map((f, i) => [
      i + 1,
      f.group_name,
      f.class,
      f.group,
      f.section,
      f.session,
      f.fees_type,
      f.fees_amount,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Fee_Types_List.pdf");
  };

  const handleRefresh = () => {
    setFees(feeTypeData);
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setSelectedDate("Monthly");
    setCurrentPage(1);
  };

  // Generate dynamic options from feeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(feeTypeData, "class");
  const groupOptions = getUniqueOptions(feeTypeData, "group");
  const sectionOptions = getUniqueOptions(feeTypeData, "section");
  const sessionOptions = getUniqueOptions(feeTypeData, "session");
  const groupNameOptions = getUniqueOptions(feeTypeData, "group_name");
  const feesTypeOptions = getUniqueOptions(feeTypeData, "fees_type");
  
  // Handle fee form field change
  const handleFeeFormChange = (name, value, updated, setFormData) => {
    // Handle field changes if needed
  };

  // Handle fee form submit (edit only - add is now handled by separate page)
  const handleFeeFormSubmit = (formData) => {
    if (editingFee) {
      // Edit existing fee
      const updatedFee = {
        ...editingFee,
        group_name: formData.group_name,
        class: formData.class,
        group: formData.group,
        section: formData.section,
        session: formData.session,
        fees_type: formData.fees_type,
        fees_amount: parseFloat(formData.fees_amount) || 0,
      };
      setFees(fees.map((f) => (f.sl === editingFee.sl ? updatedFee : f)));
      setEditingFee(null);
      alert("Fee type updated successfully ✅");
    }
    setShowFeeForm(false);
    setFeeFormData({
      group_name: "",
      class: "",
      group: "",
      section: "",
      session: "",
      fees_type: "",
      fees_amount: "",
    });
  };

  // Handle edit - open form with fee data
  useEffect(() => {
    if (editingFee) {
      setFeeFormData({
        group_name: editingFee.group_name || "",
        class: editingFee.class || "",
        group: editingFee.group || "",
        section: editingFee.section || "",
        session: editingFee.session || "",
        fees_type: editingFee.fees_type || "",
        fees_amount: editingFee.fees_amount || "",
      });
      setShowFeeForm(true);
    }
  }, [editingFee]);

  const feeFormFields = [
    {
      name: "group_name",
      label: "Type Group Name",
      type: "text",
      placeholder: "Type Group Name",
      required: true,
    },
    {
      name: "class",
      label: "Select Class",
      type: "select",
      placeholder: "Select Class",
      options: classOptions,
      required: true,
    },
    {
      name: "group",
      label: "Select Group",
      type: "select",
      placeholder: "Select Group",
      options: groupOptions,
      required: true,
    },
    {
      name: "section",
      label: "Select Section",
      type: "select",
      placeholder: "Select Section",
      options: sectionOptions,
      required: true,
    },
    {
      name: "session",
      label: "Select Session",
      type: "select",
      placeholder: "Select Session",
      options: sessionOptions,
      required: true,
    },
    {
      name: "fees_type",
      label: "Fees Type",
      type: "select",
      placeholder: "Select Fees Type",
      options: feesTypeOptions,
      required: true,
    },
    {
      name: "fees_amount",
      label: "Fees Amount",
      type: "number",
      placeholder: "Enter Fees Amount",
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

  const dropdownBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-900";

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Fee Type List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/teacher/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button
                onClick={() => navigate(`/${canEdit ? "school" : ""}/dashboard/feetypelist`)}
                className="hover:text-indigo-600 cursor-pointer"
              >
                / Fee Type List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center shadow-sm  px-3 py-2 text-xs w-24 rounded border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between shadow-sm  px-3 py-2 text-xs w-24 rounded border ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border rounded shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredFees)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredFees)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => {
                  const userRole = localStorage.getItem("role");
                  const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
                  navigate(`${basePath}/addfeetype`);
                }}
                className="flex items-center gap-1 rounded w-28 shadow-sm bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
              >
                Add Fee Type
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full  flex items-center shadow-sm  px-3 h-8 text-sm   border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full " ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full  flex items-center justify-between shadow-sm  px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border  shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredFees)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredFees)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => {
                const userRole = localStorage.getItem("role");
                const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
                navigate(`${basePath}/addfeetype`);
              }}
              className="w-full flex items-center justify-center shadow-sm bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Add Fee Type
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-4 gap-2 md:flex md:w-auto items-center">
            {/* Filter Button */}
            <div className="relative " ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full  flex items-center  shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Fee Types"
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
                className={`w-full  flex items-center justify-between shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs   border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border  shadow-sm ${
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
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100 "
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
              placeholder="Search by group name, class, fees type..."
              className={`w-full md:w-64 ${borderClr} ${inputBg}  border  px-3 h-8 shadow-sm text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== FEE TYPE TABLE ===== */}
      <div
        className={` ${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <FeeTypeTable
          data={currentFees}
          setData={setFees}
          onEdit={(fee) => setEditingFee(fee)}
        />
      </div>

      {/* Fee Form Modal */}
      <FormModal
        open={showFeeForm}
        title={editingFee ? "Edit Fee Type" : "Add Fee Type"}
        fields={feeFormFields}
        initialValues={feeFormData}
        onClose={() => {
          setShowFeeForm(false);
          setEditingFee(null);
          setFeeFormData({
            group_name: "",
            class: "",
            group: "",
            section: "",
            session: "",
            fees_type: "",
            fees_amount: "",
          });
        }}
        onSubmit={handleFeeFormSubmit}
        onChange={handleFeeFormChange}
      />
    </div>
  );
}
