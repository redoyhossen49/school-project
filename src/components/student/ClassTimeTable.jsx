import { useTheme } from "../../context/ThemeContext";
import StudentActions from "./StudentActions"; // handles edit/delete
import { classTimeData } from "../../data/classTimeData";

const headers = [
  { label: "Sl No", key: "sl" },
  { label: "Class", key: "className" },
  { label: "Group", key: "group" },
  { label: "Section", key: "section" },
  { label: "Start time", key: "startTime" },
  { label: "Last time", key: "lastTime" },
  { label: "End time", key: "endTime" },
  { label: "Subject", key: "subject" },
];

export default function ClassTimeTable({ data = classTimeData, setData, onEdit }) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const handleEdit = (row) => {
    if (onEdit) onEdit(row);
  };

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this class time?")) {
      setData((prev) => prev.filter((r) => r.sl !== sl));
      alert("Class time deleted successfully ✅");
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
                className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h.label}
              </th>
            ))}
            {showAction && (
              <th className="px-3 h-8 text-left font-semibold whitespace-nowrap">
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
                className="h-8 text-center text-gray-400"
              >
                No class times found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.sl} className={`border-b ${borderCol} ${hoverRow}`}>
              {headers.map((h) => (
                <td
                  key={h.key}
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {row[h.key]}
                </td>
              ))}

              {showAction && (
                <td className="px-3 h-8 whitespace-nowrap">
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
