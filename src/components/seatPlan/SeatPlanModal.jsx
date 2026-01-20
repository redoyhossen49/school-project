import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { studentData } from "../../data/studentData.js";
import { studentExamData } from "../../data/studentExamData.js";
import { seatNumberData } from "../../data/seatNumberData.js";
import schoolLogo from "../../assets/images/sidebar-logo.avif";
import schoolWatermark from "../../assets/images/school.webp";

export default function SeatPlanModal({ open, onClose }) {
  const { darkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const modalRef = useRef(null);

  // Step 1 states
  const [classType, setClassType] = useState("All");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sessionYear, setSessionYear] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Step 2 states
  const [totalStudents, setTotalStudents] = useState(0);
  const [seatNumberStart, setSeatNumberStart] = useState(1);
  const [seatNumberEnd, setSeatNumberEnd] = useState(1);

  // Step 3 states
  const [seatPlans, setSeatPlans] = useState([]);

  // Get unique options from exam data
  const classOptions = Array.from(new Set(studentExamData.map((s) => s.Class))).sort();
  const groupOptions = Array.from(new Set(studentExamData.map((s) => s.Group).filter(Boolean))).sort();
  const sessionOptions = Array.from(new Set(studentExamData.map((s) => s.Session))).sort();
  const examOptions = Array.from(new Set(studentExamData.map((s) => s.ExamName))).sort();

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
      // Reset states
      setStep(1);
      setClassType("All");
      setSelectedClass("");
      setSelectedClasses([]);
      setSelectedGroup("");
      setSessionYear("");
      setSelectedExam("");
      setTotalStudents(0);
      setSeatNumberStart(1);
      setSeatNumberEnd(1);
      setSeatPlans([]);
    }, 300);
  };

  // Get filtered students based on step 1 filters from exam data
  const getFilteredStudents = () => {
    let filtered = [...studentExamData];

    // Filter by exam name first
    if (selectedExam) {
      filtered = filtered.filter((s) => s.ExamName === selectedExam);
    }

    // Filter by class
    if (classType === "Single Class" && selectedClass) {
      filtered = filtered.filter((s) => s.Class === selectedClass);
    } else if (classType === "Multi Class" && selectedClasses.length > 0) {
      filtered = filtered.filter((s) => selectedClasses.includes(s.Class));
    }

    // Filter by group
    if (selectedGroup) {
      filtered = filtered.filter((s) => s.Group === selectedGroup);
    }

    // Filter by session
    if (sessionYear) {
      filtered = filtered.filter((s) => s.Session === sessionYear);
    }

    // Get unique students (by IDNumber) to avoid duplicates
    const uniqueStudents = [];
    const seenIds = new Set();
    
    filtered.forEach((examRecord) => {
      if (!seenIds.has(examRecord.IDNumber)) {
        seenIds.add(examRecord.IDNumber);
        // Map exam data structure to student-like structure for card generation
        uniqueStudents.push({
          student_name: examRecord.StudentName,
          studentId: examRecord.IDNumber,
          rollNo: examRecord.RollNo,
          className: examRecord.Class,
          group: examRecord.Group,
          section: examRecord.Section || "",
          session: examRecord.Session,
          fatherName: examRecord.FathersName,
          // Get photo from studentData if available
          photo: studentData.find((s) => s.studentId === examRecord.IDNumber)?.photo || "https://via.placeholder.com/90x110",
        });
      }
    });

    return uniqueStudents;
  };

  // Handle step 1 next
  const handleStep1Next = () => {
    if (!selectedExam) {
      alert("Please select Exam");
      return;
    }
    if (!sessionYear) {
      alert("Please select Session Year");
      return;
    }
    if (classType === "Single Class" && !selectedClass) {
      alert("Please select a class");
      return;
    }
    if (classType === "Multi Class" && selectedClasses.length === 0) {
      alert("Please select at least one class");
      return;
    }

    const students = getFilteredStudents();
    setTotalStudents(students.length);
    setSeatNumberEnd(students.length);
    setStep(2);
  };

  // Handle step 2 next
  const handleStep2Next = () => {
    if (seatNumberStart < 1 || seatNumberEnd < seatNumberStart) {
      alert("Invalid seat number range");
      return;
    }

    const students = getFilteredStudents();
    const seatCount = seatNumberEnd - seatNumberStart + 1;

    if (students.length !== seatCount) {
      alert(`Seat count (${seatCount}) must match total students (${students.length})`);
      return;
    }

    // Generate seat plans
    const plans = students.map((student, index) => ({
      ...student,
      seatNumber: seatNumberStart + index,
    }));

    setSeatPlans(plans);
    setStep(3);
  };

  // Generate seat plan card HTML
  const generateSeatPlanCardHTML = (student, seatNumber, logoUrl) => {
    const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
    const schoolName = schoolInfo.schoolName || "Mohakhali Model High School";
    const schoolAddress = schoolInfo.address || "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212";

    // Get watermark URL
    const watermarkUrl = schoolWatermark.startsWith('http://') || schoolWatermark.startsWith('https://') 
      ? schoolWatermark 
      : schoolWatermark.startsWith('/') 
        ? window.location.origin + schoolWatermark 
        : window.location.origin + '/' + schoolWatermark;

    return `
      <div class="card">
        <div class="watermark">
          <img src="${watermarkUrl}" alt="Watermark" />
        </div>
        <div class="header">
          <div class="school-logo">
            <img src="${logoUrl}" alt="Logo" onerror="this.src='https://via.placeholder.com/50'">
          </div>
          
          <div class="school-info">
            <h1>${schoolName}</h1>
            <p>${schoolAddress}</p>
          </div>

          <div class="student-photo">
            <img src="${student.photo || "https://via.placeholder.com/90x110"}" alt="${student.student_name}">
          </div>
        </div>

        <div class="banner-container">
          <div class="banner">Seat Plan</div>
        </div>

        <hr>

        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Name</span>
            <span class="value">: ${student.student_name}</span>
          </div>
          <div class="detail-item">
            <span class="label">Class</span>
            <span class="value">: ${student.className}</span>
          </div>
          <div class="detail-item">
            <span class="label">ID Number</span>
            <span class="value">: ${student.studentId}</span>
          </div>
          <div class="detail-item">
            <span class="label">Group</span>
            <span class="value">: ${student.group || "---"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Roll</span>
            <span class="value">: ${student.rollNo}</span>
          </div>
          <div class="detail-item">
            <span class="label">Section</span>
            <span class="value">: ${student.section || "N/A"}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Convert image to absolute URL for printing
  const getLogoUrl = () => {
    // Vite imports return a string path like "/assets/sidebar-logo-xxx.avif"
    // Convert to absolute URL
    if (typeof schoolLogo === 'string') {
      if (schoolLogo.startsWith('http://') || schoolLogo.startsWith('https://')) {
        return schoolLogo;
      }
      // If it starts with /, it's already an absolute path from root
      if (schoolLogo.startsWith('/')) {
        return window.location.origin + schoolLogo;
      }
      // Otherwise, prepend /
      return window.location.origin + '/' + schoolLogo;
    }
    // Fallback
    return window.location.origin + '/src/assets/images/sidebar-logo.avif';
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const logoUrl = getLogoUrl();
    const watermarkUrl = schoolWatermark.startsWith('http://') || schoolWatermark.startsWith('https://') 
      ? schoolWatermark 
      : schoolWatermark.startsWith('/') 
        ? window.location.origin + schoolWatermark 
        : window.location.origin + '/' + schoolWatermark;
    
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
          ${seatPlans.map((student, index) => {
            const cardHTML = generateSeatPlanCardHTML(student, student.seatNumber, logoUrl);
            if (index % 10 === 0) {
              return '<div class="page-container">' + cardHTML;
            } else if ((index + 1) % 10 === 0 || index === seatPlans.length - 1) {
              return cardHTML + '</div>';
            } else {
              return cardHTML;
            }
          }).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      // Wait for all images to load
      const images = printWindow.document.querySelectorAll('img');
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

  if (!open && !isModalClosing) return null;

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";
  const inputBg = darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-700";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isModalClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`${cardBg} ${textColor} max-w-[500px] w-full  mx-4 max-h-[90vh] overflow-hidden flex flex-col ${
          isModalOpening ? "animate-scaleIn" : isModalClosing ? "animate-scaleOut" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderClr}`}>
          <h2 className="text-lg font-semibold">Seat Plan</h2>
          <button
            onClick={handleClose}
            className={`px-3 py-1 text-sm border ${borderClr} ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            } transition`}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step Indicator */}
          <div className="mb-6 flex items-center justify-center ">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s
                      ? "bg-blue-600 text-white"
                      : step > s
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Filters */}
          {step === 1 && (
            <div className="space-y-4">

              <div>
                <label className="block text-[12px] font-medium mb-2">Class Type</label>
                <select
                  value={classType}
                  onChange={(e) => {
                    setClassType(e.target.value);
                    setSelectedClass("");
                    setSelectedClasses([]);
                  }}
                  className={`w-full border px-3 h-8 text-[12px]  ${borderClr} ${inputBg}`}
                >
                  <option value="All">All</option>
                  <option value="Single Class">Single Class</option>
                  <option value="Multi Class">Multi Class</option>
                </select>
              </div>

              {classType === "Single Class" && (
                <div>
                  <label className="block text-[12px] font-medium mb-2">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className={`w-full border px-3 py-2 text-sm  ${borderClr} ${inputBg}`}
                  >
                    <option value="">Choose a class</option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {classType === "Multi Class" && (
                <div>
                  <label className="block text-[12px] font-medium mb-2">Select Classes</label>
                  <div className="flex flex-wrap gap-3 border px-3 h-8">
                    {classOptions.map((cls) => (
                      <label key={cls} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClasses([...selectedClasses, cls]);
                            } else {
                              setSelectedClasses(selectedClasses.filter((c) => c !== cls));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-[12px]">{cls}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium mb-2">Select Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`w-full border px-3 h-8 text-[12px]  ${borderClr} ${inputBg}`}
                >
                  <option value="">All Groups</option>
                  {groupOptions.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2">Session Year</label>
                <select
                  value={sessionYear}
                  onChange={(e) => setSessionYear(e.target.value)}
                  className={`w-full border px-3 h-8 text-[12px]  ${borderClr} ${inputBg}`}
                  required
                >
                  <option value="">Choose Session Year</option>
                  {sessionOptions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2">Select Exam</label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className={`w-full border px-3 h-8 text-[12px]  ${borderClr} ${inputBg}`}
                  required
                >
                  <option value="">Choose Exam</option>
                  {examOptions.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam.charAt(0).toUpperCase() + exam.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleClose}
                  className={`px-4 h-8 text-[12px] border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  } transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStep1Next}
                  className="px-4 h-8 text-[12px] bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Set Seat Numbers */}
          {step === 2 && (
            <div className="space-y-2">
              <h3 className="text-[12px] font-semibold mb-2">Set Seat Numbers</h3>

              <div className={`px-3 h-8 flex items-center justify-center border ${borderClr} ${cardBg}`}>
                <div className="text-center flex items-center justify-center gap-2">
                  <p className="text-[12px] text-gray-500 mb-1">Total Students</p>
                  <p className="text-[12px] font-bold text-blue-600">{totalStudents}</p>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2">Seat Number Start</label>
                <input
                  type="number"
                  value={seatNumberStart}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setSeatNumberStart(val);
                    setSeatNumberEnd(val + totalStudents - 1);
                  }}
                  min="1"
                  className={`w-full border px-3 h-8 text-[12px] rounded ${borderClr} ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2">Seat Number End</label>
                <input
                  type="number"
                  value={seatNumberEnd}
                  onChange={(e) => setSeatNumberEnd(parseInt(e.target.value) || 1)}
                  min={seatNumberStart}
                  className={`w-full border px-3 h-8 text-[12px] rounded ${borderClr} ${inputBg}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Seat count: {seatNumberEnd - seatNumberStart + 1} (must match total students)
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className={`px-4 h-8 text-[12px] border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  } transition`}
                >
                  Back
                </button>
                <button
                  onClick={handleStep2Next}
                  className="px-4 h-8 text-[12px] bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Print */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold mb-4">Preview & Print</h3>
              
              <div className={`px-3 h-8 gap-2 flex items-center justify-center border ${borderClr} ${cardBg} mb-4`}>
                <p className="text-[12px] flex items-center justify-center gap-2">
                  <span className="font-semibold">Total Cards:</span> {seatPlans.length}
                </p>
                <p className="text-[12px] flex items-center justify-center gap-2">
                  <span className="font-semibold">Pages:</span> {Math.ceil(seatPlans.length / 10)}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setStep(2)}
                  className={`px-4 h-8 text-[12px] border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  } transition`}
                >
                  Back
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 h-8 text-[12px] bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
