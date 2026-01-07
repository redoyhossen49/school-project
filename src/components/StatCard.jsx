import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function StatCard({
  title,
  value,
  active,
  inactive,
  collected,
  due,
  request,
}) {
  const [filter, setFilter] = useState("session");
  const {darkMode}=useTheme();

  const getFiltered = (val) => {
    if (typeof val !== "number") return val;
    const factor = { today:0.1, last7:0.25, month:0.5, session:1 }[filter];
    return Math.round(val * factor);
  };

  const formatValue = (val) => {
    if (typeof val === "number") return val.toLocaleString();
    return val;
  };

  return (
    <div className={`${darkMode? "bg-gray-900 text-white":"bg-white text-gray-700"} rounded-xl p-5 shadow hover:shadow-lg transition relative`}>
      
      {/* Filter select top-right */}
      <div className="absolute top-3 right-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 py-1 border rounded-md bg-gray-100 text-gray-600 focus:outline-none text-sm"
        >
          <option value="today">Today</option>
          <option value="last7">Last 7 Days</option>
          <option value="month">Month</option>
          <option value="session">Session</option>
        </select>
      </div>

      {/* Main Value */}
      <h2 className="text-3xl font-bold mb-1">
        {formatValue(getFiltered(value))}
      </h2>

      {/* Title */}
      <p className="text-sm ">{title}</p>

      {/* Breakdown */}
      <div className="mt-3 text-sm ">
        {active !== undefined && inactive !== undefined && (
          <div className="flex justify-between">
            <span>Active: {formatValue(getFiltered(active))}</span>
            <span>Inactive: {formatValue(getFiltered(inactive))}</span>
          </div>
        )}

        {collected !== undefined && due !== undefined && (
          <div className="flex justify-between">
            <span>Collected: {formatValue(getFiltered(collected))}</span>
            <span>Due: {formatValue(getFiltered(due))}</span>
          </div>
        )}

        {request !== undefined && (
          <div><span>Request: {formatValue(getFiltered(request))}</span></div>
        )}
      </div>
    </div>
  );
}
