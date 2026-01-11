import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import StudentActions from "./StudentActions";
import EditStudentModal from "./EditStudentModal"; // import modal

const headers = [
  "Admission No",
  "Roll No",
  "Name",
  "Class",
  "Section",
  "Gender",
  "Status",
  "Date of Join",
  "DOB",
];

export default function StudentTable({ data, setData,onEdit }) {
  const { darkMode } = useTheme();
  

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role"); // "school", "teacher", "student"
  const showAction = userRole === "school";

  // ===== Handlers =====
 const handleEdit = (student) => {
  onEdit(student); // parent (StudentList) e modal open korbe
};

  const handleDelete = (id) => {
  if (confirm("Are you sure you want to delete this student?")) {
    setData((prev) => prev.filter((s) => s.id !== id));
    alert("Student deleted successfully ✅");
  }
};


 

  return (
    <div
      className={`border  rounded ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      } overflow-x-auto`}
    >
      <table className="w-full min-w-[1000px] table-fixed border-collapse text-xs">
        {/* ================= HEADER ================= */}
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 text-gray-200 border-b border-gray-700"
              : "bg-gray-100 text-gray-700 border-b border-gray-200"
          }`}
        >
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-3 h-7 text-left font-semibold whitespace-nowrap align-middle ${
                  i !== headers.length  ? `border-r ${borderCol}` : ""
                }`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 h-7 w-16 text-left font-semibold whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={showAction ? headers.length + 1 : headers.length}
                className="h-7 text-center text-gray-400"
              >
                No students found
              </td>
            </tr>
          )}

          {data.map((s) => (
            <tr
              key={s.id}
              className={`border-b ${borderCol} ${hoverRow} transition-colors`}
            >
              <td
                className={`px-3 h-7 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap border-r ${borderCol}`}
              >
                {s.admissionNo}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.rollNo}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.name}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.className}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.section}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.gender}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                <span
                  className={`inline-flex items-center h-4 px-2 text-[10px] font-semibold leading-none ${
                    s.status === "Active"
                      ? darkMode
                        ? "bg-green-900/40 text-green-300"
                        : "bg-green-100 text-green-700"
                      : darkMode
                      ? "bg-red-900/40 text-red-300"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  ● {s.status}
                </span>
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.joinDate}
              </td>
              <td className={`px-3 h-7 whitespace-nowrap border-r ${borderCol}`}>
                {s.dob}
              </td>

              {showAction && (
                <td className="px-3 h-7 w-8 whitespace-nowrap">
                  <StudentActions
                    student={s}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
}
