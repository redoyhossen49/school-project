import { useState, useRef, useEffect } from "react";
import { payrollData } from "../data/payrollData.js";
import PayrollTable from "../components/payroll/PayrollTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";

export default function PayrollList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [payrolls, setPayrolls] = useState(payrollData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const payrollsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    employee: "",
    month: "",
    year: "",
  });
  const [editingPayroll, setEditingPayroll] = useState(null);

  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // Generate unique options for filters
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Generate employee name options
  const employeeOptions = getUniqueOptions(payrollData, "employee");

  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Generate year options
  const yearOptions = Array.from(
    new Set(payrollData.map((item) => item.pay_year).filter(Boolean))
  ).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)

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
  const filteredPayrolls = payrolls
    .filter((p) => 
      p.employee?.toLowerCase().includes(search.toLowerCase()) ||
      p.employee_type?.toLowerCase().includes(search.toLowerCase()) ||
      p.pay_type?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      // Filter by employee name
      if (filters.employee && p.employee !== filters.employee) return false;
      
      // Filter by month and year
      if (filters.month && p.pay_month !== filters.month) return false;
      if (filters.year && p.pay_year !== filters.year) return false;
      
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalPayrolls = filteredPayrolls.length;
  const totalPages = Math.ceil(totalPayrolls / payrollsPerPage);
  const currentPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * payrollsPerPage,
    currentPage * payrollsPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((p, i) => ({
      Sl: i + 1,
      Employee: p.employee,
      "Employee type": p.employee_type,
      "Total salary": p.total_salary,
      "Total due": p.total_due,
      "Advance status": p.advance_status,
      "Pay type": p.pay_type,
      "Payroll amount": p.payroll_amount,
      "Pay Month": p.pay_month,
      "Pay year": p.pay_year,
      "Pay date": p.pay_date,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Payrolls");
    writeFile(wb, "Payroll_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Employee",
      "Employee type",
      "Total salary",
      "Total due",
      "Advance status",
      "Pay type",
      "Payroll amount",
      "Pay Month",
      "Pay year",
      "Pay date",
    ];

    const rows = data.map((p, i) => [
      i + 1,
      p.employee,
      p.employee_type,
      p.total_salary,
      p.total_due,
      p.advance_status,
      p.pay_type,
      p.payroll_amount,
      p.pay_month,
      p.pay_year,
      p.pay_date,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Payroll_List.pdf");
  };

  // ===== Refresh =====
  const handleRefresh = () => {
    setPayrolls([...payrollData]);
    setSearch("");
    setFilters({ employee: "", month: "", year: "" });
    setCurrentPage(1);
  };

  // ===== Edit Payroll =====
  const handlePayrollFormSubmit = (formData) => {
    const sl = editingPayroll?.sl;
    if (sl) {
      setPayrolls((prev) =>
        prev.map((p) => (p.sl === sl ? { ...p, ...formData } : p))
      );
      setEditingPayroll(null);
      alert("Payroll updated successfully ✅");
    }
  };

  // Payroll form fields for ReusableEditModal
  const payrollFields = [
    {
      name: "employee",
      label: "Employee",
      type: "text",
      required: true,
    },
    {
      name: "employee_type",
      label: "Employee type",
      type: "text",
      required: true,
    },
    {
      name: "total_salary",
      label: "Total salary",
      type: "number",
      required: true,
    },
    {
      name: "total_due",
      label: "Total due",
      type: "number",
      required: true,
    },
    {
      name: "advance_status",
      label: "Advance status",
      type: "select",
      options: ["Yes", "No"],
      required: true,
    },
    {
      name: "pay_type",
      label: "Pay type",
      type: "select",
      options: ["Full", "Partial"],
      required: true,
    },
    {
      name: "payroll_amount",
      label: "Payroll amount",
      type: "number",
      required: true,
    },
    {
      name: "pay_month",
      label: "Pay Month",
      type: "text",
      required: true,
    },
    {
      name: "pay_year",
      label: "Pay year",
      type: "text",
      required: true,
    },
    {
      name: "pay_date",
      label: "Pay date",
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
      <div className={`space-y-4 p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h2 className="text-base font-semibold">Payroll List</h2>
            <p className="text-xs text-gray-400 flex flex-wrap items-center gap-x-1">
              <Link to={`/${canEdit ? "school" : ""}/dashboard`} className="hover:text-indigo-600">
                Dashboard
              </Link>
              <span>/</span>
              <button
                onClick={() =>
                  navigate(
                    `/${canEdit ? "school" : ""}/dashboard/hrm/payroll`
                  )
                }
                className="hover:text-indigo-600 cursor-pointer"
              >
                Payroll List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center shadow-sm px-3 py-2 text-xs w-24  border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between shadow-sm px-3 py-2 text-xs w-24 border ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredPayrolls)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredPayrolls)}
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
                  navigate(`${basePath}/hrm/addpayroll`);
                }}
                className="flex items-center justify-center shadow-sm bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 "
              >
                Add Payroll
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full flex items-center justify-center shadow-sm px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full flex items-center justify-center shadow-sm px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredPayrolls)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredPayrolls)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
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
                navigate(`${basePath}/hrm/addpayroll`);
              }}
              className={`w-full flex items-center justify-center shadow-sm bg-blue-600 px-3 h-8 text-xs text-white hover:bg-blue-700 ${
                canEdit ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              Add Payroll
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-3 md:flex md:items-center md:justify-between md:gap-4 md:space-y-0">
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto items-center">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Payrolls"
                fields={[
                  {
                    key: "employee",
                    label: "Select employee",
                    options: employeeOptions,
                    placeholder: "Select employee",
                  },
                  {
                    key: "month",
                    label: "Select month",
                    options: monthOptions,
                    placeholder: "Select month",
                  },
                  {
                    key: "year",
                    label: "Select year",
                    options: yearOptions,
                    placeholder: "Select year",
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
                className={`w-full flex items-center justify-center shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border shadow-sm ${
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:mt-0 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee, type, pay type..."
              className={`w-full md:w-64 ${borderClr} ${inputBg} border px-3 h-8 shadow-sm text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== PAYROLL TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <PayrollTable
          data={currentPayrolls}
          setData={setPayrolls}
          onEdit={(payroll) => setEditingPayroll(payroll)}
        />
      </div>

      {/* Payroll Edit Modal */}
      <ReusableEditModal
        open={editingPayroll !== null}
        title="Edit Payroll"
        item={editingPayroll}
        onClose={() => setEditingPayroll(null)}
        onSubmit={handlePayrollFormSubmit}
        fields={payrollFields}
        getInitialValues={(item) => ({
          ...item,
          pay_date: item.pay_date || new Date().toISOString().split("T")[0],
        })}
      />
    </div>
  );
}
