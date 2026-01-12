import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import Stepper from "../components/Stepper";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import Step4 from "../components/Step4";

export default function AddStudentPage() {
  const { darkMode } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Register", "School", "Guardian", "Student"];

  const [formData, setFormData] = useState({
    division: "", district: "", upazila: "", school: "",
    class: "", group: "", session: "", admissionFee: "",
    admissionDate: "", previousSchool: "", className: "",
    groupName: "", sectionName: "", sessionYear: "", lastResult: "",
    guardianname: "", relation: "", mobile: "",
    guardianDivision: "", guardianDistrict: "", guardianUpazila: "",
    studentname: "", father: "", mother: "",
    currentDivision: "", currentDistrict: "", currentUpazila: "",
    permanentDivision: "", permanentDistrict: "", permanentUpazila: "",
    idNumber: "", mobileNumber: "", password: "", newpassword: "", photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const nextStep = () => { if (activeStep < steps.length - 1) setActiveStep(activeStep + 1); };
  const prevStep = () => { if (activeStep > 0) setActiveStep(activeStep - 1); };

  const handleSubmit = () => {
    console.log("STUDENT DATA 👉", formData);
    alert("Student Added Successfully ✅");
  };

  return (
    <div className="py-4 px-4 md:px-0 min-h-screen flex flex-col items-center space-y-4">
      {/* Header */}
      <div className="w-full max-w-2xl text-center md:text-left">
        <h1 className="text-base md:text-lg font-bold">Add Student</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-1">/</span>
          <Link to="/students" className="hover:text-indigo-600">Students</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-400">Add Student</span>
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-2xl my-2">
        <Stepper
          activeStep={activeStep}
          onStepClick={(step) => setActiveStep(step)}
          className="!h-6 md:!h-8" // smaller stepper
        />
      </div>

      {/* Step Content */}
      <div className={`w-full max-w-2xl p-4 md:p-5 shadow-sm rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}>
        {activeStep === 0 && <Step1 formData={formData} handleChange={handleChange} darkMode={darkMode} />}
        {activeStep === 1 && <Step2 formData={formData} handleChange={handleChange} darkMode={darkMode} />}
        {activeStep === 2 && <Step3 formData={formData} handleChange={handleChange} darkMode={darkMode} />}
        {activeStep === 3 && <Step4 formData={formData} handleChange={handleChange} darkMode={darkMode} />}

         {/* Navigation */}
      <div className="flex flex-col pb-6 md:flex-row w-full max-w-2xl gap-2 md:gap-3">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={`px-3 md:px-4 py-1 md:py-2 w-full md:w-1/2 text-sm rounded border ${activeStep === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          Previous
        </button>

        {activeStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-3 md:px-4 py-1 md:py-2 w-full md:w-1/2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-3 md:px-4 py-1 md:py-2 w-full md:w-1/2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
      </div>

     
    </div>
  );
}
