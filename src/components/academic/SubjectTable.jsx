import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions"; // Reuse the same actions component

export default function SubjectTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (subject) => onEdit(subject);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setData((prev) => prev.filter((s) => s.sl !== sl));
      alert("Subject deleted successfully ✅");
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
            {["Sl", "Class", "Group", "Section", "Subject Name"].map((h) => (
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
            <tr key={`${s.class}-${s.group}-${s.section}-${s.subjectName}`} className={`border-b ${borderCol} ${hoverRow}`}>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{s.sl}</td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{s.class}</td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{s.group}</td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{s.section}</td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{s.subjectName}</td>

              {showAction && (
                <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                  <StudentActions
                    student={s}
                    onEdit={() => handleEdit(s)}
                    onDelete={() => handleDelete(s.sl)}
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
