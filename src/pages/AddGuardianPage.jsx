import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Input from "../components/Input"; // your custom Input component
import { TfiGallery } from "react-icons/tfi";

export default function AddGuardianPage({ modal = false, onClose, onSave }) {
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
    if (modal && onSave) {
      onSave(formData);
      onClose?.();
      return;
    }
    navigate("/dashboard/school/guardianlist");
  };

  const handleCancel = () => {
    if (modal) {
      onClose?.();
      return;
    }
    navigate("guardianlist");
  };

  return (
    <div
      className={` rounded ${
        modal ? "w-72 p-6" : "py-3 px-2 min-h-screen"
      } flex flex-col items-center space-y-4 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`${
          modal ? "w-full" : "p-6"
        } space-y-4 overflow-y-auto ${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        <h2 className="font-semibold text-center">Guardian Information</h2>

        {/* Grid layout */}
        <div className={`grid ${modal ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
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
  type="text"
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
