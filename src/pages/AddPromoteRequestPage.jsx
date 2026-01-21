import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input";
import ProfessionalPaymentModal from "../components/ProfessionalPaymentModal";

export default function AddPromoteRequestPage() {
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
    payment: false, // existing
    paymentMethod: "", // selected payment method
    paymentStatus: "", // new field: initiated / processing / pending / success / failed
    transactionId: "", // new field for online payments
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const payerType =
    formData.fromGroup === "Teacher" || formData.fromGroup === "Student"
      ? "teacher"
      : "school";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Dummy backend simulation
  const createPaymentSession = async ({ amount, method, referenceId }) => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            sessionId: "sess_" + Date.now(),
            amount,
            method,
            referenceId,
          }),
        800,
      ),
    );
  };

  const simulatePaymentGateway = async (session) => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            status: "success", // success / failed
            transactionId: "TXN" + Date.now(),
          }),
        1500,
      ),
    );
  };

  const handlePayment = async (method) => {
    // Cash check
    if (method === "cash") {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: "Cash",
        paymentStatus: "pending",
      }));
      return;
    }

    // Online payment
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      paymentStatus: "processing",
    }));

    const session = await createPaymentSession({
      amount: 500,
      method,
      referenceId: "PROMOTE_" + Date.now(),
    });
    const result = await simulatePaymentGateway(session);

    setFormData((prev) => ({
      ...prev,
      paymentStatus: result.status,
      transactionId: result.transactionId,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("PROMOTE REQUEST DATA 👉", formData);
    alert("Promote Request Submitted Successfully ✅");
    navigate("/school/dashboard/promoterequestlist");
  };

  const handleCancel = () => {
    navigate("/school/dashboard/promoterequestlist");
  };

  return (
    <div className="py-4 px-2 md:mx-0 min-h-screen">
      {/* ===== Header ===== */}
      <div
        className={`mb-6  ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6 `}
      >
        <h1 className="text-base font-semibold">Add Promote Request</h1>
        <p
          className={`text-xs  mt-1 ${
            darkMode ? "text-gray-200" : "text-gray-400"
          }`}
        >
          <Link
            to="/school/dashboard"
            className="hover:text-indigo-600 transition"
          >
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to="/school/dashboard/promoterequest"
            className="hover:text-indigo-600 transition"
          >
            Promote request
          </Link>
          <span className="mx-1">/</span>Add promote
        </p>
      </div>

      {/* ===== Form ===== */}
      <form
        onSubmit={handleSave}
        className={`px-6 py-4   space-y-4 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center font-semibold text-lg mb-4">
          Promote Request
        </h2>

        {/* ===== From Class Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="select"
            label="From class"
            name="fromClass"
            value={formData.fromClass}
            onChange={handleChange}
            options={["Class 1", "Class 2", "Class 3"]} // Example options
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

        {/* ===== To Class Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
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
            label="To Group"
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

        {/* ===== Payment ===== */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="payment"
            name="payment"
            checked={formData.payment}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="payment" className="text-xs">
            Payment Required for Promote Request
          </label>
        </div>
        {formData.paymentMethod && (
          <p className="text-xs mt-1">
            Payment Method: <b>{formData.paymentMethod}</b> <br />
            Status: {formData.paymentStatus === "initiated" && "Initiated ⏳"}
            {formData.paymentStatus === "processing" && "Processing ⏳"}
            {formData.paymentStatus === "pending" && "Pending (Cash) 🕒"}
            {formData.paymentStatus === "success" && "Success ✅"}
            {formData.paymentStatus === "failed" && "Failed ❌"}
          </p>
        )}

        {/* ===== Action Buttons ===== */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 h-8 border border-gray-300 w-full md:w-auto shdaow-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white shdaow-sm hover:bg-green-700 transition"
          >
            Payment
          </button>
        </div>
      </form>
      <ProfessionalPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        payerType={payerType} // school / teacher / student
        darkMode={darkMode}
        onSelect={handlePayment} // <- Step 1 er function
      />
    </div>
  );
}
