// src/components/school/BestTeachers.jsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";

const teachers = [
  { name: "Mr. John Doe", subject: "Mathematics", bookings: 120, avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "Ms. Jane Smith", subject: "English", bookings: 98, avatar: "https://i.pravatar.cc/150?img=2" },
  { name: "Mr. Ali Khan", subject: "Physics", bookings: 85, avatar: "https://i.pravatar.cc/150?img=3" },
];

export default function BestTeachers() {
    const  {darkMode }=useTheme();
  return (
    <div className={`${darkMode? "bg-gray-900 text-white":"bg-white text-gray-700"}  shadow p-4 md:p-6 space-y-4 w-full `}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm md:text-lg  font-semibold ">
          Best Teachers
        </h3>
        <select className="border rounded p-1 md:px-2 md:py-1 text-xs md:text-sm ">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Teacher List */}
      <div className="space-y-2 md:space-y-3">
        {teachers.map((teacher, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-4 items-center md:flex-row md:items-center md:justify-between ${darkMode? "bg-gray-700 text-white":"bg-gray-50 text-gray-700"} rounded p-2 md:p-3`}
          >
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
              <div className="flex flex-col">
                <p className="text-sm md:text-base font-medium  truncate">
                  {teacher.name}
                </p>
                <p className="text-xs md:text-sm  truncate">
                  {teacher.subject}
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base font-semibold  whitespace-nowrap">
              {teacher.bookings} Bookings
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
