import { useState } from "react";
import { FaFacebookF, FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../components/Button";

import login from "../assets//images/login.jpg";
import { Link } from "react-router-dom";
import LoginLogo from "../components/LoginLogo";

export default function Login() {
  const [formData, setFormData] = useState({
    idNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // validation
  const validate = () => {
    let newErrors = {};

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID Number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log("Login Data:", formData);
      alert("Login Successful ✅");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center ">
        {/* Left Side */}
        <div className="hidden md:block  animate-fade-in-left">
          <h1 className="text-4xl text-gray-600 font-bold mb-4">
            Sign in to
            <span
              style={{ textShadow: "3px 3px 5px yellow" }}
              className=" animate-glow ml-3"
            >
              
              <span className="text-indigo-800"> Pre</span>
              <span className="text-gray-300">Skool</span>
            </span>
          </h1>
         

          <p className="text-gray-600 mb-2">
            If you don’t have an account register
          </p>
          <Link
            to="register"
            className="font-semibold text-blue-600  hover:underline"
          >
            You can Register here !
          </Link>

          <div
            className="relative cursor-pointer 
             transform scale-90  transition-all duration-900 delay-200
             hover:scale-105 hover:rotate-2 hover:brightness-110 
             hover:shadow-[0_10px_20px_rgba(99,102,241,0.4)]"
            style={{ transitionTimingFunction: "ease-out" }}
          >
            <div className="absolute -top-6 -left-6 rounded-3xl bg-indigo-500/30 h-auto w-auto md:h-full md:w-full" />

            <img
              src={login}
              alt="login"
              className="mt-12 relative z-10 rounded-3xl shadow-2xl  "
            />
          </div>
        </div>

        {/* Right Side Login Card */}
        <div className="bg-white rounded-2xl shadow-lg px-8 py-12 animate-fade-in-up relative">
          <LoginLogo></LoginLogo>
          <h2 className="text-2xl text-gray-600  font-bold text-center my-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID Number */}
            <div className="relative">
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder=" "
                className={`
      peer w-full border px-4 py-2 rounded-md
      focus:outline-none
      focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]
      placeholder:text-transparent
      ${
        errors.idNumber
          ? "border-red-500"
          : "border-gray-300 focus:border-blue-500"
      }
    `}
              />
              <label
                className={`
      absolute left-4 top-2 text-gray-400
      text-sm pointer-events-none
      transition-all duration-300
      peer-placeholder-shown:top-2
      peer-placeholder-shown:text-gray-400
      peer-placeholder-shown:text-base
      peer-focus:-top-3
      peer-focus:text-xs
      peer-focus:text-blue-600
      peer-focus:bg-white
      peer-not-placeholder-shown:-top-2
      peer-not-placeholder-shown:text-xs
      peer-not-placeholder-shown:text-gray-600
      peer-not-placeholder-shown:bg-white
      peer-not-placeholder-shown:px-1
      peer-focus:px-1
    `}
              >
                ID Number
              </label>

              {errors.idNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.idNumber}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                className={`peer w-full border px-4 py-2 rounded-md focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder-transparent
      ${
        errors.password
          ? "border-red-500"
          : "border-gray-300 focus:border-blue-500"
      }`}
              />
              <label
                htmlFor="password"
                className={`absolute left-4 top-2 text-gray-400 text-sm transition-all duration-300
      peer-placeholder-shown:top-2.5
      peer-placeholder-shown:text-base
      peer-placeholder-shown:text-gray-400
      peer-focus:-top-2
      peer-focus:text-xs
      peer-focus:text-blue-600
      peer-focus:bg-white
      peer-focus:px-1
      peer-not-placeholder-shown:-top-2
      peer-not-placeholder-shown:text-xs
      peer-not-placeholder-shown:text-gray-600
      peer-not-placeholder-shown:bg-white
      peer-not-placeholder-shown:px-1
      pointer-events-none
    `}
              >
                Password
              </label>

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                className="w-1/2 bg-blue-500 text-white py-2 rounded-md hover:bg-slate-700 hover:shadow-md hover:shadow-blue-800/50 transition-shadow duration-300"
              >
                Forget
              </button>

              <button
                type="submit"
                className="w-1/2 bg-blue-500 text-white py-2 rounded-md hover:bg-slate-700  hover:shadow-md hover:shadow-blue-800/50 transition-shadow duration-300"
              >
                Login
              </button>
            </div>
          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 mt-8 border py-2 rounded-lg border-gray-300">
            <Link to="register">
              Don’t have an account?
              <span className="text-blue-600 font-semibold ">Register</span>
            </Link>
          </p>

          {/* Social */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Join our Group</p>
            <div className="flex justify-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:scale-105 transition-all duration-500">
                <FaFacebookF />
              </div>
              <div className="bg-green-500 text-white p-3 rounded-full cursor-pointer hover:scale-105 transition-all duration-500">
                <FaWhatsapp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
