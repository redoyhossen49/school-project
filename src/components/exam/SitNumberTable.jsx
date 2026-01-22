import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import SitNumberActions from "./SitNumberActions";
import schoolLogo from "../../assets/images/sidebar-logo.avif";
import schoolWatermark from "../../assets/images/school.webp";

export default function SitNumberTable({
  columns,
  data,
  darkModeProp,
  canEdit,
}) {
  const { darkMode: themeDarkMode } = useTheme();
  const darkMode = darkModeProp ?? themeDarkMode;

  const borderCol = darkMode ? "border-gray-700" : "border-gray-300";
  const hoverRow = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // -------------------- Selection --------------------
  const [selectedSitNumbers, setSelectedSitNumbers] = useState(new Set());

  const handleSelectRow = (id) => {
    setSelectedSitNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = data.map((row, idx) => row.IDNumber ?? idx);
      setSelectedSitNumbers(new Set(allIds));
    } else {
      setSelectedSitNumbers(new Set());
    }
  };

  // -------------------- Download / Print --------------------
  const handleDownloadSelected = () => {
    if (selectedSitNumbers.size === 0) return;

    const selectedRows = data.filter((row, idx) =>
      selectedSitNumbers.has(row.IDNumber ?? idx),
    );

    handlePrint(selectedRows); // Pass selected rows
  };

  // Convert image to absolute URL for printing
  const getLogoUrl = () => {
    // Vite imports return a string path like "/assets/sidebar-logo-xxx.avif"
    // Convert to absolute URL
    if (typeof schoolLogo === "string") {
      if (
        schoolLogo.startsWith("http://") ||
        schoolLogo.startsWith("https://")
      ) {
        return schoolLogo;
      }
      // If it starts with /, it's already an absolute path from root
      if (schoolLogo.startsWith("/")) {
        return window.location.origin + schoolLogo;
      }
      // Otherwise, prepend /
      return window.location.origin + "/" + schoolLogo;
    }
    // Fallback
    return window.location.origin + "/src/assets/images/sidebar-logo.avif";
  };

  // Generate seat plan card HTML
  const generateSeatPlanCardHTML = (student, seatNumber, logoUrl) => {
    const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
    const schoolName = schoolInfo.schoolName || "Mohakhali Model High School";
    const schoolAddress =
      schoolInfo.address ||
      "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212";

    // Get watermark URL
    const watermarkUrl =
      schoolWatermark.startsWith("http://") ||
      schoolWatermark.startsWith("https://")
        ? schoolWatermark
        : schoolWatermark.startsWith("/")
          ? window.location.origin + schoolWatermark
          : window.location.origin + "/" + schoolWatermark;

    return `
      <div class="card">
        <div class="header">
          <div class="school-logo">
            <img src="${logoUrl}" alt="Logo" onerror="this.src='https://via.placeholder.com/50'">
          </div>
          
          <div class="school-info">
            <h1>${schoolName}</h1>
            <p>${schoolAddress}</p>
          </div>

          <div class="student-photo">
            <img src="${student.photo || "https://via.placeholder.com/90x110"}" alt="${student.student_name || student.StudentName || ""}">
          </div>
        </div>

        <div class="banner-container">
          <div class="banner">Seat Plan</div>
        </div>

        <hr>

        <div class="details-grid">
          <div class="left-column">
            <div class="detail-item">
              <span class="label">Class</span>
              <span class="value">: ${student.className || student.Class || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">Group</span>
              <span class="value">: ${student.group || student.Group || "---"}</span>
            </div>
            <div class="detail-item">
              <span class="label">Section</span>
              <span class="value">: ${student.section || student.Section || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="label">Session</span>
              <span class="value">: ${student.session || student.Session || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">Exam Name</span>
              <span class="value">: ${student.examName || student.ExamName || ""}</span>
            </div>
          </div>
          <div class="right-column">
            <div class="detail-item">
              <span class="label">Exam Year</span>
              <span class="value">: ${student.examYear || student.ExamYear || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">Student Name</span>
              <span class="value">: ${student.studentName || student.student_name || student.StudentName || student.name || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">ID Number</span>
              <span class="value">: ${student.idNumber || student.IDNumber || student.studentId || student.student_id || student.ID || student.id || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">Roll Number</span>
              <span class="value">: ${student.rollNo || student.RollNo || student.roll_no || student.roll || ""}</span>
            </div>
            <div class="detail-item">
              <span class="label">Seat Number</span>
              <span class="value">: ${student.seatNumber || student.SeatNumber || student.seat_number || seatNumber || ""}</span>
            </div>
          </div>
        </div>

        <div class="watermark">
          <img src="${watermarkUrl}" alt="Watermark" />
        </div>
      </div>
    `;
  };

  // Print function
  const handlePrint = (rowsToPrint = []) => {
    const seatPlans = rowsToPrint.length > 0 ? rowsToPrint : data;
    const printWindow = window.open("", "_blank");
    const logoUrl = getLogoUrl();
    const watermarkUrl =
      schoolWatermark.startsWith("http://") ||
      schoolWatermark.startsWith("https://")
        ? schoolWatermark
        : schoolWatermark.startsWith("/")
          ? window.location.origin + schoolWatermark
          : window.location.origin + "/" + schoolWatermark;

    const printContent = `
       <!DOCTYPE html>
       <html>
         <head>
           <title>Seat Plan</title>
           <style>
             * {
               margin: 0;
               padding: 0;
               box-sizing: border-box;
               -webkit-print-color-adjust: exact;
               print-color-adjust: exact;
             }
             body {
               font-family: Arial, sans-serif;
               padding: 0;
               margin: 0;
               background: white;
               width: 210mm;
               min-height: 297mm;
               margin: 0 auto;
             }
             .page-container {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               grid-template-rows: repeat(5, minmax(0, 1fr));
               gap: 0;
               page-break-after: always;
               margin: 0;
               padding: 10px;
               width: 210mm;
               height: 297mm;
               border-collapse: collapse;
             }
             .card {
               width: 100%;
               background-color: white;
               border: 1px solid #ddd;
               padding: 15px 12px 50px 12px;
               box-shadow: none;
               position: relative;
               page-break-inside: avoid;
               min-height: 100%;
               display: flex;
               flex-direction: column;
               overflow: visible;
               margin: 5px;
               border-radius: 8px;
             }
             .watermark {
               position: absolute;
               bottom: 5px;
               left: 50%;
               transform: translateX(-50%);
               opacity: 0.08;
               z-index: 0;
               pointer-events: none;
             }
             .watermark img {
               width: 200px;
               height: auto;
               object-fit: contain;
               image-rendering: -webkit-optimize-contrast;
               image-rendering: crisp-edges;
               image-rendering: high-quality;
               -webkit-backface-visibility: hidden;
               backface-visibility: hidden;
             }
             .header {
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
               margin-bottom: 5px;
               position: relative;
               z-index: 1;
               flex-shrink: 0;
             }
             .school-logo {
               width: 50px;
               height: 40px;
               border-radius: 50%;
               overflow: hidden;
               padding: 2px;
               border: 1px solid #ccc;
             }
             .school-logo img {
               width: 100%;
               height: 100%;
               object-fit: cover;
               border-radius: 50%;
               image-rendering: -webkit-optimize-contrast;
               image-rendering: auto;
               -webkit-backface-visibility: hidden;
               backface-visibility: hidden;
               transform: translateZ(0);
               -webkit-font-smoothing: antialiased;
               -moz-osx-font-smoothing: grayscale;
             }
             .school-info {
               text-align: center;
               flex-grow: 1;
               padding: 0 10px;
             }
             .school-info h1 {
               font-size: 14px;
               margin: 0;
               font-weight: bold;
             }
             .school-info p {
               font-size: 9px;
               margin: 2px 0;
               line-height: 1.3;
             }
             .student-photo {
               width: 50px;
               height: 40px;
               border-radius: 50%;
               overflow: hidden;
               padding: 2px;
               border: 1px solid #ccc;
             }
             .student-photo img {
               width: 100%;
               height: 100%;
               object-fit: cover;
               border-radius: 50%;
               image-rendering: -webkit-optimize-contrast;
               image-rendering: auto;
               -webkit-backface-visibility: hidden;
               backface-visibility: hidden;
               transform: translateZ(0);
               -webkit-font-smoothing: antialiased;
               -moz-osx-font-smoothing: grayscale;
             }
             .banner-container {
               display: flex;
               justify-content: center;
               flex-shrink: 0;
               margin: 5px 0;
             }
             .banner {
               background-color: #6c7a89;
               color: white;
               padding: 4px 30px;
               font-size: 12px;
               font-weight: bold;
               clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%);
               text-align: center;
             }
             hr {
               border: 0;
               border-top: 1px solid #ccc;
               margin: 8px 0;
               flex-shrink: 0;
             }
             .details-grid {
               display: grid;
               grid-template-columns: 1fr 1fr;
               gap: 12px 50px;
               position: relative;
               z-index: 1;
               margin-bottom: 10px;
               flex-grow: 1;
             }
             .left-column, .right-column {
               display: flex;
               flex-direction: column;
               gap: 0;
             }
             .detail-item {
               font-size: 10px;
               display: flex;
             }
             .label {
               font-weight: bold;
               width: 90px;
               flex-shrink: 0;
             }
             .value {
               flex-grow: 1;
             }
             @media print {
               * {
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important;
                 color-adjust: exact !important;
               }
               @page {
                 size: A4;
                 margin: 0;
               }
               body {
                 padding: 0;
                 margin: 0;
                 -webkit-print-color-adjust: exact;
                 print-color-adjust: exact;
               }
               .page-container {
                 margin: 0 !important;
                 padding: 10px !important;
                 height: 100vh;
                 display: grid !important;
                 grid-template-columns: repeat(2, 1fr) !important;
                 grid-template-rows: repeat(5, 1fr) !important;
                 gap: 0 !important;
                 page-break-after: always;
                 border-collapse: collapse !important;
                 -webkit-print-color-adjust: exact;
                 print-color-adjust: exact;
               }
               .card {
                 min-height: 100% !important;
                 overflow: visible !important;
                 page-break-inside: avoid;
                 box-shadow: none !important;
                 margin: 5px !important;
                 border: 1px solid #ddd !important;
                 padding: 15px 12px 50px 12px !important;
                 border-radius: 8px !important;
                 -webkit-print-color-adjust: exact;
                 print-color-adjust: exact;
               }
               .watermark {
                 position: absolute !important;
                 bottom: 10px !important;
                 left: 50% !important;
                 transform: translateX(-50%) !important;
                 opacity: 0.08 !important;
                 z-index: 0 !important;
                 pointer-events: none !important;
               }
               .watermark img {
                 width: 200px !important;
                 height: auto !important;
                 object-fit: contain !important;
               }
               .banner {
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important;
                 background-color: #6c7a89 !important;
                 color: white !important;
               }
             }
           </style>
         </head>
         <body>
           ${seatPlans
             .map((student, index) => {
               const cardHTML = generateSeatPlanCardHTML(
                 student,
                 student.seatNumber,
                 logoUrl,
               );
               if (index % 10 === 0) {
                 return '<div class="page-container">' + cardHTML;
               } else if (
                 (index + 1) % 10 === 0 ||
                 index === seatPlans.length - 1
               ) {
                 return cardHTML + "</div>";
               } else {
                 return cardHTML;
               }
             })
             .join("")}
         </body>
       </html>
     `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      // Wait for all images to load
      const images = printWindow.document.querySelectorAll("img");
      let loadedCount = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 500);
        return;
      }

      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.onafterprint = () => printWindow.close();
            }, 500);
          }
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
              }, 500);
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
              }, 500);
            }
          };
        }
      });
    };
  };

  // -------------------- Modals --------------------
  const [viewingSitNumber, setViewingSitNumber] = useState(null);
  const [editingSitNumber, setEditingSitNumber] = useState(null);
  const [viewSitNumberModalOpen, setViewSitNumberModalOpen] = useState(false);
  const [editSitNumberModalOpen, setEditSitNumberModalOpen] = useState(false);

  return (
    <div
      className={`p-3 overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <div className={`border ${borderCol} overflow-x-auto`}>
        <table className="w-full table-auto border-collapse text-xs">
          {/* ===== HEADER ===== */}
          <thead
            className={
              darkMode
                ? "bg-gray-800 border-b border-gray-700"
                : "bg-gray-100 border-b border-gray-300"
            }
          >
            {/* Download Row */}
            <tr>
              <td
                colSpan={columns.length + 2}
                className={`h-10 px-3 border-b ${borderCol}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleDownloadSelected}
                    disabled={selectedSitNumbers.size === 0}
                    className={`text-xs px-2 h-7 transition font-semibold ${
                      selectedSitNumbers.size === 0
                        ? darkMode
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Download ({selectedSitNumbers.size})
                  </button>
                </div>
              </td>
            </tr>

            {/* Column Headers */}
            <tr>
              <th
                className={`h-8 px-3 text-left font-semibold border-r ${borderCol}`}
              >
                <input
                  type="checkbox"
                  checked={
                    data.length > 0 &&
                    data.every((row, idx) =>
                      selectedSitNumbers.has(row.IDNumber ?? idx),
                    )
                  }
                  onChange={handleSelectAll}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 h-8 text-left font-semibold border-r ${borderCol} whitespace-nowrap`}
                >
                  {col.label}
                </th>
              ))}
              {canEdit && (
                <th
                  className={`px-3 h-8 text-left font-semibold whitespace-nowrap`}
                >
                  Action
                </th>
              )}
            </tr>
          </thead>

          {/* ===== BODY ===== */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="h-10 text-center">
                  No Data Found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = row.IDNumber ?? idx;
                const isSelected = selectedSitNumbers.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`border-b ${borderCol} ${hoverRow} ${isSelected ? (darkMode ? "bg-gray-800/50" : "bg-blue-50") : ""}`}
                  >
                    {/* Checkbox */}
                    <td className={`h-8 px-3 border-r ${borderCol}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                      />
                    </td>

                    {/* Data Columns */}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`h-8 px-3 border-r ${borderCol} whitespace-nowrap align-middle`}
                      >
                        {row[col.key]}
                      </td>
                    ))}

                    {/* Actions */}
                    {canEdit && (
                      <td className="h-8 px-3 whitespace-nowrap">
                        <SitNumberActions
                          row={row}
                          onView={(r) => {
                            setViewingSitNumber(r);
                            setViewSitNumberModalOpen(true);
                          }}
                          onEdit={(r) => {
                            setEditingSitNumber(r);
                            setEditSitNumberModalOpen(true);
                          }}
                          onDelete={(r) => {
                            if (
                              confirm(
                                "Are you sure you want to delete this sit number?",
                              )
                            )
                              alert("Deleted successfully");
                          }}
                          onPrint={() => handlePrint([row])} // print single row
                          darkMode={darkMode}
                          canEdit={canEdit}
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== VIEW MODAL ===== */}
      {viewSitNumberModalOpen && viewingSitNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-4 rounded ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
          >
            <h3>Seat Number: {viewingSitNumber.IDNumber}</h3>
            <button
              onClick={() => setViewSitNumberModalOpen(false)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editSitNumberModalOpen && editingSitNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-4 rounded ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
          >
            <h3>Edit Seat Number: {editingSitNumber.IDNumber}</h3>
            <button
              onClick={() => setEditSitNumberModalOpen(false)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
