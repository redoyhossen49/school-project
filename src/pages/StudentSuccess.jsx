import { Link,useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function StudentSuccess() {
    const { state } = useLocation();
     if (!state) {
    return (
      <div className="text-center mt-10">
        <h2>No admission data found</h2>
        <Link to="/register">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100  flex items-center justify-center py-8 px-4">
    <div className="relative w-full max-w-md bg-white my-16 mx-auto text-center shadow-2xl px-8 py-16 transition-all duration-300 hover:scale-[1.01] ">
      
      {/* Logo / Icon */}
      <div className="flex justify-center mb-4 animate-fade-in-up ">
        <FaCheckCircle className="text-green-500 text-6xl" />
      </div>

      {/* Title */}
      <h2 className=" text-xl md:text-2xl font-bold mb-2 text-blue-700">Congratulations!</h2>
      <p className="text-gray-600 text-sm md:text-base mb-6">
        Dear <span className="font-semibold text-lg text-purple-600">{state.studentname}</span>,  
        Your registration has been successful.
      </p>

      {/* School */}
      <h3 className=" text-base md:text-lg font-semibold mb-6 text-indigo-600">
         {state.school}
      </h3>

      {/* Info Box */}
      <div className="border shadow-lg  border-gray-200 text-white p-4 space-y-3 text-left mb-6">
        <Info label="ID Number" value={state.idNumber} />
        <Info label="Mobile Number" value={state.mobileNumber} />
        <Info label="Password" value={state.password} />
      </div>


      <div className=" font-bold my-6 text-xs md:text-base ">
        <p>-- Complete Your Admission --</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Link
          to="/"
          className="w-1/2 border px-2 py-3 font-semibold text-center hover:bg-gray-100"
        >
          Login
        </Link>

        <button
          className="w-1/2 bg-blue-600 text-white px-2 py-3 font-semibold hover:bg-blue-700"
        >
          Pay Now
        </button>
      </div>

      <p className="text-xs text-gray-700 my-6">
        © 2024 ASTHA ACADEMY · EDUCATION FIRST
      </p>
    </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      
      {/* Label */}
      <div className="border border-black text-black font-bold px-3 py-2 text-xs md:text-sm">
        {label}
      </div>

      {/* Value */}
      <div className="bg-gray-200 px-3 py-2 text-xs md:text-sm text-gray-700 break-all">
        <p className="text-xs md:text-smfont-semibold text-gray-700 break-all">
          {value}
        </p>
      </div>
     
    </div>
  );
}