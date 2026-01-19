import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

export default function ClasssectionTable({ data = [], setData, month }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((c) =>
        c.sl === selectedRow.sl
          ? {
              ...c,
              groups: c.groups.map((g) =>
                g.name === selectedRow.groupName && g.section === selectedRow.sectionName
                  ? { ...g, ...updatedData }
                  : g
              ),
            }
          : c
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this group/section?")) {
      setData((prev) =>
        prev.map((c) =>
          c.sl === row.sl
            ? {
                ...c,
                groups: c.groups.filter(
                  (g) => !(g.name === row.groupName && g.section === row.sectionName)
                ),
              }
            : c
        )
      );
      alert("Group/Section deleted successfully ✅");
    }
  };

  return (
    <div className="rounded overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        <thead
          className={`${
            darkMode ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {["SL", "Class", "Group Name", "Section Name", "Total Student", "Total Payable", "Payable Due"].map(
              (h) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
                >
                  {h}
                </th>
              )
            )}
            {showAction && (
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={showAction ? 8 : 7} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((c) =>
              c.groups.map((g) => {
                const monthData =
                  month === "All"
                    ? {
                        paid: g.monthly.reduce((a, b) => a + b.paid, 0),
                        due: g.monthly.reduce((a, b) => a + b.due, 0),
                      }
                    : g.monthly.find((m) => m.month === month) || { paid: 0, due: 0 };

                const totalPayable = month === "All" ? g.totalPayable : monthData.paid + monthData.due;
                const payableDue = month === "All" ? g.monthly.reduce((a, b) => a + b.due, 0) : monthData.due;

                const rowData = {
                  ...c,
                  groupName: g.name,
                  sectionName: g.section,
                  totalStudents: g.totalStudents,
                  totalPayable,
                  payableDue,
                };

                return (
                  <tr key={`${c.sl}-${g.name}-${g.section}`} className={`border-b ${borderCol} ${hoverRow}`}>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{c.sl}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{c.class}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{g.name}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{g.section}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>{g.totalStudents}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>৳{totalPayable}</td>
                    <td className={`px-3 py-2 border-r ${borderCol} whitespace-nowrap`}>
                      {payableDue === 0 ? (
                        <span className="text-green-600 font-semibold">Paid</span>
                      ) : (
                        <span className="text-red-600 font-semibold">৳{payableDue}</span>
                      )}
                    </td>
                    {showAction && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        <ReusableActions
                          item={rowData}
                          onEdit={(r) => {
                            setSelectedRow(r);
                            setEditModalOpen(true);
                          }}
                          onDelete={handleDelete}
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )
          )}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedRow && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Group/Section"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "groupName", label: "Group Name", type: "text", required: true },
            { name: "sectionName", label: "Section Name", type: "text" },
            { name: "totalStudents", label: "Total Students", type: "number" },
            { name: "totalPayable", label: "Total Payable", type: "number" },
            { name: "payableDue", label: "Payable Due", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
