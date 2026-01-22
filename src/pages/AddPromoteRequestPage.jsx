import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";

export default function AddPromoteRequestPage({ modal = false, onClose, onSave }) {
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
    payment: false,
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
    if (modal && onSave) {
      onSave(formData);
      onClose?.();
      return;
    }
    navigate("/school/dashboard/promoterequestlist");
  };

  const handleCancel = () => {
    if (modal) {
      onClose?.();
      return;
    }
    navigate("/school/dashboard/promoterequestlist");
  };

  return (
    <div
      className={`rounded ${
        modal ? "w-72 p-6" : "py-4 px-2 md:mx-0 min-h-screen"
      } flex flex-col items-center space-y-4 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
     
      

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`${
          modal ? "w-full" : "px-6 py-4"
        } space-y-4 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center font-semibold text-lg mb-4">
          Promote Request
        </h2>

        {/* ===== From Class Grid ===== */}
        <div className={`grid ${modal ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"} gap-4`}>
          <Input
            type="select"
            label="From class"
            name="fromClass"
            value={formData.fromClass}
            onChange={handleChange}
            options={["Class 1", "Class 2", "Class 3"]} // Example options
          />

          <Input
            type="select"
            label="From group"
            name="fromGroup"
            value={formData.fromGroup}
            onChange={handleChange}
            options={["Science", "Commerce", "Arts"]}
          />

          <Input
            type="select"
            label="From section"
            name="fromSection"
            value={formData.fromSection}
            onChange={handleChange}
            options={["A", "B", "C"]}
          />

          <Input
            type="select"
            label="From session"
            name="fromSession"
            value={formData.fromSession}
            onChange={handleChange}
            options={["2025-26", "2026-27"]}
          />
        </div>

        {/* ===== To Class Grid ===== */}
        <div className={`grid ${modal ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"} gap-4 mt-2`}>
          <Input
            type="select"
            label="To class"
            name="toClass"
            value={formData.toClass}
            onChange={handleChange}
            options={["Class 2", "Class 3", "Class 4"]}
          />

          <Input
            type="select"
            label="To Group"
            name="toGroup"
            value={formData.toGroup}
            onChange={handleChange}
            options={["Science", "Commerce", "Arts"]}
          />

          <Input
            type="select"
            label="To section"
            name="toSection"
            value={formData.toSection}
            onChange={handleChange}
            options={["A", "B", "C"]}
          />

          <Input
            type="select"
            label="To session"
            name="toSession"
            value={formData.toSession}
            onChange={handleChange}
            options={["2025-26", "2026-27"]}
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
          <label htmlFor="payment" className="text-xs">
            Payment Required for Promote Request
          </label>
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 h-8 border border-gray-300 w-full md:w-auto shadow-sm hover:bg-gray-100 transition"
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
