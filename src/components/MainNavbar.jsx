import { useState } from "react";
import { AlignJustify } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function MainNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onSignInPage = location.pathname === "/login";
  const onSignUpPage = ["/signup", "/signup-teacher", "/signup-student"].includes(location.pathname);

  return (
    <nav className="w-full h-16 bg-[#0F6B75] py-4 px-4 flex items-center justify-between relative">
      {/* LEFT LOGO */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/logo.png" alt="Examlytic Logo" className="w-12 h-10" />
        <h1 className="text-white text-lg font-bold">Examlytic</h1>
      </div>

      {/* DESKTOP LINKS */}
      <div className="hidden md:flex items-center gap-8 text-white font-medium">
        <a href="#" className="hover:text-gray-300">
          Features
        </a>
        <a href="#" className="hover:text-gray-300">
          Resources
        </a>
        <a href="#" className="hover:text-gray-300">
          Support
        </a>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:gap-2 ml-auto md:ml-0">
        {/* LOGIN BUTTON */}
        {!onSignInPage && (
          <button
            className="bg-white text-[#0F6B75] hover:bg-gray-300 font-semibold rounded-xl px-3 py-1.5 text-sm md:px-6 md:py-2 md:text-base transition-all duration-200"
            onClick={() => navigate("/login", { replace: true })}
          >
            Login
          </button>
        )}

        {/* SIGNUP BUTTON */}
        {!onSignUpPage && (
          <button
            className="bg-white text-[#0F6B75] hover:bg-gray-300 font-semibold rounded-xl px-3 py-1.5 text-sm md:px-6 md:py-2 md:text-base transition-all duration-200"
            onClick={() => navigate("/signup", { replace: true })}
          >
            Sign Up
          </button>
        )}

        {/* MOBILE MENU ICON */}
        <AlignJustify
          className="md:hidden text-white cursor-pointer ml-1"
          size={30}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-[#0F6B75] text-white flex flex-col px-6 py-4 gap-4 md:hidden shadow-lg animate-slideDown">
          <a href="#" className="text-lg">
            Features
          </a>
          <a href="#" className="text-lg">
            Resources
          </a>
          <a href="#" className="text-lg">
            Support
          </a>
        </div>
      )}
    </nav>
  );
}
