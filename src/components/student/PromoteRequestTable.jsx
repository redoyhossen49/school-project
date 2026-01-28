import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableEditModal from "../common/ReusableEditModal";
import ReusableActions from "../common/ReusableActions";
import { promoteRequestData } from "../../data/promoteRequestData";

const headers = [
  { label: "Sl", key: "sl" },
  { label: "ID number", key: "idNumber" },
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

  { label: "Promote fee", key: "promoteFee" },
  { label: "Promote date", key: "promoteDate" },
  { label: "Payment type", key: "paymentType" },

  { label: "Status", key: "status" },
];

export default function PromoteRequestTable({
  data = promoteRequestData,
  setData,
}) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditSubmit = (updatedData) => {
    const fixedData = {
      ...updatedData,
      promoteFee: Number(updatedData.promoteFee),
      promoteDate: updatedData.promoteDate,
      paymentType: updatedData.paymentType,
    };
    setData((prev) =>
      prev.map((r) => (r.sl === selectedRow.sl ? { ...r, ...fixedData } : r)),
    );
    setEditModalOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this promote request?")) {
      setData((prev) => prev.filter((r) => r.sl !== row.sl));
      alert("Promote request deleted successfully ✅");
    }
  };

  const handleAccept = (row) => {
    setData((prev) =>
      prev.map((r) => (r.sl === row.sl ? { ...r, status: "Approved" } : r)),
    );
    alert(`✅ Promote request for ${row.studentName} has been Approved`);
  };

  const handleReject = (row) => {
    setData((prev) =>
      prev.map((r) => (r.sl === row.sl ? { ...r, status: "Rejected" } : r)),
    );
    alert(`❌ Promote request for ${row.studentName} has been Rejected`);
  };

  const renderCell = (row, key) => {
    if (key === "promoteDate") {
      const dateString = row[key];

      // safe parse
      const parsed = Date.parse(dateString);
      if (!isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString();
      }
      return "-";
    }

    if (key === "promoteFee") {
      // if value is number or string number
      return row[key] !== undefined && row[key] !== null ? row[key] : "-";
    }

    if (key === "paymentType") {
      return row[key] ? row[key] : "-";
    }

    return row[key] ? row[key] : "-";
  };

  return (
    <div
      className={`border overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      <table className="w-full table-auto border-collapse text-xs ">
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

          {data.map((row) => {
            console.log("Row data:", row);

            return (
              <tr key={row.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                {headers.map((h) => (
                  <td
                    key={h.key}
                    className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}
                  >
                    {renderCell(row, h.key)}
                  </td>
                ))}
                {showAction && (
                  <td className="px-3 py-2 whitespace-nowrap">
                    <ReusableActions
                      item={row}
                      onEdit={(r) => {
                        setSelectedRow(r);
                        setEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedRow && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Promote Request"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "studentName", label: "Student Name", type: "text" },
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

            { name: "promoteFee", label: "Promote Fee", type: "number" },
            { name: "promoteDate", label: "Promote Date", type: "date" },
            {
              name: "paymentType",
              label: "Payment Type",
              type: "select",
              options: ["Cash", "Bank"],
            },

            { name: "status", label: "Status", type: "text" },
          ]}
        />
      )}
    </div>
  );
}
