import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

export default function SubjectTable({ data = [], setData }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((s) =>
        s.sl === selectedSubject.sl
          ? { ...s, ...updatedData }
          : s
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (subject) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setData((prev) => prev.filter((s) => s.sl !== subject.sl));
      alert("Subject deleted successfully ✅");
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
      <table className="w-full border-collapse text-xs">
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
              "Subject name",
              "Type",
              "Theory full",
              "Theory pass",
              "Theory fail",
              "Practical full",
              "Practical pass",
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
                colSpan={showAction ? 12 : 11}
                className="text-center h-8 whitespace-nowrap"
              >
                No Subjects Found
              </td>
            </tr>
          ) : (
            data.map((s) => (
              <tr
                key={`${s.class}-${s.group}-${s.section}-${s.subjectName}`}
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
                  {s.subjectName}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.subjectType === "theory"
                    ? "Theory"
                    : s.subjectType === "practical"
                    ? "Practical"
                    : "Theory + Practical"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.theoryFullMark ?? "-"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.theoryPassMark ?? "-"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.theoryFailMark ?? "-"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.practicalFullMark ?? "-"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.practicalPassMark ?? "-"}
                </td>

                {showAction && (
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    <ReusableActions
                      item={s}
                      onEdit={(row) => {
                        setSelectedSubject(row);
                        setEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this subject?"
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
      {selectedSubject && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Subject"
          item={selectedSubject}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "class", label: "Class", type: "text", required: true },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "subjectName", label: "Subject Name", type: "text", required: true },
            { name: "subjectType", label: "Subject Type", type: "text" },
            { name: "theoryFullMark", label: "Theory Full Mark", type: "number" },
            { name: "theoryPassMark", label: "Theory Pass Mark", type: "number" },
            { name: "theoryFailMark", label: "Theory Fail Mark", type: "number" },
            { name: "practicalFullMark", label: "Practical Full Mark", type: "number" },
            { name: "practicalPassMark", label: "Practical Pass Mark", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
