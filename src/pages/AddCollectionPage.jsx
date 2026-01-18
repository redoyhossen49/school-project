import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { collectionData } from "../data/collectionData";
import { feeTypeData } from "../data/feeTypeData";
import { studentData } from "../data/studentData";
import { discountData } from "../data/discountData";

export default function AddCollectionPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from collectionData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };
  
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
    fees_amounts: {}, // Object to store fees_type and their amounts { "Tuition": 5000, "Exam": 1000 }
    total_payable: 0, // Calculated field
    payable_due: 0, // Calculated field
    pay_type: "",
    total: 0, // Calculated field
    type_amount: "",
    total_due: 0, // Calculated field
    pay_date: today, // Auto-select today's date
  });

  // Auto-populate Class, Group, Section, Session when Student ID is entered
  // Also check for existing collection data for this student
  useEffect(() => {
    if (formData.student_id) {
      // Find the student by studentId (from studentData)
      const student = studentData.find(
        (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
      );

      if (student) {
        // Update form fields with student data
        setFormData((prev) => ({
          ...prev,
          class: student.className || "",
          group: student.group || "",
          section: student.section || "",
          session: student.session || "",
        }));

        // Check if there's existing collection data for this student (using student_id from collectionData)
        // Relation: studentData.studentId === collectionData.student_id
        const existingCollections = collectionData.filter(
          (collection) => collection.student_id?.toUpperCase() === formData.student_id.toUpperCase()
        );

        // If there are existing collections, you can use them to pre-populate or show history
        // For now, we just ensure the relation is established
        if (existingCollections.length > 0) {
          // Collections exist for this student - relation is established
          console.log(`Found ${existingCollections.length} collection(s) for student ${formData.student_id}`);
        }
      } else {
        // Clear fields if student not found
        setFormData((prev) => ({
          ...prev,
          class: "",
          group: "",
          section: "",
          session: "",
        }));
      }
    } else {
      // Clear fields if student_id is empty
      setFormData((prev) => ({
        ...prev,
        class: "",
        group: "",
        section: "",
        session: "",
      }));
    }
  }, [formData.student_id]);

  // Calculate fees amounts based on selected fees types using collectionData or feeTypeData
  useEffect(() => {
    if (formData.fees_type.length > 0 && formData.class && formData.group && formData.section && formData.session) {
      // First, check if there's existing collection data for this student and fees types
      // Relation: studentData.studentId === collectionData.student_id (case-insensitive)
      const matchingCollections = collectionData.filter(
        (collection) =>
          collection.student_id?.toUpperCase() === formData.student_id.toUpperCase() &&
          collection.class === formData.class &&
          collection.group === formData.group &&
          collection.section === formData.section &&
          collection.session === formData.session
      );

      // Check if any collection has matching fees_type
      const feesTypeString = formData.fees_type.join(", ");
      let totalPayable = 0;
      let payableDue = 0;
      let feesAmountsObj = {}; // Declare outside if-else for proper scope

      // If we have matching collection data, use it
      const matchedCollection = matchingCollections.find(
        (collection) => collection.fees_type === feesTypeString || formData.fees_type.includes(collection.fees_type)
      );

      if (matchedCollection) {
        // Use existing collection data
        totalPayable = matchedCollection.total_payable || 0;
        payableDue = matchedCollection.payable_due || 0;
      } else {
        // Calculate from feeTypeData
        const matchingFees = feeTypeData.filter(
          (fee) =>
            fee.class === formData.class &&
            fee.group === formData.group &&
            fee.section === formData.section &&
            fee.session === formData.session &&
            formData.fees_type.includes(fee.fees_type)
        );

        // Store fees amounts and calculate total payable from matching fees with discount applied
        feesAmountsObj = {};
        
        totalPayable = matchingFees.reduce((sum, fee) => {
          let feeAmount = fee.fees_amount || 0;
          
          // Store the original fee amount for this fees_type
          feesAmountsObj[fee.fees_type] = feeAmount;
          
          // Check if there's a discount for this student and fees_type
          if (formData.student_id) {
            // Find student name from studentData
            const student = studentData.find(
              (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
            );
            
            if (student) {
              // Find matching discount for this fees_type
              const matchingDiscount = discountData.find(
                (discount) =>
                  discount.student_name === student.name &&
                  discount.class === formData.class &&
                  discount.group === formData.group &&
                  discount.section === formData.section &&
                  discount.session === formData.session &&
                  discount.fees_type === fee.fees_type
              );
              
              if (matchingDiscount) {
                // Check if discount is valid for current date
                const today = new Date().toISOString().split("T")[0];
                const startDate = matchingDiscount.start_date;
                const endDate = matchingDiscount.end_date;
                
                if (today >= startDate && today <= endDate) {
                  // Apply discount: regular amount - discount amount
                  feeAmount = Math.max(0, (matchingDiscount.regular || feeAmount) - (matchingDiscount.discount_amount || 0));
                  // Update stored amount with discounted amount
                  feesAmountsObj[fee.fees_type] = feeAmount;
                }
              }
            }
          }
          
          return sum + feeAmount;
        }, 0);
        
        payableDue = totalPayable; // Initially payable_due equals total_payable
      }

      // Set formData with fees_amounts, total_payable, and payable_due
      setFormData((prev) => {
        const updated = {
          ...prev,
          total_payable: totalPayable,
          payable_due: payableDue,
        };
        
        // Only update fees_amounts if we calculated them (when not using existing collection data)
        if (!matchedCollection && totalPayable > 0 && Object.keys(feesAmountsObj).length > 0) {
          updated.fees_amounts = feesAmountsObj;
        }
        
        return updated;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        fees_amounts: {},
        total_payable: 0,
        payable_due: 0,
      }));
    }
  }, [formData.fees_type, formData.student_id, formData.class, formData.group, formData.section, formData.session]);

  // Calculate payable_due, total, and total_due based on type_amount and total_payable
  // This will update immediately when fees_type is selected (via total_payable change)
  useEffect(() => {
    const typeAmount = parseFloat(formData.type_amount) || 0;
    const totalPayable = formData.total_payable || 0;
    
    // Payable due = Total payable - Type amount
    // Initially, if no amount is entered, payable_due equals total_payable
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

          {/* Show Class - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Class</label>
            <input
              type="text"
              value={formData.class}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show Group - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Group</label>
            <input
              type="text"
              value={formData.group}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show Section - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Section</label>
            <input
              type="text"
              value={formData.section}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show Session - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Show Session</label>
            <input
              type="text"
              value={formData.session}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

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
