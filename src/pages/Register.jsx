import { NavLink, useMatch, Outlet } from "react-router-dom";
import LoginLogo from "../components/LoginLogo";
import Stepper from "../components/Stepper";

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
          <div className="flex w-full gap-3 mb-6">
  <NavLink
    to="/register"
    end
    className={({ isActive }) =>
      `flex-1 text-center py-2 text-sm md:text-base font-semibold transition
      ${isActive ? "bg-sky-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-purple-400"}`
    }
  >
    School
  </NavLink>

  <NavLink
    to="/register/admission"
    className={({ isActive }) =>
      `flex-1 text-center py-2 text-sm md:text-base font-semibold transition
      ${isActive ? "bg-sky-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-purple-400"}`
    }
  >
    Admission
  </NavLink>
</div>

            )}


          {!isAdmission && (
            <h2 className="text-base md:text-2xl  text-slate-600 transition-all duration-300">
              New School Registration
            </h2>
          )}
        </div>

          {/* Stepper */}
         

        {/* Form */}

        <Outlet />
      </div>
    </div>
  );
}