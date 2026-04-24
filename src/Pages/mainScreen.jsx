import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import MainNavbar from "../components/MainNavbar.jsx";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import KeyFeatures from "../components/KeyFeatures";

const ROLE_REDIRECT = {
  superadmin: "/superadmin",
  "super-admin": "/superadmin",   // handle hyphenated version
  admin: "/admin",
  teacher: "/teacher-home",
  student: "/student-home",
};

export default function MainScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = Cookies.get("role")?.trim().toLowerCase();
    if (role && ROLE_REDIRECT[role]) {
      navigate(ROLE_REDIRECT[role], { replace: true });
    }
  }, []);

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen w-full bg-white flex flex-col">
        <HeroSection />
        <KeyFeatures />
        <Footer />
      </div>
    </>
  );
}