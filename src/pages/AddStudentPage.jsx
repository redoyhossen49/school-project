import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import Stepper from "../components/Stepper";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import Step4 from "../components/Step4";
import PaymentMethodModal from "../components/PaymentMethodModal";

export default function AddStudentPage({ modal = false, onClose, onSave }) {
  const { darkMode } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const steps = ["Register", "School", "Guardian", "Student"];
  const navigate = useNavigate();

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
    currentVillage: "",
    permanentDivision: "",
    permanentDistrict: "",
    permanentUpazila: "",
    permanentVillage: "",
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
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };
  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleSubmit = () => {
    console.log("STUDENT DATA 👉", formData);
    console.log("PAYMENT METHOD 👉", paymentMethod);
    alert("Student Added Successfully ✅");
    if (modal && onSave) {
      onSave({ ...formData, paymentMethod });
      onClose?.();
    }
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    console.log("Payment method selected:", method);
    // Here you can integrate with payment gateway if needed
    if (method === "bank") {
      // Integrate bank gateway system
      alert("Redirecting to Bank Gateway System...");
    } else {
      // Handle cash payment
      alert("Payment method: Cash");
    }
    handleSubmit();
  };
  const cardBg = darkMode
    ? "bg-gray-700 border border-gray-600 text-gray-100"
    : "bg-white border border-gray-200 text-gray-800";

  const breadcrumbText = darkMode ? "text-gray-300" : "text-gray-500";

  const baseBtn =
    "px-3 md:px-4 py-1 md:py-2 w-full md:w-1/2 text-sm  transition";

  return (
    <div
      className={`${
        modal ? "w-72 p-6" : "py-2 px-2 md:px-0 min-h-screen"
      } rounded flex flex-col items-center space-y-4 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`${modal ? "w-full space-y-3" : "w-full px-6 py-4 space-y-4"}`}
      >
        <div>
          <h1
            className={`text-base md:text-lg font-semibold text-center ${
              darkMode ? "text-gray-100" : "text-gray-700"
            }`}
          >
            Add Student
          </h1>
        </div>

        {/* Stepper */}
        <div className="w-full">
          <Stepper
            activeStep={activeStep}
            onStepClick={(step) => setActiveStep(step)}
            className="!h-6 md:!h-8" // smaller stepper
          />
        </div>
      </div>

      {/* Step Content */}
      <div className={`${modal ? "w-full" : "w-full max-w-2xl p-5"}`}>
        {activeStep === 0 && (
          <Step1
            formData={formData}
            handleChange={handleChange}
            darkMode={darkMode}
            hideLocationSection={true}
            hideSchoolAndTitle={true}
          />
        )}
        {activeStep === 1 && (
          <Step2
            formData={formData}
            handleChange={handleChange}
            darkMode={darkMode}
          />
        )}
        {activeStep === 2 && (
          <Step3
            formData={formData}
            handleChange={handleChange}
            darkMode={darkMode}
          />
        )}
        {activeStep === 3 && (
          <Step4
            formData={formData}
            handleChange={handleChange}
            darkMode={darkMode}
          />
        )}

        {/* Navigation */}
        <div className="flex mt-6 w-full gap-2 md:gap-3">
          {modal && activeStep === 0 ? (
            <>
              <button
                onClick={onClose}
                className="px-3 md:px-4 h-8 w-full md:w-1/2 text-xs border border-gray-300 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={nextStep}
                className="px-3 md:px-4 h-8 w-full md:w-1/2 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`px-3 md:px-4 h-8 w-full md:w-1/2 text-xs  border border-gray-300 ${
                  activeStep === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                Back
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-3 md:px-4 h-8 w-full md:w-1/2 text-xs bg-indigo-600 text-white  hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="px-3 md:px-4 h-8 w-full md:w-1/2 text-xs bg-green-600 text-white hover:bg-green-700"
                >
                  Payment
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSelect={handlePaymentSelect}
      />
    </div>
  );
}
