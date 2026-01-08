// src/components/school/SchoolCalendar.jsx
import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const appointments = [
  { type: "Parent Meeting", date: "Wed, 05 Apr 2025, 06:30 PM", avatars: ["https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=2"] },
  { type: "General Class", date: "Wed, 05 Apr 2025, 04:10 PM", avatars: ["https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=3"] },
  { type: "Exam Review", date: "Wed, 05 Apr 2025, 10:00 AM", avatars: ["https://i.pravatar.cc/150?img=2", "https://i.pravatar.cc/150?img=3"] },
];

export default function SchoolCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const  {darkMode }=useTheme();

  return (
    <div className={` shadow p-4 md:p-6 w-full max-w-md md:max-w-lg lg:max-w-xl  ${darkMode? "bg-gray-900 text-gray-200":"bg-white text-gray-700"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold ">
        Schedules
        </h3>
        <select className="border rounded px-2 py-1 text-xs md:text-sm lg:text-base">
          <option>All Type</option>
        </select>
      </div>

      {/* Calendar */}
      <div className="mb-3 md:mb-4 border rounded p-2 md:p-3">
        <input
          type="date"
          className="w-full border px-2 py-1 rounded text-xs md:text-sm"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {/* Appointments List */}
      <div className="space-y-2 md:space-y-3 max-h-64 overflow-y-auto">
        {appointments.map((apt, idx) => (
          <div
            key={idx}
            className={`*:**:flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-3   ${darkMode? "bg-gray-700 text-gray-200":"bg-gray-50 text-gray-700"}`}
          >
            <div className="mb-1 md:mb-0">
              <p className="text-sm md:text-base font-medium truncate">
                {apt.type}
              </p>
              <p className="text-xs md:text-sm  truncate">
                {apt.date}
              </p>
            </div>
            <div className="flex -space-x-2">
              {apt.avatars.map((av, i) => (
                <img
                  key={i}
                  src={av}
                  alt=""
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


