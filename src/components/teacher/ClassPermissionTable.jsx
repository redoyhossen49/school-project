import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions"; // handles edit/delete
import { classPermissionData } from "../../data/classPermissionData"; // আপনার ডাটা

const headers = [
  { label: "Sl", key: "sl" },
  { label: "Name", key: "name" },
  { label: "Teacher Name", key: "teacherName" },
  { label: "Id Number", key: "idNumber" },
  { label: "Class", key: "class" },
  { label: "Group", key: "group" },
  { label: "Section", key: "section" },
  { label: "Subject", key: "subject" },
];

export default function ClassPermissionTable({ data = classPermissionData, setData, onEdit }) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const handleEdit = (row) => {
    if (onEdit) onEdit(row);
  };

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      setData((prev) => prev.filter((r) => r.sl !== sl));
      alert("Class permission deleted successfully ✅");
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
      <table className="w-full table-auto border-collapse text-xs md:text-sm">
        {/* ===== HEADER ===== */}
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
                key={h.key}
                className={`px-3 py-2 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h.label}
              </th>
            ))}
            {showAction && (
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={showAction ? headers.length + 1 : headers.length}
                className="h-7 text-center text-gray-400"
              >
                No class permissions found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.sl} className={`border-b ${borderCol} ${hoverRow}`}>
              {headers.map((h) => (
                <td
                  key={h.key}
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {row[h.key]}
                </td>
              ))}

              {showAction && (
                <td className="px-3 py-2 whitespace-nowrap">
                  <StudentActions
                    row={row}
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
