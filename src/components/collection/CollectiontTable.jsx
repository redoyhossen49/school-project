import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FiMoreHorizontal, FiEdit, FiTrash2, FiPrinter } from "react-icons/fi";
import { deleteCollectionAPI, getCollectionsAPI } from "../../utils/collectionUtils";
import { studentData } from "../../data/studentData";
import { collectionData } from "../../data/collectionData";

const headers = [
  "Sl",
  "Student id",
  "Class",
  "Group",
  "Section",
  "Session",
  "Fees Type",
  "Total payable",
  "Payable due",
  "Pay type",
  "Type amount",
  "Total due",
  "Pay Date",
  "Pay Method",
];

export default function CollectiontTable({ data, setData, onEdit, onDelete, onView, selectedCollections = [], onSelectionChange }) {
  const { darkMode } = useTheme();
  const borderCol = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const userRole = localStorage.getItem("role");
  const showAction = userRole === "school";
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const handleView = (collection) => {
    if (onView) {
      setOpenDropdown(null);
      setTimeout(() => {
        onView(collection);
      }, 100);
    }
  };

  const handleEdit = (collection) => {
    if (onEdit) {
      // Close dropdown first
      setOpenDropdown(null);
      // Small delay to ensure dropdown closes before opening modal
      setTimeout(() => {
        onEdit(collection);
      }, 100);
    }
  };

  const handleDelete = async (collection) => {
    setOpenDropdown(null);
    if (confirm("Are you sure you want to delete this collection?")) {
      try {
        const sl = collection.sl || collection.id;
        // Delete from localStorage (ready for API)
        const deleted = await deleteCollectionAPI(sl);
        if (deleted) {
          // Update local state
          setData((prev) => prev.filter((c) => c.sl !== sl && c.id !== sl));
          // Call parent's onDelete if provided
          if (onDelete) {
            onDelete(sl);
          }
          alert("Collection deleted successfully ✅");
        } else {
          alert("Collection not found or could not be deleted");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("Error deleting collection. Please try again.");
      }
    }
  };

  // Helper function to load all students (static + dynamic from localStorage)
  const loadAllStudents = () => {
    try {
      const storedStudents = localStorage.getItem("students");
      const dynamicStudents = storedStudents ? JSON.parse(storedStudents) : [];
      
      // Combine static and dynamic students, prioritizing dynamic (localStorage) data
      // Create a map to avoid duplicates (by studentId)
      const studentMap = new Map();
      
      // First add static students
      studentData.forEach((student) => {
        const key = (student.studentId || student.student_id || "").toUpperCase();
        if (key) {
          studentMap.set(key, student);
        }
      });
      
      // Then add/override with dynamic students (localStorage takes priority)
      dynamicStudents.forEach((student) => {
        const key = (student.studentId || student.student_id || "").toUpperCase();
        if (key) {
          studentMap.set(key, student);
        }
      });
      
      return Array.from(studentMap.values());
    } catch (error) {
      console.error("Error loading students:", error);
      return studentData;
    }
  };

  const handlePrint = async (collection) => {
    // Close dropdown first
    setOpenDropdown(null);
    
    // Small delay to ensure dropdown closes before print window opens
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Get school info (same as admit card)
      const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
      const schoolLogo = schoolInfo?.logo || "https://via.placeholder.com/90";
      const schoolName = (schoolInfo.schoolName || "Mohakhali Model High School").replace(/"/g, "&quot;");
      const schoolAddress = (schoolInfo.address || "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212").replace(/"/g, "&quot;");
      const schoolPhone = schoolInfo?.phone || schoolInfo?.mobile || "01XXXXXXXXX";

      // Get all students (static + dynamic)
      const allStudents = loadAllStudents();
      
      // Find student by student_id (check both studentId and student_id fields)
      const student = allStudents.find(
        (s) => {
          const sId = (s.studentId || s.student_id || "").toUpperCase();
          const cId = (collection.student_id || "").toUpperCase();
          return sId === cId && sId !== "";
        }
      );
      
      // Use student data with fallback to collection data
      const studentName = (student?.student_name || collection.student_name || "N/A").replace(/"/g, "&quot;");
      const studentId = collection.student_id || student?.studentId || student?.student_id || "N/A";
      const studentClass = (student?.className || student?.class || collection.class || "N/A");
      const studentGroup = (student?.group || collection.group || "N/A");
      const studentSection = (student?.section || collection.section || "N/A");
      const studentSession = (student?.session || collection.session || "N/A");

      // Get all collections for this student
      const allCollections = await getCollectionsAPI();
      const collections = (allCollections.length > 0 ? allCollections : collectionData).filter(
        (c) =>
          c.student_id?.toUpperCase() === collection.student_id?.toUpperCase() &&
          c.class === collection.class &&
          c.group === collection.group &&
          c.section === collection.section &&
          c.session === collection.session
      );

      // Group by fees_type for service summary
      const feesTypeMap = new Map();
      collections.forEach((c) => {
        const feesTypes = c.fees_type?.split(", ") || [c.fees_type || ""];
        feesTypes.forEach((ft) => {
          if (ft) {
            if (!feesTypeMap.has(ft)) {
              feesTypeMap.set(ft, {
                fees_type: ft,
                total_payable: 0,
                total_due: 0,
              });
            }
            const existing = feesTypeMap.get(ft);
            existing.total_payable += c.total_payable || 0;
            existing.total_due += c.total_due || 0;
          }
        });
      });

      const serviceSummary = Array.from(feesTypeMap.values());

      // Payment history (all collections sorted by date)
      const paymentHistory = collections
        .map((c, index) => ({
          sl: index + 1,
          fees_type: c.fees_type || "N/A",
          type_amount: c.type_amount || 0,
          total_due: c.total_due || 0,
          payment_method: c.payment_method || "N/A",
          pay_date: c.pay_date || "",
        }))
        .sort((a, b) => new Date(b.pay_date) - new Date(a.pay_date));

      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const getPrintDate = () => {
        const date = new Date();
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };

      const serviceSummaryHTML = serviceSummary.length > 0
        ? serviceSummary
            .map(
              (service) => `
                  <tr class="hover:bg-gray-50">
                    <td class="border p-2">${(service.fees_type || "N/A").replace(/"/g, "&quot;")}</td>
                    <td class="border p-2">${service.total_payable || 0}</td>
                    <td class="border p-2">${service.total_due || 0}</td>
                  </tr>
                `
            )
            .join("")
        : `<tr><td colspan="3" class="border p-2 text-center">No service data available</td></tr>`;

      const paymentHistoryHTML = paymentHistory.length > 0
        ? paymentHistory
            .map(
              (payment) => `
                  <tr class="hover:bg-gray-50">
                    <td class="border p-2">${payment.sl}</td>
                    <td class="border p-2">${(payment.fees_type || "N/A").replace(/"/g, "&quot;")}</td>
                    <td class="border p-2">${payment.type_amount || 0}</td>
                    <td class="border p-2">${payment.total_due || 0}</td>
                    <td class="border p-2">${(payment.payment_method || "N/A").replace(/"/g, "&quot;")}</td>
                    <td class="border p-2">${formatDate(payment.pay_date)}</td>
                  </tr>
                `
            )
            .join("")
        : `<tr><td colspan="6" class="border p-2 text-center">No payment history available</td></tr>`;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Payment Slip</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body class="bg-gray-200 flex justify-center py-6">
          <div class="bg-white w-[210mm] min-h-[297mm] p-6 text-gray-800">
            <!-- Header -->
            <div class="flex items-center justify-between border-b pb-4 mb-6">
              <img src="${schoolLogo}" class="w-24 h-24 rounded-full border shadow" onerror="this.src='https://via.placeholder.com/90'">
              <div class="flex-1 text-center">
                <h1 class="text-2xl font-bold text-blue-700">${schoolName}</h1>
                <p class="text-sm text-gray-600">${schoolAddress}</p>
                <p class="text-sm text-gray-600">Mobile: ${schoolPhone}</p>
                <p class="mt-1 font-semibold">
                  Report Type: <span class="text-blue-600">Payment</span>
                </p>
                <p class="text-sm">
                  Print Date: ${getPrintDate()}
                </p>
              </div>
              <img src="${schoolLogo}" class="w-24 h-24 rounded-full border shadow" onerror="this.src='https://via.placeholder.com/90'">
            </div>

            <!-- Student Summary -->
            <div class="border rounded-lg p-4 mb-6 bg-gray-50">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span class="font-semibold">Student Name:</span> ${studentName}</div>
                <div><span class="font-semibold">ID Number:</span> ${studentId}</div>
                <div><span class="font-semibold">Class:</span> ${studentClass}</div>
                <div><span class="font-semibold">Group:</span> ${studentGroup}</div>
                <div><span class="font-semibold">Section:</span> ${studentSection}</div>
                <div><span class="font-semibold">Session:</span> ${studentSession}</div>
              </div>
            </div>

            <!-- Service Summary -->
            <div class="overflow-x-auto mb-6">
              <table class="w-full min-w-[800px] border text-sm">
                <thead class="bg-blue-600 text-white">
                  <tr>
                    <th class="border p-2 whitespace-nowrap">Service Type</th>
                    <th class="border p-2 whitespace-nowrap">Payable</th>
                    <th class="border p-2 whitespace-nowrap">Available Due</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  ${serviceSummaryHTML}
                </tbody>
              </table>
            </div>

            <!-- Payment History -->
            <h2 class="font-semibold text-lg mb-2 text-blue-700">
              Payment History
            </h2>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[900px] border text-sm">
                <thead class="bg-gray-800 text-white">
                  <tr>
                    <th class="border p-2">SL</th>
                    <th class="border p-2">Service Name</th>
                    <th class="border p-2">Paid Amount</th>
                    <th class="border p-2">Available Due</th>
                    <th class="border p-2">Pay Method</th>
                    <th class="border p-2">Pay Date</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  ${paymentHistoryHTML}
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="flex justify-between mt-12 text-sm text-gray-700">
              <div>
                <p class="border-t w-40 mt-6"></p>
              </div>
              <div class="text-right">
                <p>Generated By</p>
                <p class="font-semibold">Auto No need signature</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error("Error printing collection slip:", error);
      alert("Error printing collection slip. Please try again.");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      let clickedInside = false;
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(e.target)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openDropdown]);

  const toggleDropdown = (sl) => {
    setOpenDropdown(openDropdown === sl ? null : sl);
  };

  const handleCheckboxChange = (collection, checked) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...(selectedCollections || []), collection]);
    } else {
      onSelectionChange((selectedCollections || []).filter(c => c.sl !== collection.sl));
    }
  };

  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...data]);
    } else {
      onSelectionChange([]);
    }
  };

  const isSelected = (collection) => {
    if (!selectedCollections) return false;
    return selectedCollections.some(c => c.sl === collection.sl);
  };

  const isAllSelected = data.length > 0 && selectedCollections && selectedCollections.length === data.length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`border overflow-x-auto hide-scrollbar ${
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
            {onSelectionChange && selectedCollections !== undefined && (
              <th className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className={`cursor-pointer ${darkMode ? "accent-blue-500" : "accent-blue-600"}`}
                />
              </th>
            )}
            {headers.map((h) => (
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
              <td colSpan={showAction ? (onSelectionChange ? 16 : 15) : (onSelectionChange ? 15 : 14)} className="text-center py-4">
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((collection) => {
              return (
                <tr key={collection.sl} className={`border-b ${borderCol} ${hoverRow}`}>
                  {onSelectionChange && selectedCollections !== undefined && (
                    <td className={`px-3 h-8 border-r ${borderCol}`}>
                      <input
                        type="checkbox"
                        checked={isSelected(collection)}
                        onChange={(e) => handleCheckboxChange(collection, e.target.checked)}
                        className={`cursor-pointer ${darkMode ? "accent-blue-500" : "accent-blue-600"}`}
                      />
                    </td>
                  )}
                  {/* Sl */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.sl}
                  </td>
                  
                  {/* Student id */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.student_id}
                  </td>
                  
                  {/* Class */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.class}
                  </td>
                  
                  {/* Group */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.group}
                  </td>
                  
                  {/* Section */}
                  <td className={`px-3 h-8 border-r ${borderCol}`}>
                    {collection.section}
                  </td>
                  
                  {/* Session */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.session}
                  </td>
                  
                  {/* Fees Type */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.fees_type}
                  </td>
                  
                  {/* Total payable */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    ৳{collection.total_payable || 0}
                  </td>
                  
                  {/* Payable due */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    ৳{collection.payable_due || 0}
                  </td>
                  
                  {/* Pay type */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.pay_type || "N/A"}
                  </td>
                  
                  {/* Type amount */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.type_amount || 0}
                  </td>
                  
                  {/* Total due */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.total_due === 0 ? (
                      <span className="text-green-600 font-semibold">Paid</span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        {collection.total_due}
                      </span>
                    )}
                  </td>
                  
                  {/* Pay Date */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {formatDate(collection.pay_date)}
                  </td>
                  
                  {/* Pay Method */}
                  <td className={`px-3 h-8 border-r ${borderCol} whitespace-nowrap`}>
                    {collection.payment_method || "N/A"}
                  </td>

                  {/* Action */}
                  {showAction && (
                    <td className="px-3 h-8">
                      <div className="relative h-6 flex items-center" ref={(el) => (dropdownRefs.current[collection.sl] = el)}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDropdown(collection.sl);
                          }}
                          className={`h-6 w-6 p-0 flex items-center justify-center transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-300"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          <FiMoreHorizontal className="w-4 h-4" />
                        </button>

                        {openDropdown === collection.sl && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 top-7 w-28 border shadow-sm z-50 ${
                              darkMode
                                ? "bg-gray-800 text-gray-100 border-gray-600"
                                : "bg-white text-gray-900 border-gray-300"
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleView(collection);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
                                darkMode
                                  ? "hover:bg-gray-700 text-gray-100"
                                  : "hover:bg-gray-100 text-gray-900"
                              }`}
                            >
                              <FiPrinter className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEdit(collection);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
                                darkMode
                                  ? "hover:bg-gray-700 text-gray-100"
                                  : "hover:bg-gray-100 text-gray-900"
                              }`}
                            >
                              <FiEdit className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(collection);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${
                                darkMode
                                  ? "text-red-400 hover:bg-gray-700"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <FiTrash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
