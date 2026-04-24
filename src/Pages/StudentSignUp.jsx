import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";

const StudentSignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    rollNo: "",
    class: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch email from URL query
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromUrl = queryParams.get("email") || "";
    setFormData((prev) => ({ ...prev, email: emailFromUrl }));
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      navigate(currentUser.role === "Teacher" ? "/teacher-home" : "/student-home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.rollNo.trim()) newErrors.rollNo = "Roll number is required";
    if (!formData.class.trim()) newErrors.class = "Class is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        rollNo: formData.rollNo,
        class: formData.class,
      };

      const response = await fetch(`${API_URL}/api/student/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Student account created successfully!");
        navigate("/student-home", { replace: true });
      } else {
        alert(data.message || "Failed to create student account");
      }
    } catch (error) {
      setLoading(false);
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex justify-center py-6 md:py-10 px-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
            {/* FORM */}
            <div className="w-full p-8">
              <h2 className="text-[#0F6B75] text-2xl md:text-3xl font-extrabold mb-2">Create Student Account</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className={`w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-3 outline-none`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#0F6B75]/50 rounded-lg px-4 py-3 outline-none`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#0F6B75]/50 rounded-lg px-4 py-3 outline-none`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className={`w-full border ${errors.rollNo ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#0F6B75]/50 rounded-lg px-4 py-3 outline-none`}
                  />
                  {errors.rollNo && <p className="text-red-500 text-sm mt-1">{errors.rollNo}</p>}
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Class *</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={`w-full border ${errors.class ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-[#0F6B75]/50 rounded-lg px-4 py-3 outline-none`}
                  />
                  {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0F6B75] text-white rounded-xl py-3 font-medium shadow-md w-full mt-4 hover:bg-[#0F5F6A] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Student Account"}
                </button>
              </form>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <div className="hidden md:flex w-1/2 bg-[#f0f9fa] items-center justify-center p-8">
              <img src="/amico.png" alt="amico" className="max-w-full h-auto" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default StudentSignUp;
