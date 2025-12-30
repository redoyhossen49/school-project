import Input from "./Input";
import { useState } from "react";

export default function Step2({ formData, handleChange }) {

   
  return (
    <div className="space-y-4 animate-fadeIn">
      <p className="text-sm text-gray-500 text-center">
        Please provide the details of the previously school.
      </p>

      {[
        { label: "Previous School", name: "previousSchool" },
        { label: "School Name", name: "schoolName" },
        { label: "Class Name", name: "className" },
        { label: "Group Name", name: "groupName" },
        { label: "Session Year", name: "sessionYear" },
        { label: "Last Result", name: "lastResult" },
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
    </div>
  );
}
