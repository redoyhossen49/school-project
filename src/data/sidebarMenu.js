import {
  Home,
  GraduationCap,
  UserCog,
  BookOpen,
  CreditCard,
  ShoppingCart,
  Wallet,
  Settings,
} from "lucide-react";
import { FiUsers, FiBell, FiCalendar } from "react-icons/fi";
import {
  FaSchool,
  FaUserTie,
  FaRegFilePdf,
  FaUsersSlash,
} from "react-icons/fa";
import { FaUsersBetweenLines, FaListCheck } from "react-icons/fa6";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

import {
  MdOutlineDashboard,
  MdOutlineFormatListNumberedRtl,
  MdOutlineShoppingBag,
} from "react-icons/md";

import { BsCalendarDay } from "react-icons/bs";

import { VscCalendar } from "react-icons/vsc";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

import { GiBookAura } from "react-icons/gi";

import { SlCalender } from "react-icons/sl";
import { BiReset, BiSolidCalendarExclamation, BiSolidSchool } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import { LuCalendarCheck2, LuCalendarClock, LuLayoutDashboard, LuUserRoundPlus, LuUsers } from "react-icons/lu";
import { TbAddressBook, TbApiApp, TbList, TbReportMoney, TbSchoolBell, TbUsersGroup, TbUserShield } from "react-icons/tb";
import { GrTransaction } from "react-icons/gr";

