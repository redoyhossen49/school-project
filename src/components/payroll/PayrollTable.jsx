import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";

const headers = [
  "Sl",
  "Employee",
  "Employee type",
  "Total salary",
  "Total due",
  "Advance status",
  "Pay type",
  "Payroll amount",
  "Pay Month",
  "Pay year",
  "Pay date",
];

export default function PayrollTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  const handleEdit = (payroll) => onEdit(payroll);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this payroll record?")) {
      setData((prev) => prev.filter((p) => p.sl !== sl));
      alert("Payroll record deleted successfully ✅");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format month number to month name
  const formatMonth = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = parseInt(monthNum) - 1;
    return months[monthIndex] || monthNum;
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={showAction ? 13 : 12} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((payroll) => (
              <tr key={payroll.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {payroll.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payroll.employee}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payroll.employee_type}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  ৳{payroll.total_salary?.toLocaleString()}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payroll.total_due === 0 ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ৳{payroll.total_due?.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  <span className={payroll.advance_status === "Yes" ? "text-blue-600 font-semibold" : ""}>
                    {payroll.advance_status}
                  </span>
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payroll.pay_type}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  ৳{payroll.payroll_amount?.toLocaleString()}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {formatMonth(payroll.pay_month)}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {payroll.pay_year}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {formatDate(payroll.pay_date)}
                </td>

                {showAction && (
                  <td className="px-3 h-8">
                    <ReusableActions
                      item={payroll}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this payroll record?"
                      getId={(item) => item.sl}
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
