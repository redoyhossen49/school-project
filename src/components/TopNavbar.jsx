import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import AdminLogo from "../assets/images/adminLogo.webp";
import SchoolLogo from "../assets/images/school.webp";
import TeacherLogo from "../assets/images/teacher.jpg";
import StudentLogo from "../assets/images/student.avif";
import {
  FiBell,
  FiChevronDown,
  FiSearch,
  FiMoon,
  FiSun,
  FiShoppingCart,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { GiBookAura } from "react-icons/gi";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { GrEdit } from "react-icons/gr";

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "student";

  const [openDropdown, setOpenDropdown] = useState(null); // "profile" | "notifications" | "settings" | null
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const { darkMode, toggleTheme } = useTheme();
  const { toggleMobileSidebar, open, hovered } = useSidebar();
  const sidebarWidth = open || hovered ? 256 : 80;

  const isSchoolDashboard = location.pathname.includes("school/dashboard");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ================== ROLE CONFIG ==================
  const roleLogos = {
    admin: AdminLogo,
    school: SchoolLogo,
    teacher: TeacherLogo,
    student: StudentLogo,
  };

  const roleConfig = {
    admin: {
      profileMenu: [
        { label: "My Profile", path: "/profile" },
        { label: "Admin Settings", path: "/admin/settings" },
      ],
      extraMenu: [],
      profileData: {
        name: "Alice",
        title: "System Administrator",
        avatar: "https://i.pravatar.cc/40?img=32",
      },
      searchPlaceholder: "Search users, schools...",
      dashboardTitle: "Admin Dashboard",
    },
    school: {
      profileMenu: [{ label: "School Profile", path: "/profile" }],
      extraMenu: [{ icon: <FiShoppingCart />, path: "/school/ecommerce" }],
      profileData: {
        name: "Sunshine High School",
        title: "School Account",
        avatar: "https://i.pravatar.cc/40?img=50",
      },
      searchPlaceholder: "Search teachers, students...",
      dashboardTitle: "School Dashboard",
    },
    teacher: {
      profileMenu: [
        { label: "My Profile", path: "/profile" },
        { label: "My Classes", path: "/teacher/classes" },
      ],
      extraMenu: [],
      profileData: {
        name: "Michael Smith",
        title: "Teacher",
        avatar: "https://i.pravatar.cc/40?img=12",
      },
      searchPlaceholder: "Search students...",
      dashboardTitle: "Teacher Dashboard",
    },
    student: {
      profileMenu: [{ label: "My Profile", path: "/profile" }],
      extraMenu: [{ icon: <GiBookAura />, path: "/student/courses" }],
      profileData: {
        name: "John Doe",
        title: "Student",
        avatar: "https://i.pravatar.cc/40?img=3",
      },
      searchPlaceholder: "Search subjects...",
      dashboardTitle: "Student Dashboard",
    },
  };

  const config = roleConfig[role];

  // Sample notifications
  const notifications = [
    {
      id: 1,
      avatar: "https://i.pravatar.cc/40?img=32",
      name: "Dr. Patel",
      message: (
        <>
          completed a <strong>follow-up</strong> report for patient{" "}
          <strong>Emily</strong>.
        </>
      ),
      time: "8 min ago",
    },
    {
      id: 2,
      avatar: "https://i.pravatar.cc/40?img=12",
      name: "Emily",
      message: (
        <>
          booked an appointment with <strong>Dr. Patel</strong> for{" "}
          <strong>April 15</strong>.
        </>
      ),
      time: "15 min ago",
    },

    {
      id: 3,
      avatar: "https://i.pravatar.cc/40?img=32",
      name: "Dr. Patel",
      message: (
        <>
          completed a <strong>follow-up</strong> report for patient{" "}
          <strong>Emily</strong>.
        </>
      ),
      time: "8 min ago",
    },
    {
      id: 4,
      avatar: "https://i.pravatar.cc/40?img=12",
      name: "Emily",
      message: (
        <>
          booked an appointment with <strong>Dr. Patel</strong> for{" "}
          <strong>April 15</strong>.
        </>
      ),
      time: "15 min ago",
    },
    {
      id: 5,
      avatar: "https://i.pravatar.cc/40?img=32",
      name: "Dr. Patel",
      message: (
        <>
          completed a <strong>follow-up</strong> report for patient{" "}
          <strong>Emily</strong>.
        </>
      ),
      time: "8 min ago",
    },
    {
      id: 6,
      avatar: "https://i.pravatar.cc/40?img=12",
      name: "Emily",
      message: (
        <>
          booked an appointment with <strong>Dr. Patel</strong> for{" "}
          <strong>April 15</strong>.
        </>
      ),
      time: "15 min ago",
    },
  ];

  const toggleDropdown = (name) =>
    setOpenDropdown(openDropdown === name ? null : name);

  return (
    <nav
      className={`fixed top-0 z-20 h-16 flex items-center justify-between px-4 transition-all duration-300 ${
        darkMode
          ? "bg-gray-900 border-b border-gray-700 text-gray-200"
          : "bg-white text-gray-800 border-b border-gray-200"
      }`}
      style={{
        left: isDesktop ? sidebarWidth : 0,
        width: isDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%",
      }}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-xl" onClick={toggleMobileSidebar}>
          ☰
        </button>
        <img
          src={roleLogos[role]}
          alt={`${role} logo`}
          className="w-8 h-8 md:w-10 md:h-10 mx-4 rounded-full object-contain "
        />
        <div className="hidden md:flex items-center relative ml-6">
          <FiSearch size={18} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            className="w-64 pl-9 pr-3 py-2 rounded-md bg-white border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 border rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          {darkMode ? (
            <FiSun className=" w-3 h-3 md:w-5 md:h-5" />
          ) : (
            <FiMoon className="w-3 h-3 md:w-5 md:h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown("notifications")}
            className="border rounded-full p-2 relative  hover:bg-gray-100"
          >
            <FiBell className="w-3 h-3 md:w-5 md:h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">
                {notifications.length}
              </span>
            )}
          </button>

          {openDropdown === "notifications" && (
            <div
              className={`fixed md:absolute ${
                isDesktop
                  ? "md:right-4 md:top-12 md:mt-4"
                  : "top-24 left-1/2 w-64 -translate-x-1/2"
              } ${
                darkMode
                  ? "bg-gray-800 border border-gray-600 text-white shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                  : "bg-white border border-gray-200 text-gray-700 shadow-lg"
              } px-4 py-4 z-50 w-72 flex flex-col max-h-[80vh]`}
            >
              <div className="font-semibold  text-center mb-3  pt-4 pb-2">
                Notifications
              </div>

              {/* Scrollable notifications list */}
              <div className="flex-1 overflow-y-auto p-4 pb-8">
                <ul className="space-y-3">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="flex gap-3 cursor-pointer hover:bg-gray-500 p-2 rounded"
                    >
                      <img
                        src={notif.avatar}
                        alt={notif.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-semibold ">{notif.name}</span>
                        <span className=" text-sm">{notif.message}</span>
                        <span className="text-xs text-gray-400 mt-1">
                          {notif.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Extra Menu */}
        {config.extraMenu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="
      border rounded-full p-2 hover:bg-gray-100
    "
          >
            <span className="w-3 h-3 md:w-5 md:h-5 flex items-center justify-center">
              {item.icon}
            </span>
          </Link>
        ))}

        {/* Profile */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleDropdown("profile")}
            className="flex items-center gap-2"
          >
            <img
              src={config.profileData.avatar}
              alt={config.profileData.name}
              className="w-7 h-7 md:w-10 md:h-10 border-1 p-[2px] hover:bg-gray-100  rounded-full"
            />
            <FiChevronDown size={14} className="hidden md:block" />
          </button>

          {openDropdown === "profile" && (
            <div
              className={`fixed md:absolute ${
                isDesktop
                  ? "md:right-4 md:top-12 md:mt-4"
                  : "top-24 left-1/2 -translate-x-1/2"
              }  ${
                darkMode
                  ? "bg-gray-800 border border-gray-600 text-white shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                  : "bg-white border border-gray-200 text-gray-700 shadow-lg"
              } px-4 py-6 w-72 z-50`}
            >
              <div className="flex flex-col items-center mb-4">
                <img
                  src={config.profileData.avatar}
                  alt={config.profileData.name}
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
                <div className="font-semibold text-lg">
                  {config.profileData.name}
                </div>
                <div className="text-sm ">{config.profileData.title}</div>
              </div>

              <div className="flex flex-col text-sm space-y-1">
                {/* Edit Profile opens Settings */}
                <button
                  onClick={() => setOpenDropdown("settings")}
                  className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-500 w-full text-left"
                >
                  <span className="flex items-center gap-2">
                    <GrEdit className="text-lg" /> Edit Profile
                  </span>
                  <FiChevronRight />
                </button>

                <Link
                  to={`/${role}/dashboard/settings`} // role can be "admin", "teacher", etc.
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-500"
                >
                  <span className="flex items-center gap-2">
                    <FiSettings className="text-lg" /> Profile Settings
                  </span>
                  <FiChevronRight />
                </Link>

                {isSchoolDashboard && (
                  <Link
                    to="/principal/select"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-500"
                  >
                    <span className="flex items-center gap-2">
                      <FiUsers className="text-lg" /> Principal Select
                    </span>
                    <FiChevronRight />
                  </Link>
                )}

                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    navigate("/");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded text-red-600 hover:bg-red-300"
                >
                  <FiLogOut className="text-lg" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        {openDropdown === "settings" && (
          <div
            className={`fixed md:absolute ${
              isDesktop
                ? "md:right-8 md:top-16 md:mt-4"
                : "top-24 left-1/2 -translate-x-1/2"
            }  ${
              darkMode
                ? "bg-gray-800 border border-gray-600 text-white shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                : "bg-white border border-gray-200 text-gray-700 shadow-lg"
            } w-80 z-50 max-h-[80vh] flex flex-col p-4`}
          >
            {/* HEADER */}
            <div className="px-4 py-3 border-b font-semibold  shrink-0">
              Settings
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Profile Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={config.profileData.avatar}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                  <button className="text-sm text-indigo-600 hover:underline">
                    Change
                  </button>
                </div>
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setOpenDropdown(null)}
                className="px-4 py-2 text-sm rounded text-black border border-gray-500 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm rounded bg-indigo-600 text-white">
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
