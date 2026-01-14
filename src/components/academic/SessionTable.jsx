import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions";

export default function SessionTable({ data, month }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  return (
    <div  className={`border rounded overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}>
      <table className="w-full table-auto border-collapse text-sm">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {[
              "SL",
              "Class",
              "Group",
              "Section",
              "Session Start",
              "Session End",
              "Session Year",
              "Total Days",
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={showAction ? 9 : 8} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((s) => (
              <tr
                key={`${s.sl}-${s.class}-${s.group}-${s.section}`}
                className={`border-b ${borderCol} ${hoverRow}`}
              >
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.sl}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.class}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.group}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.section}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.sessionStart}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.sessionEnd}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.sessionYear}
                </td>
                <td
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {s.totalDays}
                </td>

                {showAction && (
                  <td
                    className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap flex gap-1`}
                  >
                    <StudentActions
                      classData={s}
                      group={s.group}
                      month={month}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
