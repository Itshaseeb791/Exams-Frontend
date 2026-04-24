import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";

const TeacherSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromUrl = searchParams.get("email");
  const sanitizedEmail = emailFromUrl
    ? decodeURIComponent(emailFromUrl).replace(/'/g, "")
    : "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    qualification: "",
    experience: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Prefill email from URL
  useEffect(() => {
    if (sanitizedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: sanitizedEmail,
      }));
    }
  }, [sanitizedEmail]);

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      navigate("/teacher-home", { replace: true });
    }
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent editing email if coming from URL
    if (name === "email" && sanitizedEmail) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) setApiError("");
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler (BACKEND CONNECTED)
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        `${API_URL}/api/teacher/teacher-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            qualification: formData.qualification,
            experience: formData.experience,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      alert("Teacher account created successfully!");
      navigate("/login", { replace: true });

    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainNavbar />

      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex justify-center py-10 px-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex overflow-hidden">

            {/* LEFT FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-[#0F6B75] mb-2">
                Teacher Registration
              </h2>
              <p className="text-gray-500 mb-6">
                Create your teacher account
              </p>

              {apiError && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSignup} className="flex flex-col gap-4">

                <h3 className="text-lg font-bold border-b pb-2">
                  Account Details
                </h3>

                <div>
                  <label className="font-semibold">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-3`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly={!!sanitizedEmail}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-semibold">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-3`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <h3 className="text-lg font-bold border-b pb-2 mt-4">
                  Professional Details
                </h3>

                <div>
                  <label className="font-semibold">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0F6B75] text-white rounded-xl py-3 font-medium mt-6 hover:bg-[#0F5F6A] disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Teacher Account"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <span
                  className="text-[#0F6B75] font-semibold cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </span>
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="hidden md:flex w-1/2 bg-[#f0f9fa] items-center justify-center p-8">
              <img src="/amico.png" alt="Teacher" className="max-w-full h-auto" />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TeacherSignUp;
