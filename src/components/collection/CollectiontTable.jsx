import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";

const headers = [
  "Sl",
  "Student id",
  "Class",
  "Group",
  "Section",
  "Session",
  "Fees Type",
  "Total payable",
  "Payable due",
  "Pay type",
  "Type amount",
  "Total due",
  "Pay Date",
];

export default function CollectiontTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  const handleEdit = (collection) => onEdit(collection);

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      setData((prev) => prev.filter((c) => c.sl !== sl));
      alert("Collection deleted successfully ✅");
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
              <td colSpan={showAction ? 14 : 13} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((collection) => (
              <tr key={collection.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {collection.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {collection.student_id}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {collection.class}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {collection.group}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol}`}>
                  {collection.section}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {collection.session}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {collection.fees_type}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  ৳{collection.total_payable}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {collection.payable_due === 0 ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ৳{collection.payable_due}
                    </span>
                  )}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {collection.pay_type}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  ৳{collection.type_amount}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {collection.total_due === 0 ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ৳{collection.total_due}
                    </span>
                  )}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {formatDate(collection.pay_date)}
                </td>

                {showAction && (
                  <td className="px-3 h-8">
                    <ReusableActions
                      item={collection}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this collection?"
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
