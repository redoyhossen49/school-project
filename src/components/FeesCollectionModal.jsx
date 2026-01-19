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
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

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
  });

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
      });
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
    const calculatedTotalDue = totalPayable + studentFeesDue;
    const totalDue = paidAmount >= calculatedTotalDue ? 0 : calculatedTotalDue - paidAmount;

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
    if (formData.fees_type.length === 0) {
      alert("Please select at least one Fees Type");
      return;
    }
    if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
      alert("Please enter a valid Paid Amount");
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";
  const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600";

  const customFooter = (
    <div className="flex gap-2 justify-end">
      <button
        onClick={onClose}
        className={`px-6 py-1.5 text-sm border rounded ${
          darkMode
            ? "border-gray-400 text-gray-200 hover:bg-gray-600 bg-gray-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
        }`}
      >
        Close
      </button>
      <button
        onClick={handleCollection}
        className="px-6 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
      >
        COLLECTION
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      title=""
      onClose={onClose}
      hideFooter={true}
      customFooter={customFooter}
      width="w-full max-w-2xl"
    >
      <div className="space-y-4">
        {/* Title */}
        <h2 className={`text-lg font-bold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}>
          Fees Collection
        </h2>
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
            <label className="block text-sm font-medium mb-1">Class</label>
            <input
              type="text"
              value={formData.class}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Group</label>
            <input
              type="text"
              value={formData.group}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Section and Session - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Section</label>
            <input
              type="text"
              value={formData.section}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Session</label>
            <input
              type="text"
              value={formData.session}
              readOnly
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Student Name */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Student Name</label>
          <input
            type="text"
            value={formData.student_name}
            readOnly
            className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
          />
        </div>

        {/* SELECT FEES TYPE */}
        <div className="relative w-full">
          <label className="block text-xs font-medium mb-2 text-gray-500">
            SELECT FEES TYPE
          </label>
          <div className="space-y-2">
            {feesTypeOptions.map((feesType) => {
              const isSelected = formData.fees_type.includes(feesType);
              return (
                <div
                  key={feesType}
                  className="flex items-center gap-2"
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
                  />
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Section - Total Fees, Total Due, In Total */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-600">Total Fees</span>
            <span className="text-sm font-medium text-blue-600">{formData.total_payable || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-600">Total Due</span>
            <span className="text-sm font-medium text-blue-600">{formData.total_due || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-600">In Total</span>
            <span className="text-sm font-medium text-blue-600">{formData.in_total || 0}</span>
          </div>
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

        {/* Pay Date */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Pay Date</label>
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
    </Modal>
  );
}
