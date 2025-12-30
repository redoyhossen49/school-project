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

const router = createBrowserRouter([
  {
        path:"/",
        element:<Login></Login>,
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
    path: "/dashboard",
    element: <DashboardLayout></DashboardLayout>,
    children:[
      {
        index: true,
        element: <Dashboard />,
      },
     
      
       
    ]
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
