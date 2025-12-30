import { useState } from "react";
import { Link } from "react-router-dom";
import Stepper from "./Stepper";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Success from "./Success";

export default function AdmissionForm() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 🔑 Single Source of Truth
  const [formData, setFormData] = useState({
    division: "",
    district: "",
    upazila: "",
    school: "",
    className: "",
    group: "",
    session: "",
    admissionFee: "",
    admissionDate: "",

    // Step 2
    previousSchool: "",
    schoolName: "",
    className: "",
    groupName: "",
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
      "className",
      "group",
      "session",
      "admissionFee",
      "admissionDate",
    ],

    1: [
      "previousSchool",
      "schoolName",
      "className",
      "groupName",
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
    3: "Student & Account Information",
  };

  const isStepValid = () => {
    const fields = stepRequiredFields[step] || [];
    for (let field of fields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError("সব required field পূরণ করুন");
        return false;
      }
    }
    if (step === 3) {
      if (formData.password.length < 6) {
        setError("Password minimum 6 character হতে হবে");
        return false;
      }
      if (formData.password !== formData.newpassword) {
        setError("Password match করতে হবে");
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
      const id = Math.floor(100000 + Math.random() * 900000);
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
    setSubmitted(finalData); // ✅ success trigger
  };

  // SUCCESS PAGE ONLY
  if (submitted) {
    return <Success data={submitted} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl  p-6">
      {/* Title */}
      <h1 className="text-center text-3xl text-bold  mb-6 flex items-center justify-center gap-2">
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

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      <div className="flex gap-4 mt-8">
        {/* STEP 0 */}
        {step === 0 && (
          <>
            <Link
              to="/"
              className="w-1/2 bg-slate-600 border text-white py-3 text-center rounded-xl font-semibold
                   hover:bg-blue-700 transition"
            >
              Login
            </Link>

            <button
              onClick={next}
              className="w-1/2 bg-indigo-400 text-white py-3 rounded-xl font-semibold
                   hover:bg-indigo-700 transition"
            >
              Next
            </button>
          </>
        )}

        {/* STEP 1 & 2 */}
        {(step === 1 || step === 2) && (
          <>
            <button
              onClick={back}
              className="w-1/2 bg-blue-600 text-white py-3 rounded-xl font-semibold
                   hover:bg-blue-700 transition"
            >
              Back
            </button>

            <button
              onClick={next}
              className="w-1/2 bg-indigo-600 text-white py-3 rounded-xl font-semibold
                   hover:bg-indigo-700 transition"
            >
              Next
            </button>
          </>
        )}

        {/* LAST STEP */}
        {step === 3 && (
          <>
            <button
              onClick={back}
              className="w-1/2 bg-blue-600 text-white py-3 rounded-xl font-semibold
                   hover:bg-blue-700 transition"
            >
              Back
            </button>

            <button
              onClick={handleAdmission}
              className="w-1/2 bg-green-600 text-white py-3 rounded-xl font-semibold
                   hover:bg-green-700 transition"
            >
              Admission
            </button>
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
        Copyright © 2024 - Prekool
      </p>
    </div>
  );
}
