import { studentExamData } from "../../data/studentExamData.js";
import { studentData } from "../../data/studentData.js";
import headteacherSignature from "../../assets/images/signature-headteacher.png";
import schoolLogo from "../../assets/images/sidebar-logo.avif";
import schoolWatermark from "../../assets/images/school.webp";

// Helper function to get student photo
export const getStudentPhoto = (idNumber) => {
  const student = studentData.find(
    (s) => s.studentId?.toUpperCase() === idNumber?.toUpperCase()
  );
  return student?.photo || "https://via.placeholder.com/100";
};

// Helper function to get subjects for a student
export const getStudentSubjects = (row) => {
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

// Helper function to get subject details with exam date and time
export const getStudentSubjectDetails = (row) => {
  const subjectDetails = studentExamData
    .filter(
      (d) =>
        d.Class === row.Class &&
        d.Group === row.Group &&
        (d.Section || "") === (row.Section || "") &&
        d.Session === row.Session &&
        d.ExamName === row.ExamName
    )
    .map((d) => ({
      subjectName: d.SubjectName,
      examDate: d.ExamStartDate || "",
      examTime: d.StartTime ? `${d.StartTime}${d.EndTime ? ` - ${d.EndTime}` : ""}` : "",
    }));

  // Remove duplicates based on subject name and keep first occurrence
  const uniqueSubjects = [];
  const seenSubjects = new Set();
  subjectDetails.forEach((subject) => {
    if (!seenSubjects.has(subject.subjectName)) {
      seenSubjects.add(subject.subjectName);
      uniqueSubjects.push(subject);
    }
  });

  return uniqueSubjects;
};

// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateString;
  }
};

// Helper function to generate single admit card HTML
export const generateAdmitCardHTML = (row) => {
  const studentPhoto = getStudentPhoto(row.IDNumber);
  const subjectDetails = getStudentSubjectDetails(row);
  const examYear = row.ExamYear || row.Session?.split("-")[0] || new Date().getFullYear();
  
  // Get school name and address from localStorage or use defaults
  const schoolInfo = JSON.parse(localStorage.getItem("schoolInfo") || "{}");
  const schoolName = schoolInfo.schoolName || "Mohakhali Model High School";
  const schoolAddress = schoolInfo.address || "Mohakhali School Road, Wireless Gate, Mohakhali, Gulshan, Banani, Dhaka-1212";

  return `
    <div class="admit-card">
      <div class="watermark">
        <img src="${schoolWatermark}" alt="Watermark" />
      </div>
      <header class="header">
        <div class="logo">
          <img src="${schoolLogo}" alt="Logo" />
        </div>
        
        <div class="school-info">
          <h1>${schoolName}</h1>
          <p>${schoolAddress}</p>
          <div class="admit-badge">Admit Card</div><br>
          <div class="exam-title">Exam: ${row.ExamName} - ${examYear}</div>
        </div>

        <div class="student-photo">
          <img src="${studentPhoto}" alt="${row.StudentName}" />
        </div>
      </header>

      <div class="info-section">
        <div class="left-info">
          <div class="info-row">
            <span class="label">Student Name</span>
            <span class="value">: ${row.StudentName}</span>
          </div>
          <div class="info-row">
            <span class="label">ID Number</span>
            <span class="value">: ${row.IDNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Roll</span>
            <span class="value">: ${row.RollNo || ""}</span>
          </div>
          <div class="info-row">
            <span class="label">Admit Card No</span>
            <span class="value">: ${row.AdmitCardNo || ""}</span>
          </div>
        </div>

        <div class="right-info">
          <div class="info-row">
            <span class="label">Class</span>
            <div >: ${row.Class}</div>
          </div>
          <div class="info-row">
            <span class="label">Group</span>
            <div >: ${row.Group || ""}</div>
          </div>
          <div class="info-row">
            <span class="label">Section</span>
            <div >: ${row.Section || "N/A"}</div>
          </div>
          <div class="info-row">
            <span class="label">Session</span>
            <div >: ${row.Session || "N/A"}</div>
          </div>
        </div>
      </div>

    

      <footer class="footer">
       <div class="copyright">
        <p>&copy; ${new Date().getFullYear()} Astha Academic. All rights reserved.</p>
      </div>
        <div class="sig-box">
          <img src="${headteacherSignature}" alt="Headteacher Signature" class="signature-image" />
          <div class="sig-text">Principal's Signature</div>
        </div>
        
      </footer>
      
     
    </div>
  `;
};
