import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AdminLogo from "../assets/images/admin.jpg";
import SchoolLogo from "../assets/images/school.webp";
import TeacherLogo from "../assets/images/teacher.png";
import StudentLogo from "../assets/images/student.jpg";
import {
  FiBell,
  FiChevronDown,
  FiSearch,
  FiX,
  FiMoon,
  FiSun,
  FiShoppingCart,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { GiBookAura } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";

export default function TopNavbar() {

  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "student";

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const { darkMode, toggleTheme } = useTheme();
  const { toggleMobileSidebar, open, hovered } = useSidebar();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = open || hovered ? 256 : 80;

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
      extraMenu: [], // no extra icon
      profileData: {
        name: "Alice ",
        title: "System Administrator",
        avatar: "https://i.pravatar.cc/40?img=32",
      },
      searchPlaceholder: "Search users, schools...",
      dashboardTitle: "Admin Dashboard",
    },
    school: {
      profileMenu: [{ label: "School Profile", path: "/profile" }],
      extraMenu: [
        { icon: <FiShoppingCart />, path: "/school/ecommerce" }, // E-commerce icon
      ],
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
      extraMenu: [
        { icon: <GiBookAura />, path: "/student/courses" }, // Courses icon
      ],
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
  ];

  return (
    <nav
      className={`fixed top-0 z-20 h-16 border-b flex items-center justify-between px-4
        transition-all duration-300
        ${darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"}`}
      style={{
        left: isDesktop ? sidebarWidth : 0,
        width: isDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%",
      }}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button className="md:hidden text-xl" onClick={toggleMobileSidebar}>
          ☰
        </button>
        <img
          src={roleLogos[role]}
          alt={`${role} logo`}
          className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full border border-yellow-700"
        />

        {/* Desktop Search */}
        <div className="hidden md:flex items-center relative ml-6">
          <FiSearch size={18} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            className="w-64 pl-9 pr-3 py-2 rounded-md
              bg-white border border-gray-300
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 md:hidden flex items-center
          transition-all duration-300
          ${
            mobileSearchOpen
              ? "h-16 opacity-100 py-2 px-4"
              : "h-0 opacity-0 py-0 px-0 pointer-events-none"
          }`}
      >
        <div className="relative flex-1 bg-white rounded-full">
          <input
            autoFocus={mobileSearchOpen}
            type="text"
            placeholder={config.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2 rounded-full border
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden p-2 border rounded-full text-yellow-700 hover:bg-gray-100 "
        >
          <FiSearch size={10} className=" md:w-5 md:h-5" />
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 border rounded-full flex items-center justify-center text-yellow-700 hover:bg-gray-100 "
        >
          {darkMode ? (
            <FiSun size={10} className="md:w-4 md:h-4" />
          ) : (
            <FiMoon size={10} className="md:w-5 md:h-5" />
          )}
        </button>

        {/* Global Settings (Always Visible) */}
        {/* Global Settings */}
        <div className="relative">
          <button
            onClick={() => {
              setSettingsOpen(!settingsOpen);
              setNotificationOpen(false);
              setProfileOpen(false);
            }}
            className="border rounded-full p-2 text-yellow-700 hover:bg-gray-100
               flex items-center justify-center"
            aria-label="Settings"
          >
            <FiSettings size={10} className="md:w-5 md:h-5" />
          </button>

          {settingsOpen && (
            <div
              className={`fixed md:absolute
      ${
        isDesktop
          ? "md:right-4 md:top-12 md:mt-4"
          : "top-24 left-1/2 -translate-x-1/2"
      }
      bg-white rounded shadow-lg w-80 z-50
      max-h-[80vh] flex flex-col p-4
    `}
            >
              {/* HEADER */}
              <div className="px-4 py-3 border-b font-semibold text-gray-700 shrink-0">
                Settings
              </div>

              {/* CONTENT (ONLY THIS SCROLLS) */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-500 rounded px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-500 rounded px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-500  rounded px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-500 rounded px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-4 py-3 border-t flex justify-end gap-2">
                <button
                  onClick={() => setSettingsOpen(false)}
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

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="border rounded-full p-2 relative text-yellow-700 hover:bg-gray-100 "
            aria-label="Notifications"
          >
            <FiBell size={10} className=" md:w-5 md:h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">
                {notifications.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div
              className={`fixed md:absolute
                ${
                  isDesktop
                    ? "md:right-4 md:top-12 md:mt-4"
                    : "top-24 left-1/2 w-64 -translate-x-1/2"
                }
                bg-white rounded shadow-lg px-4 py-8 z-50 text-center w-72`}
            >
              <div className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Notifications
              </div>
              <ul>
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className="flex gap-3 mb-4 last:mb-0 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  >
                    <img
                      src={notif.avatar}
                      alt={notif.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-800">
                        {notif.name}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {notif.message}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {notif.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-3 text-center">
                <Link
                  to="/notifications"
                  className="text-indigo-600 hover:underline font-semibold text-sm"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        {/* Extra Menu Items */}
        {config.extraMenu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="border rounded-full p-1 md:p-2 hover:bg-gray-100 flex items-center justify-center text-yellow-700 transition-colors"
          >
            {item.icon}
          </Link>
        ))}
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center  gap-2 text-yellow-700 "
            aria-label="Profile Menu"
          >
            <img
              src={config.profileData.avatar}
              alt={config.profileData.name}
              className="w-7 h-7 md:w-10 md:h-10 border-1 p-[2px] hover:bg-gray-100  border-yellow-700 rounded-full"
            />
            <FiChevronDown size={14} className="hidden md:block" />
          </button>

          {profileOpen && (
            <div
              className={`fixed md:absolute
      ${
        isDesktop
          ? "md:right-4 md:top-12 md:mt-4"
          : "top-24 left-1/2 -translate-x-1/2"
      }
      bg-white rounded shadow-lg px-4 py-6 w-72 z-50`}
            >
              {/* Profile Info */}
              <div className="flex flex-col items-center space-y-2 mb-4 text-center">
                <img
                  src={config.profileData.avatar}
                  alt={config.profileData.name}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div className="w-64 border-b my-2" />

                <div className="font-semibold text-lg">
                  {config.profileData.name}
                </div>

                <div className="text-sm text-gray-600">
                  {config.profileData.title}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col text-sm">
                {/* Profile Settings */}
                <Link
                  to="/profile/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded
                   hover:bg-gray-100 text-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <FiSettings className="text-lg" />
                    Profile Settings
                  </span>
                  <FiChevronRight />
                </Link>

                {/* Principal Select */}
                <Link
                  to="/principal/select"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded
                   hover:bg-gray-100 text-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <FiUsers className="text-lg" />
                    Principal Select
                  </span>
                  <FiChevronRight />
                </Link>

                <div className="border-t my-2" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                     navigate("/");
                    // logout logic
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded
                   text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="text-lg" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
