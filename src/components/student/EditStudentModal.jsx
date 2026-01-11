import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function EditStudentModal({ student, onClose, onSave }) {
  const { darkMode } = useTheme();
  const [form, setForm] = useState({ ...student });

  useEffect(() => {
    setForm({ ...student });
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center   animate-fade-in">
      <div
        className={`w-10/12 max-w-md p-6 md:p-8 rounded-xl shadow-2xl transition-transform transform scale-100 ${
          darkMode
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">Edit Student</h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Student Name"
              className={`w-full px-3 py-1 rounded-lg border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>

          {/* Class & Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <input
                name="className"
                value={form.className}
                onChange={handleChange}
                placeholder="Class"
                className={`w-full px-3 py-1 rounded-lg border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <input
                name="section"
                value={form.section}
                onChange={handleChange}
                placeholder="Section"
                className={`w-full px-3 py-1 rounded-lg border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`w-full px-3 py-1 rounded-lg border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-1 rounded-lg border text-sm font-medium transition ${
              darkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
