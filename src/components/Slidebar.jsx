import { useState, useEffect, useRef } from "react";
import {
  Home,
  ClipboardList,
  CheckSquare,
  BarChart2,
  LogOut,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  LayoutDashboard,
  Users,
  Settings,
  GraduationCap,
  FileCheck,
  Library
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

const SlideBar = ({ isMobileOpen, closeMobileSidebar, onHomeClick, role }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Keep location hook for other potential uses or re-renders

  const [isOpen, setIsOpen] = useState(false);

  // Lazy initialize activeItem based on current URL to prevent stutter
  const [activeItem, setActiveItem] = useState(() => {
    const path = location.pathname;
    if (path === "/teacher-exams") return "Exams";
    if (path === "/teacher-reports") return "Reports";
    if (path === "/teacher-results") return "Results";
    if (path === "/student-results") return "My Results";
    if (path === "/superadmin") return "Dashboard";
    if (path === "/superadmin/admins") return "Admins";
    if (path === "/superadmin/create-admin") return "Create Admin";
    if (path === "/superadmin/settings") return "Settings";
    if (path === "/admin/dashboard" || path === "/admin") return "Dashboard";
    if (path === "/admin/teachers") return "Teachers";
    if (path === "/admin/students") return "Students";
    if (path === "/admin-classes" || path === "/admin/classes") return "Classes";
    if (path === "/admin/settings") return "Settings";
    if (path === "/teacher-home" || path === "/student-home") return "Home";
    return "Home"; // Default fallback
  });

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const path = location.pathname;
    let newItem = "Home";
    if (path === "/teacher-exams") newItem = "Exams";
    else if (path === "/teacher-reports") newItem = "Reports";
    else if (path === "/teacher-results") newItem = "Results";
    else if (path === "/student-results") newItem = "My Results";
    else if (path === "/superadmin") newItem = "Dashboard";
    else if (path === "/superadmin/admins") newItem = "Admins";
    else if (path === "/superadmin/create-admin") newItem = "Create Admin";
    else if (path === "/superadmin/settings") newItem = "Settings";
    else if (path === "/admin/dashboard" || path === "/admin") newItem = "Dashboard";
    else if (path === "/admin/teachers") newItem = "Teachers";
    else if (path === "/admin/students") newItem = "Students";
    else if (path === "/admin-classes" || path === "/admin/classes") newItem = "Classes";
    else if (path === "/admin/settings") newItem = "Settings";
    else if (path === "/teacher-home" || path === "/student-home")
      newItem = "Home";

    if (activeItem !== newItem) {
      setActiveItem(newItem);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
        if (window.innerWidth < 768) {
          // Close on mobile click outside
          closeMobileSidebar();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMobileSidebar]);

  let menuItems = [];

  if (role === "Teacher") {
    menuItems = [
      { icon: Home, label: "Home" },
      { icon: ClipboardList, label: "Exams" },
      { icon: CheckSquare, label: "Results" },
      { icon: BarChart2, label: "Reports" },
      {icon : UserPlus , label :"Student Management"}
    ];
  } else if (role === "Student") {
    menuItems = [
      { icon: Home, label: "Home" },
      { icon: CheckSquare, label: "My Results" },
    ];
  } else if (role === "SuperAdmin") {
    menuItems = [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Admins" },
      { icon: UserPlus, label: "Create Admin" },
      { icon: Settings, label: "Settings" }
    ];
  } else if (role === "Admin") {
    menuItems = [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Teachers" },
      { icon: GraduationCap, label: "Students" },
      { icon: Library, label: "Classes" },
      { icon: Settings, label: "Settings" }
    ];
  } else {
    // Default or fallback
    menuItems = [{ icon: Home, label: "Home" }];
  }

  const handleSignOutClick = () => {
    setIsSignOutModalOpen(true);
  };

const confirmSignOut = () => {
  setIsSignOutModalOpen(false);
  localStorage.removeItem("currentUser");
  document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  navigate("/login", { replace: true });
};

  const bottomItems = [
    { icon: LogOut, label: "Sign Out", action: handleSignOutClick },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileSidebar}
        ></div>
      )}

      <div
        ref={sidebarRef}
        className={`h-[calc(100vh-4rem)] bg-[#0F6B75] text-white fixed left-0 top-16 transition-all duration-300 z-40 flex flex-col justify-between py-6 
            ${isOpen || isMobileOpen ? "w-64" : "w-20"}
            ${
              isMobileOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
        `}
      >
        {/* Toggle Button (Desktop only) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-white text-[#0F6B75] p-1 rounded-full shadow-md hover:bg-gray-100 border border-gray-200 z-50 hidden md:flex"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex flex-col gap-2 mt-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-6 cursor-pointer py-3 transition-colors relative group ${
                activeItem === item.label
                  ? "bg-white/20 border-r-4 border-white"
                  : "hover:bg-white/10"
              }`}
              onClick={() => {
                setActiveItem(item.label);
                if (item.label === "Home" && onHomeClick) {
                  onHomeClick();
                } else if (item.label === "Exams") {
                  navigate("/teacher-exams");
                } else if (item.label === "Reports") {
                  navigate("/teacher-reports");
                }else if (item.label === "Student Management") {
                  navigate("/inviteStudent");
                } else if (item.label === "Results") {
                  navigate("/teacher-results");
                } else if (item.label === "My Results") {
                  navigate("/student-results");
                } else if (item.label === "Dashboard") {
                  if (role === "Admin") navigate("/admin");
                  else navigate("/superadmin");
                } else if (item.label === "Admins") {
                  navigate("/superadmin/admins");
                } else if (item.label === "Create Admin") {
                  navigate("/superadmin/create-admin");
                } else if (item.label === "Settings") {
                  if (role === "Admin") navigate("/admin/settings");
                  else navigate("/superadmin/settings");
                } else if (item.label === "Teachers") {
                  navigate("/admin/teachers");
                } else if (item.label === "Students") {
                  navigate("/admin/students");
                } else if (item.label === "Classes") {
                  navigate("/admin/classes");
                }
              }}
            >
              <item.icon size={24} className="min-w-6" />
              <span
                className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${
                  isOpen || isMobileOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                {item.label}
              </span>
              {!isOpen && !isMobileOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {bottomItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center px-6 cursor-pointer hover:bg-white/10 py-3 transition-colors relative group"
              onClick={() => {
                if (item.action) item.action();
              }}
            >
              <item.icon size={24} className="min-w-6" />
              <span
                className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${
                  isOpen || isMobileOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                {item.label}
              </span>
              {!isOpen && !isMobileOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDanger={true}
      />
    </>
  );
};

export default SlideBar;
