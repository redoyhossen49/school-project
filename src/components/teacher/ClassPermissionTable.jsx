import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";
import { classPermissionData } from "../../data/classPermissionData";

const headers = [
  { label: "Sl", key: "sl" },
  { label: "Teacher name", key: "teacherName" },
  { label: "Id number", key: "idNumber" },
  { label: "Class", key: "class" },
  { label: "Group", key: "group" },
  { label: "Section", key: "section" },
  { label: "Subject", key: "subject" },
];

export default function ClassPermissionTable({
  data = classPermissionData,
  setData,
}) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((r) => (r.sl === selectedRow.sl ? { ...r, ...updatedData } : r)),
    );
    setEditModalOpen(false);
  };

  const handleDelete = (sl) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      setData((prev) => prev.filter((r) => r.sl !== sl));
      alert("Class permission deleted successfully ✅");
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
                No class permissions found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.sl} className={`border-b ${borderCol} ${hoverRow}`}>
              {headers.map((h) => (
                <td
                  key={h.key}
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {row[h.key]}
                </td>
              ))}

              {showAction && (
                <td className="px-3 h-8 whitespace-nowrap md:w-18">
                  <ReusableActions
                    item={row}
                    onEdit={(r) => {
                      setSelectedRow(r);
                      setEditModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    deleteMessage="Are you sure you want to delete this permission?"
                    getId={(r) => r.sl}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedRow && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Class Permission"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            {
              name: "teacherName",
              label: "Teacher Name",
              type: "text",
              required: true,
            },
            {
              name: "idNumber",
              label: "ID Number",
              type: "text",
              required: true,
            },
            { name: "class", label: "Class", type: "text" },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "subject", label: "Subject", type: "text" },
          ]}
        />
      )}
    </div>
  );
}
