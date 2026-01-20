import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

import ReusableEditModal from "../common/ReusableEditModal";
import { promoteRequestData } from "../../data/promoteRequestData";
import ReusableActions from "../common/ReusableActions";

const headers = [
  { label: "Sl", key: "sl" },
    { label: "Id number", key: "idNumber" },
  { label: "Student name", key: "studentName" },
  { label: "Father's name", key: "fatherName" },

  { label: "From class", key: "fromClass" },
  { label: "From group", key: "fromGroup" },
  { label: "From section", key: "fromSection" },
  { label: "From session", key: "fromSession" },
  { label: "To class", key: "toClass" },
  { label: "To group", key: "toGroup" },
  { label: "To section", key: "toSection" },
  { label: "To session", key: "toSession" },
  { label: "Payment", key: "payment" },
  { label: "Status", key: "status" },
];

export default function PromoteRequestTable({ data = promoteRequestData, setData }) {
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
      prev.map((r) => (r.sl === selectedRow.sl ? { ...r, ...updatedData } : r))
    );
    setEditModalOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this promote request?")) {
      setData((prev) => prev.filter((r) => r.sl !== row.sl));
      alert("Promote request deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border  overflow-x-auto ${
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
                className={`px-3 py-2 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h.label}
              </th>
            ))}

            {showAction && (
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
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
                No promote requests found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr
              key={row.sl}
              className={`border-b ${borderCol} ${hoverRow}`}
            >
              {headers.map((h) => (
                <td
                  key={h.key}
                  className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                >
                  {row[h.key]}
                </td>
              ))}

              {showAction && (
                <td className="px-3 py-2 whitespace-nowrap">
                  <ReusableActions
                    row={row}
                    onEdit={(r) => {
                      setSelectedRow(r);
                      setEditModalOpen(true);
                    }}
                    onDelete={handleDelete}
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
          title="Edit Promote Request"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "studentName", label: "Student Name", type: "text", required: true },
            { name: "fatherName", label: "Father's Name", type: "text" },
            { name: "idNumber", label: "ID Number", type: "text" },
            { name: "fromClass", label: "From Class", type: "text" },
            { name: "fromGroup", label: "From Group", type: "text" },
            { name: "fromSection", label: "From Section", type: "text" },
            { name: "fromSession", label: "From Session", type: "text" },
            { name: "toClass", label: "To Class", type: "text" },
            { name: "toGroup", label: "To Group", type: "text" },
            { name: "toSection", label: "To Section", type: "text" },
            { name: "toSession", label: "To Session", type: "text" },
            { name: "payment", label: "Payment", type: "number" },
            { name: "status", label: "Status", type: "text" },
          ]}
        />
      )}
    </div>
  );
}
