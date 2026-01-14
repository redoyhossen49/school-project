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
  

const handleImageChange = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  const previewURL = URL.createObjectURL(file);

  if (type === "photo") {
    setPhotoPreview(previewURL);
  } else {
    setSignaturePreview(previewURL);
  }
};

const removeImage = (type) => {
  if (type === "photo") {
    setPhotoPreview(null);
  } else {
    setSignaturePreview(null);
  }
};


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
      <div
        className={`mb-6  ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6 rounded`}
      >
        <h1 className="text-base font-bold">Add Teacher</h1>
        <p className="text-xs text-indigo-600 mt-1">
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
            Teacher list
          </Link>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6 rounded shadow-md space-y-6 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
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
        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Upload Photo
            </label>

            {!photoPreview ? (
              <div
                className="border-2 border-dashed h-28 flex flex-col items-center justify-center
        text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
              >
                <span className="text-sm">📷 Upload Photo</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "photo")}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            ) : (
              <div className="relative h-28 w-full border rounded-lg overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Photo Preview"
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={() => removeImage("photo")}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full
          w-7 h-7 flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Signature Upload */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Upload Signature
            </label>

            {!signaturePreview ? (
              <div
                className="border-2 border-dashed h-28 flex flex-col items-center justify-center
        text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
              >
                <span className="text-sm">✍️ Upload Signature</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "signature")}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            ) : (
              <div className="relative h-28 w-full border rounded-lg overflow-hidden">
                <img
                  src={signaturePreview}
                  alt="Signature Preview"
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={() => removeImage("signature")}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full
          w-7 h-7 flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
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
