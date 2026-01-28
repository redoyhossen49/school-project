import { useState, useEffect, useRef } from "react";
import Input from "../Input.jsx";

export default function EditAdmitCardModal({
  open,
  onClose,
  row,
  darkMode,
  generatedAdmitCards,
  setGeneratedAdmitCards,
  classOptions,
  sectionOptions,
  sessionOptions,
  examOptions,
}) {
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [formData, setFormData] = useState({
    StudentName: "",
    IDNumber: "",
    RollNo: "",
    Class: "",
    Group: "",
    Section: "",
    Session: "",
    ExamName: "",
    AdmitCardNo: "",
  });
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && row) {
      setFormData({
        StudentName: row.StudentName || "",
        IDNumber: row.IDNumber || "",
        RollNo: row.RollNo || "",
        Class: row.Class || "",
        Group: row.Group || "",
        Section: row.Section || "",
        Session: row.Session || "",
        ExamName: row.ExamName || "",
        AdmitCardNo: row.AdmitCardNo || "",
      });
      setIsModalClosing(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [open, row]);

  const handleClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
      setFormData({
        StudentName: "",
        IDNumber: "",
        RollNo: "",
        Class: "",
        Group: "",
        Section: "",
        Session: "",
        ExamName: "",
        AdmitCardNo: "",
      });
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.StudentName || !formData.IDNumber || !formData.Class || !formData.Session || !formData.ExamName) {
      alert("Please fill in all required fields");
      return;
    }

    // Update admit card number if class/section/session/exam changed
    const oldKey = `${row.IDNumber}_${row.Class}_${row.Section || ""}_${row.Session}_${row.ExamName}`;
    const newKey = `${formData.IDNumber}_${formData.Class}_${formData.Section || ""}_${formData.Session}_${formData.ExamName}`;

    // If key changed, update the generated admit cards
    if (oldKey !== newKey && generatedAdmitCards[oldKey]) {
      const admitCardNo = generatedAdmitCards[oldKey];
      setGeneratedAdmitCards((prev) => {
        const updated = { ...prev };
        delete updated[oldKey];
        updated[newKey] = admitCardNo;
        return updated;
      });
    }

    // Update the data (you may need to update your data source here)
    // For now, we'll just show a success message
    alert("Admit Card updated successfully!");
    handleClose();
  };

  const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
  const modalBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const inputBg = darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800";

  if (!open && !isModalClosing) return null;

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
        className={`${modalBg} ${textColor} w-72 rounded border ${borderClr} p-6 max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
          isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Title */}
        <h2 className="text-base font-semibold text-center mb-6">Edit Admit Card</h2>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Student Name */}
          <Input
            label="Student Name"
            name="StudentName"
            value={formData.StudentName}
            onChange={handleChange}
            type="text"
            inputClassName={inputBg}
            required
          />

          {/* ID Number */}
          <Input
            label="ID Number"
            name="IDNumber"
            value={formData.IDNumber}
            onChange={handleChange}
            type="text"
            inputClassName={inputBg}
            required
          />

          {/* Roll No */}
          <Input
            label="Roll No"
            name="RollNo"
            value={formData.RollNo}
            onChange={handleChange}
            type="text"
            inputClassName={inputBg}
          />

          {/* Class */}
          <Input
            label="Class"
            name="Class"
            value={formData.Class}
            onChange={handleChange}
            type="select"
            options={classOptions}
            inputClassName={inputBg}
            required
          />

          {/* Group */}
          <Input
            label="Group"
            name="Group"
            value={formData.Group}
            onChange={handleChange}
            type="text"
            inputClassName={inputBg}
          />

          {/* Section */}
          <Input
            label="Section"
            name="Section"
            value={formData.Section}
            onChange={handleChange}
            type="select"
            options={sectionOptions}
            inputClassName={inputBg}
          />

          {/* Session */}
          <Input
            label="Session"
            name="Session"
            value={formData.Session}
            onChange={handleChange}
            type="select"
            options={sessionOptions}
            inputClassName={inputBg}
            required
          />

          {/* Exam Name */}
          <Input
            label="Exam Name"
            name="ExamName"
            value={formData.ExamName}
            onChange={handleChange}
            type="select"
            options={examOptions}
            inputClassName={inputBg}
            required
          />

          {/* Admit Card No */}
          <Input
            label="Admit Card No"
            name="AdmitCardNo"
            value={formData.AdmitCardNo}
            onChange={handleChange}
            type="text"
            inputClassName={inputBg}
            disabled
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className={`px-4 py-2 text-xs border ${borderClr} ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
