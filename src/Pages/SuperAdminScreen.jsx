import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SlideBar from "../components/Slidebar";

const SuperAdminScreen = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () =>
    setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar toggleSidebar={toggleMobileSidebar} userName="Super Admin" />
      <div className="flex flex-1 pt-16 relative">
        <SlideBar
          role="SuperAdmin"
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          onHomeClick={() => navigate("/superadmin")}
        />
        <main className="flex-1 p-4 md:p-10 hide-scrollbar transition-all duration-300 ml-0 md:ml-20 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};



export default SuperAdminScreen;
