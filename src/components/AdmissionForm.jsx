import { useState } from "react";
import { Link } from "react-router-dom";
import Stepper from "./Stepper";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 🔑 Single Source of Truth
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

    // Step 2
    previousSchool: "",

    className: "",
    groupName: "",
    sectionName: "",
    sessionYear: "",
    lastResult: "",

    // ---------- Step 3 (Guardian) ----------
    guardianname: "",
    relation: "",
    mobile: "",
    guardianDivision: "",
    guardianDistrict: "",
    guardianUpazila: "",
    // step 4
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

  // Common change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🧠 Step wise required fields
  const stepRequiredFields = {
    0: [
      "division",
      "district",
      "upazila",
      "school",
      "class",
      "group",
      "session",
      "admissionFee",
      "admissionDate",
    ],

    1: [
      "previousSchool",

      "className",

      "sectionName",
      "sessionYear",
      "lastResult",
    ],
    2: [
      "guardianname",
      "relation",
      "mobile",
      "guardianDivision",
      "guardianDistrict",
      "guardianUpazila",
    ],
    3: [
      "studentname",
      "father",
      "mother",
      "currentDivision",
      "currentDistrict",
      "currentUpazila",
      "permanentDivision",
      "permanentDistrict",
      "permanentUpazila",
      "idNumber",
      "mobileNumber",
      "password",
      "newpassword",
    ],
  };

  const stepTitles = {
    0: "New Student Admission",
    1: "Previous School Information",
    2: "Guardian Information",
    3: "Student  Information",
  };

  const isStepValid = () => {
    const fields = stepRequiredFields[step] || [];
    for (let field of fields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError("All required fields must be completed before proceeding.");

        return false;
      }
    }
    if (step === 3) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");

        return false;
      }
      if (formData.password !== formData.newpassword) {
        setError("Passwords do not match. Please try again.");

        return false;
      }
    }
    setError("");
    return true;
  };

  const next = () => {
    if (!isStepValid()) return;

    if (step === 3) {
      // Generate student ID and show submission
      const id = Math.floor(10000000 + Math.random() * 90000000);
      setFormData((prev) => ({ ...prev, idNumber: id }));
      setSubmitted({ ...formData, idNumber: id });
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const back = () => {
    setError("");
    setStep(step - 1);
  };

  const handleAdmission = () => {
    if (!isStepValid()) return;

    const generatedId = Math.floor(100000 + Math.random() * 900000);
    const finalData = { ...formData, idNumber: generatedId };

    setFormData(finalData);
    setSubmitted(finalData);
    navigate("/success", {
      state: finalData,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white   pt-6  pb-2">
      {/* Title */}
      <h1 className="text-center  md:text-2xl text-bold  mb-6 flex items-center justify-center gap-2">
        <span className="text-slate-600">{stepTitles[step]}</span>
      </h1>

      <Stepper activeStep={step}></Stepper>

      {/* STEP CONTENT */}
      <div className="mt-6 transition-all duration-500">
        {step === 0 && (
          <Step1 formData={formData} handleChange={handleChange} />
        )}
        {step === 1 && (
          <Step2 formData={formData} handleChange={handleChange}></Step2>
        )}
        {step === 2 && (
          <Step3 formData={formData} handleChange={handleChange} />
        )}
        {step === 3 && (
          <Step4 formData={formData} handleChange={handleChange} />
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm  text-center mt-2">{error}</p>
      )}

      <div className="flex gap-4 mt-8 w-f">
        {/* STEP 0 */}
        {step === 0 && (
          <>
            <Link
              to="/"
              className="w-1/2 bg-blue-600 text-white text-sm h-8
    hover:bg-slate-800
    hover:shadow-md hover:shadow-slate-800/50
    transition-shadow duration-300
    
    flex items-center justify-center"
            >
              Login
            </Link>
            <Button onClick={next} className="w-1/2">
              Next
            </Button>
          </>
        )}

        {/* STEP 1 & 2 */}
        {(step === 1 || step === 2) && (
          <>
          
             <Button onClick={back} className="w-1/2">
              Back
            </Button>

             <Button onClick={next} className="w-1/2">
              Next
            </Button>
          </>
        )}

        {/* LAST STEP */}
        {step === 3 && (
          <>
            <Button onClick={back} className="w-1/2">
              Back
            </Button>

             <Button onClick={handleAdmission} className="w-1/2">
              Admission
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-sm mt-6 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/"
          className="text-indigo-600 font-semibold cursor-pointer hover:underline"
        >
          Sign In
        </Link>
      </p>

      {/* Copyright */}
      <p className="text-center mt-6 text-xs text-gray-400">
        Copyright © 2025 - Astha Academy
      </p>
    </div>
  );
}
