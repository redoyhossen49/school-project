import { useTheme } from "../../context/ThemeContext";
import GuardianActions from "./GuardianActions";

const headers = [
  "Guardian Name",
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
        prev.map((s) =>
          s.id === studentId ? { ...s, guardian: null } : s
        )
      );
      alert("Guardian deleted successfully ✅");
    }
  };

  return (
    <div
      className={`border rounded overflow-x-auto ${
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
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-3 py-2 text-left font-semibold whitespace-nowrap border-r ${borderCol}`}
              >
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 py-2 text-left font-semibold">Action</th>
            )}
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={showAction ? headers.length + 1 : headers.length}
                className="h-7 text-center text-gray-400"
              >
                No guardians found
              </td>
            </tr>
          )}

          {data.map((s) => {
            const g = s.guardian;
            if (!g) return null; // skip if guardian is null

            return (
              <tr key={s.id} className={`border-b ${borderCol} ${hoverRow}`}>
                {/* ===== Guardian Name ===== */}
                <td className={`px-3 py-2 border-r ${borderCol}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={g.photo || "/default-avatar.png"} // optional photo
                      alt={g.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate">{g.name}</span>
                  </div>
                </td>

                <td className={`px-3 py-2 border-r ${borderCol}`}>{g.relation}</td>
                <td className={`px-3 py-2 border-r ${borderCol}`}>{g.division}</td>
                <td className={`px-3 py-2 border-r ${borderCol}`}>{g.district}</td>
                <td className={`px-3 py-2 border-r ${borderCol}`}>{g.upazila}</td>
                <td className={`px-3 py-2 border-r ${borderCol}`}>{g.village}</td>

                {/* ===== Phone clickable ===== */}
                <td className={`px-3 py-2 border-r ${borderCol}`}>
                  <a href={`tel:${g.phone}`} className="text-blue-500 hover:underline">
                    {g.phone}
                  </a>
                </td>

                {showAction && (
                  <td className="px-3 py-2">
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
