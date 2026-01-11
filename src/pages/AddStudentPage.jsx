import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";


export default function AddStudentPage() {
  const { darkMode } = useTheme();

  const [form, setForm] = useState({
    // ===== Student Info =====
    studentname: "",
    father: "",
    mother: "",

    currentDivision: "",
    currentDistrict: "",
    currentUpazila: "",

    permanentDivision: "",
    permanentDistrict: "",
    permanentUpazila: "",

    idNumber: "",
    mobileNumber: "",

    // ===== Previous School Info =====
    previousSchool: "",
    className: "",
    groupName: "",
    sectionName: "",
    sessionYear: "",
    lastResult: "",

    // ===== Guardian Info =====
    guardianname: "",
    relation: "",
    guardianMobile: "",
    guardianDivision: "",
    guardianDistrict: "",
    guardianUpazila: "",
  });

  // Auto generate ID
  useEffect(() => {
    if (!form.idNumber) {
      setForm((prev) => ({
        ...prev,
        idNumber: Math.floor(10000000 + Math.random() * 90000000),
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Add Student Data:", form);
    alert("Student Added ✅ (check console)");
  };

  const floatingInput =
    "peer w-full border border-gray-200 px-3 py-2 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-transparent rounded";

  const floatingLabel =
    "absolute left-3 top-2 text-gray-400 text-xs pointer-events-none transition-all duration-300 \
     peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm \
     peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 \
     peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1";

  const selectClass =
    "w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="space-y-6 py-4 min-h-[80vh]">
      {/* Header */}
      <div className="ml-1">
        <h1 className="text-base font-bold">Add Student</h1>
        <p className="text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-indigo-600 transition">
            Dashboard
          </Link>

          <span className="mx-1">/</span>

          <Link to="/students" className="hover:text-indigo-600 transition">
            Students
          </Link>
           <span className="mx-1">/</span>
          <Link to="/students" className="hover:text-indigo-600 transition">
            Student List
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= Student Information ================= */}
        <section className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 space-y-4">
          <h2 className="text-sm font-semibold text-gray-600 text-center">
            Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Student Name", name: "studentname" },
              { label: "Father Name", name: "father" },
              { label: "Mother Name", name: "mother" },
            ].map((field) => (
              <div className="relative" key={field.name}>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder=" "
                  className={floatingInput}
                />
                <label className={floatingLabel}>{field.label}</label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                name: "currentDivision",
                label: "Current Division",
                options: ["Dhaka", "Chattogram"],
              },
              {
                name: "currentDistrict",
                label: "Current District",
                options: ["Gazipur", "Comilla"],
              },
              {
                name: "currentUpazila",
                label: "Current Upazila",
                options: ["Savar", "Sonargaon"],
              },
            ].map(({ name, label, options }) => (
              <select
                key={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="" disabled>
                  {label}
                </option>
                {options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "ID Number", name: "idNumber" },
              { label: "Mobile Number", name: "mobileNumber" },
            ].map((field) => (
              <div className="relative" key={field.name}>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder=" "
                  className={floatingInput}
                />
                <label className={floatingLabel}>{field.label}</label>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Previous School Information ================= */}
        <section className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 space-y-4">
          <h2 className="text-sm font-semibold text-gray-600 text-center">
            Previous School Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Previous School", name: "previousSchool" },
              { label: "Class Name", name: "className" },
              { label: "Group Name", name: "groupName" },
              { label: "Section", name: "sectionName" },
              { label: "Session Year", name: "sessionYear" },
              { label: "Last Result", name: "lastResult" },
            ].map((field) => (
              <div className="relative" key={field.name}>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder=" "
                  className={floatingInput}
                />
                <label className={floatingLabel}>{field.label}</label>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Guardian Information ================= */}
        <section className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 space-y-4">
          <h2 className="text-sm font-semibold text-gray-600 text-center">
            Guardian Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Guardian Name", name: "guardianname" },
              { label: "Relation", name: "relation" },
              { label: "Mobile Number", name: "guardianMobile" },
            ].map((field) => (
              <div className="relative" key={field.name}>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder=" "
                  className={floatingInput}
                />
                <label className={floatingLabel}>{field.label}</label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                name: "guardianDivision",
                label: "Division",
                options: ["Dhaka", "Chattogram"],
              },
              {
                name: "guardianDistrict",
                label: "District",
                options: ["Gazipur", "Comilla"],
              },
              {
                name: "guardianUpazila",
                label: "Upazila",
                options: ["Savar", "Sonargaon"],
              },
            ].map(({ name, label, options }) => (
              <select
                key={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="" disabled>
                  {label}
                </option>
                {options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            ))}
          </div>
        </section>

        {/* Buttons */}
        {/* Buttons */}
<div className="flex  md:justify-end gap-3">
  <button
    type="reset"
    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded
               hover:bg-gray-100 transition"
  >
    Cancel
  </button>

  <button
    type="submit"
    className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded
               hover:bg-indigo-700 transition"
  >
    Save 
  </button>
</div>

      </form>
    </div>
  );
}
