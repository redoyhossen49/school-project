import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function AddStudentModal({ open, onClose, onAdd }) {
  const { darkMode } = useTheme();

  const [form, setForm] = useState({
    admissionNo: "",
    rollNo: "",
    name: "",
    className: "",
    section: "",
    gender: "Male",
    status: "Active",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: Date.now(),
      ...form,
      joinDate: new Date().toLocaleDateString(),
      dob: "N/A",
    });
    onClose();
    setForm({
      admissionNo: "",
      rollNo: "",
      name: "",
      className: "",
      section: "",
      gender: "Male",
      status: "Active",
    });
  };

  const inputClass = `w-full px-2 py-1 text-xs border rounded shadow-sm bg-transparent
    ${darkMode ? "border-gray-500 placeholder-gray-300 text-gray-100" : "border-gray-300 placeholder-gray-500 text-gray-800"}
    focus:outline-none focus:ring-1 focus:ring-blue-500`;

  const selectClass = `w-full px-2 py-1 text-xs border rounded shadow-sm bg-transparent
    ${darkMode ? "border-gray-500 text-gray-100" : "border-gray-300 text-gray-800"}
    focus:outline-none focus:ring-1 focus:ring-blue-500`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex mt-24 md:mb-28 items-center justify-center md:justify-end p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-800"}
          w-3/4 md:w-96
          p-5 md:p-6
          max-h-[90vh] overflow-y-auto
          rounded-xl shadow-2xl
          border ${darkMode ? "border-gray-600" : "border-gray-200"}
          transition-all duration-300
        `}
      >
        <h2
          className={`text-lg md:text-xl font-semibold mb-5 text-center sm:text-left
            ${darkMode ? "text-blue-300" : "text-blue-700"}
          `}
        >
          Add Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Admission + Roll */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              name="admissionNo"
              placeholder="Admission No"
              value={form.admissionNo}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="rollNo"
              placeholder="Roll No"
              value={form.rollNo}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Name */}
          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />

          {/* Class + Section */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              name="className"
              placeholder="Class"
              value={form.className}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              name="section"
              placeholder="Section"
              value={form.section}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Gender */}
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={selectClass}
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          {/* Status */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={selectClass}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`
                w-full sm:w-auto px-3 py-1 text-xs font-medium border rounded-md
                ${darkMode ? "border-gray-500 text-gray-200 hover:bg-gray-600" : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-gray-200"}
                transition
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                w-full sm:w-auto px-3 py-1 text-xs font-medium rounded-md
                ${darkMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                shadow-md transition
              `}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
