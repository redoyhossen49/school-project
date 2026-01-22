import FormModal from "../FormModal.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { classTimeData } from "../../data/classTimeData";

export default function AddClassTimeModal({ open, onClose, onSave }) {
  const { darkMode } = useTheme();

  // Generate dynamic options from classTimeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(classTimeData, "className");
  const groupOptions = getUniqueOptions(classTimeData, "group");
  const sectionOptions = getUniqueOptions(classTimeData, "section");

  const fields = [
    { key: "className", label: "Class", type: "select", placeholder: "Select Class", options: classOptions },
    { key: "group", label: "Group", type: "select", placeholder: "Select Group", options: groupOptions },
    { key: "section", label: "Section", type: "select", placeholder: "Select Section", options: sectionOptions },
    { key: "startTime", label: "Start Time", type: "time", placeholder: "Start Time" },
    { key: "lastTime", label: "Late Time", type: "time", placeholder: "Late Time" },
    { key: "endTime", label: "Close Time", type: "time", placeholder: "Close Time" },
  ];

  const initialValues = {
    className: "",
    group: "",
    section: "",
    startTime: "",
    lastTime: "",
    endTime: "",
  };

  const requiredKeys = ["className", "section", "startTime", "endTime"];

  return (
    <FormModal
      open={open}
      title="Add Class Time"
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
        onSave(data);
      }}
    />
  );
}

