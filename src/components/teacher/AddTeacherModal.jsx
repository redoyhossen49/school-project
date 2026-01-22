import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Input from "../Input";
import { TfiGallery } from "react-icons/tfi";
import { AiOutlineSignature } from "react-icons/ai";

export default function AddTeacherModal({ open, onClose, onAdd }) {
  const { darkMode } = useTheme();

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
    if (open) {
      const generatedId = "TCH" + Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({ ...prev, idNumber: generatedId }));
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
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
      setPhotoPreview(null);
      setSignaturePreview(null);
    }
  }, [open]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);

    if (type === "photo") {
      setPhotoPreview(previewURL);
      setFormData((prev) => ({ ...prev, photo: file }));
    } else {
      setSignaturePreview(previewURL);
      setFormData((prev) => ({ ...prev, signature: file }));
    }
  };

  const removeImage = (type) => {
    if (type === "photo") {
      setPhotoPreview(null);
      setFormData((prev) => ({ ...prev, photo: null }));
    } else {
      setSignaturePreview(null);
      setFormData((prev) => ({ ...prev, signature: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("TEACHER DATA 👉", formData);
    if (onAdd) {
      onAdd(formData);
    }
    alert("Teacher Added Successfully ✅");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center  p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-700"}
          w-72
          max-h-[70vh] overflow-y-auto
          rounded-lg shadow-xl
          border ${darkMode ? "border-gray-600" : "border-gray-200"}
          p-6
        `}
      >
        <h2 className="text-lg font-semibold text-center mb-4">
          Add Teacher
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid layout for text inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {/* Photo Upload */}
            <div>
              {!photoPreview ? (
                <div
                  className={`border border-dashed h-18 flex flex-col items-center justify-center
                    text-gray-400 relative cursor-pointer hover:border-indigo-400 transition
                    ${darkMode ? "border-gray-600" : "border-gray-300"}
                  `}
                >
                  <span className="text-xs flex items-center gap-2">
                    <TfiGallery /> Upload Photo
                  </span>

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
                    type="button"
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
                  className={`border border-dashed h-18 flex flex-col items-center justify-center
                    text-gray-400 relative cursor-pointer hover:border-indigo-400 transition
                    ${darkMode ? "border-gray-600" : "border-gray-300"}
                  `}
                >
                  <span className="text-xs flex items-center gap-2">
                    <AiOutlineSignature className="w-4 h-4" /> Upload Signature
                  </span>

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
                    type="button"
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
          <div className="flex w-full gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 h-8 border w-1/2 hover:bg-gray-100 transition
                ${darkMode 
                  ? "border-gray-500 text-gray-200 hover:bg-gray-700" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 h-8 bg-green-600 text-white w-1/2 hover:bg-green-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
