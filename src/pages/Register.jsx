import { NavLink, useMatch, Outlet } from "react-router-dom";
import LoginLogo from "../components/LoginLogo";

export default function Register() {
  const isAdmission = useMatch("/register/admission");
  return (
    <div className="min-h-screen bg-gray-100  flex items-center justify-center  px-4">
      <div className="relative w-full max-w-md bg-white my-16 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:scale-[1.01] ">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-4">
            <LoginLogo></LoginLogo>
          </div>
          <div className="flex mt-12 mb-8  gap-2 rounded-xl p-1 ">
            <NavLink
              to="/register"
              end
              className={({ isActive }) =>
                `w-1/2 text-center py-2 rounded-lg font-semibold transition
              ${
                isActive
                  ? "bg-sky-600 text-white "
                  : "text-gray-600 bg-gray-300 hover:bg-purple-400"
              }`
              }
            >
              School
            </NavLink>

            <NavLink
              to="/register/admission"
              className={({ isActive }) =>
                `w-1/2 text-center py-2 rounded-lg font-semibold transition
              ${
                isActive
                  ? "bg-sky-600 text-white "
                  : "text-gray-600 bg-gray-300 hover:bg-purple-400"
              }`
              }
            >
              Admission
            </NavLink>
          </div>
          {!isAdmission && (
            <h2 className="text-2xl font-bold text-slate-600 transition-all duration-300">
              New School Registration
            </h2>
          )}
        </div>

        {/* Form */}

        <Outlet />
      </div>
    </div>
  );
}
