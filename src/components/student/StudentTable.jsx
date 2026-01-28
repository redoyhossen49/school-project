import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import StudentActions from "./StudentActions";
import ReusableEditModal from "../common/ReusableEditModal";

const headers = [
  "Sl ",
  "Roll ",
  "Student id",
  "Password",
  "Name",

  "Father name",
  "Mother name",
  "Class",
  "Group",
  "Section",
  "Session",
  "Phone",
  "Admission fee",
  "Login type",
  "Join date",
  "Status",
];

export default function StudentTable({ data, setData }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";
  const isSchool = userRole === "school";

  const [editingStudent, setEditingStudent] = useState(null);

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  const handleEdit = (student) => setEditingStudent(student);

  const handleStatusChange = (id, newStatus) => {
    setData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setData((prev) => prev.filter((s) => s.id !== id));
      alert("Student deleted successfully ✅");
    }
  };

  const handleSave = (updated) => {
    setData((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingStudent(null);
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
            {headers.map((h) => {
              if ((h === "Password" || h === "Date of birth") && !isSchool) {
                return null;
              }

              return (
                <th
                  key={h}
                  className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
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

        <tbody>
          {data.map((s) => (
            <tr key={s.id} className={`border-b ${borderCol} ${hoverRow}`}>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.admissionNo}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.rollNo}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.studentId}
              </td>
              {isSchool && (
                <td
                  className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
                >
                  {s.password}
                </td>
              )}
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.student_name}
              </td>

              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.fatherName}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.motherName}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.className}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.group}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.section}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.session}
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                <a
                  href={`tel:${s.phone}`}
                  className="text-blue-500 hover:underline"
                >
                  {s.phone}
                </a>
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {s.feesDue === 0 ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    ৳{s.feesDue}
                  </span>
                )}
              </td>
              <td className={`px-3 h-8 border-r ${borderCol}`}>
                <span
                  className={`font-semibold ${
                    s.loginType === "Active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {s.loginType || "-"}
                </span>
              </td>
              <td
                className={`px-3 h-8 border-r whitespace-nowrap ${borderCol}`}
              >
                {formatDateShort(s.joinDate)}
              </td>

              <td className={`px-3 h-8 border-r ${borderCol}`}>
                <span
                  className={`font-semibold ${
                    s.status === "approved"
                      ? "text-green-600"
                      : s.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {s.status || "-"}
                </span>
              </td>

              {showAction && (
                <td className="px-3 h-8">
                  <StudentActions
                    student={s}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingStudent && (
        <ReusableEditModal
          open={!!editingStudent}
          title="Edit Student"
          item={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSubmit={handleSave}
          fields={[
            {
              name: "student_name",
              label: "Name",
              type: "text",
              required: true,
            },
            { name: "rollNo", label: "Roll No", type: "text" },
            { name: "studentId", label: "Student ID", type: "text" },
            { name: "password", label: "Password", type: "text" },
            { name: "gender", label: "Gender", type: "text" },
            { name: "fatherName", label: "Father Name", type: "text" },
            { name: "motherName", label: "Mother Name", type: "text" },
            { name: "className", label: "Class", type: "text" },
            { name: "group", label: "Group", type: "text" },
            { name: "section", label: "Section", type: "text" },
            { name: "session", label: "Session", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "feesDue", label: "Fees Due", type: "number" },
            { name: "status", label: "Status", type: "text" },
            { name: "joinDate", label: "Join Date", type: "date" },
            { name: "dob", label: "Date of Birth", type: "date" },
          ]}
        />
      )}
    </div>
  );
}
