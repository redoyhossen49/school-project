import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";

const headers = [
  "Sl",
  "Employee name",
  "Mobile number",
  "Employee Type",
  "Leave remaining",
  "Salary Amount",
  "Payroll date",
  "Total Payable",
  "Payable due",
  "Bank name",
  "Branch",
  "Routing number",
  "A/C holder name",
  "A/C number",
];

export default function EmployeeTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  const handleEdit = (employee) => onEdit(employee);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setData((prev) => prev.filter((e) => e.sl !== sl));
      alert("Employee deleted successfully ✅");
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

  // Format employee type display
  const formatEmployeeType = (type, typeOther) => {
    if (type === "teacher") {
      return "Teacher";
    } else if (type === "others" && typeOther) {
      return `Others (${typeOther})`;
    }
    return type;
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
              <td colSpan={showAction ? 16 : 15} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((employee) => (
              <tr key={employee.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {employee.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.employee_name}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.mobile_number}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {formatEmployeeType(employee.employee_type, employee.employee_type_other)}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.leave_remaining}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  ৳{employee.salary_amount?.toLocaleString()}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {formatDate(employee.payroll_date)}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  ৳{employee.total_payable?.toLocaleString()}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.payable_due === 0 ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ৳{employee.payable_due?.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.bank_name}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.branch}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.routing_number}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.ac_holder_name}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {employee.ac_number}
                </td>

                {showAction && (
                  <td className="px-3 h-8">
                    <ReusableActions
                      item={employee}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this employee?"
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
