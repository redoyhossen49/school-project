import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

export default function SyllabusTable({ data = [], setData }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((s) =>
        s.sl === selectedSyllabus.sl ? { ...s, ...updatedData } : s
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (syllabus) => {
    if (confirm("Are you sure you want to delete this syllabus?")) {
      setData((prev) => prev.filter((s) => s.sl !== syllabus.sl));
      alert("Syllabus deleted successfully ✅");
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
              "Session",
              "Subject name",
              "Exam name",
              "Start page",
              "End page",
             
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
                colSpan={showAction ? 11 : 10}
                className="text-center h-8 whitespace-nowrap"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((s) => (
              <tr
                key={`${s.class}-${s.group}-${s.section}-${s.subjectName}`}
                className={`border-b ${borderCol} ${hoverRow}`}
              >
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.sl}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.class}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.group}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.section}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.subjectName}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                  {s.subjectType === "theory" ? "Theory" :
                   s.subjectType === "practical" ? "Practical" : "Theory + Practical"}
                </td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.fullMarks ?? "-"}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.passMarks ?? "-"}</td>
                <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>{s.chapters.length}</td>
                

                {showAction && (
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    <ReusableActions
                      item={s}
                      onEdit={(row) => {
                        setSelectedSyllabus(row);
                        setEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      deleteMessage="Are you sure you want to delete this syllabus?"
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
      {selectedSyllabus && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Syllabus"
          item={selectedSyllabus}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "class", label: "Class", type: "text", required: true },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "session", label: "Session", type: "text" },
            { name: "subjectName", label: "Subject Name", type: "text", required: true },
            { name: "subjectType", label: "Subject Type", type: "text" },
            { name: "fullMarks", label: "Full Marks", type: "number" },
            { name: "passMarks", label: "Pass Marks", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
