import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

const headers = [
  "Id number",
  "Password",
  "Name",
  "Designation",
  "Phone",
  "Email",

  "Absence",
  "Present",
  "Late",
  "Leave",
  "Total payable",
  "Payable due",
];

export default function TeacherTable({ data, setData }) {
  const { darkMode } = useTheme();

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // -------------------- Handlers --------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      setData((prev) => prev.filter((t) => t.id !== id));
      alert("Teacher deleted successfully ✅");
    }
  };

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((t) =>
        t.id === selectedTeacher.id ? { ...t, ...updatedData } : t,
      ),
    );
    setEditModalOpen(false);
  };

  return (
    <div
      className={`border overflow-x-auto ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      <table className="w-full min-w-max border-collapse text-xs">
        {/* ===== HEADER ===== */}
        <thead
          className={`${
            darkMode
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-gray-100 border-b border-gray-200"
          }`}
        >
          <tr>
            {headers.map((h) => {
              // Password শুধু school হলে দেখাবে
              if (h === "Password" && userRole !== "school") return null;

              return (
                <th
                  key={h}
                  className={`px-3 h-8 text-left font-semibold whitespace-nowrap border-r ${borderCol}`}
                >
                  {h}
                </th>
              );
            })}

            {showAction && (
              <th className="px-3 h-8 text-left font-semibold whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {data.map((t) => (
            <tr key={t.id} className={`border-b ${borderCol} ${hoverRow}`}>
              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.idNumber}
              </td>
              {userRole === "school" && (
                <td
                  className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
                >
                  {t.password || "-"}
                </td>
              )}

              {/* Name + Photo */}
              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                <div className="flex items-center gap-2">
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.teacherName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-400 rounded-full" />
                  )}
                  <span>{t.teacherName}</span>
                </div>
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.designation}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.phone ? (
                  <a
                    href={`tel:${t.phone}`}
                    className="text-blue-500 hover:underline"
                  >
                    {t.phone}
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.email ? (
                  <a
                    href={`mailto:${t.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {t.email}
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.absence || 0}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.present || 0}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.late || 0}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.leave || 0}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                ৳{t.totalPayable || 0}
              </td>

              <td
                className={`px-3 h-8 whitespace-nowrap border-r ${borderCol}`}
              >
                {t.payableDue === 0 ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    ৳{t.payableDue}
                  </span>
                )}
              </td>

              {/* Action Column */}
              {showAction && (
                <td className="px-3 h-8 whitespace-nowrap">
                  <ReusableActions
                    item={t}
                    onEdit={(teacher) => {
                      setSelectedTeacher(teacher);
                      setEditModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    deleteMessage="Are you sure you want to delete this teacher?"
                    getId={(item) => item.id}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Edit Modal ===== */}
      {selectedTeacher && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Teacher"
          item={selectedTeacher}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            {
              name: "teacherName",
              label: "Name",
              type: "text",
              required: true,
            },
            {
              name: "designation",
              label: "Designation",
              type: "text",
              required: true,
            },
            { name: "phone", label: "Phone", type: "text" },
            { name: "email", label: "Email", type: "text" },
            { name: "password", label: "Password", type: "text" },
          ]}
        />
      )}
    </div>
  );
}
