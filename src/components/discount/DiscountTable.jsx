import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import { deleteDiscountAPI } from "../../utils/discountUtils";

const headers = [
  "Sl",
  "Class",
  "Group",
  "Section",
  "Session",
  "Student name",
  "Fees type",
  "Regular",
  "Discount",
  "Total payable",
  "Payable due",
];

export default function DiscountTable({ data, setData, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (discount) => onEdit(discount);

  const handleDelete = async (sl) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      try {
        // Delete from localStorage (ready for API)
        const deleted = await deleteDiscountAPI(sl);
        if (deleted) {
          // Update local state
          setData((prev) => prev.filter((d) => d.sl !== sl && d.id !== sl));
          // Call parent's onDelete if provided
          if (onDelete) {
            onDelete(sl);
          }
          alert("Discount deleted successfully ✅");
        } else {
          alert("Discount not found or could not be deleted");
        }
      } catch (error) {
        console.error("Error deleting discount:", error);
        alert("Error deleting discount. Please try again.");
      }
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
      className={`border overflow-x-auto overflow-y-visible hide-scrollbar ${
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
              <td colSpan={showAction ? 12 : 11} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((discount) => {
              const regular = parseFloat(discount.regular) || 0;
              const discountAmount = parseFloat(discount.discount_amount) || 0;
              const totalPayable = Math.max(0, regular - discountAmount);
              const payableDue = totalPayable; // Payable Due is same as Total Payable for discounts

              return (
                <tr key={discount.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {discount.sl}
                  </td>
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {discount.class}
                  </td>
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
                    {regular.toFixed(0)}
                  </td>
                  <td
                    className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                  >
                    {discountAmount.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                  >
                    {totalPayable.toFixed(0)}
                  </td>
                  <td
                    className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                  >
                    {payableDue.toFixed(0)}
                  </td>

                  {showAction && (
                    <td className="px-3 h-8 relative">
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
