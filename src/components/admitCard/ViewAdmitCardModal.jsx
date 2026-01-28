import { useState, useEffect, useRef } from "react";
import { generateAdmitCardHTML } from "./admitCardUtils.js";

export default function ViewAdmitCardModal({ open, onClose, row, darkMode }) {
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setIsModalClosing(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
    }, 300);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admit Card - ${row.StudentName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .page-container {
              max-width: 850px;
              margin: 0 auto;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .admit-card {
              width: 850px;
              background: #fff;
              padding: 40px;
              position: relative;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border: 1px solid gray;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow: hidden;
            }
            .watermark {
              position: absolute;
              top: 60%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              opacity: 0.08;
              z-index: 0;
              pointer-events: none;
            }
            .watermark img {
              width: 300px;
              height: auto;
              object-fit: contain;
            }
            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              margin-bottom: 20px;
              position: relative;
              z-index: 1;
            }
            .logo{
              border: 1px solid gray;
              padding: 2px;
              width: 100px;
              height: 100px;
              border-radius: 300% !important;
            }
            .logo img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: cover;
              border-radius: 300% !important;
            }
            .school-info {
              text-align: center;
              flex-grow: 1;
            }
            .school-info h1 {
              margin: 0;
              font-size: 26px;
              color: #1a1a1a;
              font-weight: 700;
            }
            .school-info p {
              margin: 5px 0;
              font-size: 11px;
              font-weight: bold;
              color: #333;
            }
            .admit-badge {
              background-color: #26a69a;
              color: white;
              padding: 4px 15px;
              display: inline-block;
              border-radius: 4px;
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .exam-title {
              font-size: 16px;
              font-weight: bold;
              border-bottom: 2px solid #00c2cb;
              display: inline-block;
              padding-bottom: 2px;
            }
            .student-photo {
              border: 1px solid gray;
              padding: 2px;
              width: 100px;
              height: 100px;
              border-radius: 300% !important;
            }
            .student-photo img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: cover;
              border-radius: 300% !important;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              gap: 40px;
              margin-top: 20px;
              position: relative;
              z-index: 1;
            }
            .right-info{
              margin-left: 40% !important;
              }
            .info-row {
              display: flex;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .label {
              font-weight: bold;
              width: 110px;
            }
            .value-box {
              border: 1px solid #999;
              padding: 2px 8px;
              flex-grow: 1;
              min-height: 22px;
              border-radius: 3px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .subjects-wrapper {
              margin-top: 30px;
              position: relative;
              z-index: 1;
            }
            .subjects-header {
              font-weight: bold;
              font-size: 14px;
              text-align: center;
            }
            .subjects-container {
              border: 1px solid #ddd;
              border-radius: 3px;
            }
            .subjects-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .subject-item {
              padding: 6px 10px;
              border: none;
              font-size: 12px;
              background-color: transparent;
            }
           .footer {
  margin-top: 2%;
  display: flex;
  justify-content: space-between; /* spreads the two divs */
  align-items: center; /* vertically centers items inside each div */
}
            .sig-box {
              text-align: center;
              width: 250px;
            }
            .sig-line {
              margin-bottom: 5px;
            }
            .sig-text {
            border-top: 1px dashed gray;
            padding-top: 8px;
              font-size: 12px;
              font-weight: bold;
            }
            .signature-image {
              width: 150px;
              height: auto;
              max-height: 50px;
              object-fit: contain;
              margin-bottom: 5px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            .copyright {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 40px;
              text-align: center;
              position: relative;
              margin-bottom: -30px;
            }
            .copyright p {
              font-size: 12px;
              color: #666;
              margin: 0;
              padding-bottom: 10px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                background: none !important; 
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              .page-container { 
                max-width: 850px !important;
                margin: 0 auto !important;
                padding: 40px !important;
                width: auto !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              button { display: none; }
              .admit-card { 
                page-break-inside: avoid !important; 
                margin-bottom: 20px !important;
                width: 850px !important;
                max-width: 850px !important;
                padding: 40px !important;
                border: 1px solid gray !important;
                box-shadow: none !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .watermark {
                position: absolute !important;
                top: 60% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(-45deg) !important;
                opacity: 0.08 !important;
                z-index: 0 !important;
                pointer-events: none !important;
              }
              .watermark img {
                width: 300px !important;
                height: auto !important;
                object-fit: contain !important;
              }
              .admit-badge {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-color: #26a69a !important;
                color: white !important;
              }
              .value-box {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #999 !important;
                background: #fff !important;
              }
              .student-photo {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: transparent !important;
                border: 1px solid gray !important;
                border-radius: 300px !important;
              }
                .footer {
  margin-top: 2%;
  display: flex;
  justify-content: space-between; /* spreads the two divs */
  align-items: center; /* vertically centers items inside each div */
}
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            ${generateAdmitCardHTML(row)}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for images to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close window after print dialog is closed
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    };
  };

  if (!open && !isModalClosing) return null;

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isModalClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`${cardBg} ${textColor} max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
          isModalOpening
            ? "animate-scaleIn"
            : isModalClosing
              ? "animate-scaleOut"
              : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${borderClr}`}
        >
          <h2 className="text-[12px] font-semibold">{row.StudentName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`px-3 py-1 text-xs border ${borderClr} ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              } transition`}
            >
              Print
            </button>
            <button
              onClick={handleClose}
              className={`px-3 py-1 text-xs border ${borderClr} ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              } transition`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={`admit-card-view ${darkMode ? "bg-gray-900" : "bg-white"}`}
            dangerouslySetInnerHTML={{
              __html: generateAdmitCardHTML(row),
            }}
            style={{
              width: "100%",
              position: "relative",
            }}
          />
        </div>
      </div>

      <style>{`
            .page-container {
              max-width: 850px;
              margin: 0 auto;
              background: white;
            }
            .admit-card {
              width: 850px;
              background: #fff;
              padding: 40px;
              position: relative;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border: 1px solid gray;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow: hidden;
            }
            .watermark {
              position: absolute;
              top: 60%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              opacity: 0.08;
              z-index: 0;
              pointer-events: none;
            }
            .watermark img {
              width: 300px;
              height: auto;
              object-fit: contain;
            }
            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              margin-bottom: 20px;
              position: relative;
              z-index: 1;
            }
            .logo{
              border: 1px solid gray;
              padding: 2px;
              width: 100px;
              height: 100px;
              border-radius: 300% !important;
            }
            .logo img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: cover;
              border-radius: 300% !important;
            }
            .school-info {
              text-align: center;
              flex-grow: 1;
            }
            .school-info h1 {
              margin: 0;
              font-size: 26px;
              color: #1a1a1a;
              font-weight: 700;
            }
            .school-info p {
              margin: 5px 0;
              font-size: 11px;
              font-weight: bold;
              color: #333;
            }
            .admit-badge {
              background-color: #26a69a;
              color: white;
              padding: 4px 15px;
              display: inline-block;
              border-radius: 4px;
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .exam-title {
              font-size: 16px;
              font-weight: bold;
              border-bottom: 2px solid #00c2cb;
              display: inline-block;
              padding-bottom: 2px;
            }
            .student-photo {
              border: 1px solid gray;
              padding: 2px;
              width: 100px;
              height: 100px;
              border-radius: 300% !important;
            }
            .student-photo img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: cover;
              border-radius: 300% !important;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              gap: 40px;
              margin-top: 20px;
              position: relative;
              z-index: 1;
            }
            .right-info{
              margin-left: 40% !important;
              }
            .info-row {
              display: flex;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .label {
              font-weight: bold;
              width: 110px;
            }
            .value-box {
              border: 1px solid #999;
              padding: 2px 8px;
              flex-grow: 1;
              min-height: 22px;
              border-radius: 3px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .subjects-wrapper {
              margin-top: 30px;
              position: relative;
              z-index: 1;
            }
            .subjects-header {
              font-weight: bold;
              font-size: 14px;
              text-align: center;
            }
            .subjects-container {
              border: 1px solid #ddd;
              border-radius: 3px;
            }
            .subjects-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .subject-item {
              padding: 6px 10px;
              border: none;
              font-size: 12px;
              background-color: transparent;
            }
           .footer {
  margin-top: 2%;
  display: flex;
  justify-content: space-between; /* spreads the two divs */
  align-items: center; /* vertically centers items inside each div */
}
            .sig-box {
              text-align: center;
              width: 250px;
            }
            .sig-line {
              margin-bottom: 5px;
            }
            .sig-text {
            border-top: 1px dashed gray;
            padding-top: 8px;
              font-size: 12px;
              font-weight: bold;
            }
            .signature-image {
              width: 150px;
              height: auto;
              max-height: 50px;
              object-fit: contain;
              margin-bottom: 5px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            .copyright {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 40px;
              text-align: center;
              position: relative;
              margin-bottom: -30px;
            }
            .copyright p {
              font-size: 12px;
              color: #666;
              margin: 0;
              padding-bottom: 10px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                background: none !important; 
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              .page-container { 
                max-width: 850px !important;
                margin: 0 auto !important;
                padding: 40px !important;
                width: auto !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              button { display: none; }
              .admit-card { 
                page-break-inside: avoid !important; 
                margin-bottom: 20px !important;
                width: 850px !important;
                max-width: 850px !important;
                padding: 40px !important;
                border: 1px solid gray !important;
                box-shadow: none !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .watermark {
                position: absolute !important;
                top: 60% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(-45deg) !important;
                opacity: 0.08 !important;
                z-index: 0 !important;
                pointer-events: none !important;
              }
              .watermark img {
                width: 300px !important;
                height: auto !important;
                object-fit: contain !important;
              }
              .admit-badge {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-color: #26a69a !important;
                color: white !important;
              }
              .value-box {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #999 !important;
                background: #fff !important;
              }
              .student-photo {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: transparent !important;
                border: 1px solid gray !important;
                border-radius: 300px !important;
              }
                .footer {
  margin-top: 2%;
  display: flex;
  justify-content: space-between; /* spreads the two divs */
  align-items: center; /* vertically centers items inside each div */
}
            }
      `}</style>
    </div>
  );
}
