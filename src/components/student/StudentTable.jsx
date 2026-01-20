import { useTheme } from "../../context/ThemeContext";
import StudentActions from "./StudentActions";

const headers = [
  "Sl No",
  "Roll No",
  "Student ID",
   "Password",
  "Name",
   "Gender",
  "Father name",
  "Mother name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Phone",
 
  "Fees due",
 
  "Status",
  "Join date",
  "Date of birth",
];

export default function StudentTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  // utils function
const formatDateShort = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0"); // 2 digit day
  const month = date.toLocaleString("default", { month: "short" }); // Jan, Feb...
  const year = date.getFullYear().toString().slice(-2); // last 2 digits
  return `${day} ${month} ${year}`;
};


  const handleEdit = (student) => onEdit(student);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setData((prev) => prev.filter((s) => s.id !== id));
      alert("Student deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border overflow-x-auto ${
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
                className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 h-8 text-left font-semibold whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.id} className={`border-b ${borderCol} ${hoverRow}`}>
              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>
                {s.admissionNo}
              </td>
              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>
                {s.studentId}
              </td>
              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>{s.rollNo}</td>

              {/* Name + Photo */}
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap truncate`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={s.photo}
                    alt={s.student_name}
                    className="w-6 h-6 rounded-full object-cover flex shrink-0"
                  />
                  <span className="truncate">{s.student_name}</span>
                </div>
              </td>

              <td className={`px-3 h-8 border-r  whitespace-nowrap ${borderCol}`}>
                {s.fatherName}
              </td>
              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>
                {s.motherName}
              </td>
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {s.className}
              </td>
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {s.group}
              </td>
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {s.section}
              </td>
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {s.session}
              </td>

              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>
                <a
                  href={`tel:${s.phone}`}
                  className="text-blue-500 hover:underline"
                >
                  {s.phone}
                </a>
              </td>
              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>{s.password}</td>

              <td className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}>
                {s.feesDue === 0 ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    ৳{s.feesDue}
                  </span>
                )}
              </td>

              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {s.gender}
              </td>

              {/* Status */}
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                <span
                  className={`inline-flex items-center h-4 px-2 text-[10px] font-semibold ${
                    s.status === "Active"
                      ? darkMode
                        ? " text-green-500"
                        : " text-green-700"
                      : darkMode
                      ? "b text-red-600"
                      : " text-red-700"
                  }`}
                >
                  ● {s.status}
                </span>
              </td>

              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {formatDateShort(s.joinDate)}
              </td>
              <td
                className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
              >
                {formatDateShort(s.joinDate)}
              </td>

              {showAction && (
                <td className="px-3 h-8">
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
