import Input from "./Input";
import { useTheme } from "../context/ThemeContext";

export default function Step2({ formData, handleChange }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`space-y-4 mb-6 animate-fadeIn ${
        darkMode ? "text-gray-200" : "text-gray-700"
      }`}
    >
      <p
        className={`text-xs text-center py-2 mb-3 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Provide the details of the previous school.
      </p>

      {[
        { label: "Previous school", name: "previousSchool" },
        { label: "Class name", name: "className" },
        { label: "Group name", name: "groupName" },
        { label: "Section", name: "sectionName" },
        { label: "Session year", name: "sessionYear" },
        { label: "Last result", name: "lastResult" },
      ].map((field) => (
        <Input
          key={field.name}
          label={field.label}
          name={field.name}
          value={formData[field.name]}
          onChange={handleChange}
          inputClassName={`py-1 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-700 placeholder-gray-400"
          }`}
        />
      ))}
    </div>
  );
}
