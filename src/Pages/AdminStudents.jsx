import { useState, useEffect } from "react";
import axios from "axios";
import { X, Search, Loader2, Mail, Hash, BookOpen, UserCircle2 } from "lucide-react";
import { API_URL } from "../config";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ================= FETCH =================
  const fetchStudents = async () => {
    setFetchingStudents(true);
    try {
      const res = await axios.get(`${API_URL}/api/student`);
      setStudents(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ================= SEARCH =================
  const filteredStudents = students.filter((s) =>
    [s.name, s.rollNo, s.class, s.userId?.email]
      .some((val) => val?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ================= INVITE =================
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email) return setError("Email is required");
    if (!isValidEmail(email)) return setError("Please enter a valid email address");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/admin/invite-student`, { email });
      setSuccess(res.data?.message || "Invitation sent successfully");
      setEmail("");
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= AVATAR =================
  const avatarColors = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const getAvatarColor = (name = "") =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  const getInitials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#0F6B75]">
          Students Management
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search students..."
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
            + Add Student
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">

        {/* Loading */}
        {fetchingStudents && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-teal-700">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm font-medium">Loading students…</span>
          </div>
        )}

        {/* Empty */}
        {!fetchingStudents && filteredStudents.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <UserCircle2 size={48} strokeWidth={1.5} />
            <p className="text-sm font-medium">No students found.</p>
            {searchQuery && (
              <p className="text-xs text-gray-400">Try a different search term.</p>
            )}
          </div>
        )}

        {!fetchingStudents && filteredStudents.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50 border-b border-gray-100">
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Roll No</th>
                    <th className="py-3.5 px-6">Class</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/70 transition-colors">

                      {/* Name + Email */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(s.name)}`}>
                            {getInitials(s.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm leading-tight">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {s.userId?.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Hash size={13} className="text-teal-500 shrink-0" />
                          {s.rollNo ?? "—"}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <BookOpen size={13} className="text-teal-500 shrink-0" />
                          {s.class ?? "—"}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${s.userId?.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            s.userId?.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`} />
                          {s.userId?.status ?? "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredStudents.map((s) => (
                <div key={s._id} className="px-4 py-4 flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${getAvatarColor(s.name)}`}>
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                        ${s.userId?.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s.userId?.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                        }`} />
                        {s.userId?.status ?? "Active"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={12} className="text-teal-500 shrink-0" />
                        <span className="truncate">{s.userId?.email ?? "—"}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Hash size={12} className="text-teal-500 shrink-0" />
                        {s.rollNo ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <BookOpen size={12} className="text-teal-500 shrink-0" />
                        {s.class ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">{filteredStudents.length}</span>{" "}
                {filteredStudents.length === 1 ? "student" : "students"}
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

            <h2 className="text-xl font-bold text-[#0F6B75] mb-1">Add Student</h2>
            <p className="text-sm text-gray-500 pb-4">
              Enter the email address to invite a new student.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="student@edu.pk"
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

export default AdminStudents;