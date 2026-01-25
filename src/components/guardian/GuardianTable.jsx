import { useTheme } from "../../context/ThemeContext";
import GuardianActions from "./GuardianActions";

const headers = [
  "Sl",
  "Guardian name",
  "Relation",
  "Division",
  "District",
  "Upazila",
  "Village",
  "Phone",
];

export default function GuardianTable({ data, setData, onEdit }) {
  const { darkMode } = useTheme();

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  const userRole = localStorage.getItem("role"); // "school"
  const showAction = userRole === "school";

  const handleEdit = (guardian, studentId) => {
    onEdit(guardian, studentId);
  };

  const handleDelete = (studentId) => {
    if (confirm("Are you sure you want to delete this guardian?")) {
      setData((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, guardian: null } : s))
      );
      alert("Guardian deleted successfully ✅");
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
      <table className="w-full table-auto border-collapse text-xs">
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
                key={h}
                className={`px-3 h-8 text-left font-semibold whitespace-nowrap border-r ${borderCol}`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 h-8 text-left font-semibold whitespace-nowrap md:w-18">
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
                className="h-8 text-center text-gray-400 whitespace-nowrap"
              >
                No guardians found
              </td>
            </tr>
          )}

          {data.map((s, index) => {
            const g = s.guardian;
            if (!g) return null;

            return (
              <tr key={s.id} className={`border-b ${borderCol} ${hoverRow}`}>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {index + 1} {/* 1,2,3… */}
                </td>
                {/* Guardian Name */}
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={g.photo || "/default-avatar.png"}
                      alt={g.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate">{g.name}</span>
                  </div>
                </td>

                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {g.relation}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {g.division}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {g.district}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {g.upazila}
                </td>
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  {g.village}
                </td>

                {/* Phone */}
                <td
                  className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}
                >
                  <a
                    href={`tel:${g.phone}`}
                    className="text-blue-500 hover:underline"
                  >
                    {g.phone}
                  </a>
                </td>

                {showAction && (
                  <td className="px-3 h-8 whitespace-nowrap">
                    <GuardianActions
                      guardian={g}
                      studentId={s.id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
