import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";
import Input from "./Input";
import { studentData } from "../data/studentData";
import { feesTypeData } from "../data/feesTypeData";
import { feeTypeData } from "../data/feeTypeData";
import { discountData } from "../data/discountData";
import { collectionData } from "../data/collectionData";
import { getCollectionsFromStorage } from "../utils/collectionUtils";

export default function FeesCollectionModal({
  open,
  onClose,
  onSubmit,
}) {
  const { darkMode } = useTheme();
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Handle modal opening animation
  useEffect(() => {
    if (open) {
      setIsModalClosing(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [open]);

  // Get fees types from localStorage if available
  const loadFees = () => {
    const storedData = localStorage.getItem("fees");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  const createdFees = loadFees();
  const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
  const feesTypeOptions = [...new Set([...feesTypeData, ...createdFeesNames, "Session"])];

  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    student_fees_due: 0,
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: [],
    fees_amounts: {},
    total_payable: 0,
    payable_due: 0,
    total_fees: 0,
    total_due: 0,
    in_total: 0,
    overdue_amount: 0,
    paid_amount: "0.00",
    pay_date: today,
    payment_method: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentModalClosing, setIsPaymentModalClosing] = useState(false);
  const [isPaymentModalOpening, setIsPaymentModalOpening] = useState(false);

  // Handle payment modal opening animation
  useEffect(() => {
    if (showPaymentModal) {
      setIsPaymentModalClosing(false);
      setTimeout(() => {
        setIsPaymentModalOpening(true);
      }, 10);
    } else {
      setIsPaymentModalOpening(false);
    }
  }, [showPaymentModal]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        student_id: "",
        student_name: "",
        student_fees_due: 0,
        class: "",
        group: "",
        section: "",
        session: "",
        fees_type: [],
        fees_amounts: {},
        total_payable: 0,
        payable_due: 0,
        total_fees: 0,
        total_due: 0,
        in_total: 0,
        overdue_amount: 0,
        paid_amount: "0.00",
        pay_date: today,
        payment_method: "",
      });
      setShowPaymentModal(false);
    }
  }, [open, today]);

  // Auto-populate student data when Student ID is entered
  useEffect(() => {
    if (formData.student_id) {
      const student = studentData.find(
        (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase() ||
               s.rollNo?.toString() === formData.student_id
      );

      if (student) {
        setFormData((prev) => ({
          ...prev,
          student_name: student.student_name || student.name || "",
          student_fees_due: student.feesDue || 0,
          class: student.className || "",
          group: student.group || "",
          section: student.section || "",
          session: student.session || "",
        }));
      } else {
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

  // Calculate fees amounts based on selected fees types
  useEffect(() => {
    if (formData.fees_type.length > 0 && formData.class && formData.group && formData.section && formData.session) {
      const getAllFeeTypeData = () => {
        const storedData = localStorage.getItem("feeTypes");
        const storedItems = storedData ? JSON.parse(storedData) : [];
        return [...feeTypeData, ...storedItems];
      };
      
      const allFeeTypeData = getAllFeeTypeData();
      
      const matchingFees = allFeeTypeData.filter(
        (fee) =>
          fee.class === formData.class &&
          fee.group === formData.group &&
          fee.section === formData.section &&
          fee.session === formData.session &&
          formData.fees_type.includes(fee.fees_type)
      );

      let feesAmountsObj = {};
      
      const totalPayable = matchingFees.reduce((sum, fee) => {
        let feeAmount = fee.fees_amount || 0;
        
        feesAmountsObj[fee.fees_type] = feeAmount;
        
        if (formData.student_id) {
          const student = studentData.find(
            (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
          );
          
          if (student) {
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
              const today = new Date().toISOString().split("T")[0];
              const startDate = matchingDiscount.start_date;
              const endDate = matchingDiscount.end_date;
              
              if (today >= startDate && today <= endDate) {
                feeAmount = Math.max(0, (matchingDiscount.regular || feeAmount) - (matchingDiscount.discount_amount || 0));
                feesAmountsObj[fee.fees_type] = feeAmount;
              }
            }
          }
        }
        
        return sum + feeAmount;
      }, 0);

      setFormData((prev) => ({
        ...prev,
        fees_amounts: feesAmountsObj,
        total_payable: totalPayable,
        payable_due: totalPayable,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fees_amounts: {},
        total_payable: 0,
        payable_due: 0,
      }));
    }
  }, [formData.fees_type, formData.student_id, formData.class, formData.group, formData.section, formData.session]);

  // Calculate overdue amount
  useEffect(() => {
    if (formData.student_id && formData.class && formData.group && formData.section && formData.session) {
      const storedCollections = getCollectionsFromStorage();
      const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
      
      const existingCollections = allCollections.filter(
        (collection) =>
          collection.student_id?.toUpperCase() === formData.student_id.toUpperCase() &&
          collection.class === formData.class &&
          collection.group === formData.group &&
          collection.section === formData.section &&
          collection.session === formData.session &&
          collection.total_due > 0
      );

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

  // Calculate totals when paid amount changes
  useEffect(() => {
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const totalPayable = formData.total_payable || 0;
    const overdueAmount = formData.overdue_amount || 0;
    const studentFeesDue = formData.student_fees_due || 0;
    
    const payableDue = Math.max(0, totalPayable - paidAmount);
    const inTotal = paidAmount;
    // Total Due includes: new fees (totalPayable) + student existing dues + overdue amounts
    const calculatedTotalDue = totalPayable + studentFeesDue + overdueAmount;
    const totalDue = paidAmount >= calculatedTotalDue ? 0 : Math.max(0, calculatedTotalDue - paidAmount);

    setFormData((prev) => ({
      ...prev,
      total_fees: totalPayable,
      payable_due: payableDue,
      total_due: totalDue,
      in_total: inTotal,
    }));
  }, [formData.paid_amount, formData.total_payable, formData.overdue_amount, formData.student_fees_due]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeesTypeChange = (feesType) => {
    setFormData((prev) => {
      const currentTypes = prev.fees_type || [];
      const isSelected = currentTypes.includes(feesType);
      
      if (isSelected) {
        return {
          ...prev,
          fees_type: currentTypes.filter((type) => type !== feesType),
        };
      } else {
        return {
          ...prev,
          fees_type: [...currentTypes, feesType],
        };
      }
    });
  };

  const handleCollection = () => {
    if (!formData.student_id) {
      alert("Please enter Student ID");
      return;
    }
    
    // Allow payment if fees type is selected OR if there's a due amount to pay
    const hasSelectedFeesType = formData.fees_type.length > 0;
    const hasDueAmount = formData.student_fees_due > 0 || formData.overdue_amount > 0;
    
    if (!hasSelectedFeesType && !hasDueAmount) {
      alert("Please select at least one Fees Type or there should be a due amount to pay");
      return;
    }
    
    if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
      alert("Please enter a valid Paid Amount");
      return;
    }
    
    // Show payment method modal
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: method,
    }));
  };

  const handlePaymentSave = () => {
    if (!formData.payment_method) {
      alert("Please select a payment method (Cash or Bank)");
      return;
    }

    // Close payment modal and submit
    setShowPaymentModal(false);
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handlePaymentClose = () => {
    setIsPaymentModalClosing(true);
    setIsPaymentModalOpening(false);
    setTimeout(() => {
      setShowPaymentModal(false);
      setIsPaymentModalClosing(false);
      setFormData((prev) => ({
        ...prev,
        payment_method: "",
      }));
    }, 300);
  };

  // Handle close with animation
  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
    }, 300);
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800";
  const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";

  if (!open && !isModalClosing) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
          isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${modalBg} ${textColor} w-full max-w-lg rounded-lg shadow-xl border ${borderClr} p-6 max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
            isModalOpening && !isModalClosing
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-4"
          }`}
        >
          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-6">Fees Collection</h2>
          
          <div className="space-y-4">
        {/* Student ID */}
        <Input
          label="Type Student ID (e.g. 101)"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          type="text"
          placeholder="Type Student ID (e.g. 101)"
        />

        {/* Class and Group - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <input
              type="text"
              value={formData.class}
              placeholder="Class"
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
          <div className="relative w-full">
            <input
              type="text"
              value={formData.group}
              placeholder="Group"
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Section and Session - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <input
              type="text"
              value={formData.section}
              readOnly
              placeholder="Section"
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
          <div className="relative w-full">
            <input
              type="text"
              value={formData.session}
              placeholder="Session"
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Student Name */}
        <div className="relative w-full">
          <input
            type="text"
            value={formData.student_name}
            placeholder="Student Name"
            readOnly
            className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
          />
        </div>

        {/* SELECT FEES TYPE */}
        <div className="relative w-full border border-gray-300 rounded-md p-2">
          <label className="block text-xs font-medium mb-2 text-gray-500 border-b border-gray-300 pb-2">
            SELECT FEES TYPE
          </label>
          <div className="space-y-2">
            {feesTypeOptions.map((feesType) => {
              const isSelected = formData.fees_type.includes(feesType);
              return (
                <div
                  key={feesType}
                  className="flex items-center justify-between gap-2"
                >
                  <label
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
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFeesTypeChange(feesType)}
                      className="sr-only  "
                    />
                    <div
                      onClick={() => handleFeesTypeChange(feesType)}
                      className={`w-4 h-4 cursor-pointer border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : darkMode
                          ? "border-gray-500 bg-transparent"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Section - Total Fees, Total Due, In Total */}
        <div className="space-y-2 ">
          <div className="flex justify-between items-center">
            <span className="text-sm  text-gray-600">Total Fees</span>
            <span className="text-sm  text-gray-600 pr-3">{formData.total_payable || 0}</span>
          </div>
          {formData.overdue_amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm  text-gray-600">Overdue Amount</span>
              <span className="text-sm  text-gray-600 pr-3">{formData.overdue_amount || 0}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm  text-gray-600">Total Due</span>
            <span className="text-sm  text-gray-600 pr-3">{formData.total_due || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm   text-gray-600">In Total</span>
            <span className="text-sm  text-gray-600 pr-3">{formData.in_total || 0}</span>
          </div>
        </div>

       <div className="grid grid-cols-2 gap-4">
         {/* Paid Amount */}
         <div className="relative w-full">
          <label className="block text-sm mb-1">Paid Amount</label>
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

        {/* Pay Date */}
        <div className="relative w-full">
          <label className="block text-sm  mb-1">Pay Date</label>
          <div className="relative">
            <input
              type="date"
              name="pay_date"
              value={formData.pay_date}
              onChange={handleChange}
              className={`w-full border h-8 px-2 text-sm pr-8 ${borderClr} ${inputBg}`}
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 text-sm py-[8px] border ${borderClr} ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              } transition `}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleCollection}
              className="flex-1 text-sm py-[8px] bg-green-600 text-white hover:bg-green-700 transition  font-semibold"
            >
              Collection
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
            isPaymentModalOpening && !isPaymentModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handlePaymentClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${modalBg} ${textColor} w-full max-w-md rounded-lg shadow-xl border ${borderClr} p-6 transition-all duration-300 transform ${
              isPaymentModalOpening && !isPaymentModalClosing
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-center mb-6">Payment Method</h2>

            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodSelect("Cash")}
                    className={`flex-1 py-[8px] border  transition ${
                      formData.payment_method === "Cash"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : darkMode
                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-semibold text-center text-sm">Cash</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodSelect("Bank")}
                    className={`flex-1 py-[8px] border  transition ${
                      formData.payment_method === "Bank"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : darkMode
                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-semibold text-center text-sm">Bank</div>
                  </button>
                </div>
                {formData.payment_method && (
                  <p className={`text-xs mt-2 text-center ${darkMode ? "text-green-400" : "text-green-600"}`}>
                    ✓ Selected: {formData.payment_method}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={handlePaymentSave}
                  className="flex-1 text-sm py-[8px] bg-green-600 text-white hover:bg-green-700 transition  font-semibold"
                >
                  Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
