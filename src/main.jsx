import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DashboardLayout from "./Layouts/DashboardLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SchoolForm from "./components/SchoolForm";
import AdmissionForm from "./components/AdmissionForm";
import StudentSuccess from "./pages/StudentSuccess";
import SchoolSuccess from "./pages/SchoolSuccess";
import SettingsPage from "./pages/SettingsPage";


const router = createBrowserRouter([
  {
        path:"/",
        element:<Login></Login>,
      },

      {
        path: "/success",
        element: <StudentSuccess />,
      },
      {
        path: "/schoolsuccess",
        element: <SchoolSuccess />,
      },
      
      {
        path:"/register",
        element:<Register></Register>,
         children: [
      {
        index: true, 
        element: <SchoolForm/>,
      },
      {
        path: "admission", 
        element: <AdmissionForm />,
      },
      
    ],
      },
  {
    path: "/admin/dashboard",
    element: <DashboardLayout />,
    children: [
               // default page in dashboard
      { path: "settings", element: <SettingsPage /> },    // /admin/dashboard/settings
      // Add other nested routes here for admin dashboard
    ],
  },
  {
    path: "/teacher/dashboard",
    element: <DashboardLayout />,
    children: [
      
      { path: "settings", element: <SettingsPage /> },
      // other teacher routes
    ],
  },
  {
    path: "/student/dashboard",
    element: <DashboardLayout />,
    children: [
      
      { path: "settings", element: <SettingsPage /> },
      // other student routes
    ],
  },
  {
    path: "/school/dashboard",
    element: <DashboardLayout />,
    children: [
     
      { path: "settings", element: <SettingsPage /> },
      // other school routes
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>
);





