import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";

export default function AddClassPermissionPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    teacherName: "",
    idNumber: "",
    className: "",
    group: "",
    section: "",
    subject: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("CLASS PERMISSION DATA 👉", formData);
    alert("Class Permission Added Successfully ✅");
    navigate("/school/dashboard/classpermissionlist");
  };

  const handleCancel = () => {
    navigate("/school/dashboard/classpermissionlist");
  };

  return (
    <div className="py-4 px-4 mx-6 md:mx-0 min-h-screen">
      {/* ===== Header ===== */}
      <div className={`mb-4 ${darkMode?"bg-gray-700 text-gray-200":"bg-white text-gray-800"} p-6 rounded`}>
        <h1 className="text-base font-bold">Add Class Permission</h1>
        <p className="text-xs text-indigo-600 mt-1">
          <Link to="/school/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/school/dashboard/permissionlist" className="hover:text-indigo-600">
            Class Permission  list
          </Link>
          
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`p-6 rounded shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-center">Class Permission Information</h2>

        {/* ===== Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name */}
          <Input
            label="Student Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Teacher Name */}
          <Input
            label="Teacher Name"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* ID Number */}
          <Input
            label="ID Number"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Class */}
          <Input
            label="Select Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Group */}
          <Input
            label="Select Group (Optional)"
            name="group"
            value={formData.group}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Section */}
          <Input
            label="Select Section (Optional)"
            name="section"
            value={formData.section}
            onChange={handleChange}
            inputClassName="py-1"
          />

          {/* Subject */}
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
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
