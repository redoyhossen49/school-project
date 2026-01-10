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
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          ${darkMode?"bg-gray-600 text-gray-100":"bg-white text-gray-900"}
          w-full sm:max-w-md
          
          p-4 sm:p-6
          max-h-[90vh] overflow-y-auto
          shadow-lg
        `}
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left ">
          Add Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Admission + Roll */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="admissionNo"
              placeholder="Admission No"
              value={form.admissionNo}
              onChange={handleChange}
              className="w-full border px-3 py-2 text-sm "
              required
            />
            <input
              name="rollNo"
              placeholder="Roll No"
              value={form.rollNo}
              onChange={handleChange}
              className="w-full border px-3 py-2 text-sm "
              required
            />
          </div>

          {/* Name */}
          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 text-sm "
            required
          />

          {/* Class + Section */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="className"
              placeholder="Class"
              value={form.className}
              onChange={handleChange}
              className="w-full border px-3 py-2 text-sm "
            />
            <input
              name="section"
              placeholder="Section"
              value={form.section}
              onChange={handleChange}
              className="w-full border px-3 py-2 text-sm "
            />
          </div>

          {/* Gender */}
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2 text-sm "
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border text-sm "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600  text-sm  hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
