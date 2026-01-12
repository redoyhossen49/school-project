import { useTheme } from "../../context/ThemeContext";
import StudentActions from "./StudentActions";

const headers = [
  "Admission No",
  "Student ID",
  "Roll No",
  "Name",
  "Father Name",
  "Mother Name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Phone",
  "Password",
  "Fees Due",
  "Gender",
  "Status",
  "Join Date",
  "DOB",
];

export default function StudentTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (student) => onEdit(student);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setData((prev) => prev.filter((s) => s.id !== id));
      alert("Student deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border rounded overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      <table className="w-full border-collapse text-xs">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className={`px-3 py-2 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.id} className={`border-b ${borderCol}  ${hoverRow}`}>
              <td className={`px-3 py-2 border-r ${borderCol}`}>{s.admissionNo}</td>
              <td className={`px-3 py-2 border-r ${borderCol}`}>{s.studentId}</td>
              <td className={`px-3 py-2 border-r ${borderCol}`}>{s.rollNo}</td>

              {/* Name + Photo */}
            
                 <td className={`px-3 py-2 border-r ${borderCol} max-w-[200px] truncate`}>
                <div className="flex items-center gap-2">
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="truncate">{s.name}</span>
                </div>
              </td>

              <td className={`px-3 py-2  border-r ${borderCol}`}>{s.fatherName}</td>
              <td className={`px-3 py-2 border-r ${borderCol}`}>{s.motherName}</td>
              <td className={`px-3 py-2 whitespace-nowrap border-r ${borderCol}`}>{s.className}</td>
              <td className={`px-3 py-2 whitespace-nowrap border-r ${borderCol}`}>{s.group}</td>
              <td className={`px-3 py-2 whitespace-nowrap border-r ${borderCol}`}>{s.section}</td>
              <td className={`px-3 py-2 whitespace-nowrap border-r ${borderCol}`}>{s.session}</td>

              <td className={`px-3 py-2  border-r ${borderCol}`}>
                <a href={`tel:${s.phone}`} className="text-blue-500 hover:underline">
                  {s.phone}
                </a>
              </td>
              <td className={`px-3 py-2  border-r ${borderCol}`}>{s.password}</td>

              <td className={`px-3 py-2  border-r ${borderCol}`}>
                {s.feesDue === 0 ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">৳{s.feesDue}</span>
                )}
              </td>

              <td className={`px-3 py-2  border-r ${borderCol} whitespace-nowrap`}>{s.gender}</td>

              {/* Status */}
              <td className={`px-3 py-2  border-r ${borderCol} whitespace-nowrap`}>
                <span
                  className={`inline-flex items-center h-4 px-2 text-[10px] font-semibold ${
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

              <td className={`px-3 py-2  border-r ${borderCol} whitespace-nowrap`}>{s.joinDate}</td>
              <td className={`px-3 py-2  border-r ${borderCol} whitespace-nowrap`}>{s.dob}</td>

              {showAction && (
                <td className="px-3 py-2">
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
