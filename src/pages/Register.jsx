import { NavLink, useMatch, Outlet } from "react-router-dom";
import LoginLogo from "../components/LoginLogo";

export default function Register({ submitted }) {
  const isAdmission = useMatch("/register/admission");
  const showTabs = true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Card */}
      <div className="relative w-full max-w-md bg-white shadow-lg rounded-lg px-8 pt-12 pb-4 my-16 animate-fade-in-up transition-all duration-300 hover:scale-[1.01]">
        
        {/* LoginLogo Centered */}
        <div className="flex justify-center mb-6">
          <LoginLogo />
        </div>

        {/* Tabs */}
        {showTabs && !submitted && (
          <div className="flex w-full gap-3 mb-6">
            <NavLink
              to="/register"
              end
              className={({ isActive }) =>
                `flex-1 text-center h-8 leading-8 text-sm  font-semibold transition
                ${isActive ? "bg-sky-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-purple-400"}`
              }
            >
              School
            </NavLink>

            <NavLink
              to="/register/admission"
              className={({ isActive }) =>
                `flex-1 text-center h-8 leading-8 text-sm md:text-base font-semibold transition
                ${isActive ? "bg-sky-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-purple-400"}`
              }
            >
              Admission
            </NavLink>
          </div>
        )}

        {/* Title */}
        {!isAdmission && (
          <h2 className="text-base md:text-2xl text-slate-600 font-bold text-center mb-6">
            New School Registration
          </h2>
        )}

        {/* Stepper (Optional) */}
        {/* যদি Login এর মতো stepper থাকে, এখানে include করতে পারো */}
        {/* <Stepper step={currentStep} /> */}

        {/* Form */}
        <div className="space-y-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
