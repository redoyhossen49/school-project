import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { collectionData } from "../data/collectionData";
import { feeTypeData } from "../data/feeTypeData";

export default function AddCollectionPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from collectionData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(collectionData, "class");
  const groupOptions = getUniqueOptions(collectionData, "group");
  const sectionOptions = getUniqueOptions(collectionData, "section");
  const sessionOptions = getUniqueOptions(collectionData, "session");
  
  // Get unique fees types from feeTypeData
  const feesTypeOptions = getUniqueOptions(feeTypeData, "fees_type");
  
  const payTypeOptions = ["Due", "Payable", "Advance"];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // State for fees type dropdown
  const [feesTypeDropdownOpen, setFeesTypeDropdownOpen] = useState(false);
  const feesTypeDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (feesTypeDropdownRef.current && !feesTypeDropdownRef.current.contains(e.target)) {
        setFeesTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    student_id: "",
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: [], // Array for multi-select checkboxes
    total_payable: 0, // Calculated field
    payable_due: 0, // Calculated field
    pay_type: "",
    total: 0, // Calculated field
    type_amount: "",
    total_due: 0, // Calculated field
    pay_date: today, // Auto-select today's date
  });

  // Calculate fees amounts based on selected fees types
  useEffect(() => {
    if (formData.fees_type.length > 0 && formData.class && formData.group && formData.section && formData.session) {
      // Filter feeTypeData based on selected class, group, section, session
      const matchingFees = feeTypeData.filter(
        (fee) =>
          fee.class === formData.class &&
          fee.group === formData.group &&
          fee.section === formData.section &&
          fee.session === formData.session &&
          formData.fees_type.includes(fee.fees_type)
      );

      // Calculate total payable from matching fees
      const totalPayable = matchingFees.reduce((sum, fee) => sum + (fee.fees_amount || 0), 0);
      
      setFormData((prev) => ({
        ...prev,
        total_payable: totalPayable,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        total_payable: 0,
      }));
    }
  }, [formData.fees_type, formData.class, formData.group, formData.section, formData.session]);

  // Calculate payable_due, total, and total_due based on type_amount
  useEffect(() => {
    const typeAmount = parseFloat(formData.type_amount) || 0;
    const totalPayable = formData.total_payable || 0;
    
    // Payable due = Total payable - Type amount
    const payableDue = Math.max(0, totalPayable - typeAmount);
    
    // Total = Total payable (same as total_payable)
    const total = totalPayable;
    
    // Total due = Payable due (remaining balance)
    const totalDue = payableDue;

    setFormData((prev) => ({
      ...prev,
      payable_due: payableDue,
      total: total,
      total_due: totalDue,
    }));
  }, [formData.type_amount, formData.total_payable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle fees type checkbox change
  const handleFeesTypeChange = (feesType) => {
    setFormData((prev) => {
      const currentTypes = prev.fees_type || [];
      const isSelected = currentTypes.includes(feesType);
      
      if (isSelected) {
        // Remove if already selected
        return {
          ...prev,
          fees_type: currentTypes.filter((type) => type !== feesType),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          fees_type: [...currentTypes, feesType],
        };
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.student_id) {
      alert("Student id is required");
      return;
    }
    if (!formData.class) {
      alert("Class is required");
      return;
    }
    if (!formData.group) {
      alert("Group is required");
      return;
    }
    if (!formData.section) {
      alert("Section is required");
      return;
    }
    if (!formData.session) {
      alert("Session is required");
      return;
    }
    if (formData.fees_type.length === 0) {
      alert("Please select at least one Fees Type");
      return;
    }
    if (!formData.pay_type) {
      alert("Pay type is required");
      return;
    }
    if (!formData.type_amount || parseFloat(formData.type_amount) <= 0) {
      alert("Type amount is required and must be greater than 0");
      return;
    }
    if (!formData.pay_date) {
      alert("Pay Date is required");
      return;
    }

    // Check if there's remaining balance that must be paid
    if (formData.total_due > 0) {
      const shouldContinue = confirm(
        `There is a remaining balance of ৳${formData.total_due}. Do you want to continue without paying the full amount?`
      );
      if (!shouldContinue) {
        return;
      }
    }

    const collectionDataToSave = {
      ...formData,
      fees_type: formData.fees_type.join(", "), // Convert array to comma-separated string
      total_plistayable: formData.total_payable,
      payable_due: formData.payable_due,
      total: formData.total,
      type_amount: parseFloat(formData.type_amount) || 0,
      total_due: formData.total_due,
    };

    console.loglist("COLLECTION DATA 👉", collectionDataToSave);
    alert("Collection Added Successfully ✅");
    
    // Here you can call API to save collection, then redirect to list
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/collection`);
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role");
    const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
    navigate(`${basePath}/fee/collection`);
  };

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";
  const basePath = canEdit ? "/school/dashboard" : "/teacher/dashboard";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";
  const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600";

  return (
    <div classNamelist="py-4 px-2 md:mx-0 min-h-screen">
      {/* Header */}
      <div
        className={`mb-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6`}
      >
        <h1 className="text-base font-semibold">Add Collection</h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-200" : "text-gray-400"}`}>
          <Link to={basePath} className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to={`${basePath}/fee/collection`}
            className="hover:text-indigo-600 transition"
          >
            Collection List
          </Link>
          <span className="mx-1">/</span>Add Collection
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Collection Information</h2>

        {/* Grid layout for inputs - Line by line */}
        <div className="grid grid-cols-1 gap-4">
          {/* Type student id */}
          <Input
            label="Type student id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            type="text"
          />

          {/* Show Class */}
          <Input
            label="Show Class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            type="select"
            options={classOptions}
          />

          {/* Show Group */}
          <Input
            label="Show Group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            type="select"
            options={groupOptions}
          />

          {/* Show Section */}
          <Input
            label="Show Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            type="select"
            options={sectionOptions}
          />

          {/* Show Session */}
          <Input
            label="Show Session"
            name="session"
            value={formData.session}
            onChange={handleChange}
            type="select"
            options={sessionOptions}
          />

          {/* Select Fees Type - Dropdown with Checkboxes */}
          <div className="relative w-full" ref={feesTypeDropdownRef}>
            <div
              className={`w-full h-8 border px-2 text-sm flex items-center justify-between cursor-pointer ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-gray-300"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
              onClick={() => setFeesTypeDropdownOpen(!feesTypeDropdownOpen)}
            >
              <span className={formData.fees_type.length > 0 ? "" : "text-gray-400"}>
                {formData.fees_type.length > 0
                  ? `${formData.fees_type.length} fee type${formData.fees_type.length > 1 ? "s" : ""} selected`
                  : "Select Fees Type"}
              </span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform ${
                  feesTypeDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown with Checkboxes */}
            {feesTypeDropdownOpen && (
              <ul
                className={`absolute z-50 w-full border mt-1 max-h-48 overflow-y-auto ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {feesTypeOptions.map((feesType) => {
                  const isSelected = formData.fees_type.includes(feesType);
                  return (
                    <li
                      key={feesType}
                      className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                        darkMode
                          ? "hover:bg-gray-600 text-gray-300"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeesTypeChange(feesType);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFeesTypeChange(feesType)}
                        className={`w-4 h-4 cursor-pointer rounded border-2 transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : darkMode
                            ? "border-gray-500 bg-transparent"
                            : "border-gray-400 bg-white"
                        } focus:ring-2 focus:ring-blue-500 focus:ring-offset-0`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm select-none">{feesType}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Show Total payable - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Total payable</label>
            <input
              type="number"
              value={formData.total_payable}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show Payable due - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Payable due</label>
            <input
              type="number"
              value={formData.payable_due}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Select Pay type */}
          <Input
            label="Select Pay type"
            name="pay_type"
            value={formData.pay_type}
            onChange={handleChange}
            type="select"
            options={payTypeOptions}
          />

          {/* Show Total - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Total</label>
            <input
              type="number"
              value={formData.total}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Type amount */}
          <Input
            label="Type amount"
            name="type_amount"
            value={formData.type_amount}
            onChange={handleChange}
            type="number"
          />

          {/* Show Total due - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">
              Show Total due
              {formData.total_due > 0 && (
                <span className="text-red-500 ml-1">(Remaining balance must be paid)</span>
              )}
            </label>
            <input
              type="number"
              value={formData.total_due}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed ${
                formData.total_due > 0 ? "border-red-500" : ""
              }`}
            />
          </div>

          {/* Pay Date - Auto-select today's date */}
          <Input
            label="Pay Date"
            name="pay_date"
            value={formData.pay_date}
            onChange={handleChange}
            type="date"
          />
        </div>

        {/* Warning message if there's remaining balance */}
        {formData.total_due > 0 && (
          <div className={`p-3 rounded border ${darkMode ? "bg-red-900/30 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
            <p className="text-sm font-medium">
              ⚠️ Warning: There is a remaining balance of ৳{formData.total_due}. Please ensure the full amount is paid.
            </p>
          </div>
        )}

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
