import { useTheme } from "../../context/ThemeContext";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function ClassRoutineTable({ data, onView, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  return (
    <div
      className={`border rounded overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      <table className="w-full border-collapse text-xs min-w-[1200px]">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {[
              "Sl",
              "Class",
              "Group",
              "Section",
              "Subject",
              "Teacher",
              "Class Start",
              "Class End",
              "Day Start",
              "Day End",
            ].map((h) => (
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
          {data.map((routine, index) => (
            <tr
              key={`${routine.class}-${routine.group}-${routine.section}-${routine.subject}-${routine.id}`}
              className={`border-b ${borderCol} ${hoverRow}`}
            >
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {index + 1}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.class}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.group}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.section}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap font-medium`}>
                {routine.subject}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.teacher}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.classStartTime}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.classEndTime}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.dayStart}
              </td>
              <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                {routine.dayEnd}
              </td>

              {showAction && (
                <td className="px-3 py-2 whitespace-nowrap flex gap-1">
                  <button
                    onClick={() => onView(routine)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => onEdit(routine)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onDelete(routine.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
