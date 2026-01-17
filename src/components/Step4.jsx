import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Input from "./Input";

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
          value={formData[field.name] || ""}
          onChange={handleChange}
          inputClassName={`py-1 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        />
      ))}

      {/* Current Location */}
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

      {/* Permanent Location */}
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
        { label: "ID Number", name: "idNumber" },
        { label: "Mobile Number", name: "mobileNumber" },
      ].map((field) => (
        <Input
          key={field.name}
          label={field.label}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          inputClassName={`py-1 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        />
      ))}

      {/* Password Fields */}
      {["password", "newpassword"].map((name) => (
        <div className="relative" key={name}>
          <Input
            type="password"
            label={name === "password" ? "Password" : "New Password"}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            inputClassName={`py-1 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          />
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
            className={`border-2 border-dashed h-24 flex flex-col items-center justify-center relative cursor-pointer hover:border-indigo-400 transition ${
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
          <div className="relative h-24 w-full flex justify-center items-center border rounded-lg overflow-hidden">
            <img src={preview} alt="Preview"  className="w-20 h-20 object-cover rounded-md shadow" />
            <button
              onClick={removeImage}
               className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// LocationSelect Component using Input
function LocationSelect({ darkMode, title, formData, handleChange, fields }) {
  return (
    <div className="space-y-4 mb-6">
      <h2 className={`text-center font-semibold text-base md:text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {title}
      </h2>
      {fields.map(({ name, label, options }) => (
        <Input
          key={name}
          type="select"
          label={label}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          options={options}
          inputClassName={`py-1 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}
