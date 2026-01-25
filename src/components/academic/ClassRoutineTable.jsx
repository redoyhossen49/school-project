import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";
import { classRoutineData } from "../../data/classRoutineData";

export default function ClassRoutineTable({ data = classRoutineData, setData }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-300";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === selectedRow.id ? { ...row, ...updatedData } : row
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this routine?")) {
      setData((prev) => prev.filter((r) => r.id !== row.id));
      alert("Routine deleted successfully ✅");
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
      <table className="w-full border-collapse text-xs min-w-[1200px]">
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-300"
          }`}
        >
          <tr>
            {[
              "Sl",
              "Class",
              "Group",
              "Section",
              "Subject",
              "Teacher",
              "Class start",
              "Class end",
              "Day start",
              "Day end",
            ].map((h) => (
              <th
                key={h}
                className={`h-8 px-3 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="h-8 px-3 text-left font-semibold whitespace-nowrap md:w-18">
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={showAction ? 11 : 10}
                className="h-8 text-center text-gray-400"
              >
                No routine data found
              </td>
            </tr>
          ) : (
            data.map((routine, index) => (
              <tr
                key={`${routine.class}-${routine.group}-${routine.section}-${routine.subject}-${routine.id}`}
                className={`border-b ${borderCol} ${hoverRow}`}
              >
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {index + 1}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.class}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.group}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.section}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap font-medium`}>
                  {routine.subject}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.teacher}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.classStartTime}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.classEndTime}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.dayStart}
                </td>
                <td className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap`}>
                  {routine.dayEnd}
                </td>

                {showAction && (
                  <td className="px-3 h-8 whitespace-nowrap">
                    <ReusableActions
                      item={routine}
                      onEdit={(r) => {
                        setSelectedRow(r);
                        setEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this routine?"
                      getId={(item) => item.id}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedRow && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Class Routine"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "class", label: "Class Name", type: "text", required: true },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "subject", label: "Subject", type: "text", required: true },
            { name: "teacher", label: "Teacher", type: "text" },
            { name: "classStartTime", label: "Class Start", type: "text" },
            { name: "classEndTime", label: "Class End", type: "text" },
            { name: "dayStart", label: "Day Start", type: "text" },
            { name: "dayEnd", label: "Day End", type: "text" },
          ]}
        />
      )}
    </div>
  );
}
