import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { feeTypeData } from "../data/feeTypeData";

export default function AddFeeTypePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from feeTypeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(feeTypeData, "class");
  const groupOptions = getUniqueOptions(feeTypeData, "group");
  const sectionOptions = getUniqueOptions(feeTypeData, "section");
  const sessionOptions = getUniqueOptions(feeTypeData, "session");
  const feesTypeOptions = getUniqueOptions(feeTypeData, "fees_type");

  const [formData, setFormData] = useState({
    group_name: "",
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: "",
    fees_amount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !formData.group_name ||
      !formData.class ||
      !formData.group ||
      !formData.section ||
      !formData.session ||
      !formData.fees_type ||
      !formData.fees_amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    console.log("FEE TYPE DATA 👉", formData);
    alert("Fee Type Added Successfully ✅");
    // Here you can call API to save fee type, then redirect to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/feetypelist`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/feetypelist`);
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
        <h1 className="text-base font-semibold">Add Fee Type</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/feetypelist`}
            className="hover:text-indigo-600 transition"
          >
            Fee Type List
          </Link>
          <span className="mx-1">/</span>Add Fee Type
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Fee Type Information</h2>
        
        {/* Grid layout for inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Type Group Name"
            name="group_name"
            value={formData.group_name}
            onChange={handleChange}
            type="text"
          />

          <Input
            label="Select Class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            type="select"
            options={classOptions}
          />

          <Input
            label="Select Group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            type="select"
            options={groupOptions}
          />

          <Input
            label="Select Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            type="select"
            options={sectionOptions}
          />

          <Input
            label="Select Session"
            name="session"
            value={formData.session}
            onChange={handleChange}
            type="select"
            options={sessionOptions}
          />

          <Input
            label="Fees Type"
            name="fees_type"
            value={formData.fees_type}
            onChange={handleChange}
            type="select"
            options={feesTypeOptions}
          />

          <Input
            label="Fees Amount"
            name="fees_amount"
            value={formData.fees_amount}
            onChange={handleChange}
            type="number"
            placeholder="Enter fees amount"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 h-8 border border-gray-300 w-full md:w-auto hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
