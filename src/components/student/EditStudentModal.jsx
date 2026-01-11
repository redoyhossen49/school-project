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
    onSave(form); // pass updated student back to table
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`w-96 p-6  shadow-lg ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Edit Student</h2>

        <div className="space-y-2">
          <div>
            <label className="block text-sm">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-2 py-1 border  text-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm">Class</label>
            <input
              name="className"
              value={form.className}
              onChange={handleChange}
              className={`w-full px-2 py-1 border  text-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm">Section</label>
            <input
              name="section"
              value={form.section}
              onChange={handleChange}
              className={`w-full px-2 py-1 border  text-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`w-full px-2 py-1 border  text-sm ${
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

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className={`px-3 py-1 border  ${
              darkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-3 py-1  ${
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
