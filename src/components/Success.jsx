import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function Success({ data }) {
  return (
    <div className="max-w-md mx-auto bg-gray-300 rounded-2xl shadow-lg p-8 text-center">
      
      {/* Logo / Icon */}
      <div className="flex justify-center mb-4 animate-fade-in-up ">
        <FaCheckCircle className="text-green-500 text-6xl" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2 text-blue-700">Congratulations!</h2>
      <p className="text-gray-600 mb-6">
        Dear <span className="font-semibold text-xl text-purple-600">{data.studentname}</span>,  
        Your registration has been successful.
      </p>

      {/* School */}
      <h3 className="text-lg font-semibold mb-6 text-indigo-600">
         {data.school}
      </h3>

      {/* Info Box */}
      <div className="border bg-slate-400 text-white rounded-xl p-4 space-y-3 text-left mb-6">
        <Info label="ID Number" value={data.idNumber} />
        <Info label="Mobile Number" value={data.mobileNumber} />
        <Info label="Password" value={data.password} />
      </div>


      <div className=" font-bold my-6 ">
        <p>------ Complete Your Admission ------</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Link
          to="/"
          className="w-1/2 border rounded-xl py-3 font-semibold text-center hover:bg-gray-100"
        >
          Login
        </Link>

        <button
          className="w-1/2 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700"
        >
          Pay Now
        </button>
      </div>

      <p className="text-xs text-gray-700 mt-6">
        © 2024 PRESKOOL ACADEMY · EDUCATION FIRST
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      
      {/* Label */}
      <div className="border border-white font-bold rounded-lg px-3 py-2">
        <p className="text-sm text-white">{label}</p>
      </div>

      {/* Value */}
      <div className="border border-white/50 rounded-lg px-3 py-2 bg-white">
        <p className="text-sm font-semibold text-gray-700 break-all">
          {value}
        </p>
      </div>

    </div>
  );
}