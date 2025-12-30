import { useState } from "react";
import Input from "./Input";
import { Link } from "react-router-dom";


export default function SchoolForm() {
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    eiin: "",
    referCode: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <>
      <form className="space-y-4">
        <Input
          label="School Name"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
        />

        <select className="input">
          <option>Division</option>
        </select>

        <select className="input">
          <option>District</option>
        </select>

        <select className="input">
          <option>Upazila</option>
        </select>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="EIIN Number"
            name="eiin"
            value={formData.eiin}
            onChange={handleChange}
          />
          <Input
            label="Refer Code"
            name="referCode"
            value={formData.referCode}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Mobile Number"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
        />

        <Input
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          type="password"
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <Input
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        {/* Upload */}
        <label className="block border-2 border-dashed rounded-xl p-4 text-center text-sm text-gray-500 cursor-pointer hover:border-indigo-600 transition">
          Drag & Drop or Browse
          <span className="block text-xs mt-1">Logo (PNG, JPG, PDF)</span>
          <input type="file" className="hidden" />
        </label>

        {/* Terms */}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="accent-indigo-600" />
          Terms & Privacy Policy
        </label>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold shadow-md
                       hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
        >
          Register School
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link to="/" className="text-indigo-600 font-semibold cursor-pointer hover:underline">
          Sign In
        </Link>
      </p>

      {/* Custom input style */}
      <style>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s ease;
          color: gray;

        }
          .input:hover{
         background-color: #D1D5DB;
          }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
      `}</style>
    </>
  );
}
