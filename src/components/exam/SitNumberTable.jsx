import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import SitNumberActions from "./SitNumberActions";

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

  // Dummy print function (replace with your full seat plan print logic)
  const handlePrint = () => {
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
               padding: 0;
               width: 210mm;
               height: 297mm;
               border-collapse: collapse;
             }
             .card {
               width: 100%;
               background-color: white;
               border: 1px solid #ddd;
               padding: 12px;
               box-shadow: none;
               position: relative;
               page-break-inside: avoid;
               height: 100%;
               display: flex;
               flex-direction: column;
               overflow: hidden;
               margin: -1px 0 0 -1px;
             }
             .watermark {
               position: absolute;
               top: 50%;
               left: 50%;
               transform: translate(-50%, -50%) rotate(-45deg);
               opacity: 0.08;
               z-index: 0;
               pointer-events: none;
             }
             .watermark img {
               width: 200px;
               height: auto;
               object-fit: contain;
             }
             .header {
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
               margin-bottom: 5px;
               position: relative;
               z-index: 1;
             }
             .school-logo {
               width: 50px;
               height: 50px;
               border-radius: 300%;
               overflow: hidden;
               padding: 2px;
               border: 1px solid #ccc;
             }
             .school-logo img {
               width: 100%;
               height: 100%;
               object-fit: cover;
               border-radius: 300%;
             }
             .school-info {
               text-align: center;
               flex-grow: 1;
               padding: 0 10px;
             }
             .school-info h1 {
               font-size: 16px;
               margin: 0;
               font-weight: bold;
             }
             .school-info p {
               font-size: 10px;
               margin: 2px 0;
               line-height: 1.3;
             }
             .student-photo {
               width: 60px;
               height: 60px;
               border-radius: 300%;
               overflow: hidden;
               padding: 2px;
               border: 1px solid #ccc;
             }
             .student-photo img {
               width: 100%;
               height: 100%;
               object-fit: cover;
               border-radius: 300%;
             }
             .banner-container {
               display: flex;
               justify-content: center;
              
             }
             .banner {
               background-color: #6c7a89;
               color: white;
               padding: 4px 30px;
               font-size: 14px;
               font-weight: bold;
               clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%);
               text-align: center;
             }
             hr {
               border: 0;
               border-top: 1px solid #ccc;
               margin: 10px 0;
             }
             .details-grid {
               display: grid;
               grid-template-columns: 1fr 1fr;
               gap: 15px 50px;
               position: relative;
               z-index: 1;
             }
             .detail-item {
               font-size: 12px;
               display: flex;
             }
             .label {
               font-weight: bold;
               width: 65px;
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
                 padding: 0 !important;
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
                 height: 100% !important;
                 overflow: hidden !important;
                 page-break-inside: avoid;
                 box-shadow: none !important;
                 margin: -1px 0 0 -1px !important;
                 border: 1px solid #ddd !important;
                 -webkit-print-color-adjust: exact;
                 print-color-adjust: exact;
               }
               .watermark {
                 position: absolute !important;
                 top: 50% !important;
                 left: 50% !important;
                 transform: translate(-50%, -50%) rotate(-45deg) !important;
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
                    onClick={handlePrint}
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
