import { useState, useEffect, useRef } from "react";

export default function AdmitCardModal({
  open,
  onClose,
  selections,
  setSelections,
  classOptions,
  sectionOptions,
  sessionOptions,
  groupOptions,
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
      setTimeout(() => setIsModalOpening(true), 10);
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
      if (["class", "section", "session", "exam"].includes(name)) {
        if (name === "class") updated.section = "";
        if (name === "class" || name === "section") updated.session = "";
        if (name === "class" || name === "section" || name === "session")
          updated.exam = "";
        setLocalGeneratedAdmitCards({});
      }
      return updated;
    });
  };

  const allSelected =
    selections.class &&
    selections.group &&
    selections.section &&
    selections.session &&
    selections.exam;

  useEffect(() => {
    if (!allSelected || filteredStudents.length === 0) {
      setLocalGeneratedAdmitCards({});
      return;
    }

    const examNameMap = { Mid: "Mid Term", Final: "Final" };
    const examName = examNameMap[selections.exam] || selections.exam;

    const newAdmitCards = {};
    filteredStudents.forEach((student) => {
      const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
      if (!parentGeneratedAdmitCards[key]) {
        let sessionCode = student.Session || selections.session;
        sessionCode = sessionCode.replace(/-/g, "");
        if (sessionCode.length > 4) sessionCode = sessionCode.substring(0, 4);

        const classCode = student.Class || selections.class;

        let studentId = student.IDNumber.toString();
        studentId = studentId.replace(/^STU[-_]?/i, "");
        studentId = studentId.replace(/^ST[-_]?/i, "");
        studentId = studentId.replace(/[^0-9]/g, "");

        const baseNumber = `${sessionCode}${classCode}${studentId}`;
        const admitCardNo =
          baseNumber.length > 8
            ? baseNumber.slice(-8)
            : baseNumber.padStart(8, "0");

        newAdmitCards[key] = admitCardNo;
      } else {
        newAdmitCards[key] = parentGeneratedAdmitCards[key];
      }
    });

    setLocalGeneratedAdmitCards(newAdmitCards);
  }, [selections, filteredStudents, parentGeneratedAdmitCards]);

  const handleGenerateAdmitCards = () => {
    if (!allSelected || filteredStudents.length === 0) {
      alert("Please select all fields and ensure students are available");
      return;
    }
    setIsGenerating(true);

    const newAdmitCards = {};
    const examNameMap = { Mid: "Mid Term", Final: "Final" };
    const examName = examNameMap[selections.exam] || selections.exam;

    filteredStudents.forEach((student) => {
      const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
      if (!parentGeneratedAdmitCards[key]) {
        newAdmitCards[key] = localGeneratedAdmitCards[key];
      }
    });

    setTimeout(() => {
      const updatedCards = { ...parentGeneratedAdmitCards, ...newAdmitCards };
      setParentGeneratedAdmitCards(updatedCards);
      localStorage.setItem("generatedAdmitCards", JSON.stringify(updatedCards));
      setIsGenerating(false);

      const totalGenerated = Object.keys(newAdmitCards).length;
      const alreadyExists = filteredStudents.length - totalGenerated;
      alert(
        `Successfully generated ${totalGenerated} new admit card numbers! ${
          alreadyExists > 0
            ? `${alreadyExists} students already had admit cards.`
            : ""
        }`
      );
    }, 500);
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  if (!open && !isModalClosing) return null;

  // ------------------ Internal Reusable Input ------------------
  const SelectInput = ({ label, name, value, options }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
      const handler = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div
          onClick={() => setOpen(!open)}
          className={`h-8 px-2 text-[12px] flex items-center justify-between border ${inputBg} ${borderClr} cursor-pointer`}
        >
          <span className={value ? "" : "text-gray-400"}>{value || label}</span>
          <span className="h-4 w-4">&#9662;</span>
        </div>
        {open && (
          <ul
            className={`absolute top-full left-0 w-full max-h-48 overflow-y-auto border ${inputBg} ${borderClr} z-50`}
          >
            {options.map((opt, i) => (
              <li
                key={i}
                onClick={() => {
                  handleChange({ target: { name, value: opt } });
                  setOpen(false);
                }}
                className={`px-2 py-1 text-[12px] cursor-pointer hover:bg-indigo-100`}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // ------------------ Modal JSX ------------------
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
        isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`${modalBg} ${textColor} w-72 rounded border ${borderClr} p-6 max-h-[90vh] relative overflow-y-auto transition-all duration-300 transform ${
          isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <h2 className="text-base font-semibold text-center mb-6">
          New Admit Card
        </h2>

        <div className="space-y-4">
          <SelectInput label="Class" name="class" value={selections.class} options={classOptions} />
          <SelectInput label="Group" name="group" value={selections.group} options={groupOptions} />
          <SelectInput label="Section" name="section" value={selections.section} options={sectionOptions} />
          <SelectInput label="Session" name="session" value={selections.session} options={sessionOptions} />
          <SelectInput label="Exam" name="exam" value={selections.exam} options={examOptions} />
        </div>

        {/* Student Quantity */}
        {allSelected && (
          <div className={`border ${borderClr} py-[6px] px-2 mt-2 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <div className="flex justify-between items-center text-[12px] font-medium">
              <span>Total student :</span>
              <span className="font-bold text-blue-600">{filteredStudents.length}</span>
            </div>
          </div>
        )}

        {/* Student table */}
        {allSelected && Object.keys(localGeneratedAdmitCards).length > 0 && (
          <div className="mt-4">
            <div className={`border ${borderClr} max-h-50 overflow-y-auto ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 z-10">
                  <tr className={`border-b ${borderClr} ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                    <th className={`px-2 py-[6px] text-left font-semibold border-r ${borderClr} ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Student name
                    </th>
                    <th className={`px-2 py-[6px] text-right font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Admit card no
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const examNameMap = { Mid: "Mid Term", Final: "Final" };
                    const examName = examNameMap[selections.exam] || selections.exam;
                    const key = `${student.IDNumber}_${student.Class}_${student.Section || ""}_${student.Session}_${examName}`;
                    const admitCardNo = localGeneratedAdmitCards[key];
                    if (!admitCardNo) return null;
                    return (
                      <tr key={student.IDNumber} className={`border-b ${borderClr} last:border-b-0 ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}>
                        <td className={`px-2 py-[6px] border-r ${borderClr} ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{student.StudentName}</td>
                        <td className={`px-2 py-[6px] text-right font-semibold text-blue-600 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{admitCardNo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={handleClose} className={`flex-1 text-[12px] h-8 border ${borderClr} ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"} transition`}>
            Close
          </button>
          <button type="button" onClick={handleGenerateAdmitCards} disabled={isGenerating} className={`flex-1 text-[12px] h-8 bg-blue-600 text-white hover:bg-blue-700 transition font-semibold ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
