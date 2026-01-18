import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";

const headers = [
  "Sl",
  "Group Name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Student Name",
  "Fees Type",
  "Regular",
  "Discount Amount",
  "Start Date",
  "End Date",
];

export default function DiscountTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (discount) => onEdit(discount);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      setData((prev) => prev.filter((d) => d.sl !== sl));
      alert("Discount deleted successfully ✅");
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
            data.map((discount) => (
              <tr key={discount.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {discount.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {discount.group_name}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>{discount.class}</td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {discount.group}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {discount.section}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {discount.session}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {discount.student_name}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {discount.fees_type}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  ৳{discount.regular}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  ৳{discount.discount_amount}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {formatDate(discount.start_date)}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {formatDate(discount.end_date)}
                </td>

                {showAction && (
                  <td className="px-3 h-8">
                    <ReusableActions
                      item={discount}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this discount?"
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
