import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ReusableActions from "../common/ReusableActions";
import ReusableEditModal from "../common/ReusableEditModal";

export default function ClassGroupTable({
  data = [],
  setData,
  month = "All",
  groupFilter,
}) {
  const { darkMode } = useTheme();
  const userRole = localStorage.getItem("role"); // school | teacher | student
  const isSchool = userRole === "school";

  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const bgHeader = darkMode ? "bg-gray-800" : "bg-gray-100";
  const textHeader = darkMode ? "text-gray-100" : "text-gray-800";

  // -------------------- Edit Modal --------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditSubmit = (updatedData) => {
    setData((prev) =>
      prev.map((c) =>
        c.sl === selectedRow.classSl
          ? {
              ...c,
              groups: c.groups.map((g) =>
                g.name === selectedRow.groupName ? { ...g, ...updatedData } : g
              ),
            }
          : c
      )
    );
    setEditModalOpen(false);
  };

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this group?")) {
      setData((prev) =>
        prev.map((c) =>
          c.sl === row.classSl
            ? { ...c, groups: c.groups.filter((g) => g.name !== row.groupName) }
            : c
        )
      );
      alert("Group deleted successfully ✅");
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
      <table className="w-full table-auto border-collapse text-xs ">
        {/* ================= HEADER ================= */}
        <thead className={`${bgHeader} border-b ${borderCol}`}>
          <tr>
            <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>SL</th>
            <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>Class</th>
            <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>Group</th>
            <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>Subjects</th>
            <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>Students</th>

            {isSchool && (
              <>
                <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>
                  Total Payable
                </th>
                <th className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol} ${textHeader}`}>
                  Payable Due
                </th>
                <th className={`px-3 h-8 text-left whitespace-nowrap md:w-18 ${textHeader}`}>
                  Action
                </th>
              </>
            )}
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={isSchool ? 8 : 5}
                className="text-center h-10 text-gray-400 whitespace-nowrap"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((c) =>
              c.groups
                .filter((g) => !groupFilter || g.name === groupFilter)
                .map((g) => {
                  const monthData =
                    month === "All"
                      ? {
                          paid: g.monthly.reduce((a, b) => a + b.paid, 0),
                          due: g.monthly.reduce((a, b) => a + b.due, 0),
                        }
                      : g.monthly.find((m) => m.month === month) || {
                          paid: 0,
                          due: 0,
                        };

                  const totalPayable =
                    month === "All"
                      ? g.totalPayable
                      : monthData.paid + monthData.due;

                  const payableDue =
                    month === "All"
                      ? g.monthly.reduce((a, b) => a + b.due, 0)
                      : monthData.due;

                  const rowData = {
                    classSl: c.sl,
                    groupName: g.name,
                    subjects: g.subjects,
                    totalStudents: g.totalStudents,
                    totalPayable,
                    payableDue,
                  };

                  return (
                    <tr
                      key={`${c.sl}-${g.name}`}
                      className={`border-b ${borderCol} ${hoverRow}`}
                    >
                      <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>{c.sl}</td>
                      <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>{c.class}</td>
                      <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>{g.name}</td>
                      <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>{g.subjects}</td>
                      <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>{g.totalStudents}</td>

                      {isSchool && (
                        <>
                          <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>
                            ৳{totalPayable}
                          </td>

                          <td className={`px-3 h-8 text-left whitespace-nowrap border-r ${borderCol}`}>
                            {payableDue === 0 ? (
                              <span className="text-green-600 font-semibold">Paid</span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                ৳{payableDue}
                              </span>
                            )}
                          </td>

                          <td className="px-3 h-8 text-left whitespace-nowrap">
                            <ReusableActions
                              item={rowData}
                              onEdit={(row) => {
                                setSelectedRow(row);
                                setEditModalOpen(true);
                              }}
                              onDelete={handleDelete}
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
            )
          )}
        </tbody>
      </table>

      {/* ================= EDIT MODAL ================= */}
      {selectedRow && (
        <ReusableEditModal
          open={editModalOpen}
          title="Edit Group"
          item={selectedRow}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          fields={[
            { name: "groupName", label: "Group Name", type: "text", required: true },
            { name: "subjects", label: "Subjects", type: "number" },
            { name: "totalStudents", label: "Total Students", type: "number" },
            { name: "totalPayable", label: "Total Payable", type: "number" },
            { name: "payableDue", label: "Payable Due", type: "number" },
          ]}
        />
      )}
    </div>
  );
}
