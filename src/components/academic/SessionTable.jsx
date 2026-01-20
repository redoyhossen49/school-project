import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

export default function SessionTable({ data = [], setData, month }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((s) =>
        s.sl === selectedSession.sl
          ? { ...s, ...updatedData }
          : s
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (session) => {
    if (confirm("Are you sure you want to delete this session?")) {
      setData((prev) => prev.filter((s) => s.sl !== session.sl));
      alert("Session deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-300"
      }`}
    >
      <table className="w-full table-auto border-collapse text-xs">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {[
              "Sl",
              "Class",
              "Group",
              "Section",
              "Session start",
              "Session end",
              "Session year",
              "Total days",
            ].map((h) => (
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
              <td
                colSpan={showAction ? 9 : 8}
                className="text-center h-8 whitespace-nowrap"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((s) => (
              <tr
                key={`${s.sl}-${s.class}-${s.group}-${s.section}`}
                className={`border-b ${borderCol} ${hoverRow}`}
              >
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.sl}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.class}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.group}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.section}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.sessionStart}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.sessionEnd}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.sessionYear}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.totalDays}
                </td>

                {showAction && (
                  <td className="px-3 h-8 whitespace-nowrap">
                    <ReusableActions
                      item={s}
                      onEdit={(row) => {
                        setSelectedSession(row);
                        setEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this session?"
                      getId={(item) => item.sl}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedSession && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Session"
          item={selectedSession}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "class", label: "Class", type: "text", required: true },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "sessionStart", label: "Session Start", type: "text" },
            { name: "sessionEnd", label: "Session End", type: "text" },
            { name: "sessionYear", label: "Session Year", type: "text" },
            { name: "totalDays", label: "Total Days", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
