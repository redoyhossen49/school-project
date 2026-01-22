import FormModal from "../FormModal.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const DEFAULT_PHOTO =
  "https://ui-avatars.com/api/?name=Student&background=0D8ABC&color=fff";

export default function AddStudentModal({ open, onClose, onSave }) {
  const { darkMode } = useTheme();

  const fields = [
    { key: "admissionNo", label: "Admission No", type: "text", placeholder: "Admission No" },
    { key: "studentId", label: "Student ID", type: "text", placeholder: "Student ID" },
    { key: "rollNo", label: "Roll No", type: "text", placeholder: "Roll No" },
    { key: "password", label: "Password", type: "text", placeholder: "Password" },
    { key: "student_name", label: "Student Name", type: "text", placeholder: "Student Name" },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      placeholder: "Select gender",
      options: ["Male", "Female", "Other"],
    },
    { key: "fatherName", label: "Father Name", type: "text", placeholder: "Father Name" },
    { key: "motherName", label: "Mother Name", type: "text", placeholder: "Mother Name" },
    { key: "className", label: "Class", type: "text", placeholder: "Class" },
    { key: "group", label: "Group", type: "text", placeholder: "Group" },
    { key: "section", label: "Section", type: "text", placeholder: "Section" },
    { key: "session", label: "Session", type: "text", placeholder: "Session" },
    { key: "phone", label: "Phone", type: "text", placeholder: "Phone" },
    {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      options: ["Active", "Inactive"],
    },
    { key: "joinDate", label: "Join Date", type: "date", placeholder: "Join Date" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Photo URL" },
  ];

  const initialValues = {
    admissionNo: "",
    studentId: "",
    rollNo: "",
    password: "",
    student_name: "",
    gender: "",
    fatherName: "",
    motherName: "",
    className: "",
    group: "",
    section: "",
    session: "",
    phone: "",
    status: "Active",
    joinDate: new Date().toISOString().slice(0, 10),
    photo: DEFAULT_PHOTO,
  };

  const requiredKeys = [
    "admissionNo",
    "studentId",
    "rollNo",
    "password",
    "student_name",
    "className",
    "session",
    "joinDate",
    "status",
  ];

  return (
    <FormModal
      open={open}
      title="Add Student"
      fields={fields}
      initialValues={initialValues}
      onClose={onClose}
      darkMode={darkMode}
      onSubmit={(data) => {
        for (const k of requiredKeys) {
          if (!data?.[k]) {
            alert(`${k} is required`);
            return;
          }
        }
        onSave({
          ...data,
          photo: data.photo || DEFAULT_PHOTO,
        });
      }}
    />
  );
}
