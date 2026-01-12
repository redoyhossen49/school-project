import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input"; // your custom Input component

export default function AddTeacherPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teacherName: "",
    designation: "",
    idNumber: "",
    mobileNumber: "",
    email: "",
    password: "",
    dateOfBirth: "",
    joinDate: "",
    photo: null,
    signature: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // Auto-generate ID on mount
  useEffect(() => {
    const generatedId = "TCH" + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, idNumber: generatedId }));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Set previews
      if (name === "photo") setPhotoPreview(URL.createObjectURL(file));
      if (name === "signature") setSignaturePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("TEACHER DATA 👉", formData);
    alert("Teacher Added Successfully ✅");
    // Here you can call API to save teacher, then redirect to list
    navigate("/teachers");
  };

  const handleCancel = () => {
    navigate("/teachers"); // go back to teacher list
  };

  return (
    <div className="py-4 px-4 mx-6 md:mx-0  min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded">
        <h1 className="text-base font-bold">Add Teacher</h1>
        <p className="text-sm text-gray-500 mt-1">
          <Link
            to="/school/dashboard"
            className="hover:text-indigo-600 transition"
          >
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link
            to="/school/dashboard/teacherlist"
            className="hover:text-indigo-600 transition"
          >
            Teachers
          </Link>
          <span className="mx-1">/</span>
          <span className="truncate">Teacher List</span>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 rounded shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-center">Teacher Information</h2>
        {/* Grid layout for text inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Teacher Name"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="ID Number"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            type="text"
            disabled
            inputClassName="py-1"
          />

          <Input
            label="Mobile Number"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="E-mail Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            inputClassName="py-1"
          />

          <Input
            label="Join Date"
            name="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={handleChange}
            inputClassName="py-1"
          />
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">
              Upload Photo
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-3 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Upload Signature
            </label>
            <input
              type="file"
              name="signature"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-3 py-1"
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex w-full gap-4 md:justify-end mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-1 border w-full md:w-auto rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-1 w-full md:w-auto bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
