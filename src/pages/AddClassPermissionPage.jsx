import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";

export default function AddClassPermissionPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teacherName:"",
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
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* ===== Header ===== */}
      <div
        className={`mb-4 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6 `}
      >
        <h1 className="text-base font-semibold">Class Permission</h1>
        <p
          className={`text-xs mt-1 ${
            darkMode ? "text-gray-200" : "text-gray-400"
          }`}
        >
          <Link to="/school/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/school/dashboard/permissionlist" className="hover:text-indigo-600">
            Teacher
          </Link>
          <span className="mx-1">/</span>Add Permission
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`p-6  space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-center font-semibold">Class Permission </h2>

        {/* ===== Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">

           <Input
            type="select"
            label="Select teacher"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            options={["Redoy", "Sagor", "Rahim", "Karim", "Nasim"]}
          />
          {/* Class */}
          <Input
            type="select"
            label="Select class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            options={["1", "2", "3", "4", "5"]}
          />
         
          {/* Group */}
          <Input
            type="select"
            label="Select group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            options={["Science", "Arts", "Commerce"]}
          />

          {/* Section */}
          <Input
            type="select"
            label="Select section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            options={["A", "B", "C", "D"]}
          />

          {/* Subject */}
          <Input
            type="select"
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={["Math", "Physics", "Chemistry", "Biology", "English"]}
              showDropdownTop={true}
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
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white shadow-sm hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
