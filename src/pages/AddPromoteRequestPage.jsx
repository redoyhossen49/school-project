import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";

export default function AddPromoteRequestPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fromClass: "",
    fromGroup: "",
    fromSection: "",
    fromSession: "",
    toClass: "",
    toGroup: "",
    toSection: "",
    toSession: "",
    payment: false, // Payment checkbox
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("PROMOTE REQUEST DATA 👉", formData);
    alert("Promote Request Submitted Successfully ✅");
    navigate("/school/dashboard/promoterequestlist");
  };

  const handleCancel = () => {
    navigate("/school/dashboard/promoterequestlist");
  };

  return (
    <div className="py-4 px-4 mx-6 md:mx-0 min-h-screen">
      {/* ===== Header ===== */}
      <div className="mb-4 bg-white p-6 rounded">
        <h1 className="text-base font-bold">Add Promote Request</h1>
        <p className="text-sm text-gray-500 mt-1">
          <Link to="/school/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/students" className="hover:text-indigo-600">
            Students
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-400">Add Promote Request</span>
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`p-6 rounded shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-center font-semibold text-lg mb-4">
          Promote Request Information
        </h2>

        {/* ===== From Class Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="From Class"
            name="fromClass"
            value={formData.fromClass}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="From Group (Optional)"
            name="fromGroup"
            value={formData.fromGroup}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="From Section (Optional)"
            name="fromSection"
            value={formData.fromSection}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="From Session"
            name="fromSession"
            value={formData.fromSession}
            onChange={handleChange}
            inputClassName="py-1"
          />
        </div>

        {/* ===== To Class Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <Input
            label="To Class"
            name="toClass"
            value={formData.toClass}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="To Group (Optional)"
            name="toGroup"
            value={formData.toGroup}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="To Section (Optional)"
            name="toSection"
            value={formData.toSection}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="To Session"
            name="toSession"
            value={formData.toSession}
            onChange={handleChange}
            inputClassName="py-1"
          />
        </div>

        {/* ===== Payment ===== */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="payment"
            name="payment"
            checked={formData.payment}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="payment" className="text-sm">
            Payment Required for Promote Request
          </label>
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
