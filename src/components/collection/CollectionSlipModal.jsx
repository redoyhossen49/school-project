import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getCollectionsAPI } from "../../utils/collectionUtils";
import { studentData } from "../../data/studentData";
import { collectionData } from "../../data/collectionData";
import schoolLogo from "../../assets/images/sidebar-logo.avif";

export default function CollectionSlipModal({ open, onClose, collection, darkMode }) {
  const { darkMode: themeDarkMode } = useTheme();
  const isDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;
  
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const modalRef = useRef(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [serviceSummary, setServiceSummary] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setIsModalClosing(false);
      setDataLoaded(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
      loadCollectionData();
    } else {
      setIsModalOpening(false);
    }
  }, [open, collection]);

  const loadCollectionData = async () => {
    if (!collection) return;

    try {
      // Get school info (same as admit card)
      const school = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
      const schoolName = school.schoolName || "Mohakhali Model High School";
      const schoolAddress = school.address || "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212";
      const schoolLogoUrl = school?.logo || schoolLogo;
      const schoolPhone = school?.phone || school?.mobile || "01XXXXXXXXX";
      
      setSchoolInfo({
        logo: schoolLogoUrl,
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
      });

      // Load all students
      const storedStudents = localStorage.getItem("students");
      const dynamicStudents = storedStudents ? JSON.parse(storedStudents) : [];
      const combinedStudents = [...studentData, ...dynamicStudents];
      
      const student = combinedStudents.find(
        (s) => {
          const sId = (s.studentId || s.student_id || "").toUpperCase();
          const cId = (collection.student_id || "").toUpperCase();
          return sId === cId && sId !== "";
        }
      );

      // Get student photo
      const studentPhoto = student?.photo || "https://via.placeholder.com/100";
      
      if (student) {
        setStudentInfo({
          name: student.student_name || collection.student_name || "N/A",
          id: collection.student_id || student.studentId || student.student_id || "N/A",
          class: student.className || student.class || collection.class || "N/A",
          group: student.group || collection.group || "N/A",
          section: student.section || collection.section || "N/A",
          session: student.session || collection.session || "N/A",
          photo: studentPhoto,
        });
      } else {
        setStudentInfo({
          name: collection.student_name || "N/A",
          id: collection.student_id || "N/A",
          class: collection.class || "N/A",
          group: collection.group || "N/A",
          section: collection.section || "N/A",
          session: collection.session || "N/A",
          photo: studentPhoto,
        });
      }

      // Use the specific collection data instead of loading all collections
      // Service Summary - based on the specific collection
      const feesTypes = collection.fees_type?.split(", ") || [collection.fees_type || ""];
      const serviceSummaryData = feesTypes
        .filter((ft) => ft)
        .map((ft) => ({
          fees_type: ft,
          total_payable: collection.total_payable || 0,
          total_due: collection.total_due || 0,
        }));

      setServiceSummary(serviceSummaryData);

      // Payment History - show only the specific collection
      const history = [{
        sl: 1,
        fees_type: collection.fees_type || "N/A",
        type_amount: collection.type_amount || 0,
        total_due: collection.total_due || 0,
        payment_method: collection.payment_method || "N/A",
        pay_date: collection.pay_date || collection.payDate || "",
      }];

      setPaymentHistory(history);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading collection data:", error);
      setDataLoaded(true);
    }
  };

  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
    }, 300);
  };

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

  const handlePrint = () => {
    if (!schoolInfo || !studentInfo || !dataLoaded) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

      const serviceSummaryHTML = serviceSummary.length > 0
        ? serviceSummary
            .map(
              (service) => `
                <tr>
                  <td>${(service.fees_type || "N/A").replace(/"/g, "&quot;")}</td>
                  <td>${service.total_payable || 0}</td>
                  <td>${service.total_due || 0}</td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="3" style="text-align: center;">No service data available</td></tr>`;

      const paymentHistoryHTML = paymentHistory.length > 0
        ? paymentHistory
            .map(
              (payment, index) => `
                <tr>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${payment.sl}</td>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${(payment.fees_type || "N/A").replace(/"/g, "&quot;")}</td>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${payment.type_amount || 0}</td>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${payment.total_due || 0}</td>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${(payment.payment_method || "N/A").replace(/"/g, "&quot;")}</td>
                  <td style="border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: ${index === paymentHistory.length - 1 ? '1px solid #e5e7eb' : '1px solid #e5e7eb'}; border-top: none;">${formatDate(payment.pay_date)}</td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="6" style="border: 1px solid #e5e7eb; text-align: center;">No payment history available</td></tr>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Payment Slip</title>
        <style>
          /* General Reset */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            background-color: #e5e7eb;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            padding: 1.5rem 0;
          }

          @page {
            size: A4;
            margin: 0.5in;
          }

          /* Container - A4 */
          .container {
            background-color: #ffffff;
            width: 210mm;
            height: 297mm;
            padding: 1.5rem;
            color: #374151;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            page-break-after: avoid;
            page-break-inside: avoid;
            overflow: hidden;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          /* Header */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
            page-break-inside: avoid;
            flex-shrink: 0;
          }

          .logo {
            width: 6rem;
            height: 6rem;
            border-radius: 9999px;
            border: 1px solid #e5e7eb;
          }

          .header-text {
            flex: 1;
            text-align: center;
          }

          .header-text h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1d4ed8;
            margin-bottom: 2px;
          }

          .header-text p {
            font-size: 0.875rem;
            color: #4b5563;
          }

          .text-blue-600 { color: #2563eb; }
          .font-semibold { font-weight: 600; }

          /* Student Info Grid */
          .student-summary {
            padding: 0.75rem 0;
            margin-bottom: 1rem;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            font-size: 0.875rem;
            page-break-inside: avoid;
            flex-shrink: 0;
          }

          /* Table Styles */
          .table-container {
            overflow-x: auto;
            margin-bottom: 1rem;
            page-break-inside: avoid;
            flex-shrink: 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            page-break-inside: avoid;
            border-spacing: 0;
          }

          th, td {
            border: 1px solid #e5e7eb;
            padding: 0.4rem;
            text-align: center;
            border-collapse: collapse;
          }
          
          th {
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
          }
          
          td {
            border-top: none;
            border-bottom: 1px solid #e5e7eb;
          }
          
          tr:last-child td {
            border-bottom: 1px solid #e5e7eb;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .bg-blue { background-color: #2563eb; color: white; }
          .bg-dark { background-color: #1f2937; color: white; }

          /* Footer */
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 1rem;
            font-size: 0.875rem;
            page-break-inside: avoid;
            flex-shrink: 0;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .container {
              page-break-after: avoid;
              page-break-inside: avoid;
              height: 297mm;
              overflow: hidden;
            }
            
            .header,
            .student-summary,
            .table-container,
            .footer {
              page-break-inside: avoid;
            }
            
            table {
              page-break-inside: avoid;
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            h2 {
              page-break-after: avoid;
              margin-bottom: 0.5rem;
            }
          }

          .signature-line {
            border-top: 1px solid #374151;
            width: 160px;
          }
        </style>
      </head>
      <body>

      <div class="container">

        <div class="header">
          <img src="${schoolInfo.logo}" class="logo" onerror="this.src='https://via.placeholder.com/90'">

          <div class="header-text">
            <h1>${schoolInfo.name}</h1>
            <p>${schoolInfo.address}</p>
            <p>Mobile: ${schoolInfo.phone}</p>
            <p style="margin-top: 4px; font-weight: 600;">
              Report Type: <span class="text-blue-600">Payment</span>
            </p>
            <p style="font-size: 0.8125rem;">
              Print Date: <span id="printDate"></span>
            </p>
          </div>

          <img src="${studentInfo.photo || 'https://via.placeholder.com/100'}" class="logo" onerror="this.src='https://via.placeholder.com/100'">
        </div>

        <div class="student-summary">
          <div><span class="font-semibold">Student Name:</span> ${studentInfo.name}</div>
          <div><span class="font-semibold">ID Number:</span> ${studentInfo.id}</div>
          <div><span class="font-semibold">Class:</span> ${studentInfo.class}</div>
          <div><span class="font-semibold">Group:</span> ${studentInfo.group}</div>
          <div><span class="font-semibold">Section:</span> ${studentInfo.section}</div>
          <div><span class="font-semibold">Session:</span> ${studentInfo.session}</div>
        </div>

        <div class="table-container">
          <table>
            <thead class="bg-blue">
              <tr>
                <th>Service Type</th>
                <th>Payable</th>
                <th>Available Due</th>
              </tr>
            </thead>
            <tbody>
              ${serviceSummaryHTML}
            </tbody>
          </table>
        </div>

        <h2 style="font-size: 14px; font-weight: normal; color: black; margin-bottom: 0.5rem;">Payment History</h2>
        <div class="table-container">
          <table style="border-collapse: collapse; border-spacing: 0;">
            <thead class="bg-dark">
              <tr>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">SL</th>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">Service Name</th>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">Paid Amount</th>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">Available Due</th>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">Pay Method</th>
                <th style="border: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">Pay Date</th>
              </tr>
            </thead>
            <tbody>
              ${paymentHistoryHTML}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>
            <div class="signature-line"></div>
            <p style="margin-top: 5px; text-align: center;">Authority Signature</p>
          </div>
          <div style="text-align: right;">
            <p>©${new Date().getFullYear()} Astha Academic </p>
          </div>
        </div>

      </div>
      <script>
        const date = new Date();
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        document.getElementById('printDate').innerText = date.toLocaleDateString('en-US', options);
      </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const borderClr = isDarkMode ? "border-gray-600" : "border-gray-300";
  const cardBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-gray-100" : "text-gray-900";

  if (!open && !isModalClosing) return null;

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }
          }
        `}
      </style>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={handleClose}
      >
        <div
          ref={modalRef}
          className={`${cardBg} ${textColor} max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform ${
            isModalOpening && !isModalClosing
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderClr}`}>
          <h2 className="text-[12px] font-semibold">Payment Slip - {studentInfo?.name || collection?.student_id || "N/A"}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!dataLoaded}
              className={`px-3 py-1 text-xs border ${borderClr} ${isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                } transition`}
            >
              Print
            </button>
            <button
              onClick={handleClose}
              className={`px-3 py-1 text-xs border ${borderClr} ${isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                } transition`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#e5e7eb' }}>
          {!dataLoaded ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-gray-500">Loading payment slip data...</p>
            </div>
          ) : schoolInfo && studentInfo ? (
            <div style={{
              backgroundColor: '#ffffff',
              width: '210mm',
              height: '297mm',
              padding: '1.5rem',
              color: '#374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              margin: '0 auto',
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '0.75rem',
                marginBottom: '1rem',
                flexShrink: 0
              }}>
                <img 
                  src={schoolInfo.logo} 
                  alt="School Logo" 
                  style={{
                    width: '6rem',
                    height: '6rem',
                    borderRadius: '9999px',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/90"; }}
                />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    marginBottom: '2px'
                  }}>{schoolInfo.name}</h1>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{schoolInfo.address}</p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Mobile: {schoolInfo.phone}</p>
                  <p style={{ marginTop: '4px', fontWeight: 600 }}>
                    Report Type: <span style={{ color: '#2563eb' }}>Payment</span>
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>Print Date: {getPrintDate()}</p>
                </div>
                <img 
                  src={studentInfo.photo || "https://via.placeholder.com/100"} 
                  alt="Student Photo" 
                  style={{
                    width: '6rem',
                    height: '6rem',
                    borderRadius: '9999px',
                    border: '1px solid #e5e7eb',
                    objectFit: 'cover'
                  }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                />
              </div>

              {/* Student Summary */}
              <div style={{
                padding: '0.75rem 0',
                marginBottom: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                fontSize: '0.875rem',
                flexShrink: 0
              }}>
                <div><span style={{ fontWeight: 600 }}>Student Name:</span> {studentInfo.name}</div>
                <div><span style={{ fontWeight: 600 }}>ID Number:</span> {studentInfo.id}</div>
                <div><span style={{ fontWeight: 600 }}>Class:</span> {studentInfo.class}</div>
                <div><span style={{ fontWeight: 600 }}>Group:</span> {studentInfo.group}</div>
                <div><span style={{ fontWeight: 600 }}>Section:</span> {studentInfo.section}</div>
                <div><span style={{ fontWeight: 600 }}>Session:</span> {studentInfo.session}</div>
              </div>

              {/* Service Summary */}
              <div style={{ overflowX: 'auto', marginBottom: '1rem', flexShrink: 0 }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px'
                }}>
                  <thead style={{ backgroundColor: '#2563eb', color: 'white' }}>
                    <tr>
                      <th style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Service Type</th>
                      <th style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Payable</th>
                      <th style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Available Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceSummary.length > 0 ? (
                      serviceSummary.map((service, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>{service.fees_type || "N/A"}</td>
                          <td style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>{service.total_payable || 0}</td>
                          <td style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>{service.total_due || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>No service data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment History */}
              <h2 style={{ fontSize: '14px',  marginBottom: '0.5rem', flexShrink: 0 }}>Payment History</h2>
              <div style={{ overflowX: 'auto', marginBottom: '1rem', flexShrink: 0 }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  borderSpacing: 0,
                  fontSize: '12px'
                }}>
                  <thead style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    <tr>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>SL</th>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Service Name</th>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Paid Amount</th>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Available Due</th>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Pay Method</th>
                      <th style={{ border: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>Pay Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment, index) => (
                        <tr key={payment.sl}>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{payment.sl}</td>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{payment.fees_type || "N/A"}</td>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{payment.type_amount || 0}</td>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{payment.total_due || 0}</td>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{payment.payment_method || "N/A"}</td>
                          <td style={{ borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderTop: 'none', padding: '0.4rem', textAlign: 'center' }}>{formatDate(payment.pay_date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ border: '1px solid #e5e7eb', padding: '0.4rem', textAlign: 'center' }}>No payment history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '1rem',
                fontSize: '0.875rem',
                flexShrink: 0
              }}>
                <div>
                  <div style={{
                    borderTop: '1px dashed #374151',
                    width: '160px'
                  }}></div>
                  <p style={{ marginTop: '5px', textAlign: 'center' }}>Authority Signature</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p>©{new Date().getFullYear()} Astha Academic </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-red-500">Error loading payment slip data</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
