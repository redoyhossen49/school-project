import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions";

export default function ReusableTable({ columns, data, showActionKey = false, extraProps = {} }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role");
  const showAction = showActionKey && userRole === "school";

  return (
    <div
      className={`border rounded overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      <table className="w-full table-auto border-collapse text-sm">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {col.label}
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
              <td colSpan={columns.length + (showAction ? 1 : 0)} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.sl || index} className={`border-b ${borderCol} ${hoverRow}`}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                  >
                    {row[col.key]}
                  </td>
                ))}

                {showAction && (
                  <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap flex gap-1`}>
                    <StudentActions {...extraProps} rowData={row} />
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
