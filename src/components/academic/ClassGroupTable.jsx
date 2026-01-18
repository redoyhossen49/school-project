import { useTheme } from "../../context/ThemeContext";
import StudentActions from "../student/StudentActions";

export default function ClassGroupTable({
  data = [],
  month = "All",
  groupFilter,
}) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const bgHeader = darkMode ? "bg-gray-800" : "bg-gray-100";
  const textHeader = darkMode ? "text-gray-100" : "text-gray-900";

  return (
    <div
      className={`border overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      } `}
    >
      <table className="w-full table-auto border-collapse text-xs md:text-sm">
        {/* ===== HEADER ===== */}
        <thead className={`${bgHeader} border-b ${borderCol}`}>
          <tr>
            {[
              "SL",
              "Class",
              "Group",
              "Subjects No",
              "Student No",
              "Total payable",
              "Payable due",
            ].map((h) => (
              <th
                key={h}
                className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap ${textHeader}`}
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

        {/* ===== BODY ===== */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={showAction ? 8 : 7}
                className="text-center h-8 text-gray-400 whitespace-nowrap"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((c) =>
              c.groups
                .filter((g) => !groupFilter || g.name === groupFilter)
                .map((g, idx) => {
                  const monthData =
                    month === "All"
                      ? {
                          paid: g.monthly.reduce((a, b) => a + b.paid, 0),
                          due: g.monthly.reduce((a, b) => a + b.due, 0),
                        }
                      : g.monthly.find((m) => m.month === month) || {
                          paid: 0,
                          due: 0,
                        };

                  const totalPayable =
                    month === "All"
                      ? g.totalPayable
                      : monthData.paid + monthData.due;
                  const payableDue =
                    month === "All"
                      ? g.monthly.reduce((a, b) => a + b.due, 0)
                      : monthData.due;

                  return (
                    <tr
                      key={`${c.sl}-${g.name}`}
                      className={`border-b ${borderCol} ${hoverRow}`}
                    >
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {c.sl}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {c.class}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {g.name}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {g.subjects}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {g.totalStudents}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        ৳{totalPayable}
                      </td>
                      <td
                        className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                      >
                        {payableDue === 0 ? (
                          <span className="text-green-600 font-semibold">
                            Paid
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            ৳{payableDue}
                          </span>
                        )}
                      </td>
                      {showAction && (
                        <td className="px-3 h-8 whitespace-nowrap">
                          <StudentActions
                            classData={c}
                            group={g}
                            month={month}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
