import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function AddStudentPage({ onBack, onAdd }) {
  const { darkMode } = useTheme();

  const [studentInfo, setStudentInfo] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    admissionNo: "",
    admissionDate: "",
    rollNo: "",
    className: "",
    section: "",
    gender: "",
    status: "",
  });

  const [guardianInfo, setGuardianInfo] = useState({
    fatherName: "",
    fatherEmail: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherEmail: "",
    motherPhone: "",
    motherOccupation: "",
  });

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardianChange = (e) => {
    const { name, value } = e.target;
    setGuardianInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine both info
    onAdd({ id: Date.now(), ...studentInfo, ...guardianInfo });
  };

  const inputClass = `w-full px-3 py-2 border rounded shadow-sm bg-transparent
    ${darkMode ? "border-gray-500 text-gray-100" : "border-gray-300 text-gray-800"}
    focus:outline-none focus:ring-1 focus:ring-blue-500`;

  return (
    <div className={`min-h-screen p-4 space-y-6 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Add Student</h1>
        <nav className="text-sm text-gray-500">
          Dashboard / Students / Add Student
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information Section */}
        <section className="p-4 border rounded-md space-y-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-lg">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="firstName" placeholder="First Name" value={studentInfo.firstName} onChange={handleStudentChange} className={inputClass} />
            <input name="lastName" placeholder="Last Name" value={studentInfo.lastName} onChange={handleStudentChange} className={inputClass} />
            <input type="date" name="dob" placeholder="Date of Birth" value={studentInfo.dob} onChange={handleStudentChange} className={inputClass} />
            <input name="admissionNo" placeholder="Admission Number" value={studentInfo.admissionNo} onChange={handleStudentChange} className={inputClass} />
            <input type="date" name="admissionDate" placeholder="Admission Date" value={studentInfo.admissionDate} onChange={handleStudentChange} className={inputClass} />
            <input name="rollNo" placeholder="Roll Number" value={studentInfo.rollNo} onChange={handleStudentChange} className={inputClass} />
            <select name="className" value={studentInfo.className} onChange={handleStudentChange} className={inputClass}>
              <option>Select Class</option>
              <option>One</option>
              <option>Two</option>
            </select>
            <select name="section" value={studentInfo.section} onChange={handleStudentChange} className={inputClass}>
              <option>Select Section</option>
              <option>A</option>
              <option>B</option>
            </select>
            <select name="gender" value={studentInfo.gender} onChange={handleStudentChange} className={inputClass}>
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <select name="status" value={studentInfo.status} onChange={handleStudentChange} className={inputClass}>
              <option>Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </section>

        {/* Guardian Information Section */}
        <section className="p-4 border rounded-md space-y-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-lg">Parents & Guardian Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Father Info */}
            <input name="fatherName" placeholder="Father Name" value={guardianInfo.fatherName} onChange={handleGuardianChange} className={inputClass} />
            <input name="fatherEmail" placeholder="Father Email" value={guardianInfo.fatherEmail} onChange={handleGuardianChange} className={inputClass} />
            <input name="fatherPhone" placeholder="Father Phone" value={guardianInfo.fatherPhone} onChange={handleGuardianChange} className={inputClass} />
            <input name="fatherOccupation" placeholder="Father Occupation" value={guardianInfo.fatherOccupation} onChange={handleGuardianChange} className={inputClass} />

            {/* Mother Info */}
            <input name="motherName" placeholder="Mother Name" value={guardianInfo.motherName} onChange={handleGuardianChange} className={inputClass} />
            <input name="motherEmail" placeholder="Mother Email" value={guardianInfo.motherEmail} onChange={handleGuardianChange} className={inputClass} />
            <input name="motherPhone" placeholder="Mother Phone" value={guardianInfo.motherPhone} onChange={handleGuardianChange} className={inputClass} />
            <input name="motherOccupation" placeholder="Mother Occupation" value={guardianInfo.motherOccupation} onChange={handleGuardianChange} className={inputClass} />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onBack} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </form>
    </div>
  );
}
