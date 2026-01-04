import { useLocation, Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function SchoolSuccess() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="text-center mt-10">
        <h2>No registration data found</h2>
        <Link to="/register">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white text-center shadow-2xl px-8 py-14">

        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />

        <h2 className="text-base md:text-2xl font-bold text-blue-700 mb-2">
          School Registered Successfully 🎉
        </h2>

        <p className="text-sm md:text-base text-gray-600 mb-6">
          <span className="font-semibold text-purple-600">
            {state.schoolName}
          </span>
        </p>

        <div className="border shadow-lg  border-gray-200 text-white p-4 space-y-3 text-left mb-6">
          <Info label="School ID" value={state.id} />
          <Info label="Mobile" value={state.mobile} />
          <Info label="Password" value={state.password} />
        </div>

        <Link
          to="/"
          className="block bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
        >
          Go to Login
        </Link>

        <p className="text-xs text-gray-500 mt-6">
          © 2025 ASTHA ACADEMY
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-black text-black font-bold px-3 py-2 text-xs md:text-sm">
        {label}
      </div>
      <div className="bg-gray-200 px-3 py-2 text-xs md:text-sm text-gray-700 break-all">
        {value}
      </div>
    </div>
  );
}
