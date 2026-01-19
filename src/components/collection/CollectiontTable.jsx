import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import { deleteCollectionAPI } from "../../utils/collectionUtils";
import { studentData } from "../../data/studentData";

const headers = [
  "Sl",
  "Collection Date",
  "Student ID",
  "Student Name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Fees Type",
  "Paid Amount",
  "Total Due",
];

export default function CollectiontTable({ data, setData, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  const handleEdit = (collection) => onEdit(collection);

  const handleDelete = async (sl) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      try {
        // Delete from localStorage (ready for API)
        const deleted = await deleteCollectionAPI(sl);
        if (deleted) {
          // Update local state
          setData((prev) => prev.filter((c) => c.sl !== sl && c.id !== sl));
          // Call parent's onDelete if provided
          if (onDelete) {
            onDelete(sl);
          }
          alert("Collection deleted successfully ✅");
        } else {
          alert("Collection not found or could not be deleted");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("Error deleting collection. Please try again.");
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
      className={`border overflow-x-auto hide-scrollbar ${
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
            data.map((collection) => {
              // Get student name and photo from studentData if not in collection
              const student = studentData.find(
                (s) => s.studentId?.toUpperCase() === collection.student_id?.toUpperCase()
              );
              const studentName = collection.student_name || student?.student_name || "N/A";
              const studentPhoto = student?.photo || "";
              
              return (
                <tr key={collection.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                  {/* Sl */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.sl}
                  </td>
                  
                  {/* Collection Date */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {formatDate(collection.pay_date)}
                  </td>
                  
                  {/* Id Number */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.student_id}
                  </td>
                  
                  {/* Student Name with Avatar */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap truncate`}>
                    <div className="flex items-center gap-2">
                      {studentPhoto && (
                        <img
                          src={studentPhoto}
                          alt={studentName}
                          className="w-6 h-6 rounded-full object-cover flex shrink-0"
                        />
                      )}
                      <span className="truncate">{studentName}</span>
                    </div>
                  </td>
                  
                  {/* Class */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.class}
                  </td>
                  
                  {/* Group */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.group}
                  </td>
                  
                  {/* Section */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.section}
                  </td>
                  
                  {/* Session */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.session}
                  </td>
                  
                  {/* Fees Type */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.fees_type}
                  </td>
                  
                  {/* Paid Amount */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    ৳{collection.paid_amount || collection.type_amount || 0}
                  </td>
                  
                  {/* Total Due */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.total_due === 0 ? (
                      <span className="text-green-600 font-semibold">Paid</span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ৳{collection.total_due}
                      </span>
                    )}
                  </td>

                  {/* Action */}
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
