import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { feeTypeData } from "../data/feeTypeData";
import { feesTypeData } from "../data/feesTypeData";

export default function AddFeeTypePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from feeTypeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Load fees from localStorage
  const loadFees = () => {
    const storedData = localStorage.getItem("fees");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error("Error loading fees from localStorage:", e);
        return [];
      }
    }
    return [];
  };

  const [formData, setFormData] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: "",
    fees_amount: "",
    payable_last_date: "",
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("feeTypes");
    if (storedData) {
      // Data is stored, form is ready for new entry
    }
  }, []);

  // Get all data (static + localStorage)
  const getAllFeeTypeData = () => {
    const storedData = localStorage.getItem("feeTypes");
    const storedItems = storedData ? JSON.parse(storedData) : [];
    return [...feeTypeData, ...storedItems];
  };

  // Get class options
  const classOptions = getUniqueOptions(getAllFeeTypeData(), "class");

  // Get group options based on selected class
  const getGroupOptions = (selectedClass) => {
    if (!selectedClass) return getUniqueOptions(getAllFeeTypeData(), "group");
    const filtered = getAllFeeTypeData().filter(item => item.class === selectedClass);
    return getUniqueOptions(filtered, "group");
  };

  // Get section options based on selected class and group
  const getSectionOptions = (selectedClass, selectedGroup) => {
    if (!selectedClass && !selectedGroup) return getUniqueOptions(getAllFeeTypeData(), "section");
    let filtered = getAllFeeTypeData();
    if (selectedClass) filtered = filtered.filter(item => item.class === selectedClass);
    if (selectedGroup) filtered = filtered.filter(item => item.group === selectedGroup);
    return getUniqueOptions(filtered, "section");
  };

  const sessionOptions = getUniqueOptions(getAllFeeTypeData(), "session");
  
  // Get fees type options from both static data (feesTypeData.js) and localStorage
  const staticFeesTypeOptions = feesTypeData || [];
  const createdFees = loadFees();
  const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
  // Merge and remove duplicates
  const feesTypeOptions = [...new Set([...staticFeesTypeOptions, ...createdFeesNames])];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
      if (name === "class") {
        // Reset group and section when class changes
        updated.group = "";
        updated.section = "";
      } else if (name === "group") {
        // Reset section when group changes
        updated.section = "";
      }
      
      return updated;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
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

    // Get existing data from localStorage
    const storedData = localStorage.getItem("feeTypes");
    const existingData = storedData ? JSON.parse(storedData) : [];
    
    // Generate new serial number
    const maxSl = existingData.length > 0 
      ? Math.max(...existingData.map(item => item.sl || 0))
      : feeTypeData.length > 0
      ? Math.max(...feeTypeData.map(item => item.sl || 0))
      : 0;
    
    // Create new fee type entry
    // Note: total_payable and payable_due will be calculated by backend
    const newFeeType = {
      sl: maxSl + 1,
      group_name: formData.group, // Keep group_name for backward compatibility
      class: formData.class,
      group: formData.group,
      section: formData.section,
      session: formData.session,
      fees_type: formData.fees_type,
      fees_amount: parseFloat(formData.fees_amount) || 0,
      payable_last_date: formData.payable_last_date || "",
      // total_payable and payable_due will be calculated by backend - not included here
    };

    // Add to localStorage
    const updatedData = [...existingData, newFeeType];
    localStorage.setItem("feeTypes", JSON.stringify(updatedData));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('feeTypesUpdated'));

    console.log("FEE TYPE DATA SAVED TO LOCALSTORAGE 👉", newFeeType);
    alert("Fee Type Added Successfully ✅");
    
    // Navigate back to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/type`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/type`);
  };

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";
  const basePath = canEdit ? "/school/dashboard" : "/teacher/dashboard";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";

  return (
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* Header */}
      <div
        className={`mb-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6`}
      >
        <h1 className="text-base font-semibold">Add Fees Type</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/fee/type`}
            className="hover:text-indigo-600 transition"
          >
            Fee Type List
          </Link>
          <span className="mx-1">/</span>Add Fees Type
        </p>
      </div>

      {/* Form - Modal Style */}
      <div className="flex items-center justify-center">
        <div
          className={`${modalBg} ${textColor} w-full max-w-md rounded-lg shadow-xl border ${borderClr} p-6`}
        >
          <h2 className="text-lg font-semibold text-center mb-6">Add Fees Type</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            {/* Class */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Class
              </label>
              <Input
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                type="select"
                options={classOptions}
                inputClassName={inputBg}
              />
            </div>

            {/* Group */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Group
              </label>
              <Input
                label="Group"
                name="group"
                value={formData.group}
                onChange={handleChange}
                type="select"
                options={getGroupOptions(formData.class || "")}
                inputClassName={inputBg}
              />
            </div>

            {/* Section */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Section
              </label>
              <Input
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                type="select"
                options={getSectionOptions(formData.class || "", formData.group || "")}
                inputClassName={inputBg}
              />
            </div>

            {/* Session */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Session
              </label>
              <Input
                label="Session"
                name="session"
                value={formData.session}
                onChange={handleChange}
                type="select"
                options={sessionOptions}
                inputClassName={inputBg}
              />
            </div>

            {/* Fees Type (Admission) */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Fees Type
              </label>
              <Input
                label="Admission"
                name="fees_type"
                value={formData.fees_type}
                onChange={handleChange}
                type="select"
                options={feesTypeOptions}
                inputClassName={inputBg}
              />
            </div>

            {/* Type Amount */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Type Amount
              </label>
              <Input
                label="Type Amount"
                name="fees_amount"
                value={formData.fees_amount}
                onChange={handleChange}
                type="number"
                placeholder="Type Amount"
                inputClassName={inputBg}
              />
            </div>

            {/* Payable Last Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${textColor}`}>
                Payable Last Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="payable_last_date"
                  value={formData.payable_last_date}
                  onChange={handleChange}
                  className={`w-full h-8 border ${borderClr} ${inputBg} px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 h-10 border ${borderClr} ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"} transition rounded`}
              >
                Close
              </button>

              <button
                type="submit"
                className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 transition rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
