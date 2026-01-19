import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input"; // your custom Input component
import { TfiGallery } from "react-icons/tfi";

export default function AddGuardianPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    photo: null,
    division: "",
    district: "",
    upazila: "",
    village: "",
    phone: "",
    email: "",
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Set preview
      if (name === "photo") setPhotoPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("GUARDIAN DATA 👉", formData);
    alert("Guardian Added Successfully ✅");
    // API call can go here, then redirect
    navigate("/dashboard/school/guardianlist");
  };

  const handleCancel = () => {
    navigate("guardianlist");
  };

  return (
    <div
      className={`py-3 px-2  min-h-screen ${
        darkMode ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`mb-3 p-6  ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h1 className="text-base font-semibold">Add Guardian</h1>
        <p className="text-xs text-gray-500 mt-1">
          <Link to="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="mx-1">/</span>
          <Link  to="/school/dashboard/guardianlist" className="hover:text-indigo-600">
            Guardian
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-400">Add Guardian</span>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`p-6  space-y-4 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="font-semibold text-center">Guardian Information</h2>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Relation"
            name="relation"
            value={formData.relation}
            onChange={handleChange}
          />

          <Input
  label="Division"
  name="division"
  type="select"
  value={formData.division}
  onChange={handleChange}
  options={["Dhaka", "Chattogram", "Khulna", "Rajshahi"]}
/>

<Input
  label="District"
  name="district"
  type="select"
  value={formData.district}
  onChange={handleChange}
  options={["Gazipur", "Narsingdi", "Tangail", "Dhaka"]}
/>

<Input
  label="Upazila"
  name="upazila"
  type="select"
  value={formData.upazila}
  onChange={handleChange}
  options={["Sadar", "Kaliakair", "Narsingdi Sadar"]}
/>

<Input
  label="Village"
  name="village"
  type="select"
  value={formData.village}
  onChange={handleChange}
  options={["Village 1", "Village 2", "Village 3"]}
/>


          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {!photoPreview ? (
              <div
                className="border border-dashed border-gray-300 h-18 flex flex-col items-center justify-center
                  text-gray-400 relative cursor-pointer hover:border-indigo-400 transition"
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
                  onClick={() => removeImage("photo")}
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
             className="px-6 h-8 border border-gray-300 w-full md:w-auto  hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 h-8 w-full md:w-auto bg-green-600 text-white  hover:bg-green-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
