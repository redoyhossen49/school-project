import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";

export default function AddClassTimePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

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
    navigate("/school/dashboard/classtimelist");
  };

  const handleCancel = () => {
    navigate("/school/dashboard/classtimelist");
  };

  return (
    <div className="py-4 px-4 mx-6 md:mx-0 min-h-screen">
      {/* ===== Header ===== */}
      <div className="mb-4 bg-white p-6 rounded">
        <h1 className="text-base font-bold">Add Class Time</h1>
        <p className="text-sm text-gray-500 mt-1">
          <Link to="/school/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/classtime" className="hover:text-indigo-600">
            Class Time
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-400">Add Class Time</span>
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`p-6 rounded shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-center ">Class Time Information</h2>

        {/* ===== Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class */}
          <Input
            label="Select Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Group (Optional) */}
          <Input
            label="Select Group (Optional)"
            name="group"
            value={formData.group}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Section (Optional) */}
          <Input
            label="Select Section (Optional)"
            name="section"
            value={formData.section}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Start Time */}
          <Input
            label="Class Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Last Time */}
          <Input
            label="Attended Last Time"
            name="lastTime"
            type="time"
            value={formData.lastTime}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* End Time */}
          <Input
            label="Class End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            inputClassName="py-1"
          />
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-1 border w-full md:w-auto rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-1 w-full md:w-auto bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
