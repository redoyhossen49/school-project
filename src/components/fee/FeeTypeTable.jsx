import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";

const headers = [
  "Sl",
  "Group Name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Fees Type",
  "Fees Amount",
];

export default function FeeTypeTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (fee) => onEdit(fee);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this fee type?")) {
      setData((prev) => prev.filter((f) => f.sl !== sl));
      alert("Fee type deleted successfully ✅");
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
              <td colSpan={showAction ? 9 : 8} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((fee) => (
              <tr key={fee.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {fee.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {fee.group_name}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>{fee.class}</td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {fee.group}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {fee.section}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {fee.session}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {fee.fees_type}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  ৳{fee.fees_amount}
                </td>

                {showAction && (
                  <td className="px-3 h-8">
                    <ReusableActions
                      item={fee}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this fee type?"
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
