import { useState, useEffect } from "react";
import axios from "axios";
import { X, Search, Loader2, Mail, Phone, GraduationCap, UserCircle2 } from "lucide-react";
import { API_URL } from "../config";

const AdminTeacher = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = teachers.filter((t) =>
    [t.name, t.qualification, t.userId?.email, t.phone].some((val) =>
      val?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const fetchTeachers = async () => {
    setFetchingTeachers(true);
    try {
      const response = await axios.get(`${API_URL}/api/teacher`);
      setTeachers(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    } finally {
      setFetchingTeachers(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email) return setError("Email is required");
    if (!isValidEmail(email)) return setError("Please enter a valid email address");

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/admin/invite-teacher`,
        { email }
      );
      setSuccess(response.data?.message || "Invitation sent successfully");
      setEmail("");
      fetchTeachers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initials avatar
  const getInitials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  // Soft color per teacher based on name char code
  const avatarColors = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const getAvatarColor = (name = "") =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#0F6B75]">
          Teachers Management
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B75] bg-white shadow-sm transition-all"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm whitespace-nowrap"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">

        {/* Loading State */}
        {fetchingTeachers && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-teal-700">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm font-medium">Loading teachers…</span>
          </div>
        )}

        {/* Empty State */}
        {!fetchingTeachers && filteredTeachers.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <UserCircle2 size={48} strokeWidth={1.5} />
            <p className="text-sm font-medium">No teachers found.</p>
            {searchQuery && (
              <p className="text-xs text-gray-400">
                Try a different search term.
              </p>
            )}
          </div>
        )}

        {/* Desktop Table */}
        {!fetchingTeachers && filteredTeachers.length > 0 && (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50 border-b border-gray-100">
                    <th className="py-3.5 px-6">Teacher</th>
                    <th className="py-3.5 px-6">Qualification</th>
                    <th className="py-3.5 px-6">Phone</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher._id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Name + Email with avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(teacher.name)}`}>
                            {getInitials(teacher.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm leading-tight">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {teacher.userId?.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Qualification */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <GraduationCap size={14} className="text-teal-500 shrink-0" />
                          {teacher.qualification ?? "—"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone size={13} className="text-teal-500 shrink-0" />
                          {teacher.phone ?? "—"}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${teacher.userId?.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            teacher.userId?.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`} />
                          {teacher.userId?.status ?? "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => (
                <div key={teacher._id} className="px-4 py-4 flex gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${getAvatarColor(teacher.name)}`}>
                    {getInitials(teacher.name)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{teacher.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                        ${teacher.userId?.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          teacher.userId?.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                        }`} />
                        {teacher.userId?.status ?? "Active"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={12} className="text-teal-500 shrink-0" />
                        <span className="truncate">{teacher.userId?.email ?? "—"}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} className="text-teal-500 shrink-0" />
                        {teacher.phone ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <GraduationCap size={12} className="text-teal-500 shrink-0" />
                        {teacher.qualification ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row count footer */}
            <div className="mt-auto px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">{filteredTeachers.length}</span>{" "}
                {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => { setOpen(false); setError(""); setSuccess(""); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-[#0F6B75] mb-1">Add Staff</h2>
            <p className="text-sm text-gray-500 pb-4">
              Enter the email address to invite a new staff member.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="teacher@example.com"
              className="w-full border border-gray-200 p-2.5 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-[#0F6B75] focus:border-transparent transition-all"
            />

            {error && <p className="text-sm text-red-600 font-medium mb-2 mt-1">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium mb-2 mt-1">{success}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#0F6B75] text-white text-sm font-medium py-2.5 rounded-md hover:bg-[#0c565e] disabled:opacity-50 disabled:cursor-not-allowed mt-4 transition-colors shadow-sm"
            >
              {loading ? "Sending Invitation..." : "Send Invitation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacher;