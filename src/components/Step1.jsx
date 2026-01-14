import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// Mock database
const mockDB = {
  Dhaka: {
    Gazipur: {
      Savar: [
        { name: "Sunshine High School", admissionFee: 5000 },
        { name: "Greenfield Academy", admissionFee: 4500 },
      ],
    },
    Comilla: {
      Sonargaon: [{ name: "Comilla Central School", admissionFee: 4800 }],
    },
  },
  Chattogram: {
    Comilla: {
      Sonargaon: [{ name: "Chattogram High School", admissionFee: 5200 }],
    },
  },
};

export default function Step1({ formData, handleChange }) {
  const { darkMode } = useTheme();
  const [availableSchools, setAvailableSchools] = useState([]);

  const selectClass = `
    w-full px-4 py-1 my-2 text-sm md:text-base rounded
    focus:outline-none focus:ring-2
    ${
      darkMode
        ? "bg-gray-700 border border-gray-500 text-gray-100 focus:ring-indigo-500"
        : "bg-white border border-gray-300 text-gray-700 focus:ring-indigo-400"
    }
  `;

  const titleClass = darkMode ? "text-gray-200" : "text-gray-600";

  // Location change
  useEffect(() => {
    const { division, district, upazila } = formData;
    if (division && district && upazila) {
      const schools = mockDB?.[division]?.[district]?.[upazila] || [];
      setAvailableSchools(schools);
      handleChange({ target: { name: "school", value: "" } });
      handleChange({ target: { name: "admissionFee", value: "" } });
    } else {
      setAvailableSchools([]);
      handleChange({ target: { name: "school", value: "" } });
      handleChange({ target: { name: "admissionFee", value: "" } });
    }
  }, [formData.division, formData.district, formData.upazila]);

  // School change
  useEffect(() => {
    if (formData.school) {
      const school = availableSchools.find((s) => s.name === formData.school);
      if (school) {
        handleChange({
          target: { name: "admissionFee", value: school.admissionFee },
        });
      }
    } else {
      handleChange({ target: { name: "admissionFee", value: "" } });
    }
  }, [formData.school, availableSchools]);

  return (
    <div>
      {/* Title */}
      <h2 className={`text-center font-semibold text-base md:text-lg mb-4 ${titleClass}`}>
        Find Your Location
      </h2>

      {/* Location */}
      {["division", "district", "upazila"].map((field) => (
        <select
          key={field}
          name={field}
          value={formData[field] || ""}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="" disabled>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </option>

          {field === "division" &&
            Object.keys(mockDB).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}

          {field === "district" &&
            formData.division &&
            Object.keys(mockDB[formData.division] || {}).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}

          {field === "upazila" &&
            formData.division &&
            formData.district &&
            Object.keys(
              mockDB[formData.division][formData.district] || {}
            ).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
        </select>
      ))}

      {/* School Info */}
      <h2 className={`text-center font-semibold text-base md:text-lg my-4 ${titleClass}`}>
        New School Information
      </h2>

      <section className="space-y-2 mb-6">
        <select
          name="school"
          value={formData.school || ""}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="" disabled>Select School</option>
          {availableSchools.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select name="class" value={formData.class || ""} onChange={handleChange} className={selectClass}>
          <option value="" disabled>Select Class</option>
          {["1", "2", "3"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select name="group" value={formData.group || ""} onChange={handleChange} className={selectClass}>
          <option value="" disabled>Select Group</option>
          {["Science", "Arts", "Commerce"].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select name="session" value={formData.session || ""} onChange={handleChange} className={selectClass}>
          <option value="" disabled>Select Session</option>
          {["2023-24", "2024-25"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="number"
          readOnly
          name="admissionFee"
          value={formData.admissionFee || ""}
          placeholder="Admission Fee"
          className={`${selectClass} ${
            darkMode ? "bg-gray-600" : "bg-gray-100"
          }`}
        />

        <input
          type="date"
          name="admissionDate"
          value={formData.admissionDate || ""}
          onChange={handleChange}
          className={selectClass}
        />
      </section>
    </div>
  );
}
