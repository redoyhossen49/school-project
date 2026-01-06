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
import { FiUsers, FiBell } from "react-icons/fi";
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
} from "react-icons/md";

import { BsCalendarDay } from "react-icons/bs";

import { VscCalendar } from "react-icons/vsc";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

import { GiBookAura } from "react-icons/gi";

import { SlCalender } from "react-icons/sl";
import { BiSolidSchool } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";

export const sidebarMenu = (role) => {
  // ================= Admin Menu =================
  const adminMenu = [
    {
      title: "Landing Page",
      icon: Home,
      children: [
        { title: "See", path: "/landing/see" },
        { title: "Edit", path: "/landing/edit" },
        { title: "Add", path: "/landing/add" },
      ],
    },
    {
      title: "Member Ship",
      icon: FiUsers,
      children: [
        { title: "Member Ship Plan", path: "/membership/plan" },
        { title: "Active Plan", path: "/membership/active" },
        {
          title: "Unactive Plan",
          path: "/membership/unactive",
        },
      ],
    },
    {
      title: "School Details",
      icon: BiSolidSchool,
      children: [
        { title: "School List", path: "/school/list" },
        { title: "Pending", path: "/school/pending" },
      ],
    },
    {
      title: "Transaction",
      icon: CreditCard,
      children: [
        { title: "Cash In History", path: "/transaction/cashin" },
        { title: "Cash Out History", path: "/transaction/cashout" },
        { title: "Profit History", path: "/transaction/profit" },
        { title: "Cash Out Request", path: "/transaction/request" },
        { title: "Cash Out", path: "/transaction/out" },
      ],
    },
    {
      title: "Financial & Profit",
      icon: RiMoneyDollarCircleLine,
      children: [
        { title: "Our Profit", path: "/financial/profit" },
        { title: "Our Balance", path: "/financial/balance" },
        { title: "Member Balance", path: "/financial/memberbalance" },
      ],
    },
    {
      title: "Dashboard",
      icon: RxDashboard,
      children: [
        { title: "School", path: "/dashboard/school" },
        { title: "Teacher", path: "/dashboard/teacher" },
        { title: "Student", path: "/dashboard/student" },
      ],
    },
    {
      title: "Integration API",
      icon: IoExtensionPuzzleOutline,
      children: [
        { title: "Add Payment", path: "/integration/payment" },
        { title: "Delivery API", path: "/integration/delivery" },
      ],
    },
    {
      title: "E-commerce",
      icon: ShoppingCart,
      children: [
        { title: "Category", path: "/ecommerce/category" },
        { title: "Product", path: "/ecommerce/product" },
        { title: "Product List", path: "/ecommerce/list" },
        { title: "Order Receive", path: "/ecommerce/order/receive" },
        { title: "Order Process", path: "/ecommerce/order/process" },
        { title: "Order Delivery", path: "/ecommerce/order/delivery" },
      ],
    },
    {
      title: "Profile Tool",
      icon: Settings,
      children: [
        { title: "Profile", path: "/profile" },
        { title: "Forget", path: "/profile/forget" },
        { title: "Reset", path: "/profile/reset" },
      ],
    },
  ];

  // ================= School Menu =================
  const schoolMenu = [
    { title: "Dashboard", icon:  RxDashboard, path: "/dashboard" },
    { title: "Membarship Plan", icon: FiUsers, path: "/membership" },

    { title: "Principle", icon: FaUserTie, path: "/principle" },

    {
      title: "Teacher",
      icon: UserCog,
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
          title: "Class Promote",
          path: "/student/promote",
        },
      ],
    },

    {
      title: "Guardian",
      icon: FaUsersSlash,
      children: [{ title: "Guardian List", path: "/guardian/list" }],
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
        { title: "Set Number", path: "/exam/setnumber" },
        { title: "Mark Submit", path: "/exam/marksubmit" },
        { title: "OMR Submit", path: "/exam/omrsubmit" },
        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: CreditCard,
      children: [
        { title: "Fees Collection", path: "/fee/collection-main" },
        { title: "Fees Group", path: "/fee/group" },
        { title: "Fees Type", path: "/fee/type" },
        { title: "Discount", path: "/fee/discount" },
        { title: "Fee List", path: "/fee/list" },
        { title: "Collection", path: "/fee/collection" },
      ],
    },

    {
      title: "HRM",
      icon: FaUsersBetweenLines,
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
      icon: FaListCheck, // group icon for attendance section
      children: [
        {
          title: "Teacher Attendance",
          path: "/attendance/teacher",
        },
        {
          title: "Student Attendance",
          path: "/attendance/student",
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon: SlCalender, // section icon for leaves
      children: [
        {
          title: "List Of Leave",
          path: "/leaves/list",
        },
        {
          title: "Request",
          path: "/leaves/request",
        },
      ],
    },

    {
      title: "Holiday",
      path: "/leaves/holiday",
      icon: BsCalendarDay, // holiday calendar
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
      icon: FaRegFilePdf, // Example icon for reports
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
      icon: Settings, // Main section icon
      children: [
        { title: "Forget", path: "/tool/forget" }, // Feather refresh icon
        { title: "Reset", path: "/tool/reset" }, // Feather rotate icon
        { title: "Delete", path: "/tool/delete" }, // Feather trash icon
      ],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
      children: [
        {
          title: "Academic Details",
          path: "/details/academic",
        },
        {
          title: " List of Ranking",
          path: "/details/schoollist",
        },
      ],
    },
  ];
  // ================= Teacher Menu =================
  const teacherMenu = [
    { title: "Dashboard", icon:  RxDashboard, path: "/dashboard" },

    {
      title: "Teacher",
      icon: UserCog,
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
      icon: FaUsersSlash,
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
        { title: "Set Number", path: "/exam/setnumber" },
        { title: "Mark Submit", path: "/exam/marksubmit" },
        { title: "OMR Submit", path: "/exam/omrsubmit" },
        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        {
          title: "Fees Collection",
          path: "/fee/collection-main",
        },
        { title: "Fee List", path: "/fee/list" },
        { title: "Collection", path: "/fee/collection" },
      ],
    },
    {
      title: "HRM",
      icon: FaUsersBetweenLines,
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
      icon: FaListCheck,
      children: [
        {
          title: "Teacher Attendance",
          path: "/attendance/teacher",
        },
        {
          title: "Student Attendance",
          path: "/attendance/student",
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon: VscCalendar, // section icon for leaves
      children: [
        {
          title: "List Of Leave",
          path: "/leaves/list",
        },
      ],
    },

    {
      title: "Holiday",
      path: "/leaves/holiday",
      icon: BsCalendarDay, // holiday calendar
    },
    {
      title: "Tool",
      icon: Settings,
      children: [{ title: "Forget", path: "/information/forget" }],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
      children: [
        { title: "Principle", path: "/details/principle" },
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
    { title: "Dashboard", icon:  RxDashboard, path: "/dashboard" },

    {
      title: "Teacher",
      icon: UserCog,
      children: [{ title: "Teacher List", path: "/teacher/list" }],
    },

    {
      title: "Student",
      icon: GraduationCap,
      children: [
        [
          { title: "Student List", path: "/student/list" },
          { title: "Student ID", path: "/student/id" },
          { title: "Class Time", path: "/student/time" },
          {
            title: "Class Promote",
            path: "/student/promote",
          },
          {
            title: "Assignment",
            path: "/teacher/assignment",
          },
          { title: "Live Class", path: "/student/live" },
        ],
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
        { title: "Set Number", path: "/exam/setnumber" },
        { title: "Mark Submit", path: "/exam/marksubmit" },
        { title: "OMR Submit", path: "/exam/omrsubmit" },
        { title: "Result Find", path: "/exam/result" },
        { title: "Certificate", path: "/exam/certificate" },
      ],
    },

    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        { title: "Fee List", path: "/fee/list" },
        { title: "Pay Fee", path: "/fee/pay" },
        { title: "Pay Slip", path: "/fee/payslip" },
      ],
    },

    {
      title: "Attendance",
      icon: FaListCheck,
      children: [{ title: "Student", path: "/attendance/student" }],
    },

    {
      title: "Leaves",
      icon: VscCalendar,
      children: [{ title: "Leave", path: "/leaves/leave" }],
    },

    { title: "Holiday", icon: BsCalendarDay, path: "/holiday" },

    {
      title: "Information",
      icon: Settings,
      children: [{ title: "Forget", path: "/information/forget" }],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
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
