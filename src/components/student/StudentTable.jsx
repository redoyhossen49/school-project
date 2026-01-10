// src/components/student/StudentTable.jsx
import { useTheme } from "../../context/ThemeContext";
import StudentActions from "./StudentActions";

export default function StudentTable({ data }) {
    const {darkMode}=useTheme();
  return (
    <div className={`${darkMode?"bg-gray-900 text-gray-200":"bg-white text-gray-900"} border border-gray-200 overflow-x-auto`}>
      <table className="w-full min-w-[1000px] text-sm">
        <thead className={`${darkMode?"bg-gray-600 text-gray-100":"bg-gray-100 text-gray-900"}`}>
          <tr>
            {[
              "Admission No",
              "Roll No",
              "Name",
              "Class",
              "Section",
              "Gender",
              "Status",
              "Date of Join",
              "DOB",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-medium whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="10" className="text-center py-6 text-gray-500">
                No students found
              </td>
            </tr>
          )}

          {data.map((s) => (
            <tr
              key={s.id}
              className={`border-t border-gray-200 ${darkMode?"hover:bg-slate-500 ":"hover:bg-slate-100 "} transition`}
            >
              <td className="px-4 py-3 text-blue-600 font-medium">
                {s.admissionNo}
              </td>
              <td className="px-4 py-3">{s.rollNo}</td>
              <td className="px-4 py-3">{s.name}</td>
              <td className="px-4 py-3">{s.className}</td>
              <td className="px-4 py-3">{s.section}</td>
              <td className="px-4 py-3">{s.gender}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    s.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  ● {s.status}
                </span>
              </td>
              <td className="px-4 py-3">{s.joinDate}</td>
              <td className="px-4 py-3">{s.dob}</td>
              <td className="px-4 py-3">
                <StudentActions />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
