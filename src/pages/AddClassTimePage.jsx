import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import { classTimeData } from "../data/classTimeData";

export default function AddClassTimePage({ modal = false, onClose, onSave }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate dynamic options from classTimeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(classTimeData, "className");
  const groupOptions = getUniqueOptions(classTimeData, "group");
  const sectionOptions = getUniqueOptions(classTimeData, "section");

  const [formData, setFormData] = useState({
    className: "",
    group: "",
    section: "",
    startTime: "",
    lastTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("CLASS TIME DATA 👉", formData);
    alert("Class Time Added Successfully ✅");
    if (modal && onSave) {
      onSave(formData);
      onClose?.();
      return;
    }
    navigate("/school/dashboard/classtimelist");
  };

  const handleCancel = () => {
    if (modal) {
      onClose?.();
      return;
    }
    navigate("/school/dashboard/classtimelist");
  };

  return (
    <div
      className={`py-3 px-2  min-h-screen ${
        darkMode ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      {/* ===== Header ===== */}
      <div
        className={`mb-3 p-6  ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h1 className="text-base font-bold">Add Class Time</h1>
        <p
          className={`text-xs mt-1 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <Link to="/school/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to="/school/dashboard/classtimelist"
            className="hover:text-indigo-600"
          >
            Class time{" "}
          </Link>
          <span className="mx-1">/</span>Add class time
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`px-6  py-4 space-y-4 overflow-y-auto transition-colors duration-300 ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-center font-semibold ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Class Time Information
        </h2>

        {/* ===== Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class */}
          <Input
            type="select"
            label="Select class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            options={classOptions}
          />

          <Input
            type="select"
            label="Select group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            options={groupOptions}
          />

          <Input
            type="select"
            label="Select section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            options={sectionOptions}
          />

          {/* Start Time */}
          <Input
            label=" Start time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            showDropdownTop={true}
          />

          {/* Last Time */}
          <Input
            label="Late time"
            name="lastTime"
            type="time"
            value={formData.lastTime}
            onChange={handleChange}
          />

          {/* End Time */}
          <Input
            label="End time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 h-8 border border-gray-300 w-full md:w-auto  hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white  hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
