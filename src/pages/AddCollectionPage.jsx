import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import Modal from "../components/Modal";
import { collectionData } from "../data/collectionData";
import { feeTypeData } from "../data/feeTypeData";
import { feesTypeData } from "../data/feesTypeData";
import { studentData } from "../data/studentData";
import { discountData } from "../data/discountData";
import { saveCollectionAPI, getCollectionsFromStorage, updateCollectionAPI } from "../utils/collectionUtils";

export default function AddCollectionPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from collectionData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };
  
  // Get fees types from feesTypeData.js and merge with localStorage created fees
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
  
  const createdFees = loadFees();
  const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
  const feesTypeOptions = [...new Set([...feesTypeData, ...createdFeesNames])];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];


  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "", // Auto-populated from studentData
    student_fees_due: 0, // Student's base fees due from studentData
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: [], // Array for multi-select checkboxes
    fees_amounts: {}, // Object to store fees_type and their amounts { "Tuition": 5000, "Exam": 1000 }
    total_payable: 0, // Calculated field
    payable_due: 0, // Calculated field
    total: 0, // Calculated field
    paid_amount: "", // Amount being paid
    total_due: 0, // Calculated field
    overdue_amount: 0, // Calculated field for overdue payments
    pay_date: today, // Auto-select today's date
    payment_method: "", // Cash or Bank
  });

  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
          student_name: student.student_name || student.name || "",
          student_fees_due: student.feesDue || 0, // Get student's base fees due
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
          student_name: "",
          student_fees_due: 0,
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
        student_name: "",
        student_fees_due: 0,
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
        // Get all fee types data (static + localStorage)
        const getAllFeeTypeData = () => {
          const storedData = localStorage.getItem("feeTypes");
          const storedItems = storedData ? JSON.parse(storedData) : [];
          return [...feeTypeData, ...storedItems];
        };
        
        const allFeeTypeData = getAllFeeTypeData();
        
        // Calculate from feeTypeData (static + localStorage)
        // Match: Fees Type, Class, Group, Section, Session
        const matchingFees = allFeeTypeData.filter(
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
                  discount.student_name === student.student_name &&
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

      // Set formData with fees_amounts, total_payable, payable_due
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

  // Calculate overdue amount from existing collections (from localStorage)
  // Only consider collections with remaining dues (total_due > 0)
  useEffect(() => {
    if (formData.student_id && formData.class && formData.group && formData.section && formData.session) {
      // Get collections from localStorage (with fallback to collectionData)
      const storedCollections = getCollectionsFromStorage();
      const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
      
      // Find all existing collections for this student with remaining dues
      // Only count collections where total_due > 0 (already paid ones won't affect overdue)
      const existingCollections = allCollections.filter(
        (collection) =>
          collection.student_id?.toUpperCase() === formData.student_id.toUpperCase() &&
          collection.class === formData.class &&
          collection.group === formData.group &&
          collection.section === formData.section &&
          collection.session === formData.session &&
          collection.total_due > 0
      );

      // Calculate total overdue amount (only from unpaid collections)
      const overdueAmount = existingCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);

      setFormData((prev) => ({
        ...prev,
        overdue_amount: overdueAmount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        overdue_amount: 0,
      }));
    }
  }, [formData.student_id, formData.class, formData.group, formData.section, formData.session]);

  // Calculate payable_due, total, total_due, and in_total based on paid_amount and total_payable
  // This will update immediately when fees_type is selected (via total_payable change)
  // Even if total_due becomes 0, user can still add new fees types (backend will calculate)
  useEffect(() => {
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const totalPayable = formData.total_payable || 0; // Total Fees
    const overdueAmount = formData.overdue_amount || 0;
    const studentFeesDue = formData.student_fees_due || 0; // Student's base fees due
    
    // Payable due = Total payable - Paid amount
    // Initially, if no amount is entered, payable_due equals total_payable
    const payableDue = Math.max(0, totalPayable - paidAmount);
    
    // In Total = Paid Amount (based on what user enters)
    const inTotal = paidAmount;
    
    // Total = Total payable + Overdue amount + Student fees due
    const total = totalPayable + overdueAmount + studentFeesDue;
    
    // Total Due = Total Fees (total_payable) + Student Fees Due (student_fees_due)
    // This is the sum of current fees and student's existing dues
    const calculatedTotalDue = totalPayable + studentFeesDue;
    
    // If paid amount is greater than or equal to calculated total due, set total_due to 0
    // Otherwise, use the calculated total_due
    // Even when total_due is 0, user can add new fees types and they will be calculated
    const totalDue = paidAmount >= calculatedTotalDue ? 0 : calculatedTotalDue;

    setFormData((prev) => ({
      ...prev,
      payable_due: payableDue,
      in_total: inTotal,
      total: total,
      total_due: totalDue,
    }));
  }, [formData.paid_amount, formData.total_payable, formData.overdue_amount, formData.student_fees_due]);

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

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: method,
    }));
  };

  // Handle collection button click - open payment modal
  const handleCollectionClick = () => {
    // Validate required fields before opening modal
    if (!formData.student_id) {
      alert("Please enter Student ID");
      return;
    }
    if (formData.fees_type.length === 0) {
      alert("Please select at least one Fees Type");
      return;
    }
    if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
      alert("Please enter a valid Paid Amount");
      return;
    }
    setShowPaymentModal(true);
  };

  // Handle payment modal save
  const handlePaymentSave = () => {
    if (!formData.payment_method) {
      alert("Please select a payment method (Cash or Bank)");
      return;
    }

    // Close modal and proceed with save
    setShowPaymentModal(false);
    handleSave();
  };

  // Handle payment modal close
  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setFormData((prev) => ({
      ...prev,
      payment_method: "",
    }));
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
    }

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
    if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
      alert("Paid amount is required and must be greater than 0");
      return;
    }
    if (!formData.pay_date) {
      alert("Pay Date is required");
      return;
    }
    if (!formData.payment_method) {
      alert("Payment method is required");
      return;
    }

    // If total_due is already 0 (overpayment), no need to show confirmation
    // Only show confirmation if there's remaining balance
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    // Total Due = Total Fees + Student Fees Due
    const calculatedTotalDue = formData.total_payable + formData.student_fees_due;
    
    if (calculatedTotalDue > 0 && paidAmount < calculatedTotalDue) {
      const shouldContinue = confirm(
        `There is a remaining balance of ৳${calculatedTotalDue} (Total Fees: ৳${formData.total_payable} + Student Fees Due: ৳${formData.student_fees_due}). Do you want to continue without paying the full amount?`
      );
      if (!shouldContinue) {
        return;
      }
    }

    const collectionDataToSave = {
      student_id: formData.student_id,
      student_name: formData.student_name, // Save student name
      class: formData.class,
      group: formData.group,
      section: formData.section,
      session: formData.session,
      fees_type: formData.fees_type.join(", "), // Convert array to comma-separated string
      total_payable: formData.total_payable,
      payable_due: formData.payable_due,
      type_amount: parseFloat(formData.paid_amount) || 0, // Keep type_amount for compatibility
      paid_amount: parseFloat(formData.paid_amount) || 0,
      total: formData.total,
      total_due: formData.total_due,
      overdue_amount: formData.overdue_amount,
      pay_date: formData.pay_date,
      payment_method: formData.payment_method,
    };

    try {
      // Get existing collections before saving new one
      const storedCollections = getCollectionsFromStorage();
      const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
      
      // Find all existing collections for this student (excluding the one we're about to save)
      const existingStudentCollections = allCollections.filter(
        (collection) => collection.student_id?.toUpperCase() === formData.student_id.toUpperCase()
      );
      
      // Calculate total existing due from previous collections
      const totalExistingDue = existingStudentCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);
      
      // If paid amount covers all existing due, update previous collections' total_due to 0
      if (paidAmount >= totalExistingDue && totalExistingDue > 0) {
        // Update all previous collections for this student
        for (const collection of existingStudentCollections) {
          if (collection.total_due > 0) {
            await updateCollectionAPI(collection.sl, {
              ...collection,
              total_due: 0,
              payable_due: 0, // Also set payable_due to 0
            });
          }
        }
      }
      
      // Save new collection to localStorage (ready for API integration)
      await saveCollectionAPI(collectionDataToSave);
      
      // Update student's feesDue based on all collections
      const updateStudentFeesDue = () => {
        const updatedCollections = getCollectionsFromStorage();
        const finalCollections = updatedCollections.length > 0 ? updatedCollections : collectionData;
        
        // Find all collections for this student
        const studentCollections = finalCollections.filter(
          (collection) => collection.student_id?.toUpperCase() === formData.student_id.toUpperCase()
        );
        
        // Calculate total due from all collections
        const totalDue = studentCollections.reduce((sum, collection) => {
          return sum + (collection.total_due || 0);
        }, 0);
        
        // Update student data in localStorage
        const storedStudents = localStorage.getItem("students");
        let students = storedStudents ? JSON.parse(storedStudents) : [...studentData];
        
        // Find and update the student
        const studentIndex = students.findIndex(
          (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
        );
        
        if (studentIndex !== -1) {
          students[studentIndex] = {
            ...students[studentIndex],
            feesDue: totalDue, // Update feesDue based on total_due from collections
          };
          localStorage.setItem("students", JSON.stringify(students));
          
          // Dispatch event to notify StudentList to refresh
          window.dispatchEvent(new Event('studentsUpdated'));
        }
      };
      
      // Update student feesDue
      updateStudentFeesDue();
      
      console.log("COLLECTION DATA SAVED 👉", collectionDataToSave);
      alert("Collection Added Successfully ✅");
      
      // Redirect to collection list
      const userRole = localStorage.getItem("role");
      const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
      navigate(`${basePath}/fee/collection`);
    } catch (error) {
      console.error("Error saving collection:", error);
      alert("Error saving collection. Please try again.");
    }
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
        <h1 className="text-base font-semibold">Fees Collection</h1>
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
        <h2 className="text-center">Fees Collection</h2>

        {/* Grid layout for inputs - Line by line */}
        <div className="grid grid-cols-1 gap-4">
          {/* Type student id */}
          <Input
            label="Type Student ID (e.g. 101)"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            type="text"
            placeholder="Type Student ID (e.g. 101)"
          />

          {/* Student Name - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <input
              type="text"
              value={formData.student_name}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

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

          {/* Select Fees Type - Simple List with Checkboxes */}
          <div className="relative w-full">
            <label className="block text-sm font-semibold mb-3">
              SELECT FEES TYPE
            </label>
            <div className="space-y-2">
              {feesTypeOptions.map((feesType) => {
                const isSelected = formData.fees_type.includes(feesType);
                return (
                  <div
                    key={feesType}
                    className={`flex items-center justify-between py-2 px-3 border rounded ${
                      darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <span
                      className={`text-sm cursor-pointer flex-1 ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                      onClick={() => handleFeesTypeChange(feesType)}
                    >
                      {feesType}
                      {formData.fees_amounts[feesType] && (
                        <span className={`ml-2 font-medium ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}>
                          - ৳{formData.fees_amounts[feesType]}
                        </span>
                      )}
                    </span>
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
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show Total Fees - Read-only (based on selected fee types) */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">
              Total Fees
              {formData.fees_type.length > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.fees_type.length} fee type{formData.fees_type.length > 1 ? "s" : ""} selected)
                </span>
              )}
            </label>
            <input
              type="number"
              value={formData.total_payable}
              readOnly
              className={`w-full border h-8 px-2 text-sm font-semibold ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show Student Fees Due - Read-only */}
          {formData.student_fees_due > 0 && (
            <div className="relative w-full">
              <label className="block text-sm font-medium mb-1">Student Fees Due</label>
              <input
                type="number"
                value={formData.student_fees_due}
                readOnly
                className={`w-full border h-8 px-2 text-sm font-semibold text-orange-600 ${borderClr} ${readOnlyBg} cursor-not-allowed`}
              />
            </div>
          )}

          {/* Show Total Due - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">
              Total Due
              {formData.total_payable > 0 || formData.student_fees_due > 0 ? (
                <span className="text-xs text-gray-500 ml-1">
                  (Total Fees: ৳{formData.total_payable} + Student Fees Due: ৳{formData.student_fees_due})
                </span>
              ) : null}
            </label>
            <input
              type="number"
              value={formData.total_due}
              readOnly
              className={`w-full border h-8 px-2 text-sm font-semibold text-red-600 ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Show In Total - Read-only */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">In Total</label>
            <input
              type="number"
              value={formData.in_total}
              readOnly
              className={`w-full border h-8 px-2 text-sm font-semibold text-blue-600 ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>

          {/* Paid Amount */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Paid Amount</label>
            <input
              type="number"
              name="paid_amount"
              value={formData.paid_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
            />
          </div>

          {/* Pay Date - Auto-select today's date */}
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Pay Date</label>
            <div className="relative">
              <input
                type="date"
                name="pay_date"
                value={formData.pay_date}
                onChange={handleChange}
                className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
              />
              <svg
                className="absolute right-2 top-2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-6 h-8 border w-full md:w-auto transition ${
              darkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-600 bg-gray-700"
                : "border-gray-300 hover:bg-gray-100 bg-white text-gray-700"
            }`}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleCollectionClick}
            className="px-6 h-8 w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
          >
            COLLECTION
          </button>
        </div>
      </form>

      {/* Payment Method Modal */}
      <Modal
        open={showPaymentModal}
        title="Confirm Payment"
        onSave={handlePaymentSave}
        saveText="Collectin"
        width="w-96"

      >
        <div className="space-y-4">
          
          {/* Payment Summary */}
          <div className={`p-3 rounded border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Total Payable:</span>
                <span className="font-semibold">৳{formData.total_payable}</span>
              </div>
              {formData.overdue_amount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Overdue Amount:</span>
                  <span className="font-semibold">৳{formData.overdue_amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Amount Paying:</span>
                <span className="font-semibold">৳{formData.paid_amount || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Total Due:</span>
                <span className={`font-semibold ${formData.total_due > 0 ? "text-red-500" : ""}`}>
                  ৳{formData.total_due}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
              Payment Method *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("Cash")}
                className={`flex-1 p-4 border-2 rounded transition ${
                  formData.payment_method === "Cash"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : darkMode
                    ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💵</div>
                  <div className="font-semibold">Cash</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("Bank")}
                className={`flex-1 p-4 border-2 rounded transition ${
                  formData.payment_method === "Bank"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : darkMode
                    ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏦</div>
                  <div className="font-semibold">Bank</div>
                </div>
              </button>
            </div>
            {formData.payment_method && (
              <p className={`text-xs mt-2 ${darkMode ? "text-green-400" : "text-green-600"}`}>
                ✓ Selected: {formData.payment_method}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
