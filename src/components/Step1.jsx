import React, { useState, useEffect } from "react";

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
      Sonargaon: [
        { name: "Comilla Central School", admissionFee: 4800 },
      ],
    },
  },
  Chattogram: {
    Comilla: {
      Sonargaon: [
        { name: "Chattogram High School", admissionFee: 5200 },
      ],
    },
  },
};

export default function Step1({ formData, handleChange }) {
  const [availableSchools, setAvailableSchools] = useState([]);

  // When location changes, update school list
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

  // When school changes, update admission fee
  useEffect(() => {
    if (formData.school) {
      const school = availableSchools.find((s) => s.name === formData.school);
      if (school) {
        handleChange({ target: { name: "admissionFee", value: school.admissionFee } });
      }
    } else {
      handleChange({ target: { name: "admissionFee", value: "" } });
    }
  }, [formData.school, availableSchools]);

  return (
    <div>
      {/* Title */}
      <h2 className="text-center font-semibold text-base md:text-lg mb-6 text-gray-600">
        Find Your Location
      </h2>

      {/* Location Selection */}
      {["division", "district", "upazila"].map((field) => (
        <select
          key={field}
          name={field}
          value={formData[field] || ""}
          onChange={handleChange}
          className="w-full border text-sm md:text-base border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </option>

          {field === "division" &&
            Object.keys(mockDB).map((d) => <option key={d} value={d}>{d}</option>)}

          {field === "district" &&
            formData.division &&
            Object.keys(mockDB[formData.division] || {}).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}

          {field === "upazila" &&
            formData.division &&
            formData.district &&
            Object.keys(mockDB[formData.division][formData.district] || {}).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
        </select>
      ))}

      {/* School Information */}
      <h2 className="text-center text-base md:text-lg font-semibold my-6 text-gray-600">
        New School Information
      </h2>

      <section className="space-y-4 mb-10">
        {/* School */}
        <select
          name="school"
          value={formData.school || ""}
          onChange={handleChange}
          className="w-full text-sm md:text-base border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            Select School
          </option>
          {availableSchools.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

      
        {/* Class */}
        <select
          name="class"
          value={formData.class || ""}
          onChange={handleChange}
          className="w-full text-sm md:text-base border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            Select Class
          </option>
          {["1", "2", "3"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Group */}
        <select
          name="group"
          value={formData.group || ""}
          onChange={handleChange}
          className="w-full text-sm md:text-base border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            Select Group
          </option>
          {["Science", "Arts", "Commerce"].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Session */}
        <select
          name="session"
          value={formData.session || ""}
          onChange={handleChange}
          className="w-full text-sm md:text-base border border-gray-300 px-4 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>
            Select Session
          </option>
          {["2023-24", "2024-25"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

          {/* Admission Fee */}
        <input
          type="number"
          name="admissionFee"
          value={formData.admissionFee || ""}
          placeholder="Admission Fee"
          readOnly
          className="w-full border border-gray-300 px-4 py-3 placeholder-gray-400 placeholder:text-sm md:placeholder:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 transition bg-gray-100"
        />


        {/* Admission Date */}
        <input
          type="date"
          name="admissionDate"
          value={formData.admissionDate || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 transition cursor-pointer"
        />
      </section>
    </div>
  );
}
