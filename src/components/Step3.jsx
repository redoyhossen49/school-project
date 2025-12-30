import Input from "./Input";
import { useState } from "react";

export default function Step3({ formData, handleChange }) {

   
  return (
    <div className="space-y-4 animate-fadeIn">
      <p className="text-sm text-gray-500 text-center">
        Please provide the details of the previously school.
      </p>

      {[
        { label: "Guardian Name", name: "guardianname" },
        { label: "Relation", name: "relation" },
        { label: "Mobile Number", name: "mobile" },
        
      ].map((field) => (
        <Input
          key={field.name}
          label={field.label}
          name={field.name}
          placeholder={field.label}
          value={formData[field.name]}
          onChange={handleChange}
        />
      ))}

       <section className="space-y-4 mb-8">
         {[
          { name: "guardianDivision", label: "Division", options: ["Dhaka", "Chattogram"] },
  { name: "guardianDistrict", label: "District", options: ["Gazipur", "Comilla"] },
  { name: "guardianUpazila", label: "Upazila", options: ["Savar", "Sonargaon"] },
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


       
      </section>
    </div>
  );
}
