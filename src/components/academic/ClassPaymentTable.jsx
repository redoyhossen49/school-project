import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions";

const headers = [
  { label: "SL", key: "sl" },
  { label: "Class", key: "class" },
  { label: "Subjects No", key: "subjects" },
  { label: "Student No", key: "totalStudents" },
  { label: "Total payable", key: "totalPayable" },
  { label: "Payable due", key: "payableDue" },
];

export default function ClassPaymentTable({ data = [], month }) {
  const { darkMode } = useTheme();

  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

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
                No Data Found
              </td>
            </tr>
          )}

          {data.map((c) => {
            let totalPayable = c.totalPayable;
            let payableDue = c.payableDue;

            if (month !== "All") {
              const m = c.monthly?.find((m) => m.month === month);
              if (m) {
                totalPayable = m.paid + m.due;
                payableDue = m.due;
              } else {
                totalPayable = 0;
                payableDue = 0;
              }
            }

            return (
              <tr key={c.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                {/* SL */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {c.sl}
                </td>

                {/* Class */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {c.class}
                </td>

                {/* Subjects */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {c.subjects}
                </td>

                {/* Students */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {c.totalStudents}
                </td>

                {/* Total Payable */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  ৳{totalPayable}
                </td>

                {/* Payable Due */}
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payableDue === 0 ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ৳{payableDue}
                    </span>
                  )}
                </td>

                {showAction && (
                  <td className="px-3 h-8 whitespace-nowrap">
                    <StudentActions classData={c} month={month} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
