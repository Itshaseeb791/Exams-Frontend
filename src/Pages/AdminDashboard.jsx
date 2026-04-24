import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Settings, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import TableTeacher from "../components/TableTeacher";
import { API_URL } from "../config";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/teacher`);
      if (res.data.success) {
        setTeachers(res.data.data);
      } else {
        setError("Failed to load teachers.");
      }
    } catch (err) {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`);
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setStatsError(true);
      }
    } catch (err) {
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchStats();
  }, []);

  const normalizedTeachers = teachers.map((t) => ({
    id: t._id,
    name: t.name,
    email: t.userId?.email ?? "—",
    phone: t.phone ?? "—",
    qualification: t.qualification ?? "—",
    experience: t.experience ?? "—",
    status: t.userId?.status ?? "Active",
  }));

  // Reusable stat card value renderer
  const StatValue = ({ value, colorClass = "text-gray-800" }) => {
    if (statsLoading) return <Loader2 size={24} className="animate-spin text-gray-400 mt-4" />;
    if (statsError) return <span className={`text-3xl font-bold mt-4 ${colorClass}`}>—</span>;
    return <h2 className={`text-3xl font-bold mt-4 ${colorClass}`}>{value ?? "—"}</h2>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#0F6B75]">
          Dashboard Overview
        </h2>
        <button
          onClick={() => navigate("/admin/add-teacher")}
          className="bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm"
        >
          + Add Teacher
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

        {/* Total Teachers */}
        <div className="bg-[#0F6B75] text-white p-6 rounded-2xl shadow-md flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center gap-2 opacity-90">
            <Users size={22} />
            <span className="font-medium text-sm">Total Teachers</span>
          </div>
          {statsLoading
            ? <Loader2 size={24} className="animate-spin opacity-70 mt-4" />
            : <h2 className="text-4xl font-bold tracking-tight mt-4">
                {statsError ? "—" : stats?.totalTeachers ?? "—"}
              </h2>
          }
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center gap-2 text-gray-500">
            <GraduationCap size={22} className="text-teal-600" />
            <span className="font-medium text-sm">Total Students</span>
          </div>
          <StatValue value={stats?.totalStudents} />
        </div>

        {/* Active Exams */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center gap-2 text-gray-500">
            <FileText size={22} className="text-teal-600" />
            <span className="font-medium text-sm">Active Exams</span>
          </div>
          <StatValue value={stats?.totalExams} />
        </div>

        {/* Total Classes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Settings size={22} className="text-teal-600" />
            <span className="font-medium text-sm">Total Classes</span>
          </div>
          <StatValue value={stats?.totalClasses} />
        </div>

      </div>

      {/* Teachers Table */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-teal-700 gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm font-medium">Loading teachers…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTeachers}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <TableTeacher
          title="Recent Teachers"
          teachers={normalizedTeachers.slice(0, 5)}
        />
      )}

    </div>
  );
};

export default AdminDashboard;