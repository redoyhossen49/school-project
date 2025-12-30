import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="bg-sky-400">

      <Outlet></Outlet>
    </div>
  );
}
