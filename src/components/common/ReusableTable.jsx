import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "./ReusableActions";
import ReusableEditModal from "./ReusableEditModal";

export default function ReusableTable({
  columns,
  data,
  setData,
  showActionKey = false,
  modalFields = [], // Edit modal এর fields
  extraProps = {},  // ReusableActions-এর extra props
}) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-300";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role");
  const showAction = showActionKey && userRole === "school";

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
    if (confirm("Are you sure you want to delete this item?")) {
      setData((prev) => prev.filter((r) => r.sl !== row.sl));
      alert("Item deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-700 border-gray-200"
      }`}
    >
      <table className="w-full table-auto border-collapse text-xs">
        {/* ===== HEADER ===== */}
        <thead
          className={
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-300"
          }
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`h-8 px-3 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {col.label}
              </th>
            ))}

            {showAction && (
              <th className="h-8 px-3 text-left font-semibold whitespace-nowrap">
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
                colSpan={columns.length + (showAction ? 1 : 0)}
                className="h-10 text-center"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.sl || index}
                className={`border-b ${borderCol} ${hoverRow}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap align-middle`}
                  >
                    {row[col.key]}
                  </td>
                ))}

                {showAction && (
                  <td
                    className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap md:w-18`}
                  >
                    <div className="flex items-center gap-1 h-full">
                      <ReusableActions
                        rowData={row}
                        onEdit={(r) => {
                          setSelectedRow(r);
                          setEditModalOpen(true);
                        }}
                        onDelete={handleDelete}
                        {...extraProps}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedRow && modalFields.length > 0 && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Item"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={modalFields}
        />
      )}
    </div>
  );
}
