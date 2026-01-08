import { useTheme } from "../context/ThemeContext";

// src/components/FeeSummaryCard.jsx
export default function FeeSummaryCard({ title, value }) {
  const  {darkMode }=useTheme();

  return (
    <div className={` p-2 md:p-4 border text-center ${darkMode? "bg-gray-700 text-gray-200":"bg-gray-50 text-gray-700"}`}>
      <p className="text-sm ">{title}</p>
      <h3 className=" text-base md:text-xl font-semibold  mt-1">
        ৳ {value.toLocaleString()}
      </h3>
    </div>
  );
}
