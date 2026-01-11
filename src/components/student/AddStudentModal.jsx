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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex mt-28 md:mb-28  items-center justify-center md:justify-end p-4 bg-black/30"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-800"}
          w-3/4 md:w-96
          p-5 md:p-6
          max-h-[90vh] overflow-y-auto
           shadow-xl
        `}
      >
        <h2 className={`text-lg md:text-xl font-semibold mb-5 ${darkMode ? "text-blue-300" : "text-blue-700"} text-center sm:text-left`}>
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
              className={`
                w-full px-2 py-1 text-xs border 
                ${darkMode ? "bg-gray-600 border-gray-500 placeholder-gray-300 text-gray-100" : "bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-800"}
                focus:outline-none focus:ring-1 focus:ring-blue-500
              `}
              required
            />
            <input
              name="rollNo"
              placeholder="Roll No"
              value={form.rollNo}
              onChange={handleChange}
              className={`
                w-full px-2 py-1 text-xs border 
                ${darkMode ? "bg-gray-600 border-gray-500 placeholder-gray-300 text-gray-100" : "bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-800"}
                focus:outline-none focus:ring-1 focus:ring-blue-500
              `}
              required
            />
          </div>

          {/* Name */}
          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            className={`
              w-full px-2 py-1 text-xs border 
              ${darkMode ? "bg-gray-600 border-gray-500 placeholder-gray-300 text-gray-100" : "bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-800"}
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
            required
          />

          {/* Class + Section */}
          <div className="flex  gap-2">
            <input
              name="className"
              placeholder="Class"
              value={form.className}
              onChange={handleChange}
              className={`
                w-full px-2 py-1 text-xs border 
                ${darkMode ? "bg-gray-600 border-gray-500 placeholder-gray-300 text-gray-100" : "bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-800"}
                focus:outline-none focus:ring-1 focus:ring-blue-500
              `}
            />
            <input
              name="section"
              placeholder="Section"
              value={form.section}
              onChange={handleChange}
              className={`
                w-full px-2 py-1 text-xs border 
                ${darkMode ? "bg-gray-600 border-gray-500 placeholder-gray-300 text-gray-100" : "bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-800"}
                focus:outline-none focus:ring-1 focus:ring-blue-500
              `}
            />
          </div>

          {/* Gender */}
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={`
              w-full px-2 py-1 text-xs border 
              ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100" : "bg-gray-50 border-gray-300 text-gray-800"}
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          {/* Buttons */}
          <div className="flex  justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`
                w-full sm:w-auto px-3 py-1 text-xs font-medium border 
                ${darkMode ? "border-gray-500 text-gray-200 hover:bg-gray-600" : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-gray-200"}
                transition
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                w-full sm:w-auto px-3 py-1 text-xs font-medium 
                ${darkMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                transition
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
