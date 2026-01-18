import { useState, useRef, useEffect } from "react";
import { employeeData } from "../data/employeeData.js";
import EmployeeTable from "../components/employee/EmployeeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";

export default function EmployeeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [employees, setEmployees] = useState(employeeData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    employee_name: "",
    month: "",
    year: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null);

  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // Generate unique options for filters
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Generate employee name options
  const employeeNameOptions = getUniqueOptions(employeeData, "employee_name");

  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Generate year options from payroll_date
  const yearOptions = Array.from(
    new Set(
      employeeData
        .map((item) => {
          if (item.payroll_date) {
            const year = new Date(item.payroll_date).getFullYear();
            return year.toString();
          }
          return null;
        })
        .filter(Boolean)
    )
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
  const filteredEmployees = employees
    .filter((e) => 
      e.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.mobile_number?.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_type?.toLowerCase().includes(search.toLowerCase()) ||
      e.bank_name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((e) => {
      // Filter by employee name
      if (filters.employee_name && e.employee_name !== filters.employee_name) return false;
      
      // Filter by month and year from payroll_date
      if (filters.month || filters.year) {
        if (!e.payroll_date) return false;
        const payrollDate = new Date(e.payroll_date);
        const payrollMonth = (payrollDate.getMonth() + 1).toString(); // getMonth() returns 0-11
        const payrollYear = payrollDate.getFullYear().toString();
        
        if (filters.month && payrollMonth !== filters.month) return false;
        if (filters.year && payrollYear !== filters.year) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalEmployees = filteredEmployees.length;
  const totalPages = Math.ceil(totalEmployees / employeesPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((e, i) => ({
      Sl: i + 1,
      "Employee name": e.employee_name,
      "Mobile number": e.mobile_number,
      "Employee Type": e.employee_type === "teacher" ? "Teacher" : `Others (${e.employee_type_other || ""})`,
      "Leave remaining": e.leave_remaining,
      "Salary Amount": e.salary_amount,
      "Payroll date": e.payroll_date,
      "Total Payable": e.total_payable,
      "Payable due": e.payable_due,
      "Bank name": e.bank_name,
      "Branch": e.branch,
      "Routing number": e.routing_number,
      "A/C holder name": e.ac_holder_name,
      "A/C number": e.ac_number,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Employees");
    writeFile(wb, "Employee_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Employee name",
      "Mobile",
      "Type",
      "Leave",
      "Salary",
      "Payroll date",
      "Total Payable",
      "Payable due",
      "Bank",
      "Branch",
      "Routing",
      "A/C Holder",
      "A/C Number",
    ];

    const rows = data.map((e, i) => [
      i + 1,
      e.employee_name,
      e.mobile_number,
      e.employee_type === "teacher" ? "Teacher" : `Others (${e.employee_type_other || ""})`,
      e.leave_remaining,
      e.salary_amount,
      e.payroll_date,
      e.total_payable,
      e.payable_due,
      e.bank_name,
      e.branch,
      e.routing_number,
      e.ac_holder_name,
      e.ac_number,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Employee_List.pdf");
  };

  // ===== Refresh =====
  const handleRefresh = () => {
    setEmployees([...employeeData]);
    setSearch("");
    setFilters({ employee_name: "", month: "", year: "" });
    setCurrentPage(1);
  };

  // ===== Edit Employee =====
  const handleEmployeeFormSubmit = (formData) => {
    const sl = editingEmployee?.sl;
    if (sl) {
      setEmployees((prev) =>
        prev.map((e) => (e.sl === sl ? { ...e, ...formData } : e))
      );
      setEditingEmployee(null);
      alert("Employee updated successfully ✅");
    }
  };

  // Employee form fields for ReusableEditModal
  const employeeFields = [
    {
      name: "employee_name",
      label: "Employee name",
      type: "text",
      required: true,
    },
    {
      name: "mobile_number",
      label: "Mobile number",
      type: "text",
      required: true,
    },
    {
      name: "employee_type",
      label: "Employee Type",
      type: "select",
      options: ["teacher", "others"],
      required: true,
    },
    {
      name: "employee_type_other",
      label: "Employee Type (Others - specify)",
      type: "text",
      required: false,
    },
    {
      name: "leave_remaining",
      label: "Leave remaining",
      type: "number",
      required: true,
    },
    {
      name: "salary_amount",
      label: "Salary Amount",
      type: "number",
      required: true,
    },
    {
      name: "payroll_date",
      label: "Payroll date",
      type: "date",
      required: true,
    },
    {
      name: "total_payable",
      label: "Total Payable",
      type: "number",
      required: true,
    },
    {
      name: "payable_due",
      label: "Payable due",
      type: "number",
      required: true,
    },
    {
      name: "bank_name",
      label: "Bank name",
      type: "text",
      required: false,
    },
    {
      name: "branch",
      label: "Branch",
      type: "text",
      required: false,
    },
    {
      name: "routing_number",
      label: "Routing number",
      type: "text",
      required: false,
    },
    {
      name: "ac_holder_name",
      label: "A/C holder name",
      type: "text",
      required: false,
    },
    {
      name: "ac_number",
      label: "A/C number",
      type: "text",
      required: false,
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
            <h2 className="text-base font-semibold">Employee List</h2>
            <p className="text-xs text-gray-400 flex flex-wrap items-center gap-x-1">
              <Link to={`/${canEdit ? "school" : ""}/dashboard`} className="hover:text-indigo-600">
                Dashboard
              </Link>
              <span>/</span>
              <button
                onClick={() =>
                  navigate(
                    `/${canEdit ? "school" : ""}/dashboard/hrm/employee`
                  )
                }
                className="hover:text-indigo-600 cursor-pointer"
              >
                Employee List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center shadow-sm px-3 py-2 text-xs w-24 rounded border ${borderClr} ${inputBg}`}
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
                    onClick={() => exportPDF(filteredEmployees)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredEmployees)}
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
                  navigate(`${basePath}/hrm/addemployee`);
                }}
                className="flex items-center justify-center shadow-sm bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
              >
                Add Employee
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
                  onClick={() => exportPDF(filteredEmployees)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredEmployees)}
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
                navigate(`${basePath}/employee/add`);
              }}
              className={`w-full flex items-center justify-center shadow-sm bg-blue-600 px-3 h-8 text-xs text-white hover:bg-blue-700 ${
                canEdit ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              Add Employee
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
                title="Filter Employees"
                fields={[
                  {
                    key: "employee_name",
                    label: "Select employee",
                    options: employeeNameOptions,
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
              placeholder="Search by name, mobile, type, bank..."
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

      {/* ===== EMPLOYEE TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <EmployeeTable
          data={currentEmployees}
          setData={setEmployees}
          onEdit={(employee) => setEditingEmployee(employee)}
        />
      </div>

      {/* Employee Edit Modal */}
      <ReusableEditModal
        open={editingEmployee !== null}
        title="Edit Employee"
        item={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSubmit={handleEmployeeFormSubmit}
        fields={employeeFields}
        getInitialValues={(item) => ({
          ...item,
          payroll_date: item.payroll_date || new Date().toISOString().split("T")[0],
        })}
      />
    </div>
  );
}