export const sidebarMenu = (role) => {
  // ================= Admin Menu =================
  const adminMenu = [
    {
      title: "Dashboard",
      icon:  LuLayoutDashboard,
      children: [
        { title: "Admin", path: "/admin/dashboard" },
        { title: "School", path: "/school/dashboard" },
        { title: "Teacher", path: "/teacher/dashboard" },
        { title: "Student", path: "/student/dashboard" },
      ],
    },
    {
      title: "Landing Page",
      icon: Home,

      children: [
        { title: "view", path: "/landing/see" },
        { title: "Edit Page", path: "/landing/edit" },
        { title: "Add Page", path: "/landing/add" },
      ],
    },
    {
      title: "Member Ship",
      icon: LuUserRoundPlus,
      children: [
        { title: "Create Plan", path: "/membership/plan" },
        { title: "Active Plan", path: "/membership/active" },
        {
          title: "Unactive Plan",
          path: "/membership/unactive",
        },
      ],
    },
    {
      title: "School Details",
      icon:  TbSchoolBell,
      children: [
        { title: "School List", path: "/school/list" },
        { title: "Pending List", path: "/school/pending" },
      ],
    },
    {
      title: "Transaction",
      icon: GrTransaction,
      children: [
        { title: "Cash In History", path: "/transaction/cashin" },
        { title: "Cash Out History", path: "/transaction/cashout" },
        { title: "Profit history", path: "/transaction/profit" },
        { title: "Cash Out Request", path: "/transaction/request" },
      ],
    },
    {
      title: "Financial & Profit",
      icon:  TbReportMoney,
      children: [
        { title: "Our Profit", path: "/financial/profit" },
        { title: "Our Balance", path: "/financial/balance" },
        { title: "Member Balance", path: "/financial/memberbalance" },
      ],
    },

    {
      title: "Integration API",
      icon: TbApiApp,
      children: [
        { title: " Payment API", path: "/integration/payment" },
        { title: "Delivery API", path: "/integration/delivery" },
      ],
    },
    {
      title: "E-commerce",
      icon: MdOutlineShoppingBag,
      children: [
        { title: "Category", path: "/ecommerce/category" },
        { title: "Product", path: "/ecommerce/product" },
        { title: "Order Receive", path: "/ecommerce/order/receive" },
        { title: "Order Process", path: "/ecommerce/order/process" },
        { title: "Order Delivery", path: "/ecommerce/order/delivery" },
      ],
    },
    {
      title: "Profile Tool",
      icon:  BiReset,
      children: [
        { title: "Forget", path: "/profile/forget" },
        { title: "Reset", path: "/profile/reset" },
      ],
    },
  ];

  // ================= School Menu =================
  const schoolMenu = [
    { title: "Dashboard", icon: LuLayoutDashboard, path: "/school/dashboard" },
    

   

    {
      title: "Teacher",
      icon: LuUsers,
      children: [
        { title: "Teacher List", path: "/teacher/list" },
        { title: "Teacher ID", path: "/teacher/id" },
        {
          title: "Class Permission",
          path: "/teacher/permission",
        },
      ],
    },

    {
      title: "Student",
      icon: GraduationCap,
      children: [
        { title: "Student List", path: "/student/list" },
        { title: "Student ID", path: "/student/id" },
        { title: "Class Time", path: "/student/time" },
        {
          title: " Promote Request",
          path: "/student/promote",
        },
      ],
    },

    {
      title: "Guardian",
      icon: TbUserShield,
      children: [{ title: "Guardian List", path: "/guardian/list" }],
    },

    {
      title: "Academic",
      icon: TbAddressBook,
      children: [
        { title: "Class", path: "/academic/class" },
        { title: "Group", path: "/academic/group" },
        { title: "Section", path: "/academic/section" },
        { title: "Session", path: "/academic/session" },
        { title: "Subject", path: "/academic/subject" },
        { title: "Syllabus", path: "/academic/syllabus" },
        { title: "Class Routine", path: "/academic/routine" },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name" },
        { title: "Exam Routine", path: "/exam/routine" },
        { title: "Grade", path: "/exam/grade" },
        { title: "Admit Card", path: "/exam/admit" },
        { title: "Sit Number", path: "/exam/setnumber" },

        { title: "Schedule", path: "/exam/schedule" },
        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: CreditCard,
      children: [
        { title: "Fees Group", path: "/fee/group" },
        { title: "Fees Type", path: "/fee/type" },
        { title: "Discount", path: "/fee/discount" },
        { title: "Fees List", path: "/fee/list" },
        { title: "Collection", path: "/fee/collection" },
      ],
    },

    {
      title: "HRM",
      icon: TbUsersGroup ,
      children: [
        {
          title: "Employee",
          path: "/hrm/employee",
        },
        { title: "Payroll", path: "/hrm/payroll" },
      ],
    },

    {
      title: "Attendance",
      icon: LuCalendarCheck2, // group icon for attendance section
      children: [
        {
          title: "Teacher ",
          path: "/attendance/teacher",
        },
        {
          title: "Student ",
          path: "/attendance/student",
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon: LuCalendarClock , // section icon for leaves
      children: [
        {
          title: "Request",
          path: "/leaves/request",
        },
        {
          title: "Leave List  ",
          path: "/leaves/list",
        },
      ],
    },

    {
      title: "Holiday",
      path: "/holiday",
      icon: FiCalendar, // holiday calendar
    },

    {
      title: "Financial & Account",
      icon: Wallet, // Main section icon
      children: [
        { title: "Income", path: "/financial/income" },
        { title: "Expense", path: "/financial/expense" },
        { title: "Product", path: "/financial/product" },
        { title: "Supplier", path: "/financial/supplier" },
        { title: "Purchase", path: "/financial/purchase" },
        { title: "Return", path: "/financial/return" },
        { title: "Payment", path: "/financial/payment" },
      ],
    },

    {
      title: "Announcement",
      icon: FiBell,
      children: [
        {
          title: "Send Notice",
          path: "/notice",
        },
      ],
    },

    {
      title: "Report",
      icon: BiSolidCalendarExclamation, // Example icon for reports
      children: [
        { title: "Today", path: "/report/today" },
        {
          title: "Monthly",
          path: "/report/monthly",
        },
        {
          title: "Cash In",
          path: "/report/cash-in",
        },
        { title: "Cash Out", path: "/report/cash-out" },
        {
          title: "Order Process",
          path: "/report/order-process",
        },
        { title: "Collection", path: "/report/collection" },
        { title: "Profit Loss", path: "/report/profit-loss" },
      ],
    },

    {
      title: "Tools",
      icon: BiReset, // Main section icon
      children: [
        { title: "Forget", path: "/tool/forget" }, // Feather refresh icon
        { title: "Reset", path: "/tool/reset" }, // Feather rotate icon
        { title: "Delete", path: "/tool/delete" }, // Feather trash icon
      ],
    },

    {
      title: "Details Item",
      icon: TbList,
      children: [
        {
          title: "Academic ",
          path: "/details/academic",
        },
         { title: "Principal", icon: FaUserTie, path: "/principal" },
        {
          title: "School List ",
          path: "/details/schoollist",
        },
      ],
    },
  ];
  // ================= Teacher Menu =================
  const teacherMenu = [
    { title: "Dashboard", icon: RxDashboard, path: "/teacher/dashboard" },

    {
      title: "Teacher",
      icon:  LuUsers,
      children: [
        { title: "Teacher List", path: "/teacher/list" },
        { title: "Teacher ID", path: "/teacher/id" },
        {
          title: "Class Permission",
          path: "/teacher/permission",
        },
        {
          title: "Assignment",
          path: "/teacher/assignment",
        },
        { title: "Live Class", path: "/teacher/live" },
        { title: "Attendance", path: "/teacher/attendance" },
      ],
    },

    {
      title: "Student",
      icon: GraduationCap,
      children: [
        { title: "Student List", path: "/student/list" },
        { title: "Student ID", path: "/student/id" },
        { title: "Class Time", path: "/student/time" },

        { title: "Attendance", path: "/student/attendance" },
      ],
    },

    {
      title: "Guardian",
      icon: TbUserShield,
      children: [
        { title: "Guardian List", path: "/guardian/list" },
        {
          title: "Complain",
          path: "/guardian/complain",
        },
      ],
    },

    {
      title: "Academic",
      icon: TbAddressBook,
      children: [
        { title: "Class", path: "/academic/class" },
        { title: "Group", path: "/academic/group" },
        { title: "Section", path: "/academic/section" },
        { title: "Session", path: "/academic/session" },
        { title: "Subject", path: "/academic/subject" },
        { title: "Syllabus", path: "/academic/syllabus" },
        { title: "Class Routine", path: "/academic/routine" },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name" },
        { title: "Exam Routine", path: "/exam/routine" },
        { title: "Grade", path: "/exam/grade" },
        { title: "Admit Card", path: "/exam/admit" },
        { title: "Sit Number", path: "/exam/sitnumber" },
        { title: "Mark Submit", path: "/exam/marksubmit" },
        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        { title: "Fees List", path: "/fee/list" },
        { title: "Payment", path: "/fee/payment" },
      ],
    },
    {
      title: "HRM",
      icon: TbUsersGroup,
      children: [
        {
          title: "Employee",
          path: "/hrm/employee",
        },
        { title: "Payroll", path: "/hrm/payroll" },
      ],
    },

    {
      title: "Attendance",
      icon: LuCalendarCheck2,
      children: [
        {
          title: "Teacher ",
          path: "/attendance/teacher",
        },
        {
          title: "Student ",
          path: "/attendance/student",
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon:LuCalendarClock , // section icon for leaves
      children: [
        {
          title: "Leave Request",
          path: "/leaves/list",
        },
      ],
    },

    {
      title: "Holiday",
      path: "/leaves/holiday",
      icon: FiCalendar, // holiday calendar
    },
    {
      title: "Tool",
      icon: BiReset,
      children: [{ title: "Forget", path: "/information/forget" }],
    },

    {
      title: "Details Item",
      icon:  TbList,
      children: [
        { title: "Principal", path: "/details/principle" },
        { title: "Academic", path: "/details/academic" },
        {
          title: "School List",
          path: "/details/schoollist",
        },
      ],
    },
  ];

  // ================= Student Menu =================
  const studentMenu = [
    {
      title: "Dashboard",
      icon: RxDashboard,
      path: "/student/dashboard",
    },

    {
      title: "Teacher",
      icon: UserCog,
      children: [{ title: "Teacher List", path: "/teacher/list" }],
    },

    {
      title: "Student",
      icon: GraduationCap,
      children: [
        { title: "Student List", path: "/student/list" },
        { title: "Student ID", path: "/student/id" },
        { title: "Class Time", path: "/student/time" },
        { title: "Class Promote", path: "/student/promote" },
        { title: "Assignment", path: "/teacher/assignment" },
        { title: "Live Class", path: "/student/live" },
      ],
    },

    {
      title: "Academic",
      icon: GiBookAura,
      children: [
        { title: "Class", path: "/academic/class" },
        { title: "Group", path: "/academic/group" },
        { title: "Section", path: "/academic/section" },
        { title: "Session", path: "/academic/session" },
        { title: "Subject", path: "/academic/subject" },
        { title: "Syllabus", path: "/academic/syllabus" },
        { title: "Class Routine", path: "/academic/routine" },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name" },
        { title: "Exam Routine", path: "/exam/routine" },
        { title: "Grade", path: "/exam/grade" },
        { title: "Admit Card", path: "/exam/admit" },
        { title: "Sit Number", path: "/exam/setnumber" },

        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        { title: "Fees List", path: "/fee/list" },
        { title: "Pay Fee", path: "/fee/pay" },
        { title: "Pay Slip", path: "/fee/payslip" },
      ],
    },

    {
      title: "Attendance",
      icon: LuCalendarCheck2,
      children: [{ title: "Student ", path: "/attendance/student" }],
    },

    {
      title: "Leaves",
      icon: LuCalendarClock,
      children: [{ title: "Leave", path: "/leaves/leave" }],
    },

    {
      title: "Holiday",
      icon: FiCalendar,
      path: "/holiday",
    },

    {
      title: "Information",
      icon: Settings,
      children: [{ title: "Forget", path: "/information/forget" }],
    },

    {
      title: "Details Item",
      icon: TbList,
      children: [
        { title: "Principle", path: "/details/principle" },
        { title: "Academic", path: "/details/academic" },
        { title: "School List", path: "/details/schoollist" },
      ],
    },
  ];

  if (role === "admin") return adminMenu;
  if (role === "school") return schoolMenu;
  if (role === "teacher") return teacherMenu;
  if (role === "student") return studentMenu;
  return [];
};
