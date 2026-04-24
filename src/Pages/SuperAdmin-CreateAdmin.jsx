import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Save, X, Eye, EyeOff } from "lucide-react";
import DropDownMenu from "../components/DropDownMenu";
import axios from "axios";
import { API_URL } from "../config";

const SuperAdminCreateAdmin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institutionName: "",
    password: "",
    confirmPassword: "",
    status: "Active"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  // Prepare payload
  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    institutionName: formData.institutionName,
    password: formData.password,
    // Map frontend "Suspended" to backend "Inactive"
    status: formData.status === "Suspended" ? "Inactive" : "Active",
  };

  try {
    const { data } = await axios.post(`${API_URL}/api/admin/create`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Axios treats 2xx as success, so no need for extra response.ok check
    alert(data.message || "Admin created successfully");

    // Redirect to admin list
    navigate("/superadmin/admins");
  } catch (error) {
    console.error(error);

    // Axios error handling
    if (error.response) {
      // Server responded with a status other than 2xx
      alert(error.response.data.message || "Failed to create admin");
    } else if (error.request) {
      // No response received
      alert("No response from server. Please try again.");
    } else {
      // Something else happened
      alert("Error: " + error.message);
    }
  }
};
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0F6B75]">Create New Admin</h2>
          <p className="text-gray-500 mt-1">Register a new institution administrator into the platform</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0F6B75]/5 px-8 py-5 border-b border-[#0F6B75]/10 flex items-center gap-3">
          <div className="bg-[#0F6B75] p-2 rounded-lg text-white">
            <UserPlus size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#012f36]">Admin Information</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Ali"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Khan"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@institution.edu"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
              />
            </div>

            {/* Institution Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="institutionName"
                required
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="e.g. Punjab Group of Colleges"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter secure password"
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0F6B75] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0F6B75] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Initial Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Status
              </label>
              <div className="w-full flex">
                <DropDownMenu
                  fullWidth
                  options={["Active", "Suspended"]}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row border-t border-gray-100 pt-6 justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/superadmin/admins")}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#0F6B75] hover:bg-[#0c565e] rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={18} />
              Create Administrator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminCreateAdmin;
