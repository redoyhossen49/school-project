import { useState, useEffect, useRef } from "react";
import Input from "../Input.jsx";

export default function AdmitCardModal({
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

    studentsToGenerate.forEach((student) => {
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
                  {filteredStudents.map((student) => {
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
