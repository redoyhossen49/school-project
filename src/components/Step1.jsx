import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Input from "./Input"; // import your reusable Input component

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

  const titleClass = darkMode ? "text-gray-200" : "text-gray-600";

  // Update available schools when location changes
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

  // Update admission fee when school changes
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
      <h2
        className={`text-center font-semibold text-base md:text-lg mb-4 ${titleClass}`}
      >
        Find Your Location
      </h2>

      {/* Location selects */}
      <div className="space-y-4">
        <Input
          type="select"
          label="Division"
          name="division"
          value={formData.division || ""}
          onChange={handleChange}
          options={Object.keys(mockDB)}
        />
        <Input
          type="select"
          label="District"
          name="district"
          value={formData.district || ""}
          onChange={handleChange}
          options={
            formData.division
              ? Object.keys(mockDB[formData.division] || {})
              : []
          }
        />
        <Input
          type="select"
          label="Upazila"
          name="upazila"
          value={formData.upazila || ""}
          onChange={handleChange}
          options={
            formData.division && formData.district
              ? Object.keys(mockDB[formData.division][formData.district] || {})
              : []
          }
        />
      </div>

      {/* School Info */}
      <h2
        className={`text-center font-semibold text-base md:text-lg my-4 ${titleClass}`}
      >
        New School Information
      </h2>

      <div className="space-y-4 ">
        <Input
          type="select"
          label=" School"
          name="school"
          value={formData.school || ""}
          onChange={handleChange}
          options={availableSchools.map((s) => s.name)}
        />

        <Input
          type="select"
          label=" Class"
          name="class"
          value={formData.class || ""}
          onChange={handleChange}
          options={["1", "2", "3"]}
        />

        <Input
          type="select"
          label=" Group"
          name="group"
          value={formData.group || ""}
          onChange={handleChange}
          options={["Science", "Arts", "Commerce"]}
        />

        <Input
          type="select"
          label=" Session"
          name="session"
          value={formData.session || ""}
          onChange={handleChange}
          options={["2023-24", "2024-25"]}
        />

        <Input
          type="text"
          label="Admission fee"
          name="admissionFee"
          value={formData.admissionFee || ""}
         
          error={false}
          readOnly
        />

        <Input
          type="date"
          label="Admission date"
          name="admissionDate"
          value={formData.admissionDate || ""}
          onChange={handleChange}
           showDropdownTop={true}
        />
      </div>
    </div>
  );
}
