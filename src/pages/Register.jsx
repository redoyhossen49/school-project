import { NavLink, useMatch, Outlet } from "react-router-dom";
import LoginLogo from "../components/LoginLogo";

export default function Register({submitted}) {
  const isAdmission = useMatch("/register/admission");
   const showTabs = true; 

  return (
    <div className="min-h-screen bg-gray-100  flex items-center justify-center py-8 px-4">
      <div className="relative w-full max-w-md bg-white my-16  shadow-2xl px-8 py-16 transition-all duration-300 hover:scale-[1.01] ">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-4">
            <LoginLogo></LoginLogo>
          </div>

              {showTabs && !submitted && (
          <div className="flex mt-12 mb-8  gap-2  p-1 ">
            <NavLink
              to="/register"
              end
              className={({ isActive }) =>
                `w-1/2 text-center py-2 text-sm md:text-base font-semibold transition
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
                `w-1/2 text-center py-2 text-sm md:text-base font-semibold transition
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
            )}


          {!isAdmission && (
            <h2 className="text-lg md:text-2xl font-bold text-slate-600 transition-all duration-300">
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
