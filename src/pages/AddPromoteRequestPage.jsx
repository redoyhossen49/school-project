import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import ProfessionalPaymentModal from "../components/ProfessionalPaymentModal";

/* ===== Class wise promote/admission fee ===== */
const admissionFeeByClass = {
  "Class 1": 1000,
  "Class 2": 1500,
  "Class 3": 2000,
  "Class 4": 2500,
};

export default function AddPromoteRequestPage({
  modal = false,
  onClose,
  onSave,
}) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fromClass: "",
    fromGroup: "",
    fromSection: "",
    fromSession: "",
    toClass: "",
    toGroup: "",
    toSection: "",
    toSession: "",
    admission_fee: "",
    promote_date: "",
    payment: false,
    payment_method: "",
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  /* ===== Handle input change ===== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // 🔥 Auto fee + date when To Class changes
      if (name === "toClass") {
        updated.admission_fee = admissionFeeByClass[value] || "";
        updated.payment = !!admissionFeeByClass[value];
        updated.promote_date = new Date()
          .toISOString()
          .split("T")[0]; // YYYY-MM-DD
      }

      return updated;
    });
  };

  /* ===== Payment method select ===== */
  const handlePaymentMethodSelect = (method) => {
    const updatedData = {
      ...formData,
      payment_method: method,
    };

    setFormData(updatedData);
    setPaymentModalOpen(false);

    setTimeout(() => {
      submitData(updatedData);
    }, 100);
  };

  /* ===== Submit ===== */
  const submitData = (data) => {
    console.log("PROMOTE REQUEST DATA 👉", data);
    alert("Promote Request Submitted Successfully ✅");

    if (modal && onSave) {
      onSave(data);
      onClose?.();
      return;
    }

    navigate("/school/dashboard/promoterequestlist");
  };

  /* ===== Save ===== */
  const handleSave = (e) => {
    e.preventDefault();

    if (formData.payment) {
      setPaymentModalOpen(true);
      return;
    }

    submitData(formData);
  };

  /* ===== Cancel ===== */
  const handleCancel = () => {
    if (modal) {
      onClose?.();
      return;
    }
    navigate("/school/dashboard/promoterequestlist");
  };

  return (
    <div
      className={`rounded ${
        modal ? "w-72 p-6" : "py-4 px-2 min-h-screen"
      } flex flex-col items-center ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <form
        onSubmit={handleSave}
        className={`${
          modal ? "w-full" : "px-6 py-4"
        } space-y-4 ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center font-semibold text-lg">
          Promote Request
        </h2>

        {/* ===== From ===== */}
        <div className={`grid ${modal ? "grid-cols-1" : "grid-cols-4"} gap-4`}>
          <Input
            type="select"
            label="From class"
            name="fromClass"
            value={formData.fromClass}
            onChange={handleChange}
            options={["Class 1", "Class 2", "Class 3"]}
          />
          <Input
            type="select"
            label="From group"
            name="fromGroup"
            value={formData.fromGroup}
            onChange={handleChange}
            options={["Science", "Commerce", "Arts"]}
          />
          <Input
            type="select"
            label="From section"
            name="fromSection"
            value={formData.fromSection}
            onChange={handleChange}
            options={["A", "B", "C"]}
          />
          <Input
            type="select"
            label="From session"
            name="fromSession"
            value={formData.fromSession}
            onChange={handleChange}
            options={["2025-26", "2026-27"]}
          />
        </div>

        {/* ===== To ===== */}
        <div className={`grid ${modal ? "grid-cols-1" : "grid-cols-4"} gap-4`}>
          <Input
            type="select"
            label="To class"
            name="toClass"
            value={formData.toClass}
            onChange={handleChange}
            options={["Class 2", "Class 3", "Class 4"]}
          />
          <Input
            type="select"
            label="To group"
            name="toGroup"
            value={formData.toGroup}
            onChange={handleChange}
            options={["Science", "Commerce", "Arts"]}
          />
          <Input
            type="select"
            label="To section"
            name="toSection"
            value={formData.toSection}
            onChange={handleChange}
            options={["A", "B", "C"]}
          />
          <Input
            type="select"
            label="To session"
            name="toSession"
            value={formData.toSession}
            onChange={handleChange}
            options={["2025-26", "2026-27"]}
          />
        </div>

        {/* ===== Promote Fee + Date ===== */}
        {formData.admission_fee && (
          <>
            <Input
              type="text"
              label="Promote Fee"
              name="admission_fee"
              value={formData.admission_fee}
              readOnly
            />

            <Input
              type="date"
              label="Promoted Date"
              name="promote_date"
              value={formData.promote_date}
              readOnly
            />
          </>
        )}

        {/* ===== Payment ===== */}
        {formData.payment && (
          <div className="flex items-center gap-2">
            <input type="checkbox" checked readOnly />
            <span className="text-xs">Payment Required</span>
          </div>
        )}

        {/* ===== Buttons ===== */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full h-8 border"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full h-8 bg-blue-600 text-white"
          >
            Payment
          </button>
        </div>
      </form>

      {/* ===== Payment Modal ===== */}
      <ProfessionalPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payerType={localStorage.getItem("role") || "school"}
        onSelect={handlePaymentMethodSelect}
      />
    </div>
  );
}
