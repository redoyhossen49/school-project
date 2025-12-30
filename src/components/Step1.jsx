import React from "react";
import { useState } from "react";

export default function Step1({ formData, handleChange }) {
  return (
    <div>
      {/* Title */}
      <h2 className="text-center font-semibold text-lg mb-6 text-gray-600">
        Find Your Location
      </h2>

      {/* Find Your Location */}
      {[
        {
          name: "division",
          label: "Division",
          options: ["Dhaka", "Chattogram"],
        },
        {
          name: "district",
          label: "District",
          options: ["Gazipur", "Comilla"],
        },
        { name: "upazila", label: "Upazila", options: ["Savar", "Sonargaon"] },
      ].map(({ name, label, options }) => (
        <select
          key={name}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

      {/* New School Information */}
      <h2 className="text-center font-semibold text-lg mb-6 text-gray-600">
        New School Information
      </h2>

      <section className="space-y-4 mb-10">
        {[
          {
            name: "school",
            label: "School",
            options: ["Sunshine High School", "Greenfield Academy"],
          },
          { name: "className", label: "Class", options: ["1", "2", "3"] },
          {
            name: "group",
            label: "Group",
            options: ["Science", "Arts", "Commerce"],
          },
          {
            name: "session",
            label: "Session",
            options: ["2023-24", "2024-25"],
          },
        ].map(({ name, label, options }) => (
          <select
            key={name}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

        <input
          type="number"
          name="admissionFee"
          value={formData.admissionFee}
          onChange={handleChange}
          placeholder="Admission Fee"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600
                     transition"
        />

        <input
          type="date"
          name="admissionDate"
          value={formData.admissionDate}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600
                     transition cursor-pointer"
        />
      </section>
    </div>
  );
}
