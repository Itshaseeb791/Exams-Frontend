import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, LayoutDashboard, Settings } from "lucide-react";
import axios from "axios";
import ConfirmationModal from "../components/ConfirmationModal";
import AdminTable from "../components/AdminTable";
import { API_URL } from "../config";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    admin: null,
  });

  const [admins, setAdmins] = useState([]);

  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalExams: 0,
  });

  const handleActionClick = (type, admin) => {
    setModalState({ isOpen: true, type, admin });
  };

  const confirmAction = () => {
    console.log(`Confirmed ${modalState.type} for admin ${modalState.admin?.name}`);
    setModalState({ isOpen: false, type: "", admin: null });
  };

  // ✅ Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/stats`
      );

      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // ✅ Fetch Admins for table
  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/all`
      );

      const adminList = data.admins.map((admin) => ({
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        institution: admin.institutionName,
        email: admin.userId?.email || "N/A",
        date: new Date(admin.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: admin.userId?.status === "Active" ? "Active" : "Suspended",
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  // ✅ Load both on page load
  useEffect(() => {
    fetchAdmins();
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-[1.75rem] font-bold text-[#0F6B75]">
          Dashboard Overview
        </h2>

        <button
          onClick={() => navigate("/superadmin/create-admin")}
          className="bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm cursor-pointer"
        >
          + Create New Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-[#0F6B75]">

        {/* Admins */}
        <div className="bg-[#0F6B75] text-white p-6 rounded-2xl shadow-md min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <Users size={24} />
            <span className="font-medium text-teal-50">Total Admins</span>
          </div>

          <h2 className="text-4xl font-bold mt-4">
            {stats.totalAdmins}
          </h2>
        </div>

        {/* Teachers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <LayoutDashboard size={24} className="text-teal-600" />
            <span className="font-medium">Total Teachers</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            {stats.totalTeachers}
          </h2>
        </div>

        {/* Students */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Users size={24} className="text-teal-600" />
            <span className="font-medium">Total Students</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            {stats.totalStudents}
          </h2>
        </div>

        {/* Exams */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Settings size={24} className="text-teal-600" />
            <span className="font-medium">Total Exams</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            {stats.totalExams}
          </h2>
        </div>
      </div>

      {/* Recent Admins */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-[1.1rem] font-bold text-[#012f36]">
            Recent Admins
          </h3>

          <button
            onClick={() => navigate("/superadmin/admins")}
            className="text-sm font-semibold text-teal-600 hover:text-teal-800"
          >
            View All →
          </button>
        </div>

        <AdminTable
          admins={admins.slice(0, 5)}
          onActionClick={handleActionClick}
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, type: "", admin: null })
        }
        onConfirm={confirmAction}
        title={
          modalState.type === "suspend"
            ? "Suspend Admin"
            : modalState.type === "unsuspend"
            ? "Unsuspend Admin"
            : "Delete Admin"
        }
        message={`Are you sure you want to ${modalState.type} ${modalState.admin?.name}?`}
        confirmText={
          modalState.type === "suspend"
            ? "Suspend"
            : modalState.type === "unsuspend"
            ? "Unsuspend"
            : "Delete"
        }
        isDanger={modalState.type === "delete"}
      />
    </div>
  );
};

export default SuperAdminDashboard;