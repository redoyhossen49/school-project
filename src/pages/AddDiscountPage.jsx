import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { discountData } from "../data/discountData";

export default function AddDiscountPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from discountData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const groupNameOptions = getUniqueOptions(discountData, "group_name");
  const classOptions = getUniqueOptions(discountData, "class");
  const groupOptions = getUniqueOptions(discountData, "group");
  const sectionOptions = getUniqueOptions(discountData, "section");
  const sessionOptions = getUniqueOptions(discountData, "session");
  const studentNameOptions = getUniqueOptions(discountData, "student_name");
  
  // Fees type options as specified by user
  const feesTypeOptions = ["Admission", "Monthly", "Food", "Exam", "Session"];

  const [formData, setFormData] = useState({
    group_name: "",
    class: "",
    group: "",
    section: "",
    session: "",
    student_name: "",
    fees_type: "",
    regular: "",
    discount_amount: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      "group_name",
      "class",
      "group",
      "section",
      "session",
      "student_name",
      "fees_type",
      "regular",
      "discount_amount",
      "start_date",
      "end_date",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`${field.replace("_", " ")} is required`);
        return;
      }
    }

    console.log("DISCOUNT DATA 👉", formData);
    alert("Discount Added Successfully ✅");
    // Here you can call API to save discount, then redirect to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/discount`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/discount`);
  };

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";
  const basePath = canEdit ? "/school/dashboard" : "/teacher/dashboard";


  return (
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* Header */}
      <div
        className={`mb-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6`}
      >
        <h1 className="text-base font-semibold">Add Discount</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/fee/discount`}
            className="hover:text-indigo-600 transition"
          >
            Discount List
          </Link>
          <span className="mx-1">/</span>Add Discount
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Discount Information</h2>
        
        {/* Grid layout for inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Select Group Name"
            name="group_name"
            value={formData.group_name}
            onChange={handleChange}
            type="select"
            options={groupNameOptions}
          />

          <Input
            label="Show Class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            type="select"
            options={classOptions}
          />

          <Input
            label="Show Group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            type="select"
            options={groupOptions}
          />

          <Input
            label="Show Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            type="select"
            options={sectionOptions}
          />

          <Input
            label="Show Session"
            name="session"
            value={formData.session}
            onChange={handleChange}
            type="select"
            options={sessionOptions}
          />

          <Input
            label="Select Student"
            name="student_name"
            value={formData.student_name}
            onChange={handleChange}
            type="select"
            options={studentNameOptions}
          />

          <Input
            label="Select Fees Type"
            name="fees_type"
            value={formData.fees_type}
            onChange={handleChange}
            type="select"
            options={feesTypeOptions}
          />

          <Input
            label="Show Regular Amount"
            name="regular"
            value={formData.regular}
            onChange={handleChange}
            type="number"
          />

          <Input
            label="Type Amount"
            name="discount_amount"
            value={formData.discount_amount}
            onChange={handleChange}
            type="number"
          />

          <Input
            label="Dis Start Date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            type="date"
          />

          <Input
            label="Dis End Date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            type="date"
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
