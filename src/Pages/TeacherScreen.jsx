import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SlideBar from "../components/Slidebar";

const TeacherScreen = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar toggleSidebar={toggleMobileSidebar} />
      <div className="flex flex-1 pt-16">
        <SlideBar
          role="Teacher"
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          onHomeClick={() => navigate("/teacher-home")}
        />
        <main className="flex-1 p-4 md:p-10 md:px-20 ml-0 md:ml-20 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherScreen;
