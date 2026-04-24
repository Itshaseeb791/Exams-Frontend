// LoginPage.jsx
import React, { useState, useEffect } from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api` ;

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student", // default role
  });

  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (token && user) {
      navigate(user.role === "teacher" ? "/teacher-home" : "/student-home", { replace: true });
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleLogin = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setErrors({});

  try {
    const response = await axios.post(`${API_BASE_URL}/teacher/login`, {
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    const { accessToken, refreshToken, user } = response.data;

    // store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // store role in cookie
    Cookies.set("role", user.role, { expires: 1 });

    // store user
    localStorage.setItem("currentUser", JSON.stringify(user));

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // redirect by role
    switch (user.role) {
      case "student":
        navigate("/student-home", { replace: true });
        break;

      case "teacher":
        navigate("/teacher-home", { replace: true });
        break;

      case "admin":
        navigate("/admin", { replace: true });
        break;

      case "super-admin":
        navigate("/superadmin", { replace: true });
        break;

      default:
        navigate("/");
    }
  } catch (error) {
    setErrors({
      email: error?.response?.data?.message || "Invalid email or password",
    });
  } finally {
    setLoading(false);
  }
};

 const getDashboardByRole = (role) => {
  switch (role) {
    case "student":
      return "/student-home";

    case "teacher":
      return "/teacher-home";

    case "admin":
      return "/admin";

    case "super-admin":
      return "/superadmin";

    default:
      return "/login";
  }
};

useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const role = Cookies.get("role");

  if (token && role) {
    navigate(getDashboardByRole(role), { replace: true });
  }
}, []);
  return (
    <>
      <MainNavbar />
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex justify-center py-10 px-4">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/2 p-6 md:p-12">
              <h2 className="text-[#0F6B75] text-2xl md:text-3xl font-bold mb-6">
                Sign in to your account
              </h2>

              <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                {/* ROLE SELECTOR */}
                <div>
                  <label className="font-semibold text-gray-700 mb-1 block">Login as</label>
                 <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="font-semibold text-gray-700 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F6B75]/50`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="font-semibold text-gray-700 mb-1 block">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F6B75]/50`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* REMEMBER ME */}
                <div className="flex justify-between text-sm text-gray-600">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Remember Me
                  </label>
                </div>

                <button type="submit" disabled={loading} className="mt-6 bg-[#0F6B75] hover:bg-[#0F6B80] text-white rounded-lg py-3 font-medium transition">
                  {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                  Don’t have an account?{" "}
                  <span className="text-[#0F6B75] font-semibold cursor-pointer" onClick={() => navigate("/signup")}>
                    Signup here
                  </span>
                </p>
              </form>
            </div>

            <div className="hidden md:flex w-1/2 items-center justify-center p-8">
              <img src="/amico.png" alt="Login Illustration" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
