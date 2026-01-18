import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { employeeData } from "../data/employeeData";
import { teacherData } from "../data/teacherData";
import { payrollData } from "../data/payrollData";

export default function AddPayrollPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee: "",
    employee_type: "",
    total_salary: "",
    total_due: "",
    advance_status: "No",
    pay_type: "payroll",
    payroll_amount: "",
    pay_month: "",
    pay_year: new Date().getFullYear().toString(),
    pay_date: "",
  });

  // Get unique employee names from employeeData
  const employeeOptions = useMemo(() => {
    return employeeData.map((emp) => emp.employee_name);
  }, []);

  // Get selected employee details
  const selectedEmployee = useMemo(() => {
    if (!formData.employee) return null;
    return employeeData.find((emp) => emp.employee_name === formData.employee);
  }, [formData.employee]);

  // Get teacher attendance data if employee is teacher
  const teacherAttendance = useMemo(() => {
    if (!selectedEmployee || selectedEmployee.employee_type !== "teacher") return null;
    return teacherData.find(
      (t) => t.teacherName.toLowerCase() === selectedEmployee.employee_name.toLowerCase()
    );
  }, [selectedEmployee]);

  // Calculate working days in a month
  const getWorkingDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    let workingDays = 0;
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();
      // Count Monday to Saturday as working days (excluding Sunday)
      if (dayOfWeek !== 0) {
        workingDays++;
      }
    }
    return workingDays;
  };

  // Calculate total salary for teachers based on attendance
  const calculateTeacherSalary = (month, year) => {
    if (!selectedEmployee || selectedEmployee.employee_type !== "teacher") {
      return selectedEmployee?.salary_amount || 0;
    }

    if (!teacherAttendance) {
      // If no attendance data, return full salary
      return selectedEmployee?.salary_amount || 0;
    }

    const baseSalary = selectedEmployee.salary_amount || 0;
    const workingDays = getWorkingDaysInMonth(parseInt(month), parseInt(year));
    
    // Get attendance counts for the month
    const presentDays = teacherAttendance.present || 0;
    const leaveDays = teacherAttendance.leave || 0;
    const absentDays = teacherAttendance.absence || 0;

    // Calculate daily salary
    const dailySalary = baseSalary / workingDays;

    // Total payable days = present + leave (absent days are deducted)
    const payableDays = presentDays + leaveDays;
    
    // Calculate total salary based on attendance
    const calculatedSalary = dailySalary * payableDays;

    return Math.round(calculatedSalary);
  };

  // Update employee type when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      const employeeTypeDisplay =
        selectedEmployee.employee_type === "teacher"
          ? "Teacher"
          : selectedEmployee.employee_type_other
          ? `Others (${selectedEmployee.employee_type_other})`
          : "Others";

      setFormData((prev) => ({
        ...prev,
        employee_type: employeeTypeDisplay,
      }));
    }
  }, [selectedEmployee]);

  // Calculate total salary when employee, month, or year changes
  useEffect(() => {
    if (formData.employee && formData.pay_month && formData.pay_year) {
      const calculatedSalary = calculateTeacherSalary(formData.pay_month, formData.pay_year);
      setFormData((prev) => ({
        ...prev,
        total_salary: calculatedSalary.toString(),
        // Calculate total due if payroll amount exists
        total_due: prev.payroll_amount
          ? Math.max(0, calculatedSalary - parseFloat(prev.payroll_amount || 0)).toString()
          : prev.total_due,
      }));
    } else if (selectedEmployee && !formData.pay_month) {
      // Set base salary if month/year not selected yet
      setFormData((prev) => ({
        ...prev,
        total_salary: selectedEmployee.salary_amount?.toString() || "",
      }));
    }
  }, [formData.employee, formData.pay_month, formData.pay_year, selectedEmployee]);

  // Calculate total due when payroll amount changes
  useEffect(() => {
    if (formData.total_salary && formData.payroll_amount) {
      const totalSalary = parseFloat(formData.total_salary || 0);
      const payrollAmount = parseFloat(formData.payroll_amount || 0);
      const due = totalSalary - payrollAmount;
      setFormData((prev) => ({
        ...prev,
        total_due: Math.max(0, due).toString(),
      }));
    } else if (formData.total_salary) {
      // If no payroll amount, due equals total salary
      setFormData((prev) => ({
        ...prev,
        total_due: formData.total_salary,
      }));
    }
  }, [formData.payroll_amount, formData.total_salary]);

  // Auto-set pay date when month/year changes
  useEffect(() => {
    if (formData.pay_month && formData.pay_year) {
      // Set pay date to 15th of the selected month/year
      const month = formData.pay_month.padStart(2, "0");
      const year = formData.pay_year;
      const payDate = `${year}-${month}-15`;
      setFormData((prev) => ({
        ...prev,
        pay_date: payDate,
      }));
    }
  }, [formData.pay_month, formData.pay_year]);

  // Update pay_type and advance_status based on payroll amount
  useEffect(() => {
    if (!formData.payroll_amount || parseFloat(formData.payroll_amount) === 0) {
      // If no amount, it's "due"
      setFormData((prev) => ({ ...prev, pay_type: "due" }));
      return;
    }

    const totalSalary = parseFloat(formData.total_salary || 0);
    const payrollAmount = parseFloat(formData.payroll_amount || 0);

    if (payrollAmount > totalSalary) {
      // If paying more than salary, it's advance
      setFormData((prev) => ({
        ...prev,
        pay_type: "advance",
        advance_status: "Yes",
      }));
    } else if (formData.advance_status === "Yes") {
      // If advance status is Yes, it's advance payment
      setFormData((prev) => ({ ...prev, pay_type: "advance" }));
    } else {
      // Otherwise it's regular payroll
      setFormData((prev) => ({ ...prev, pay_type: "payroll" }));
    }
  }, [formData.payroll_amount, formData.total_salary, formData.advance_status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.employee) {
      alert("Please select an employee");
      return;
    }
    if (!formData.total_salary || parseFloat(formData.total_salary) <= 0) {
      alert("Total salary must be greater than 0");
      return;
    }
    if (!formData.pay_type) {
      alert("Pay type is required");
      return;
    }
    if (!formData.payroll_amount || parseFloat(formData.payroll_amount) <= 0) {
      alert("Payroll amount must be greater than 0");
      return;
    }
    if (!formData.pay_month) {
      alert("Pay month is required");
      return;
    }
    if (!formData.pay_year) {
      alert("Pay year is required");
      return;
    }
    if (!formData.pay_date) {
      alert("Pay date is required");
      return;
    }

    const payrollDataToSave = {
      sl: payrollData.length + 1,
      employee: formData.employee,
      employee_type: formData.employee_type,
      total_salary: parseFloat(formData.total_salary),
      total_due: parseFloat(formData.total_due || 0),
      advance_status: formData.advance_status,
      pay_type: formData.pay_type.charAt(0).toUpperCase() + formData.pay_type.slice(1),
      payroll_amount: parseFloat(formData.payroll_amount),
      pay_month: formData.pay_month.padStart(2, "0"),
      pay_year: formData.pay_year,
      pay_date: formData.pay_date,
    };

    console.log("PAYROLL DATA 👉", payrollDataToSave);
    alert("Payroll Added Successfully ✅");

    // Here you can call API to save payroll, then redirect to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/hrm/payroll`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/hrm/payroll`);
  };

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";
  const basePath = canEdit ? "/school/dashboard" : "/teacher/dashboard";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";

  // Month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthNames = [
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
    return { value: monthNum.toString(), label: `${monthNum} - ${monthNames[i]}` };
  });

  // Year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return year.toString();
  });

  const payTypeOptions = ["due", "payroll", "advance"];
  const advanceStatusOptions = ["Yes", "No"];

  // Display attendance info for teachers
  const attendanceInfo =
    selectedEmployee?.employee_type === "teacher" && teacherAttendance
      ? `Present: ${teacherAttendance.present || 0}, Leave: ${teacherAttendance.leave || 0}, Absent: ${teacherAttendance.absence || 0}`
      : null;

  return (
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* Header */}
      <div
        className={`mb-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6`}
      >
        <h1 className="text-base font-semibold">Add Payroll</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/hrm/payroll`}
            className="hover:text-indigo-600 transition"
          >
            Payroll List
          </Link>
          <span className="mx-1">/</span>Add Payroll
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Payroll Information</h2>

        {/* Vertical layout for inputs */}
        <div className="space-y-4">
          {/* Select Employee */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Select Employee *</label>
            <Input
              label="Select Employee"
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              type="select"
              options={employeeOptions}
              inputClassName={inputBg}
            />
          </div>

          {/* Employee Type (Read-only) */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Employee Type</label>
            <div
              className={`w-full h-8 border ${borderClr} px-2 text-sm flex items-center ${
                darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}
            >
              {formData.employee_type || "-"}
            </div>
            {attendanceInfo && (
              <p className="text-xs text-blue-600 mt-1">{attendanceInfo}</p>
            )}
          </div>

          {/* Total Salary (Read-only for teachers, editable for others) */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Total Salary *</label>
            {selectedEmployee?.employee_type === "teacher" ? (
              <div
                className={`w-full h-8 border ${borderClr} px-2 text-sm flex items-center ${
                  darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}
              >
                ৳{parseFloat(formData.total_salary || 0).toLocaleString()}
              </div>
            ) : (
              <Input
                label="Total Salary"
                name="total_salary"
                value={formData.total_salary}
                onChange={handleChange}
                type="number"
                inputClassName={inputBg}
              />
            )}
          </div>

          {/* Total Due (Read-only) */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Total Due</label>
            <div
              className={`w-full h-8 border ${borderClr} px-2 text-sm flex items-center ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : parseFloat(formData.total_due || 0) > 0
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              ৳{parseFloat(formData.total_due || 0).toLocaleString()}
            </div>
          </div>

          {/* Advance Status */}
          <div className="relative w-full">
            <Input
              label="Advance Status"
              name="advance_status"
              value={formData.advance_status}
              onChange={handleChange}
              type="select"
              options={advanceStatusOptions}
              inputClassName={inputBg}
            />
          </div>

          {/* Pay Type */}
          <div className="relative w-full">
            <Input
              label="Pay Type *"
              name="pay_type"
              value={formData.pay_type}
              onChange={handleChange}
              type="select"
              options={payTypeOptions}
              inputClassName={inputBg}
            />
          </div>

          {/* Payroll Amount */}
          <div className="relative w-full">
            <Input
              label="Type Amount *"
              name="payroll_amount"
              value={formData.payroll_amount}
              onChange={handleChange}
              type="number"
              inputClassName={inputBg}
            />
          </div>

          {/* Pay Month */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Select Pay Month *</label>
            <select
              name="pay_month"
              value={formData.pay_month}
              onChange={(e) => {
                const monthValue = e.target.value;
                setFormData((prev) => ({ ...prev, pay_month: monthValue }));
              }}
              className={`w-full h-8 border ${borderClr} px-2 text-sm ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="">Select Month</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pay Year */}
          <div className="relative w-full">
            <Input
              label="Select Pay Year *"
              name="pay_year"
              value={formData.pay_year}
              onChange={handleChange}
              type="select"
              options={yearOptions}
              inputClassName={inputBg}
            />
          </div>

          {/* Pay Date (Auto-set) */}
          <div className="relative w-full">
            <label className="block text-xs font-medium mb-1">Pay Date (Auto)</label>
            <Input
              label="Pay Date"
              name="pay_date"
              value={formData.pay_date}
              onChange={handleChange}
              type="date"
              inputClassName={inputBg}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-6 h-8 border w-full md:w-auto shadow-sm transition ${
              darkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-600"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white shadow-sm hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}