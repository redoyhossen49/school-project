import Input from "./Input";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function Step4({ formData, handleChange }) {
  const { darkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    handleChange(e);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPreview(null);
    handleChange({ target: { name: "photo", value: null } });
  };

  useEffect(() => {
    if (!formData.idNumber) {
      handleChange({
        target: {
          name: "idNumber",
          value: Math.floor(10000000 + Math.random() * 90000000),
        },
      });
    }
  }, []);

  return (
    <div className={`space-y-4 animate-fadeIn ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
      <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Please provide the student information.
      </p>

      {/* Student Info Inputs */}
      {[
        { label: "Student Name", name: "studentname" },
        { label: "Father Name", name: "father" },
        { label: "Mother Name", name: "mother" },
      ].map((field) => (
        <Input
          key={field.name}
          label={field.label}
          name={field.name}
          placeholder={field.label}
          value={formData[field.name] || ""}
          onChange={handleChange}
          inputClassName={`py-1 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-700 placeholder-gray-400"
          }`}
          labelClassName={darkMode ? "text-gray-300" : "text-gray-600"}
        />
      ))}

      {/* Current Location Select */}
      <LocationSelect
        darkMode={darkMode}
        formData={formData}
        handleChange={handleChange}
        title="Current Location"
        fields={[
          { name: "currentDivision", label: "Division", options: ["Dhaka", "Chattogram"] },
          { name: "currentDistrict", label: "District", options: ["Gazipur", "Comilla"] },
          { name: "currentUpazila", label: "Upazila", options: ["Savar", "Sonargaon"] },
        ]}
      />

      {/* Permanent Location Select */}
      <LocationSelect
        darkMode={darkMode}
        formData={formData}
        handleChange={handleChange}
        title="Permanent Location"
        fields={[
          { name: "permanentDivision", label: "Division", options: ["Dhaka", "Chattogram"] },
          { name: "permanentDistrict", label: "District", options: ["Gazipur", "Comilla"] },
          { name: "permanentUpazila", label: "Upazila", options: ["Savar", "Sonargaon"] },
        ]}
      />

      {/* Account Info */}
      {[
        { label: "ID Number", name: "idNumber", type: "text" },
        { label: "Mobile Number", name: "mobileNumber", type: "text" },
      ].map((field) => (
        <div className="relative" key={field.name}>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border px-4 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-transparent ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          />
          <label
            className={`absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all duration-300
              peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
              peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs ${
                darkMode ? "peer-not-placeholder-shown:text-gray-300 peer-focus:bg-gray-700" : "peer-not-placeholder-shown:text-gray-600"
              } peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1`}
          >
            {field.label}
          </label>
        </div>
      ))}

      {/* Password Fields */}
      {["password", "newpassword"].map((name) => (
        <div className="relative" key={name}>
          <input
            type={showPassword ? "text" : "password"}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border px-4 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-transparent ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          />
          <label
            className={`absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all duration-300
              peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
              peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs ${
                darkMode ? "peer-not-placeholder-shown:text-gray-300 peer-focus:bg-gray-700" : "peer-not-placeholder-shown:text-gray-600"
              } peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1`}
          >
            {name === "password" ? "Password" : "New Password"}
          </label>

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      ))}

      {/* Upload Photo */}
      <div className="my-4">
        {!preview ? (
          <div
            className={`border-2 border-dashed h-28 flex flex-col items-center justify-center relative cursor-pointer hover:border-indigo-400 transition ${
              darkMode ? "text-gray-400 border-gray-600" : "text-gray-400 border-gray-300"
            }`}
          >
            <span className="text-sm">📷 Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              name="photo"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full border rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// LocationSelect Component
function LocationSelect({ darkMode, title, formData, handleChange, fields }) {
  return (
    <div>
      <h2 className={`text-center font-semibold text-base md:text-lg mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {title}
      </h2>
      {fields.map(({ name, label, options }) => (
        <select
          key={name}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className={`w-full text-sm md:text-base border px-4 py-1 my-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <option value="" disabled>
            {label}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className={darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"}>
              {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
