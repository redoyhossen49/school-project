import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { employeeData } from "../data/employeeData";

export default function AddEmployeePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    employee_name: "",
    mobile_number: "",
    employee_type: "",
    employee_type_other: "",
    monthly_leave: "",
    salary_amount: "",
    payroll_date: today,
    bank_name: "",
    branch: "",
    routing_number: "",
    ac_holder_name: "",
    ac_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear employee_type_other when employee_type is not "others"
    if (name === "employee_type" && value !== "others") {
      setFormData((prev) => ({ ...prev, employee_type_other: "" }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.employee_name) {
      alert("Employee name is required");
      return;
    }
    if (!formData.mobile_number) {
      alert("Mobile number is required");
      return;
    }
    if (!formData.employee_type) {
      alert("Employee Type is required");
      return;
    }
    if (formData.employee_type === "others" && !formData.employee_type_other) {
      alert("Please specify the employee type (others)");
      return;
    }
    if (!formData.salary_amount || parseFloat(formData.salary_amount) <= 0) {
      alert("Salary Amount is required and must be greater than 0");
      return;
    }
    if (!formData.payroll_date) {
      alert("Payroll date is required");
      return;
    }

    const employeeDataToSave = {
      ...formData,
      monthly_leave: formData.monthly_leave ? parseInt(formData.monthly_leave) : 0,
      salary_amount: parseFloat(formData.salary_amount) || 0,
      // Calculate total_payable and payable_due (same as salary for now, can be adjusted)
      total_payable: parseFloat(formData.salary_amount) || 0,
      payable_due: 0, // Default to 0, can be adjusted later
      leave_remaining: formData.monthly_leave ? parseInt(formData.monthly_leave) : 0,
    };

    console.log("EMPLOYEE DATA 👉", employeeDataToSave);
    alert("Employee Added Successfully ✅");
    
    // Here you can call API to save employee, then redirect to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/hrm/employee`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/hrm/employee`);
  };

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";
  const basePath = canEdit ? "/school/dashboard" : "/teacher/dashboard";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";

  const employeeTypeOptions = ["Teacher", "Others"];

  return (
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* Header */}
      <div
        className={`mb-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6`}
      >
        <h1 className="text-base font-semibold">Add Employee</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/employee`}
            className="hover:text-indigo-600 transition"
          >
            Employee List
          </Link>
          <span className="mx-1">/</span>Add Employee
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Employee Information</h2>

        {/* Grid layout for inputs - Column wise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Employee name */}
          <Input
            label="Employee name"
            name="employee_name"
            value={formData.employee_name}
            onChange={handleChange}
            type="text"
          />

          {/* Mobile number */}
          <Input
            label="Mobile number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            type="text"
          />

          {/* Employee Type */}
          <Input
            label="Employee Type"
            name="employee_type"
            value={formData.employee_type}
            onChange={handleChange}
            type="select"
            options={employeeTypeOptions}
          />

          {/* Employee Type Other - Show only when "others" is selected */}
          {formData.employee_type === "others" && (
            <Input
              label="Employee Type (Others - specify)"
              name="employee_type_other"
              value={formData.employee_type_other}
              onChange={handleChange}
              type="text"
            />
          )}

          {/* Monthly Leave */}
          <Input
            label="Monthly Leave"
            name="monthly_leave"
            value={formData.monthly_leave}
            onChange={handleChange}
            type="number"
          />

          {/* Salary Amount */}
          <Input
            label="Salary Amount"
            name="salary_amount"
            value={formData.salary_amount}
            onChange={handleChange}
            type="number"
          />

          {/* Payroll date */}
          <Input
            label="Payroll date"
            name="payroll_date"
            value={formData.payroll_date}
            onChange={handleChange}
            type="date"
          />

          {/* Bank name */}
          <Input
            label="Bank name"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            type="text"
          />

          {/* Branch */}
          <Input
            label="Branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            type="text"
          />

          {/* Routing number */}
          <Input
            label="Routing number"
            name="routing_number"
            value={formData.routing_number}
            onChange={handleChange}
            type="text"
          />

          {/* A/C holder name */}
          <Input
            label="A/C holder name"
            name="ac_holder_name"
            value={formData.ac_holder_name}
            onChange={handleChange}
            type="text"
          />

          {/* A/C number */}
          <Input
            label="A/C number"
            name="ac_number"
            value={formData.ac_number}
            onChange={handleChange}
            type="text"
          />
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
