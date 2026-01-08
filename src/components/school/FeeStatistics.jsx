// src/components/school/FeeStatistics.jsx
import { useState } from "react";
import { feeStatsData } from "../../data/feeStatsData";
import { calculateSummary } from "../../utils/feeUtils";
import FeeSummaryCard from "../FeeSummaryCard";
import FeeChart from "./FeeChart";
import { useTheme } from "../../context/ThemeContext";

export default function FeeStatistics() {
  const [filter, setFilter] = useState("today");
  const [session, setSession] = useState("2024-25");
  const  {darkMode }=useTheme();

  const rawData =
    filter === "session"
      ? feeStatsData.session?.[session]
      : feeStatsData?.[filter];

  if (!rawData || !rawData.fees) {
    return (
      <div className="bg-white  shadow p-4 md:p-6">
        <p className="text-gray-500 text-sm">No fee data found</p>
      </div>
    );
  }

  const summary = calculateSummary(rawData.fees);

  return (
    <div className={`${darkMode? "bg-gray-900 text-gray-200": "bg-white text-gray-900"} shadow p-4 md:p-6 space-y-6`}>
      {/* Header */}
      <div className="flex  gap-3 items-center justify-between">
        <h2 className="font-semibold  text-xs md:text-lg">
          Fee Statistics
        </h2>

        <div className="flex gap-2  items-center">
          <select
            className="border rounded px-2 py-1 md:px-3 md:py-2 text-sm w-full "
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="session">Session Wise</option>
          </select>

          {filter === "session" && (
            <select
              className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              {Object.keys(feeStatsData.session).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
        <FeeSummaryCard title="Total Fees" value={summary.total} />
        <FeeSummaryCard title="Collected Fees" value={summary.collected} />
        <FeeSummaryCard title="Due Fees" value={summary.due} />
       
      </div>

      {/* Fee Chart */}
      {rawData.fees && rawData.fees.length > 0 && (
        <FeeChart data={rawData.fees} />
      )}
    </div>
  );
}
