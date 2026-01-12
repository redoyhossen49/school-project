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
    division: "",
    district: "",
    upazila: "",
    school: "",
    class: "",
    group: "",
    session: "",
    admissionFee: "",
    admissionDate: "",

    previousSchool: "",
    className: "",
    groupName: "",
    sectionName: "",
    sessionYear: "",
    lastResult: "",

    guardianname: "",
    relation: "",
    mobile: "",
    guardianDivision: "",
    guardianDistrict: "",
    guardianUpazila: "",

    studentname: "",
    father: "",
    mother: "",
    currentDivision: "",
    currentDistrict: "",
    currentUpazila: "",
    permanentDivision: "",
    permanentDistrict: "",
    permanentUpazila: "",
    idNumber: "",
    mobileNumber: "",
    password: "",
    newpassword: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("STUDENT DATA 👉", formData);
    alert("Student Added Successfully ✅");
  };

  return (
    <div className="py-4 px-4 mx-6 md:mx-0 min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold">Add Student</h1>
        <p className="text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link to="/students" className="hover:text-indigo-600">
            Students
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-400">Add Student</span>
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        onStepClick={(step) => setActiveStep(step)}
      />

      {/* Step Content */}
      <div
        className={`p-5  shadow-sm rounded ${
          darkMode ? "bg-gray-700 border-gray-600 " : "bg-white"
        }`}
      >
        {activeStep === 0 && (
          <Step1 formData={formData} handleChange={handleChange} />
        )}

        {activeStep === 1 && (
          <Step2 formData={formData} handleChange={handleChange} />
        )}

        {activeStep === 2 && (
          <Step3 formData={formData} handleChange={handleChange} />
        )}

        {activeStep === 3 && (
          <Step4 formData={formData} handleChange={handleChange} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex w-full justify-between gap-3">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={`px-4 py-2 w-full rounded border ${
            activeStep === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        {activeStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 w-full bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
