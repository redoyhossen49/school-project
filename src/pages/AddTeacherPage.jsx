import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input"; // your custom Input component
import { TfiGallery } from "react-icons/tfi";
import { AiOutlineSignature } from "react-icons/ai";

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
    <div className="py-4 px-2  md:mx-0  min-h-screen">
      {/* Header */}
      <div
        className={`mb-6  ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700"
        } p-6 `}
      >
        <h1 className="text-base font-bold">Add Teacher</h1>
        <p className={`text-xs  mt-1 ${darkMode?"text-gray-200":"text-gray-400"}`}>
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
           <span className="mx-1">/</span>Add teacher
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`px-6 py-4   space-y-4 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="text-center">Teacher Information</h2>
        {/* Grid layout for text inputs */}
        <div className="grid grid-cols-1  gap-4">
          <Input
            label="Teacher name"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
           
          />

          <Input
            label="ID number"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            type="text"
            disabled
            
          />

          <Input
            label="Mobile number"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            
          />

          <Input
            label="E-mail address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
           
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
           
          />

          <Input
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
           
          />

          <Input
            label="Join date"
            name="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={handleChange}
           
          />
        </div>

        {/* Upload Section */}
        {/* Upload Section */}
        <div className="grid grid-cols-1 gap-4 my-4">
          {/* Photo Upload */}
          <div>
           

            {!photoPreview ? (
              <div
                className="border border-dashed border-gray-300 h-18 flex flex-col items-center justify-center
        text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
              >
                <span className="text-xs flex items-center gap-2"><TfiGallery /> Upload Photo</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "photo")}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            ) : (
              <div className="relative h-12 w-full border rounded-lg overflow-hidden">
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
           

            {!signaturePreview ? (
              <div
                className="border border-dashed border-gray-300 h-18  flex flex-col items-center justify-center
        text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
              >
                <span className="text-xs flex items-center gap-2">  <AiOutlineSignature className="w-4 h-4"/>Upload Signature</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "signature")}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            ) : (
              <div className="relative h-12 w-full border rounded-lg overflow-hidden">
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
            className="px-6 h-8 border border-gray-300 w-full md:w-auto shdaow-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white shdaow-sm hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
