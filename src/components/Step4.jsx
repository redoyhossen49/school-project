import Input from "./Input";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Step4({ formData, handleChange }) {
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
          value: Math.floor(100000 + Math.random() * 900000),
        },
      });
    }
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn">
      <p className="text-sm text-gray-500 text-center">
        Please provide the student personal & account details.
      </p>

      {/* Student Name */}
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
        />
      ))}

      {/* Current Location */}
      <h2 className="text-center font-semibold text-gray-600 text-lg mb-4">
        Current Location
      </h2>
      {[
        {
          name: "currentDivision",
          label: "Division",
          options: ["Dhaka", "Chattogram"],
        },
        {
          name: "currentDistrict",
          label: "District",
          options: ["Gazipur", "Comilla"],
        },
        {
          name: "currentUpazila",
          label: "Upazila",
          options: ["Savar", "Sonargaon"],
        },
      ].map(({ name, label, options }) => (
        <select
          key={name}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            {label}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}

      {/* Permanent Location */}
      <h2 className="text-center font-semibold text-gray-600 text-lg mb-4">
        Permanent Location
      </h2>
      {[
        {
          name: "permanentDivision",
          label: "Division",
          options: ["Dhaka", "Chattogram"],
        },
        {
          name: "permanentDistrict",
          label: "District",
          options: ["Gazipur", "Comilla"],
        },
        {
          name: "permanentUpazila",
          label: "Upazila",
          options: ["Savar", "Sonargaon"],
        },
      ].map(({ name, label, options }) => (
        <select
          key={name}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full rounded-lg border px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            {label}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}

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
            className="peer w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-transparent"
          />
          <label
            className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all duration-300
                       peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                       peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
                       peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
          >
            {field.label}
          </label>
        </div>
      ))}

      {/* Password */}
      {[
        { label: "Password", name: "password" },
        { label: "New Password", name: "newpassword" },
      ].map((field) => (
        <div className="relative" key={field.name}>
          <input
            type={showPassword ? "text" : "password"}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-transparent"
          />
          <label
            className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all duration-300
                       peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                       peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1
                       peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-600 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
          >
            {field.label}
          </label>

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      ))}

      {/* Upload */}
      <div className="my-4">
        {!preview ? (
          <div
            className="border-2 border-dashed rounded-lg h-28 flex flex-col items-center justify-center
                    text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
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
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />

            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full
                   w-7 h-7 flex items-center justify-center hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
