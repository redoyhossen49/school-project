import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import FormModal from "../components/FormModal";

export default function AddClassPermissionPage({
  open: openProp,
  onClose: onCloseProp,
  onSubmit: onSubmitProp,
}) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const open = typeof openProp === "boolean" ? openProp : true;

  const handleClose = () => {
    if (onCloseProp) return onCloseProp();
    navigate("/school/dashboard/classpermissionlist");
  };

  const handleSubmit = (data) => {
    if (onSubmitProp) return onSubmitProp(data);
    console.log("CLASS PERMISSION DATA 👉", data);
    alert("Class Permission Added Successfully ✅");
    navigate("/school/dashboard/classpermissionlist");
  };

  return (
    <FormModal
      open={open}
      title="Class Permission"
      darkMode={darkMode}
      initialValues={{
        teacherName: "",

        class: "",
        group: "",
        section: "",
        subject: "",
      }}
      onClose={handleClose}
      onSubmit={handleSubmit}
      fields={[
        {
          key: "teacherName",
          type: "select",
          label: "Select teacher",
          placeholder: "Select teacher",
          options: ["Redoy", "Sagor", "Rahim", "Karim", "Nasim"],
        },

        {
          key: "class",
          type: "select",
          label: "Select class",
          placeholder: "Select class",
          options: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
        },
        {
          key: "group",
          type: "select",
          label: "Select group",
          placeholder: "Select group",
          options: ["Science", "Arts", "Commerce"],
        },
        {
          key: "section",
          type: "select",
          label: "Select section",
          placeholder: "Select section",
          options: ["Morning", "Day"],
        },
        {
          key: "subject",
          type: "select",
          label: "Subject",
          placeholder: "Select subject",
          options: ["Math", "Physics", "Chemistry", "Biology", "English"],
        },
      ]}
    />
  );
}
