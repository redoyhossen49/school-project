import Input from "./Input";
import { useTheme } from "../context/ThemeContext";

export default function Step3({ formData, handleChange }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`space-y-4 animate-fadeIn ${
        darkMode ? "text-gray-200" : "text-gray-700"
      }`}
    >
      <p
        className={`text-sm text-center py-4 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Please provide the details of the guardian.
      </p>

      {/* Guardian Inputs */}
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
          inputClassName={` ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-700 placeholder-gray-400"
          }`}
          labelClassName={darkMode ? "text-gray-300" : "text-gray-600"}
        />
      ))}

      {/* Guardian Location Select */}
      <section className="space-y-4 mb-8">
        {[
          {
            name: "guardianDivision",
            label: "Division",
            options: ["Dhaka", "Chattogram"],
          },
          {
            name: "guardianDistrict",
            label: "District",
            options: ["Gazipur", "Comilla"],
          },
          {
            name: "guardianUpazila",
            label: "Upazila",
            options: ["Savar", "Sonargaon"],
          },
        ].map(({ name, label, options }) => (
          <Input
            key={name}
            type="select"
            label={label}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            options={options}
            inputClassName={
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-700 border-gray-300"
            }
          />
        ))}
      </section>
    </div>
  );
}
