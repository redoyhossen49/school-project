import { useState, useMemo, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { studentExamData } from "../data/studentExamData.js";
import { studentData } from "../data/studentData.js";
import Pagination from "../components/Pagination.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import ReusableActions from "../components/common/ReusableActions.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { FiMoreHorizontal, FiEdit, FiTrash2, FiPrinter, FiEye } from "react-icons/fi";
import FormModal from "../components/FormModal.jsx";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import Input from "../components/Input.jsx";
import classTeacherSignature from "../assets/images/class-teacher.png";
import headteacherSignature from "../assets/images/signature-headteacher.png";

export default function AdmitCardPage() {
  const canEdit = localStorage.getItem("role") === "school";
  const { darkMode } = useTheme();
  // -------------------- State --------------------
  const [data, setData] = useState([]);
  const [classData, setClassData] = useState(studentExamData);

  const [sectionFilter, setSectionFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [filters, setFilters] = useState({
    class: "",
    group: "",

    session: "",
    exam: "",
  });

  // -------------------- Dropdowns --------------------
  const [monthOpen, setMonthOpen] = useState(false);

  // Add these states at the top

  const [statusFilter, setStatusFilter] = useState("All");

  const [filterOpen, setFilterOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);

  // -------------------- Filters ------------  const [data, setData] = useState(gradeData);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [admitCardModalOpen, setAdmitCardModalOpen] = useState(false);
  const [viewAdmitCardModalOpen, setViewAdmitCardModalOpen] = useState(false);
  const [viewingAdmitCard, setViewingAdmitCard] = useState(null);
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // Admit Card Modal States
  const [admitCardSelections, setAdmitCardSelections] = useState({
    class: "",
    section: "",
    session: "",
    exam: "",
  });

  // Store generated admit cards (key: `${IDNumber}_${Class}_${Section}_${Session}_${ExamName}`)
  const [generatedAdmitCards, setGeneratedAdmitCards] = useState(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem("generatedAdmitCards");
    return stored ? JSON.parse(stored) : {};
  });

  // Selected admit cards for download
  const [selectedAdmitCards, setSelectedAdmitCards] = useState(new Set());

  // Update localStorage when generatedAdmitCards changes
  useEffect(() => {
    localStorage.setItem("generatedAdmitCards", JSON.stringify(generatedAdmitCards));
  }, [generatedAdmitCards]);

  // Temporary (UI selection only)
  const [tempClass, setTempClass] = useState(null);
  const [tempGroup, setTempGroup] = useState(null);

  // Add these states at the top

  const [filterSelections, setFilterSelections] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    exam: "",
  });

  // -------------------- Options --------------------
  const classOptions = Array.from(new Set(studentExamData.map((d) => d.Class)));
  const groupOptions = Array.from(new Set(studentExamData.map((d) => d.Group)));
  const sectionOptions = Array.from(
    new Set(studentExamData.map((d) => d.Section || "")),
  );
  const sessionOptions = Array.from(
    new Set(studentExamData.map((d) => d.Session)),
  );
  const examOptions = ["Mid", "Final"];

  // Filtered section options based on selected class
  const filteredSectionOptions = useMemo(() => {
    if (!admitCardSelections.class) return sectionOptions;
    return Array.from(
      new Set(
        studentExamData
          .filter((d) => d.Class === admitCardSelections.class)
          .map((d) => d.Section || "")
          .filter(Boolean)
      )
    );
  }, [admitCardSelections.class]);

  // Filtered students based on selections
  const filteredStudentsForAdmitCard = useMemo(() => {
    if (!admitCardSelections.class || !admitCardSelections.section ||
      !admitCardSelections.session || !admitCardSelections.exam) {
      return [];
    }

    // Map "Mid" to "Mid Term" and "Final" to "Final" for matching
    const examNameMap = {
      "Mid": "Mid Term",
      "Final": "Final"
    };
    const examNameToMatch = examNameMap[admitCardSelections.exam] || admitCardSelections.exam;

    return studentExamData.filter((d) => {
      return (
        d.Class === admitCardSelections.class &&
        (d.Section || "") === admitCardSelections.section &&
        d.Session === admitCardSelections.session &&
        d.ExamName === examNameToMatch
      );
    });
  }, [admitCardSelections]);

  const studentOptions = studentExamData.map((d) => d.StudentName);
  const subjectOptions = Array.from(
    new Set(studentExamData.map((d) => d.SubjectName)),
  );

  const classRef = useRef(null);
  const groupRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);

  const exportPDF = (rows) => {
    const doc = new jsPDF();

    doc.text("Admit Card List", 14, 10);

    autoTable(doc, {
      startY: 16,
      head: [
        [
          "Class",
          "Group",
          "Session",
          "Exam",
          "Student",
          "Roll",
          "Admit Card No",
        ],
      ],
      body: rows.map((r) => [
        r.Class,
        r.Group,
        r.Session,
        r.ExamName,
        r.StudentName,
        r.RollNo,
        r.AdmitCardNo,
      ]),
    });

    doc.save("admit-card-list.pdf");
  };

  const exportExcel = (rows) => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Class: r.Class,
        Group: r.Group,
        Session: r.Session,
        Exam: r.ExamName,
        Student: r.StudentName,
        Roll: r.RollNo,
        AdmitCardNo: r.AdmitCardNo,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdmitCards");

    XLSX.writeFile(workbook, "admit-card-list.xlsx");
  };
  // -------------------- Handlers --------------------
  const handleSelectFilter = (field, value) => {
    setFilterSelections((prev) => {
      let updated = { ...prev, [field]: value };

      // Reset dependent filters
      if (field === "class") {
        updated.group = "";
        updated.section = "";
        updated.session = "";
        updated.exam = "";
      } else if (field === "group") {
        updated.section = "";
        updated.session = "";
        updated.exam = "";
      }

      return updated;
    });

    // Close dropdown
    switch (field) {
      case "class":
        setClassOpen(false);
        break;
      case "group":
        setGroupOpen(false);
        break;
      case "section":
        setSectionOpen(false);
        break;
      case "session":
        setSessionOpen(false);
        break;
      case "exam":
        setExamOpen(false);
        break;
      default:
        break;
    }
  };

  const applyFilter = () => {
    setAppliedFilters({ ...filterSelections });
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // -------------------- Filtered + Sorted Data --------------------
  const filteredData = useMemo(() => {
    const source = data.length ? data : studentExamData;

    return source
      .filter((d) => {
        // Only show students who have generated admit card numbers
        const admitCardKey = `${d.IDNumber}_${d.Class}_${d.Section || ""}_${d.Session}_${d.ExamName}`;
        const hasAdmitCard = generatedAdmitCards[admitCardKey];

        if (!hasAdmitCard) return false; // Hide if no admit card generated

        return (
          (appliedFilters.class ? d.Class === appliedFilters.class : true) &&
          (appliedFilters.group ? d.Group === appliedFilters.group : true) &&
          (appliedFilters.section ? d.Section === appliedFilters.section : true) &&
          (appliedFilters.session ? d.Session === appliedFilters.session : true) &&
          (appliedFilters.exam ? d.ExamName === appliedFilters.exam : true) &&
          (search ? d.StudentName.toLowerCase().includes(search.toLowerCase()) : true)
        );
      })
      .map((d) => {
        // Add generated admit card number to the data
        const admitCardKey = `${d.IDNumber}_${d.Class}_${d.Section || ""}_${d.Session}_${d.ExamName}`;
        const admitCardNo = generatedAdmitCards[admitCardKey] || "";
        return {
          ...d,
          AdmitCardNo: admitCardNo,
        };
      })
      .sort((a, b) => {
        // Sorting by IDNumber (or SL if exists)
        if (sortOrder === "asc") {
          return a.IDNumber.localeCompare(b.IDNumber); // oldest first
        } else {
          return b.IDNumber.localeCompare(a.IDNumber); // newest first
        }
      });
  }, [data, appliedFilters, search, sortOrder, generatedAdmitCards]);



  // -------------------- Pagination --------------------
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "SL" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Session", label: "Session" },
    { key: "ExamName", label: "Exam Name" },
    { key: "ExamYear", label: "Exam Year" },
    { key: "StudentName", label: "Student Name" },
    { key: "IDNumber", label: "ID Number" },
    { key: "RollNo", label: "Roll No" },
    { key: "FathersName", label: "Father's Name" },
    { key: "AdmitCardNo", label: "Admit Card No" },
    { key: "SubjectName", label: "Subject Name" },
    { key: "ExamStartDate", label: "Exam Start Date" },
    { key: "StartTime", label: "Start Time" },
    { key: "EndTime", label: "End Time" },
  ];

  // Reset selected cards when page changes (not on every data change)
  useEffect(() => {
    setSelectedAdmitCards(new Set());
  }, [currentPage]);

  // Helper function to get student photo
  const getStudentPhoto = (idNumber) => {
    const student = studentData.find(
      (s) => s.studentId?.toUpperCase() === idNumber?.toUpperCase()
    );
    return student?.photo || "https://via.placeholder.com/100";
  };

  // Helper function to get subjects for a student
  const getStudentSubjects = (row) => {
    // Get all subjects for this class, group, section
    const subjects = studentExamData
      .filter(
        (d) =>
          d.Class === row.Class &&
          d.Group === row.Group &&
          (d.Section || "") === (row.Section || "") &&
          d.Session === row.Session &&
          d.ExamName === row.ExamName
      )
      .map((d) => d.SubjectName);

    return Array.from(new Set(subjects));
  };

  // Helper function to generate single admit card HTML
  const generateAdmitCardHTML = (row) => {
    const studentPhoto = getStudentPhoto(row.IDNumber);
    const subjects = getStudentSubjects(row);
    const examYear = row.ExamYear || row.Session?.split("-")[0] || new Date().getFullYear();

    return `
      <div class="admit-card">
        <!-- Header: Left Photo, Middle School Info, Right Logo -->
        <div class="school-header">
          <!-- Left: Student Photo -->
          <div class="header-left">
            <div class="student-photo-header">
              <img src="${studentPhoto}" alt="${row.StudentName}" />
            </div>
          </div>
          
          <!-- Middle: School Name and Address -->
          <div class="header-middle">
            <h1 class="school-name">Mohakhali Model High School</h1>
            <p class="school-address">Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212</p>
          </div>
          
          <!-- Right: School Logo -->
          <div class="header-right">
            <div class="logo-placeholder"></div>
          </div>
        </div>
        
        <!-- Admit Card Title Button -->
        <div class="admit-title">Admit Card</div>
        
        <!-- Exam Info -->
        <div class="exam-info">
          <u>Exam: ${row.ExamName} - ${examYear}</u>
        </div>
        
        <!-- Main Content -->
        <div class="card-content">
          <!-- Left Side - Student Details -->
          <div class="student-details">
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${row.StudentName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Student ID:</span>
              <span class="value">${row.AdmitCardNo || row.IDNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Medium/version:</span>
              <span class="value">Bangla</span>
            </div>
          </div>
          
          <!-- Right Side - Academic Details -->
          <div class="right-section">
            <div class="academic-details">
              <div class="detail-row">
                <span class="label">Roll:</span>
                <span class="box">${row.RollNo}</span>
              </div>
              <div class="detail-row">
                <span class="label">Class:</span>
                <span class="box">${row.Class}</span>
              </div>
              <div class="detail-row">
                <span class="label">Group:</span>
                <span class="box">${row.Group || "---"}</span>
              </div>
              <div class="detail-row">
                <span class="label">Section:</span>
                <span class="box">${row.Section || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Subject List -->
        <div class="subject-section">
          <h3>Subject Code and Name</h3>
          <div class="subject-grid">
            ${subjects.map((subject, idx) => `
              <div class="subject-item">${subject}</div>
            `).join("")}
          </div>
        </div>
        
        <!-- Signatures -->
        <div class="signature-section">
          <div class="signature-box">
            <img src="${classTeacherSignature}" alt="Class Teacher Signature" class="signature-image" />
            <p>Class Teacher's Signature</p>
          </div>
          <div class="signature-box">
            <img src="${headteacherSignature}" alt="Headteacher Signature" class="signature-image" />
            <p>Headmaster's (In Charge) Signature</p>
          </div>
        </div>
      </div>
    `;
  };

  // -------------------- Handlers --------------------
  const handlePrint = (row) => {
    // Print admit card
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admit Card - ${row.StudentName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            .page-container {
              max-width: 70% !important;
              margin: 0 auto;
              background: white;
              padding: 15mm;
            }
            .admit-card {
              border: 3px solid #8B7355;
              border-radius: 8px;
              margin-bottom: 20px;
              background: white;
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 20px;
            }
            .school-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: -10px;
              gap: 15px;
            }
            .header-left {
              flex: 0 0 auto;
            }
            .header-middle {
              flex: 1;
              text-align: center;
            }
            .header-right {
              flex: 0 0 auto;
            }
            .student-photo-header {
              width: 80px;
              height: 100px;
              border: 2px solid #8B7355;
              border-radius: 5px;
              overflow: hidden;
              background: #f0f0f0;
            }
            .student-photo-header img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              border: 2px solid #8B7355;
              border-radius: 50%;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .school-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .school-address {
              font-size: 11px;
              color: #666;
            }
            .admit-title {
              background: #20B2AA;
              color: white;
              text-align: center;
              padding: 8px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 12px;
              width: 15%;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .exam-info {
              margin-top: 10px;
              text-align: center;
              margin-bottom: 15px;
              font-size: 14px;
              font-weight: bold;
            }
            .card-content {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 30px;
            }
            .student-details {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .right-section {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .detail-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              font-size: 12px;
            }
            .student-details .detail-row {
              justify-content: flex-start;
            }
            .academic-details .detail-row {
              justify-content: flex-start;
            }
            .detail-row .label {
              font-weight: bold;
              margin-right: 8px;
              min-width: 120px;
            }
            .detail-row .value {
              margin-right: 10px;
            }
            .detail-row .box {
              width: 80px;
              min-height: 22px;
              border: 1px solid #333;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 3px 8px;
              font-size: 11px;
              background: #fff;
              text-align: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .academic-details {
              flex: 1;
              width: 100%;
              margin-left: 90px !important;
            }
            @media print {
              .academic-details {
                padding-left: 90px !important;
                margin-left: 90px !important;
              }
            }
            .subject-section {
              margin: 20px 0;
              border-top: 2px solid #8B7355;
              padding-top: 15px;
            }
            .subject-section h3 {
              font-size: 14px;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            .subject-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 12px;
            }
            .subject-item {
              padding: 5px;
              border-bottom: 1px dotted #ccc;
            }
            .signature-section {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 100px;
              margin-top: 30px;
              padding-top: 20px;
            }
            .signature-box {
              flex: 0 0 auto;
              text-align: center;
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
            .signature-line {
              width: 150px;
              height: 2px;
              background: #333;
              margin: 0 auto 5px;
            }
            .signature-box p {
              font-size: 11px;
              margin-top: 5px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                background: white !important; 
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              .page-container { 
                max-width: 70% !important;
                margin: 0 auto !important;
                padding: 15mm !important;
                width: auto !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              button { display: none; }
              .admit-card { 
                page-break-inside: avoid !important; 
                margin-bottom: 20px !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
                border: 3px solid #8B7355 !important;
                border-radius: 8px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .signature-section {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 100px !important;
              }
              .signature-box {
                flex: 0 0 auto !important;
              }
              .signature-image {
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }
              .academic-details {
                padding-left: 90px;
                margin-left: 90px !important;
              }
              .admit-title {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: #20B2AA !important;
                color: white !important;
              }
              .detail-row .box {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #333 !important;
                background: #fff !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            ${generateAdmitCardHTML(row)}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #20B2AA; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Handle checkbox selection
  const handleSelectAdmitCard = (e, rowId) => {
    e.stopPropagation();
    setSelectedAdmitCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (currentData.length === 0) return;

    const allSelected = currentData.every((row) => selectedAdmitCards.has(row.IDNumber));

    if (allSelected) {
      // Deselect all
      setSelectedAdmitCards((prev) => {
        const newSet = new Set(prev);
        currentData.forEach((row) => {
          newSet.delete(row.IDNumber);
        });
        return newSet;
      });
    } else {
      // Select all
      setSelectedAdmitCards((prev) => {
        const newSet = new Set(prev);
        currentData.forEach((row) => {
          newSet.add(row.IDNumber);
        });
        return newSet;
      });
    }
  };

  // Helper function to generate admit card PDF (for jsPDF)
  const generateAdmitCardPDF = (doc, row, x, y, width, height) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cardWidth = width || (pageWidth - 60);
    const cardHeight = height || (pageHeight / 2 - 45);

    // Decorative border (using regular rect if roundedRect not supported)
    doc.setDrawColor(139, 115, 85); // Brown color
    doc.setLineWidth(2);
    if (doc.roundedRect) {
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);
    } else {
      doc.rect(x, y, cardWidth, cardHeight);
    }

    // Inner decorative border
    doc.setDrawColor(212, 175, 55); // Gold color
    doc.setLineWidth(1);
    if (doc.roundedRect) {
      doc.roundedRect(x + 2, y + 2, cardWidth - 4, cardHeight - 4, 2, 2);
    } else {
      doc.rect(x + 2, y + 2, cardWidth - 4, cardHeight - 4);
    }

    let currentY = y + 15;

    // School Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Mohakhali Model High School", x + cardWidth / 2, currentY, { align: "center" });
    currentY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212",
      x + cardWidth / 2, currentY, { align: "center" });
    currentY += 15;

    // Admit Card Title
    doc.setFillColor(32, 178, 170); // Teal color
    if (doc.roundedRect) {
      doc.roundedRect(x + cardWidth / 2 - 60, currentY - 8, 120, 15, 3, 3, "F");
    } else {
      doc.rect(x + cardWidth / 2 - 60, currentY - 8, 120, 15, "F");
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Admit Card", x + cardWidth / 2, currentY, { align: "center" });
    doc.setTextColor(0, 0, 0);
    currentY += 20;

    // Exam Info
    const examYear = row.ExamYear || row.Session?.split("-")[0] || new Date().getFullYear();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Exam: ${row.ExamName} - ${examYear}`, x + cardWidth / 2, currentY, { align: "center" });
    currentY += 20;

    // Student Photo
    const photoSize = 80;
    const photoX = x + cardWidth - photoSize - 20;
    const photoY = currentY;

    // Draw photo border
    doc.setDrawColor(139, 115, 85);
    doc.setLineWidth(1);
    doc.rect(photoX, photoY, photoSize, photoSize * 1.2);

    // Try to add student photo (will be added if available, otherwise placeholder remains)
    try {
      const studentPhoto = getStudentPhoto(row.IDNumber);
      if (studentPhoto && studentPhoto !== "https://via.placeholder.com/100") {
        doc.addImage(studentPhoto, "JPEG", photoX, photoY, photoSize, photoSize * 1.2, undefined, "FAST");
      } else {
        doc.setFontSize(8);
        doc.text("Photo", photoX + photoSize / 2, photoY + (photoSize * 1.2) / 2, { align: "center" });
      }
    } catch (e) {
      // If image fails, show placeholder text
      doc.setFontSize(8);
      doc.text("Photo", photoX + photoSize / 2, photoY + (photoSize * 1.2) / 2, { align: "center" });
    }

    // Student Details (Left Side)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let detailY = currentY;

    doc.text(`Name: ${row.StudentName}`, x + 15, detailY);
    detailY += 12;
    doc.text(`Username: ${row.IDNumber}`, x + 15, detailY);
    detailY += 12;
    doc.text(`Medium/version: Bangla`, x + 15, detailY);
    detailY += 20;

    // Academic Details (Right Side, next to photo)
    detailY = currentY;
    doc.text(`Roll: ${row.RollNo}`, photoX - 80, detailY);
    doc.rect(photoX - 20, detailY - 5, 40, 8);
    detailY += 12;

    doc.text(`Class: ${row.Class}`, photoX - 80, detailY);
    doc.rect(photoX - 20, detailY - 5, 40, 8);
    detailY += 12;

    doc.text(`Group: ${row.Group || "---"}`, photoX - 80, detailY);
    doc.rect(photoX - 20, detailY - 5, 40, 8);
    detailY += 12;

    doc.text(`Section: ${row.Section || "N/A"}`, photoX - 80, detailY);
    doc.rect(photoX - 20, detailY - 5, 40, 8);

    // Subject List
    currentY = photoY + photoSize * 1.2 + 20;
    doc.setDrawColor(139, 115, 85);
    doc.line(x + 15, currentY, x + cardWidth - 15, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Subject Code and Name", x + 15, currentY);
    currentY += 12;

    const subjects = getStudentSubjects(row);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const subjectsPerColumn = Math.ceil(subjects.length / 2);
    subjects.forEach((subject, idx) => {
      const col = idx < subjectsPerColumn ? 0 : 1;
      const rowIdx = idx < subjectsPerColumn ? idx : idx - subjectsPerColumn;
      const subjectX = col === 0 ? x + 20 : x + cardWidth / 2 + 10;
      doc.text(subject, subjectX, currentY + (rowIdx * 10));
    });

    // Signatures
    currentY = y + cardHeight - 40;
    doc.setDrawColor(139, 115, 85);
    doc.line(x + 15, currentY, x + cardWidth - 15, currentY);
    currentY += 15;

    doc.setFontSize(9);

    // Class Teacher Signature Image
    const signatureHeight = 30;
    const signatureWidth = 100;
    try {
      doc.addImage(classTeacherSignature, "PNG", x + 40, currentY, signatureWidth, signatureHeight, undefined, "FAST");
    } catch (e) {
      doc.line(x + 40, currentY + signatureHeight / 2, x + 140, currentY + signatureHeight / 2);
    }
    doc.text("Class Teacher's Signature", x + 90, currentY + signatureHeight + 8, { align: "center" });

    // Headteacher Signature Image
    try {
      doc.addImage(headteacherSignature, "PNG", x + cardWidth - 140, currentY, signatureWidth, signatureHeight, undefined, "FAST");
    } catch (e) {
      doc.line(x + cardWidth - 140, currentY + signatureHeight / 2, x + cardWidth - 40, currentY + signatureHeight / 2);
    }
    doc.text("Headmaster's (In Charge) Signature", x + cardWidth - 90, currentY + signatureHeight + 8, { align: "center" });
  };

  // Download selected admit cards
  const handleDownloadSelected = () => {
    if (selectedAdmitCards.size === 0) {
      alert("Please select at least one admit card to download");
      return;
    }

    const selectedRows = currentData.filter((row) =>
      selectedAdmitCards.has(row.IDNumber)
    );

    // Generate PDF for selected admit cards - 2 cards per page (landscape)
    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth(); // 842pt for landscape
    const pageHeight = doc.internal.pageSize.getHeight(); // 595pt for landscape
    const margin = 30;
    const cardHeight = (pageHeight - (margin * 3)) / 2; // Two cards with spacing
    const cardWidth = pageWidth - (margin * 2);

    selectedRows.forEach((row, index) => {
      // Add new page if needed (every 2 cards)
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
      }

      // Calculate position (top or bottom of page)
      const cardIndex = index % 2;
      const yPosition = margin + (cardIndex * (cardHeight + margin));

      // Generate admit card
      generateAdmitCardPDF(doc, row, margin, yPosition, cardWidth, cardHeight);
    });

    doc.save(`Admit_Cards_${selectedRows.length}_students.pdf`);
    alert(`Successfully downloaded ${selectedRows.length} admit card(s)!`);
  };

  const filterFields = [
    {
      key: "class",
      placeholder: "Select Class",
      options: classOptions,
    },
    {
      key: "group",
      placeholder: "Select Group",
      options: groupOptions,
    },

    {
      key: "session",

      placeholder: "Select session",
      options: sessionOptions,
    },
    {
      key: "exam",

      placeholder: "Select exam",
      options: examOptions,
    },
  ];
  const getAdmitCardFields = [
    {
      key: "class",
      type: "select",
      placeholder: "Select Class",
      options: classOptions,
    },
    {
      key: "group",
      type: "select",
      placeholder: "Select Group",
      options: groupOptions,
    },
    {
      key: "session",
      type: "select",
      placeholder: "Select Session",
      options: sessionOptions,
    },
    {
      key: "examName",
      type: "select",
      placeholder: "Select Exam",
      options: examOptions,
    },
    {
      key: "examYear",
      type: "number",
      placeholder: "Enter Exam Year",
    },
    {
      key: "studentName",
      type: "select",
      placeholder: "Select Student",
      options: studentOptions,
    },
    {
      key: "idNumber",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "rollNo",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "fathersName",
      type: "text",
      placeholder: "Auto from Student",
      readOnly: true,
    },
    {
      key: "admitCardNo",
      type: "text",
      placeholder: "Auto-generated",
    },
    {
      key: "subjectName",
      type: "select",
      placeholder: "Select Subject",
      options: subjectOptions,
    },
    {
      key: "examStartDate",
      type: "date",
      placeholder: "Select Exam Date",
    },
    {
      key: "startTime",
      type: "time",
      placeholder: "Select Start Time",
    },
    {
      key: "endTime",
      type: "time",
      placeholder: "Select End Time",
    },
  ];

  const handleRefresh = () => {
    // UI filter states
    setClassFilter("");
    setGroupFilter("");
    setSectionFilter("");
    setSessionFilter("");
    setExamFilter("");

    // Applied filter reset
    setAppliedFilters({
      class: "",
      group: "",
      section: "",
      session: "",
      exam: "",
    });

    // Other states
    setSearch("");
    setSortOrder("newest");
    setCurrentPage(1);

    // Close all dropdowns
    setFilterOpen(false);
    setClassOpen(false);
    setGroupOpen(false);
    setSectionOpen(false);
    setSessionOpen(false);
    setExamOpen(false);
    setExportOpen(false);
    setStatusOpen(false);
  };

  // -------------------- Styles --------------------
  const cardBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-700";
  const borderClr = darkMode ? "border-gray-500" : "border-gray-300";
  const inputBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";
  const dropdownBg = darkMode
    ? "bg-gray-700 text-gray-100"
    : "bg-white text-gray-700";

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className={` p-3 space-y-4 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Admit Card</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              / Admit Card
            </p>
          </div>

          {/* Refresh | Export | Add Class */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
            <button
              onClick={handleRefresh}
              className={`w-full flex items-center  border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div ref={exportRef} className="relative w-full md:w-28">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={`w-full flex items-center   border px-3 h-8 text-xs ${borderClr} ${inputBg}`}
              >
                Export
              </button>
              {exportOpen && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 w-full md:w-28 border  ${borderClr} ${dropdownBg}`}
                >
                  <button
                    onClick={() => {
                      exportPDF(filteredData); // download
                      setExportOpen(false); // close dropdown
                    }}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      exportExcel(filteredData);
                      setExportOpen(false);
                    }}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-blue-50"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setAdmitCardModalOpen(true)}
                className="w-full flex items-center  bg-blue-600 text-white px-3 h-8 text-xs"
              >
                Admit Card
              </button>
            )}

            <FormModal
              open={addClassOpen}
              title="Add Admit Card"
              fields={getAdmitCardFields}
              initialValues={{
                Class: "",
                Group: "",
                Subject: "",
                LetterGrade: "",
                MaxNumber: "",
                MinNumber: "",
                GradePoint: "",
              }}
              onClose={() => setAddClassOpen(false)}
              onSubmit={(newEntry) => {
                setData((prev) => [...prev, newEntry]);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* / Filter / Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2 md:gap-0">
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            <div ref={statusRef} className="relative flex-1">
              <button
                onClick={() => setStatusOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center gap-2 border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                {classFilter || " Class"}
              </button>

              {statusOpen &&
                Array.isArray(classOptions) &&
                classOptions.length > 0 && (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 w-full  border  max-h-56 overflow-y-auto ${borderClr} ${dropdownBg}`}
                  >
                    {classOptions.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setClassFilter(cls); // select class
                          setGroupFilter(""); // reset dependent filter
                          setCurrentPage(1); // reset pagination
                          setStatusOpen(false); // close dropdown
                        }}
                        className={`block w-full px-3 h-8 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${classFilter === cls
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : darkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Filter Dropdown */}
            {/* Filter Dropdown */}
            <div ref={filterRef} className="relative flex-1">
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs  ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter exam routine"
                fields={filterFields}
                selected={filters}
                setSelected={setFilters}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(values) => {
                  setClassFilter(values.class || "");
                  setGroupFilter(values.group || "");

                  setSessionFilter(values.session || "");
                  setExamFilter(values.exam || "");

                  setCurrentPage(1);
                  setFilterOpen(false);
                }}
                darkMode={darkMode}
                buttonRef={filterRef}
              />
            </div>

            {/* Sort Button */}
            <div className="relative flex-1 " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                  }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-full z-40 border  ${darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                    }  left-0`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center md:justify-between gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search class..."
              className={`w-full md:w-64 border px-3 h-8 text-xs focus:outline-none ${borderClr} ${inputBg}`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={` p-3 overflow-x-auto ${cardBg}`}>
        <div className="border overflow-x-auto">
          <table className="w-full table-auto border-collapse text-xs">
            {/* HEADER */}
            <thead
              className={
                darkMode
                  ? "bg-gray-800 border-b border-gray-700"
                  : "bg-gray-100 border-b border-gray-300"
              }
            >
              {/* Download Button Row */}
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className={`h-10 px-3 border-b ${borderClr}`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleDownloadSelected}
                      disabled={selectedAdmitCards.size === 0}
                      className={`text-xs px-3 h-7 rounded transition font-semibold ${selectedAdmitCards.size === 0
                          ? darkMode
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      Download ({selectedAdmitCards.size})
                    </button>
                  </div>
                </td>
              </tr>
              {/* Column Headers Row */}
              <tr>
                <th className={`h-8 px-3 text-left font-semibold border-r ${borderClr} whitespace-nowrap`}>
                  <input
                    type="checkbox"
                    checked={currentData.length > 0 && currentData.every((row) => selectedAdmitCards.has(row.IDNumber))}
                    onChange={handleSelectAll}
                    className="cursor-pointer w-4 h-4"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`h-8 px-3 text-left font-semibold border-r ${borderClr} whitespace-nowrap`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="h-8 px-3 text-left font-semibold whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="h-10 text-center"
                  >
                    No Data Found
                  </td>
                </tr>
              ) : (
                currentData.map((row, index) => {
                  const isSelected = selectedAdmitCards.has(row.IDNumber);
                  return (
                    <tr
                      key={row.sl || index}
                      className={`border-b ${borderClr} ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        } ${isSelected ? darkMode ? "bg-gray-800/50" : "bg-blue-50" : ""}`}
                    >
                      {/* Checkbox Column */}
                      <td className={`h-8 px-3 border-r ${borderClr} whitespace-nowrap`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectAdmitCard(e, row.IDNumber)}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer w-4 h-4"
                        />
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`h-8 px-3 border-r ${borderClr} whitespace-nowrap align-middle`}
                        >
                          {row[col.key]}
                        </td>
                      ))}

                      {/* Custom Action Dropdown */}
                      <td className="h-8 px-3 whitespace-nowrap">
                        <AdmitCardActions
                          row={row}
                          onView={(r) => {
                            setViewingAdmitCard(r);
                            setViewAdmitCardModalOpen(true);
                          }}
                          onEdit={(r) => {
                            // Handle edit if needed
                            alert(`Edit ${r.StudentName}`);
                          }}
                          onDelete={(r) => {
                            if (confirm("Are you sure you want to delete this admit card?")) {
                              // Handle delete
                              alert("Deleted successfully");
                            }
                          }}
                          onPrint={handlePrint}
                          darkMode={darkMode}
                          canEdit={canEdit}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Card Modal */}
      {admitCardModalOpen && (
        <AdmitCardModal
          open={admitCardModalOpen}
          onClose={() => {
            setAdmitCardModalOpen(false);
            setAdmitCardSelections({
              class: "",
              section: "",
              session: "",
              exam: "",
            });
          }}
          selections={admitCardSelections}
          setSelections={setAdmitCardSelections}
          classOptions={classOptions}
          sectionOptions={filteredSectionOptions}
          sessionOptions={sessionOptions}
          examOptions={examOptions}
          filteredStudents={filteredStudentsForAdmitCard}
          darkMode={darkMode}
          generatedAdmitCards={generatedAdmitCards}
          setGeneratedAdmitCards={setGeneratedAdmitCards}
        />
      )}

      {/* View Admit Card Modal */}
      {viewAdmitCardModalOpen && viewingAdmitCard && (
        <ViewAdmitCardModal
          open={viewAdmitCardModalOpen}
          onClose={() => {
            setViewAdmitCardModalOpen(false);
            setViewingAdmitCard(null);
          }}
          row={viewingAdmitCard}
          darkMode={darkMode}
          generateAdmitCardHTML={generateAdmitCardHTML}
        />
      )}
    </div>
  );
}

// Custom Admit Card Modal Component
function AdmitCardModal({
  open,
  onClose,
  selections,
  setSelections,
  classOptions,
  sectionOptions,
  sessionOptions,
  examOptions,
  filteredStudents,
  darkMode,
  generatedAdmitCards: parentGeneratedAdmitCards,
  setGeneratedAdmitCards: setParentGeneratedAdmitCards,
}) {
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [localGeneratedAdmitCards, setLocalGeneratedAdmitCards] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset dependent fields when class changes
      if (name === "class") {
        updated.section = "";
        updated.session = "";
        updated.exam = "";
        setLocalGeneratedAdmitCards({});
      } else if (name === "section") {
        updated.session = "";
        updated.exam = "";
        setLocalGeneratedAdmitCards({});
      } else if (name === "session") {
        updated.exam = "";
        setLocalGeneratedAdmitCards({});
      } else if (name === "exam") {
        setLocalGeneratedAdmitCards({});
      }
      return updated;
    });
  };

  // Generate Admit Card Numbers
  const handleGenerateAdmitCards = () => {
    if (!allSelected || filteredStudents.length === 0) {
      alert("Please select all fields and ensure students are available");
      return;
    }

    setIsGenerating(true);

    // Generate admit card numbers locally
    const newAdmitCards = {};
    const examCode = selections.exam === "Mid" ? "MID" : "FINAL";
    const year = selections.session.split("-")[0] || "2026";
    const classCode = selections.class.padStart(2, "0");
    const sectionCode = selections.section.toUpperCase();
    const examNameMap = {
      "Mid": "Mid Term",
      "Final": "Final"
    };
    const examName = examNameMap[selections.exam] || selections.exam;

    // Check which students already have admit cards
    const studentsToGenerate = filteredStudents.filter((student) => {
      const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
      // Only generate if admit card doesn't exist
      return !parentGeneratedAdmitCards[key];
    });

    if (studentsToGenerate.length === 0) {
      setIsGenerating(false);
      alert("All students already have admit card numbers for this exam!");
      return;
    }

    studentsToGenerate.forEach((student, index) => {
      // Extract Session (e.g., "2025-26" -> "2526" or "202526")
      let sessionCode = student.Session || selections.session;
      // Remove dashes and take last 4 digits or format as YYYY-YY -> YYYY
      sessionCode = sessionCode.replace(/-/g, ""); // Remove dashes
      // If format is like "2025-26", take "2025" part, else use as is
      if (sessionCode.length > 4) {
        sessionCode = sessionCode.substring(0, 4); // Take first 4 digits (year)
      }

      // Extract Class (e.g., "10" -> "10")
      const classCode = student.Class || selections.class;

      // Extract student ID number (remove STU, STU-, or any prefix)
      // Example: STU1001 -> 1001, STU-1001 -> 1001, 1001 -> 1001
      let studentId = student.IDNumber.toString();
      // Remove common prefixes
      studentId = studentId.replace(/^STU[-_]?/i, ""); // Remove STU, STU-, STU_
      studentId = studentId.replace(/^ST[-_]?/i, ""); // Remove ST, ST-, ST_
      studentId = studentId.replace(/[^0-9]/g, ""); // Remove any remaining non-numeric characters

      // Format: Session + Class + StudentID (e.g., 2025101001 for Session 2025-26, Class 10, Student 1001)
      const admitCardNo = `${sessionCode}${classCode}${studentId}`;

      // Create unique key: IDNumber_Class_Section_Session_ExamName
      const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
      newAdmitCards[key] = admitCardNo;
    });

    // Simulate API call delay
    setTimeout(() => {
      // Update local state for modal display (merge with existing)
      const mergedLocalCards = { ...localGeneratedAdmitCards, ...newAdmitCards };
      setLocalGeneratedAdmitCards(mergedLocalCards);

      // Update parent state and localStorage (merge with existing)
      const updatedCards = { ...parentGeneratedAdmitCards, ...newAdmitCards };
      setParentGeneratedAdmitCards(updatedCards);
      localStorage.setItem("generatedAdmitCards", JSON.stringify(updatedCards));

      setIsGenerating(false);
      const totalGenerated = Object.keys(newAdmitCards).length;
      const alreadyExists = filteredStudents.length - totalGenerated;
      if (alreadyExists > 0) {
        alert(`Successfully generated ${totalGenerated} new admit card numbers! ${alreadyExists} students already had admit cards.`);
      } else {
        alert(`Successfully generated ${totalGenerated} admit card numbers!`);
      }
    }, 500);
  };

  // Reset local generated cards when modal closes
  useEffect(() => {
    if (!open) {
      setLocalGeneratedAdmitCards({});
      setIsGenerating(false);
    }
  }, [open]);

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";

  if (!open && !isModalClosing) return null;

  const allSelected =
    selections.class &&
    selections.section &&
    selections.session &&
    selections.exam;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
        }`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} ${textColor} w-full max-w-[500px] border ${borderClr} p-6 max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
          }`}
      >
        {/* Title */}
        <h2 className="text-base font-semibold text-center mb-6">Admit Card</h2>

        {/* Select Fields */}
        <div className="space-y-4">
          {/* Class */}
          <Input
            label="Class"
            name="class"
            value={selections.class}
            onChange={handleChange}
            type="select"
            options={classOptions}
            inputClassName={inputBg}
          />

          {/* Section */}
          <Input
            label="Section"
            name="section"
            value={selections.section}
            onChange={handleChange}
            type="select"
            options={sectionOptions}
            inputClassName={inputBg}
            disabled={!selections.class}
          />

          {/* Session */}
          <Input
            label="Session"
            name="session"
            value={selections.session}
            onChange={handleChange}
            type="select"
            options={sessionOptions}
            inputClassName={inputBg}
            disabled={!selections.section}
          />

          {/* Exam */}
          <Input
            label="Exam"
            name="exam"
            value={selections.exam}
            onChange={handleChange}
            type="select"
            options={examOptions}
            inputClassName={inputBg}
            disabled={!selections.session}
          />

          {/* Student Quantity */}
          {allSelected && (
            <div
              className={`border ${borderClr} py-[6px] px-2  ${darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-medium">Student Quantity:</span>
                <span className="text-[12px] font-bold text-blue-600">
                  {filteredStudents.length}
                </span>
              </div>
            </div>
          )}

          {allSelected && filteredStudents.length === 0 && (
            <div
              className={`border ${borderClr} p-4 rounded text-center ${darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
            >
              <p className="text-sm text-gray-500">No students found</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className={`flex-1 text-[12px] h-8 border ${borderClr} ${darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              } transition`}
          >
            Close
          </button>

          {allSelected && filteredStudents.length > 0 && (
            <button
              type="button"
              onClick={handleGenerateAdmitCards}
              disabled={isGenerating}
              className={`flex-1 text-[12px] h-8 bg-blue-600 text-white hover:bg-blue-700 transition font-semibold ${isGenerating ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          )}
        </div>

        {/* Generated Admit Cards Display */}
        {allSelected && Object.keys(localGeneratedAdmitCards).length > 0 && (
          <div className="mt-4">
            <div
              className={`border ${borderClr} max-h-[300px] overflow-y-auto ${darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
            >
              <table className="w-full text-[12px]">
                <thead>
                  <tr className={`border-b ${borderClr} ${darkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                    <th className={`px-2 py-[6px] text-left font-semibold border-r ${borderClr} ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      Student Name
                    </th>
                    <th className={`px-2 py-[6px] text-right font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      Admit Card No
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const examNameMap = {
                      "Mid": "Mid Term",
                      "Final": "Final"
                    };
                    const examName = examNameMap[selections.exam] || selections.exam;
                    const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
                    const admitCardNo = localGeneratedAdmitCards[key];
                    if (!admitCardNo) return null;

                    return (
                      <tr
                        key={student.IDNumber}
                        className={`border-b ${borderClr} last:border-b-0 ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                          }`}
                      >
                        <td className={`px-2 py-[6px] border-r ${borderClr} ${darkMode ? "text-gray-300" : "text-gray-500"
                          }`}>
                          {student.StudentName}
                        </td>
                        <td className={`px-2 py-[6px] text-[12px] text-right font-semibold text-blue-600 ${darkMode ? "text-blue-400" : "text-blue-600"
                          }`}>
                          {admitCardNo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Admit Card Actions Component
function AdmitCardActions({ row, onEdit, onDelete, onPrint, onView, darkMode, canEdit }) {
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownHeight = canEdit ? 140 : 70; // Height based on number of options (View + Print + Edit/Delete)
      const spaceBelow = window.innerHeight - rect.bottom;

      const tableRow = ref.current.closest('tr');
      let isFirstRow = false;
      let isLastRow = false;
      let isSingleRow = false;

      if (tableRow) {
        const tbody = tableRow.closest('tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr');
          isFirstRow = tableRow === rows[0];
          isLastRow = tableRow === rows[rows.length - 1];
          isSingleRow = rows.length === 1;
        }
      }

      if (isSingleRow) {
        setPositionTop(true);
      } else if (isFirstRow) {
        setPositionTop(spaceBelow >= 30);
      } else if (isLastRow) {
        setPositionTop(false);
      } else {
        setPositionTop(spaceBelow >= dropdownHeight);
      }
    }
    setOpen(!open);
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";

  return (
    <div className="relative h-6 flex items-center" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`h-6 w-6 p-0 flex items-center justify-center transition-colors ${darkMode
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
          }`}
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute -right-4 w-28 border shadow-sm z-50 ${positionTop ? "top-7" : "bottom-7"
            } ${darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
            }`}
        >
          {/* View Button - Always visible */}
          <button
            onClick={() => {
              onView(row);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs ${darkMode
                ? "hover:bg-gray-700 text-gray-100"
                : "hover:bg-gray-100 text-gray-900"
              }`}
          >
            <FiEye className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            View
          </button>

          {/* Print Button - Always visible */}
          <button
            onClick={() => {
              onPrint(row);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
                ? "hover:bg-gray-700 text-gray-100"
                : "hover:bg-gray-100 text-gray-900"
              }`}
          >
            <FiPrinter className={`w-3 h-3 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            Print
          </button>

          {/* Edit and Delete - Only if canEdit */}
          {canEdit && (
            <>
              <button
                onClick={() => {
                  onEdit(row);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
                    ? "hover:bg-gray-700 text-gray-100"
                    : "hover:bg-gray-100 text-gray-900"
                  }`}
              >
                <FiEdit className={`w-3 h-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                Edit
              </button>

              <button
                onClick={() => {
                  onDelete(row);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1 text-xs border-t ${borderClr} ${darkMode
                    ? "text-red-400 hover:bg-gray-700"
                    : "text-red-600 hover:bg-red-50"
                  }`}
              >
                <FiTrash2 className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// View Admit Card Modal Component
function ViewAdmitCardModal({ open, onClose, row, darkMode, generateAdmitCardHTML }) {
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
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            .page-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 15mm;
            }
            .admit-card {
              border: 3px solid #8B7355;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background: white;
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .school-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: -10px;
              gap: 15px;
            }
            .header-left {
              flex: 0 0 auto;
            }
            .header-middle {
              flex: 1;
              text-align: center;
            }
            .header-right {
              flex: 0 0 auto;
            }
            .student-photo-header {
              width: 80px;
              height: 100px;
              border: 2px solid #8B7355;
              border-radius: 5px;
              overflow: hidden;
              background: #f0f0f0;
            }
            .student-photo-header img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              border: 2px solid #8B7355;
              border-radius: 50%;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .school-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .school-address {
              font-size: 11px;
              color: #666;
            }
            .admit-title {
              background: #20B2AA;
              color: white;
              text-align: center;
              padding: 8px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 12px;
              width: 15%;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .exam-info {
              margin-top: 10px;
              text-align: center;
              margin-bottom: 15px;
              font-size: 14px;
              font-weight: bold;
            }
            .card-content {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 30px;
            }
            .student-details {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .right-section {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .detail-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              font-size: 12px;
            }
            .student-details .detail-row {
              justify-content: flex-start;
            }
            .academic-details .detail-row {
              justify-content: flex-start;
            }
            .detail-row .label {
              font-weight: bold;
              margin-right: 8px;
              min-width: 120px;
            }
            .detail-row .value {
              margin-right: 10px;
            }
            .detail-row .box {
              width: 80px;
              min-height: 22px;
              border: 1px solid #333;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 3px 8px;
              font-size: 11px;
              background: #fff;
              text-align: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .academic-details {
              flex: 1;
              padding-left: 90px;
              margin-left: 90px; !important;
            }
            @media print {
              .academic-details {
                padding-left: 90px !important;
                margin-left: 90px !important;
              }
            }
            .subject-section {
              margin: 20px 0;
              border-top: 2px solid #8B7355;
              padding-top: 15px;
            }
            .subject-section h3 {
              font-size: 14px;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            .subject-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 12px;
            }
            .subject-item {
              padding: 5px;
              border-bottom: 1px dotted #ccc;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              padding-top: 20px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-image {
              width: 150px;
              height: auto;
              max-height: 50px;
              object-fit: contain;
              margin-bottom: 5px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .signature-line {
              width: 150px;
              height: 2px;
              background: #333;
              margin: 0 auto 5px;
            }
            .signature-box p {
              font-size: 11px;
              margin-top: 5px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                background: white; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page-container { 
                padding: 10mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              button { display: none; }
              .admit-card { 
                page-break-inside: avoid !important; 
                margin-bottom: 10mm !important;
                width: 100% !important;
                max-width: 100% !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .academic-details {
                padding-left: 90px 
                margin-left: 90px !important;
              }
              .page-container {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
              }
              body {
                padding: 0 !important;
                margin: 0 !important;
              }
              .admit-title {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: #20B2AA !important;
                color: white !important;
              }
              .detail-row .box {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #333 !important;
                background: #fff !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            ${generateAdmitCardHTML(row)}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #20B2AA; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  if (!open && !isModalClosing) return null;

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isModalClosing ? "animate-fadeOut" : "animate-fadeIn"
        }`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`${cardBg} ${textColor} max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${isModalOpening ? "animate-scaleIn" : isModalClosing ? "animate-scaleOut" : ""
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderClr}`}>
          <h2 className="text-[12px] font-semibold">{row.StudentName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`px-3 py-1 text-xs border ${borderClr} ${darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                } transition`}
            >
              Print
            </button>
            <button
              onClick={handleClose}
              className={`px-3 py-1 text-xs border ${borderClr} ${darkMode
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
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 15mm;
            }
            .admit-card {
              border: 3px solid #8B7355;
              border-radius: 8px;
              margin-bottom: 20px;
              background: white;
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 20px;
            }
            .school-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: -10px;
              gap: 15px;
            }
            .header-left {
              flex: 0 0 auto;
            }
            .header-middle {
              flex: 1;
              text-align: center;
            }
            .header-right {
              flex: 0 0 auto;
            }
            .student-photo-header {
              width: 80px;
              height: 100px;
              border: 2px solid #8B7355;
              border-radius: 5px;
              overflow: hidden;
              background: #f0f0f0;
            }
            .student-photo-header img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              border: 2px solid #8B7355;
              border-radius: 50%;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .school-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .school-address {
              font-size: 11px;
              color: #666;
            }
            .admit-title {
              background: #20B2AA;
              color: white;
              text-align: center;
              padding: 8px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 12px;
              width: 15%;
              margin: 0 auto;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .exam-info {
              margin-top: 10px;
              text-align: center;
              margin-bottom: 15px;
              font-size: 14px;
              font-weight: bold;
            }
            .card-content {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 30px;
            }
            .student-details {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .right-section {
              flex: 1 1 50%;
              display: flex;
              flex-direction: column;
            }
            .detail-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              font-size: 12px;
            }
            .student-details .detail-row {
              justify-content: flex-start;
            }
            .academic-details .detail-row {
              justify-content: flex-start;
            }
            .detail-row .label {
              font-weight: bold;
              margin-right: 8px;
              min-width: 120px;
            }
            .detail-row .value {
              margin-right: 10px;
            }
            .detail-row .box {
              width: 80px;
              min-height: 22px;
              border: 1px solid #333;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 3px 8px;
              font-size: 11px;
              background: #fff;
              text-align: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .academic-details {
              flex: 1;
              padding-left: 90px;
              margin-left: 90px !important;
            }
            @media print {
              .academic-details {
                padding-left: 90px !important;
              }
            }
            .subject-section {
              margin: 20px 0;
              border-top: 2px solid #8B7355;
              padding-top: 15px;
            }
            .subject-section h3 {
              font-size: 14px;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            .subject-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 12px;
            }
            .subject-item {
              padding: 5px;
              border-bottom: 1px dotted #ccc;
            }
            .signature-section {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 100px;
              margin-top: 30px;
              padding-top: 20px;
            }
            .signature-box {
              flex: 0 0 auto;
              text-align: center;
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
            .signature-line {
              width: 150px;
              height: 2px;
              background: #333;
              margin: 0 auto 5px;
            }
            .signature-box {
              flex: 0 0 auto;
              text-align: center;
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
            .signature-box p {
              font-size: 11px;
              margin-top: 5px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { 
                background: white !important; 
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              .page-container { 
                max-width: 210mm !important;
                margin: 0 auto !important;
                padding: 15mm !important;
                width: auto !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              button { display: none; }
              .admit-card { 
                page-break-inside: avoid !important; 
                margin-bottom: 20px !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
                border: 3px solid #8B7355 !important;
                border-radius: 8px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .signature-section {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 100px !important;
              }
              .signature-box {
                flex: 0 0 auto !important;
              }
              .signature-image {
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }
              .academic-details {
                padding-left: 90px !important;
              }
              .admit-title {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: #20B2AA !important;
                color: white !important;
              }
              .detail-row .box {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                border: 1px solid #333 !important;
                background: #fff !important;
              }
            }
      `}</style>
    </div>
  );
}
