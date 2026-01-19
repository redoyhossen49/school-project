import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";
import Input from "./Input";
import { feeTypeData } from "../data/feeTypeData";
import { feesTypeData } from "../data/feesTypeData";

export default function AddFeeTypeModal({
  open,
  onClose,
  onSubmit,
}) {
  const { darkMode } = useTheme();

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
        return [];
      }
    }
    return [];
  };

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
  
  // Get fees type options
  const staticFeesTypeOptions = feesTypeData || [];
  const createdFees = loadFees();
  const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
  const feesTypeOptions = [...new Set([...staticFeesTypeOptions, ...createdFeesNames])];

  const [formData, setFormData] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: "",
    fees_amount: "",
    payable_last_date: "",
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        class: "",
        group: "",
        section: "",
        session: "",
        fees_type: "",
        fees_amount: "",
        payable_last_date: "",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
      if (name === "class") {
        updated.group = "";
        updated.section = "";
      } else if (name === "group") {
        updated.section = "";
      }
      
      return updated;
    });
  };

  const handleCreate = () => {
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
        onClick={handleCreate}
        className="px-6 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
      >
        Create
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
          Add Fees Type
        </h2>

        {/* Class and Group - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
              required
            >
              <option value="">Select Class</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Group</label>
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
              required
            >
              <option value="">Select Group</option>
              {getGroupOptions(formData.class || "").map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section and Session - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Section</label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
              required
            >
              <option value="">Select Section</option>
              {getSectionOptions(formData.class || "", formData.group || "").map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full">
            <label className="block text-sm font-medium mb-1">Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleChange}
              className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
              required
            >
              <option value="">Select Session</option>
              {sessionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fees Type */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Fees Type</label>
          <select
            name="fees_type"
            value={formData.fees_type}
            onChange={handleChange}
            className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
            required
          >
            <option value="">Select Fees Type</option>
            {feesTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Type Amount */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Type Amount</label>
          <input
            type="number"
            name="fees_amount"
            value={formData.fees_amount}
            onChange={handleChange}
            placeholder="Type Amount"
            step="0.01"
            className={`w-full border h-8 px-2 text-sm ${borderClr} ${inputBg}`}
            required
          />
        </div>

        {/* Payable Last Date */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Payable Last Date</label>
          <div className="relative">
            <input
              type="date"
              name="payable_last_date"
              value={formData.payable_last_date}
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
