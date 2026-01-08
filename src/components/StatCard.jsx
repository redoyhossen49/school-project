import * as Icons from "lucide-react";
import MiniGraph from "./MiniGraph";
import { useTheme } from "../context/ThemeContext";

export default function StatCard({
  title,
  value,
  active,
  inactive,
  collected,
  due,
  request,
  icon,
  percentage,
  trendData,
  bgColor = "#2E37A4",
}) {
  const Icon = Icons[icon] || Icons.BarChart3;
  const { darkMode } = useTheme();

  const formatValue = (val) =>
    typeof val === "number" ? val.toLocaleString() : val;

  return (
    <div
      className={`relative overflow-hidden p-4 shadow-md transition-colors duration-300 w-full  ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      {/* Background SVG */}
      <svg
        className="absolute -top-4 -left-4 w-44 h-44 pointer-events-none"
        viewBox="0 0 145 146"
        fill="none"
      >
        <path
          d="M100.13 79.3201L-29.8852 112.71L6.20539 -16.5808L100.13 79.3201Z"
          fill={bgColor}
          fillOpacity="0.06"
        />
        <path
          d="M112.468 146.423L-56.6104 179.789L-0.966733 16.6796L112.468 146.423Z"
          fill={bgColor}
          fillOpacity="0.04"
        />
      </svg>

      {/* Icon and Title + Value */}
<div
  className={`relative z-10  flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4`}
>
  <div
    className={`flex items-center justify-center rounded-full shadow
      ${darkMode ? "bg-gray-700" : bgColor}
     `}
  >
    <Icon  className="text-blue-600 w-4 h-4 md:w-6 md:h-6" />
  </div>
  <div className={`text-left`}>
    <h3 className={`text-sm md:text-lg font-semibold`}>{title}</h3>
    <p className={`text-xl md:text-3xl font-extrabold leading-none`}>{formatValue(value)}</p>
  </div>
</div>


      {/* Percentage + MiniGraph */}
      {percentage && trendData && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1 select-none text-xs md:text-sm">
          <span
            className={`font-semibold px-2 py-1 rounded-md text-white ${
              percentage.startsWith("-") ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {percentage}
          </span>
          <span className="text-[8px] text-gray-400 tracking-wide uppercase whitespace-nowrap">
            in last 7 Days
          </span>
          <MiniGraph
            data={trendData}
            width={40}
            height={18}
            color={percentage.startsWith("-") ? "#ef4444" : "#22c55e"}
          />
        </div>
      )}

      {/* Breakdown */}
      <div
  className="
    relative z-10 mt-6 text-sm
flex items-center justify-between
    
  "
>
  {active !== undefined && inactive !== undefined && (
    <>
      <div className=" ml-2 text-green-600">
        <h3>Active</h3>
        <span>{formatValue(active)}</span>
      </div>
      <div className="mr-2 text-red-500">
        <h3>Inactive</h3>
        <span>{formatValue(inactive)}</span>
      </div>
    </>
  )}

  {collected !== undefined && (
    <div className="ml-2 text-emerald-600">
      <h3>Collected</h3>
      <span>{formatValue(collected)}</span>
    </div>
  )}

  {due !== undefined && (
    <div className="mr-2 text-orange-500">
      <h3>Due</h3>
      <span>{formatValue(due)}</span>
    </div>
  )}

  {request !== undefined && (
    <div className="mr-2 text-gray-700">
      <h3>Request</h3>
      <span>{formatValue(request)}</span>
    </div>
  )}
</div>

    </div>
  );
}
