import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { feeStatsData } from "../../data/feeStatsData";
import { calculateSummary } from "../../utils/feeUtils";
import FeeSummaryCard from "../FeeSummaryCard";
import FeeChart from "./FeeChart";
import { useTheme } from "../../context/ThemeContext";

export default function FeeStatistics() {
  const { darkMode } = useTheme();

  const [open, setOpen] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [filter, setFilter] = useState("today");

  const dropdownRef = useRef(null);
  const sessionKeys = Object.keys(feeStatsData.session);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowSession(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // resolve data
  let rawData;
  if (["today", "weekly", "monthly"].includes(filter)) {
    rawData = feeStatsData[filter];
  } else if (sessionKeys.includes(filter)) {
    rawData = feeStatsData.session[filter];
  }

  if (!rawData || !rawData.fees) {
    return <p className="text-sm text-gray-500">No fee data found</p>;
  }

  const summary = calculateSummary(rawData.fees);

  const labelMap = {
    today: "Today",
    weekly: "Last 7 Days",
    monthly: "Monthly",
  };

  const selectedLabel = sessionKeys.includes(filter)
    ? `Session : ${filter}`
    : labelMap[filter];

  return (
    <div
      className={`shadow p-4 md:p-6 space-y-6 rounded-lg
        ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm md:text-lg">
          Fee Statistics
        </h2>

        {/* DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          {/* MAIN BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-between gap-2
              min-w-[200px] px-4 py-2 rounded-lg border text-sm transition
              ${darkMode
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            <span>{selectedLabel}</span>
            <ChevronDown
              size={16}
              className={`transition ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {open && (
            <div
              className={`absolute right-0 mt-2 w-full rounded-lg shadow-lg z-30 overflow-hidden
                ${darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border"
                }
              `}
            >
              {/* MAIN OPTIONS */}
              {[
                { label: "Today", value: "today" },
                { label: "Last 7 Days", value: "weekly" },
                { label: "Monthly", value: "monthly" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    setOpen(false);
                    setShowSession(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm
                    transition
                    ${darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                    }
                  `}
                >
                  {opt.label}
                  <ChevronRight size={14} />
                </button>
              ))}

              {/* SESSION BUTTON */}
              <button
                onClick={() => setShowSession(!showSession)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium
                  transition
                  ${darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                  }
                `}
              >
                Session
                <ChevronRight
                  size={14}
                  className={`transition ${showSession ? "rotate-90" : ""}`}
                />
              </button>

              {/* SESSION OPTIONS */}
              {showSession && (
                <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                  {sessionKeys.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilter(s);
                        setOpen(false);
                        setShowSession(false);
                      }}
                      className={`w-full flex items-center justify-between px-6 py-2 text-sm
                        transition
                        ${darkMode
                          ? "hover:bg-blue-900"
                          : "hover:bg-blue-50"
                        }
                      `}
                    >
                      {s}
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FeeSummaryCard title="Total Fees" value={summary.total} />
        <FeeSummaryCard title="Collected Fees" value={summary.collected} />
        <FeeSummaryCard title="Due Fees" value={summary.due} />
      </div>

      {/* CHART */}
      <FeeChart data={rawData.fees} />
    </div>
  );
}
