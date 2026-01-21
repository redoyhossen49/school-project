import { useState, useMemo, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { studentExamData } from "../data/studentExamData.js";
import { studentData } from "../data/studentData.js";
import Pagination from "../components/Pagination.jsx";
import ReusableTable from "../components/common/ReusableTable.jsx";
import ReusableActions from "../components/common/ReusableActions.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import FormModal from "../components/FormModal.jsx";
import AdmitCardModal from "../components/admitCard/AdmitCardModal.jsx";
import ViewAdmitCardModal from "../components/admitCard/ViewAdmitCardModal.jsx";
import EditAdmitCardModal from "../components/admitCard/EditAdmitCardModal.jsx";
import AdmitCardActions from "../components/admitCard/AdmitCardActions.jsx";
import {
  generateAdmitCardHTML,
  getStudentSubjects,
  getStudentPhoto,
  getStudentSubjectDetails,
  formatDate,
} from "../components/admitCard/admitCardUtils.js";
import classTeacherSignature from "../assets/images/class-teacher.png";
import headteacherSignature from "../assets/images/signature-headteacher.png";
import schoolLogo from "../assets/images/sidebar-logo.avif";
import schoolWatermark from "../assets/images/school.webp";

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
  const [editingAdmitCard, setEditingAdmitCard] = useState(null);
  const [editAdmitCardModalOpen, setEditAdmitCardModalOpen] = useState(false);
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
    localStorage.setItem(
      "generatedAdmitCards",
      JSON.stringify(generatedAdmitCards),
    );
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
          .filter(Boolean),
      ),
    );
  }, [admitCardSelections.class]);

  // Filtered students based on selections
  const filteredStudentsForAdmitCard = useMemo(() => {
    if (
      !admitCardSelections.class ||
      !admitCardSelections.section ||
      !admitCardSelections.session ||
      !admitCardSelections.exam
    ) {
      return [];
    }

    // Map "Mid" to "Mid Term" and "Final" to "Final" for matching
    const examNameMap = {
      Mid: "Mid Term",
      Final: "Final",
    };
    const examNameToMatch =
      examNameMap[admitCardSelections.exam] || admitCardSelections.exam;

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
          (appliedFilters.section
            ? d.Section === appliedFilters.section
            : true) &&
          (appliedFilters.session
            ? d.Session === appliedFilters.session
            : true) &&
          (appliedFilters.exam ? d.ExamName === appliedFilters.exam : true) &&
          (search
            ? d.StudentName.toLowerCase().includes(search.toLowerCase())
            : true)
        );
      })
      .map((d, index) => {
        // Add generated admit card number to the data
        const admitCardKey = `${d.IDNumber}_${d.Class}_${d.Section || ""}_${d.Session}_${d.ExamName}`;
        const admitCardNo = generatedAdmitCards[admitCardKey] || "";
        return {
          ...d,
          AdmitCardNo: admitCardNo,
          SL: d.SL || d.sl || index + 1, // Add SL field (serial number)
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
  // Keep SL from studentExamData (already set in filteredData)

  // -------------------- Columns --------------------
  const columns = [
    { key: "SL", label: "Sl" },
    { key: "Class", label: "Class" },
    { key: "Group", label: "Group" },
    { key: "Section", label: "Section" },
    { key: "Session", label: "Session" },
    { key: "ExamName", label: "Exam name" },
    { key: "ExamYear", label: "Exam year" },
    { key: "StudentName", label: "Student name" },
    { key: "IDNumber", label: "ID number" },
    { key: "RollNo", label: "Roll no" },
    { key: "FathersName", label: "Father's name" },
    { key: "AdmitCardNo", label: "Admit card no" },
  ];

  // Don't reset selected cards automatically - let user control it
  // Reset only when filters change significantly
  useEffect(() => {
    // Only reset if filters change, not on page change
    // This allows selection to persist across pages
  }, [appliedFilters]);

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
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              opacity: 0.1;
              z-index: 0;
              pointer-events: none;
            }
            .watermark img {
              width: 600px;
              height: auto;
              object-fit: contain;
            }
            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              margin-bottom: 20px;
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
              margin-top: 5%;
              display: flex;
              justify-content: flex-end;
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
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) rotate(-45deg) !important;
                opacity: 0.08 !important;
                z-index: 0 !important;
                pointer-events: none !important;
              }
              .watermark img {
                width: 600px !important;
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

    const allSelected = currentData.every((row) => {
      const rowId = row.IDNumber || row.idNumber || row.sl;
      return selectedAdmitCards.has(rowId);
    });

    if (allSelected) {
      // Deselect all
      setSelectedAdmitCards((prev) => {
        const newSet = new Set(prev);
        currentData.forEach((row) => {
          const rowId = row.IDNumber || row.idNumber || row.sl;
          newSet.delete(rowId);
        });
        return newSet;
      });
    } else {
      // Select all
      setSelectedAdmitCards((prev) => {
        const newSet = new Set(prev);
        currentData.forEach((row) => {
          const rowId = row.IDNumber || row.idNumber || row.sl;
          newSet.add(rowId);
        });
        return newSet;
      });
    }
  };

  // Helper function to generate admit card PDF (for jsPDF)
  const generateAdmitCardPDF = (doc, row, x, y, width, height) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cardWidth = width || pageWidth - 60;
    const cardHeight = height || pageHeight / 2 - 45;

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
    doc.text("Mohakhali Model High School", x + cardWidth / 2, currentY, {
      align: "center",
    });
    currentY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212",
      x + cardWidth / 2,
      currentY,
      { align: "center" },
    );
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
    const examYear =
      row.ExamYear || row.Session?.split("-")[0] || new Date().getFullYear();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Exam: ${row.ExamName} - ${examYear}`,
      x + cardWidth / 2,
      currentY,
      { align: "center" },
    );
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
        doc.addImage(
          studentPhoto,
          "JPEG",
          photoX,
          photoY,
          photoSize,
          photoSize * 1.2,
          undefined,
          "FAST",
        );
      } else {
        doc.setFontSize(8);
        doc.text(
          "Photo",
          photoX + photoSize / 2,
          photoY + (photoSize * 1.2) / 2,
          { align: "center" },
        );
      }
    } catch (e) {
      // If image fails, show placeholder text
      doc.setFontSize(8);
      doc.text(
        "Photo",
        photoX + photoSize / 2,
        photoY + (photoSize * 1.2) / 2,
        { align: "center" },
      );
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
      doc.text(subject, subjectX, currentY + rowIdx * 10);
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
      doc.addImage(
        classTeacherSignature,
        "PNG",
        x + 40,
        currentY,
        signatureWidth,
        signatureHeight,
        undefined,
        "FAST",
      );
    } catch (e) {
      doc.line(
        x + 40,
        currentY + signatureHeight / 2,
        x + 140,
        currentY + signatureHeight / 2,
      );
    }
    doc.text(
      "Class Teacher's Signature",
      x + 90,
      currentY + signatureHeight + 8,
      { align: "center" },
    );

    // Headteacher Signature Image
    try {
      doc.addImage(
        headteacherSignature,
        "PNG",
        x + cardWidth - 140,
        currentY,
        signatureWidth,
        signatureHeight,
        undefined,
        "FAST",
      );
    } catch (e) {
      doc.line(
        x + cardWidth - 140,
        currentY + signatureHeight / 2,
        x + cardWidth - 40,
        currentY + signatureHeight / 2,
      );
    }
    doc.text(
      "Headmaster's (In Charge) Signature",
      x + cardWidth - 90,
      currentY + signatureHeight + 8,
      { align: "center" },
    );
  };

  // Helper function to convert image path to absolute URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/")) {
      return window.location.origin + imagePath;
    }
    // For Vite imported assets, try to get the actual URL
    try {
      return new URL(imagePath, window.location.origin).href;
    } catch {
      return window.location.origin + "/" + imagePath;
    }
  };

  // Download selected admit cards - Print like handlePrint
  const handleDownloadSelected = async () => {
    if (selectedAdmitCards.size === 0) {
      alert("Please select at least one admit card to download");
      return;
    }

    // Filter selected rows and remove duplicates based on SL number
    const selectedRowsMap = new Map();
    currentData.forEach((row) => {
      const rowId = row.IDNumber || row.idNumber || row.sl;
      const uniqueKey = row.SL || row.sl || `${row.IDNumber}_${row.Class}_${row.Section || ""}_${row.Session}_${row.ExamName}`;
      
      if (selectedAdmitCards.has(rowId) && !selectedRowsMap.has(uniqueKey)) {
        selectedRowsMap.set(uniqueKey, row);
      }
    });
    const selectedRows = Array.from(selectedRowsMap.values());

    // Helper to generate HTML with absolute image URLs using generateAdmitCardHTML
    const generateCardHTMLWithUrls = (row) => {
      // Generate HTML using the same function as ViewAdmitCardModal
      let html = generateAdmitCardHTML(row);

      // Replace image URLs with absolute URLs
      const logoUrl = getImageUrl(schoolLogo);
      const watermarkUrl = getImageUrl(schoolWatermark);
      const signatureUrl = getImageUrl(headteacherSignature);
      const studentPhoto = getStudentPhoto(row.IDNumber);
      const photoUrl = studentPhoto.startsWith("http")
        ? studentPhoto
        : getImageUrl(studentPhoto);

      // Replace image sources with absolute URLs
      html = html.replace(/src="[^"]*sidebar-logo[^"]*"/g, `src="${logoUrl}"`);
      html = html.replace(
        /src="[^"]*school\.webp[^"]*"/g,
        `src="${watermarkUrl}"`,
      );
      html = html.replace(
        /src="[^"]*signature-headteacher[^"]*"/g,
        `src="${signatureUrl}"`,
      );
      html = html.replace(
        /(<div class="student-photo">[\s\S]*?<img[^>]*src=")[^"]*("[^>]*>)/g,
        `$1${photoUrl}$2`,
      );

      return html;
    };

    // Open print window in new tab with A4 size
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print admit cards");
      return;
    }

    // Generate HTML for all selected cards (2 cards per page, portrait mode)
    let printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admit Cards - ${selectedRows.length} Students</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              background: white;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 0;
            }
            .page-container {
              width: 210mm;
              min-height: 297mm;
              max-height: 297mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              background: white;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
               
               margin-top:4px;
            }
            .admit-card {
              width: 100%;
              background: #fff;
              padding: 25px;
              position: relative;
              border: 1px solid gray;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow: hidden;
              height: calc(50vh - 10px);
  flex: 0 0 calc(50vh - 10px);
  margin-bottom: 10px;
              min-height: 50vh;
              max-height: 50vh;
            
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .admit-card:first-child {
              border-bottom: 1px solid gray;
            }
            .admit-card:last-child {
              border-top: 1px solid gray;
            }
            .subjects-wrapper {
              flex-shrink: 1;
              overflow: hidden;
              margin-top: 15px;
            }
            .subjects-container {
              max-height: 100px;
              overflow: hidden;
            }
            .subjects-grid {
              max-height: 90px;
              overflow-y: auto;
              font-size: 10px;
              padding: 5px;
            }
            .subject-item {
              padding: 3px 5px;
              font-size: 10px;
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
              width: 600px;
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
              margin-top: 5%;
              display: flex;
              justify-content: flex-end;
            }
            .sig-box {
              text-align: center;
              width: 250px;
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
              margin-top: auto;
              text-align: center;
              position: relative;
              padding-top: 10px;
            }
            .copyright p {
              font-size: 12px;
              color: #666;
              margin: 0;
              padding-bottom: 10px;
            }
            .copyright a {
              color: #26a69a;
              text-decoration: none;
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
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
              .page-container { 
                padding: 0 !important;
                margin: 0 !important;
                min-height: 100vh !important;
                max-height: 100vh !important;
                height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
              }
              .page-container:last-child {
                page-break-after: auto !important;
              }
              .admit-card { 
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                margin: 0 !important;
                width: 100% !important;
                padding: 20px !important;
                border: 1px solid gray !important;
                box-shadow: none !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                flex: 0 0 50vh !important;
                height: 50vh !important;
                min-height: 50vh !important;
                max-height: 50vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .copyright {
                margin-top: auto !important;
                padding-top: 10px !important;
              }
              .subjects-wrapper {
                flex-shrink: 1 !important;
                overflow: hidden !important;
                margin-top: 10px !important;
                max-height: 80px !important;
              }
              .subjects-container {
                max-height: 70px !important;
                overflow: hidden !important;
              }
              .subjects-grid {
                max-height: 60px !important;
                overflow-y: auto !important;
                font-size: 9px !important;
                padding: 4px !important;
                gap: 4px !important;
              }
              .subject-item {
                padding: 2px 4px !important;
                font-size: 9px !important;
              }
              .subjects-wrapper {
                flex-shrink: 1 !important;
                overflow: hidden !important;
                max-height: 100px !important;
              }
              .subjects-container {
                max-height: 90px !important;
                overflow: hidden !important;
              }
              .subjects-grid {
                max-height: 80px !important;
                overflow-y: auto !important;
                font-size: 10px !important;
                padding: 5px !important;
              }
              .subject-item {
                padding: 3px 5px !important;
                font-size: 10px !important;
              }
              .admit-card:first-child {
                border-top: 1px solid gray !important;
                border-bottom: 1px solid gray !important;
              }
              .admit-card:last-child {
                border-bottom: 1px solid gray !important;
                border-top: 1px solid gray !important;
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
                width: 400px !important;
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
            }
          </style>
        </head>
        <body>
    `;

    // Add all selected cards (exactly 2 per page, no empty space)
    // Process cards in pairs to ensure exactly 2 per page
    for (let i = 0; i < selectedRows.length; i += 2) {
      // Start new page container for every pair
      printContent += '<div class="page-container">';

      // Add first card
      printContent += generateCardHTMLWithUrls(selectedRows[i]);

      // Add second card if exists, otherwise duplicate the first card to fill the page
      if (i + 1 < selectedRows.length) {
        printContent += generateCardHTMLWithUrls(selectedRows[i + 1]);
      }

      // Close page container
      printContent += "</div>";
    }

    printContent += `
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for images to load, then show content in new tab and trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus(); // Focus the new tab to show content
        printWindow.print();
        // Close window after print dialog is closed
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
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
      <div className={` p-3 space-y-3 ${cardBg}`}>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          {/* <div className="flex gap-2 md:gap-2 w-full md:w-auto">
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
                        className={`block w-full px-3 h-8 text-left text-xs hover:bg-blue-50 hover:text-blue-600 ${
                          classFilter === cls
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

         
            <div className="relative flex-1 " ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center  md:w-28  w-full  border  px-3 h-8 text-xs   ${
                  darkMode
                    ? "border-gray-500 bg-gray-700 text-gray-100"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute mt-2 w-full z-40 border  ${
                    darkMode
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
          </div>*/}

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
        <div className="border border-gray-300 overflow-x-auto">
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
                      className={`text-xs px-2 h-7 transition font-semibold ${
                        selectedAdmitCards.size === 0
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
                <th
                  className={`h-8 px-3 text-left font-semibold border-r ${borderClr} whitespace-nowrap`}
                >
                  <input
                    type="checkbox"
                    checked={
                      currentData.length > 0 &&
                      currentData.every((row) => {
                        const rowId = row.IDNumber || row.idNumber || row.sl;
                        return selectedAdmitCards.has(rowId);
                      })
                    }
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 h-8 text-left font-semibold border-r ${darkMode ? "border-gray-700" : "border-gray-200"} whitespace-nowrap`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className={`px-3 h-8 text-left font-semibold ${darkMode ? "border-gray-700" : "border-gray-200"} whitespace-nowrap`}>
                  Action
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="h-10 text-center">
                    No Data Found
                  </td>
                </tr>
              ) : (
                currentData.map((row, index) => {
                  const isSelected = selectedAdmitCards.has(row.IDNumber);
                  return (
                    <tr
                      key={row.sl || index}
                      className={`border-b ${borderClr} ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-800"
                          : "bg-white hover:bg-gray-50"
                      } ${isSelected ? (darkMode ? "bg-gray-800/50" : "bg-blue-50") : ""}`}
                    >
                      {/* Checkbox Column */}
                      <td
                        className={`h-8 px-3 border-r ${borderClr} whitespace-nowrap`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectAdmitCard(e, row.IDNumber)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
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
                            setEditingAdmitCard(r);
                            setEditAdmitCardModalOpen(true);
                          }}
                          onDelete={(r) => {
                            if (
                              confirm(
                                "Are you sure you want to delete this admit card?",
                              )
                            ) {
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
              group: "",
              section: "",
              session: "",
              exam: "",
            });
          }}
          selections={admitCardSelections}
          setSelections={setAdmitCardSelections}
          classOptions={classOptions}
          groupOptions={groupOptions}
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
        />
      )}

      {/* Edit Admit Card Modal */}
      {editAdmitCardModalOpen && editingAdmitCard && (
        <EditAdmitCardModal
          open={editAdmitCardModalOpen}
          onClose={() => {
            setEditAdmitCardModalOpen(false);
            setEditingAdmitCard(null);
          }}
          row={editingAdmitCard}
          darkMode={darkMode}
          generatedAdmitCards={generatedAdmitCards}
          setGeneratedAdmitCards={setGeneratedAdmitCards}
          classOptions={classOptions}
          sectionOptions={filteredSectionOptions}
          sessionOptions={sessionOptions}
          examOptions={examOptions}
        />
      )}
    </div>
  );
}
