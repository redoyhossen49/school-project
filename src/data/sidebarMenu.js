import {
  LayoutDashboard,
  User,
  Users,
  GraduationCap,
  Layers
} from "lucide-react";

export const sidebarMenu = [
  {
    section: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [
          { label: "Admin Dashboard", path: "/admin" },
          { label: "Teacher Dashboard", path: "/teacher" },
          { label: "Student Dashboard", path: "/student" },
          { label: "Parent Dashboard", path: "/parent" },
        ],
      },
      {
        label: "Application",
        icon: Layers,
        path: "/application",
      },
    ],
  },
  {
    section: "LAYOUT",
    items: [
      {
        label: "Default",
        icon: LayoutDashboard,
        path: "/layout/default",
      },
      {
        label: "Mini",
        icon: User,
        path: "/layout/mini",
      },
      {
        label: "RTL",
        icon: Users,
        path: "/layout/rtl",
      },
      {
        label: "Box",
        icon: GraduationCap,
        path: "/layout/box",
      },
    ],
  },
];
