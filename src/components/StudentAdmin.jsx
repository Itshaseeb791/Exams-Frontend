import { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, X } from "lucide-react";
import { API_URL } from "../config";

const StudentAdmin = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // ---------------- Email Validation ----------------
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ---------------- Fetch Students ----------------
  const fetchStudents = async () => {
    setFetchingStudents(true);
    try {
      const response = await axios.get(`${API_URL}/api/student`);
      setStudents(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ---------------- Submit Handler ----------------
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/admin/invite-student`,
        { email }
      );

      setSuccess(response.data?.message || "Invitation sent successfully");
      setEmail("");

      // Refresh student list after successful invite
      fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:-mx-10">
      <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-[1.75rem] font-bold text-[#0F6B75]">Invite Students</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm cursor-pointer"
          >
            + Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {/* ================= Student Table ================= */}
        <div className="overflow-x-auto flex-1">
          {fetchingStudents ? (
            <p className="p-8 text-center text-gray-500">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No students found.</p>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-gray-50/50 sticky top-0 z-10 shadow-sm">
                <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3 px-6 text-gray-800 font-medium">{student.name}</td>
                    <td className="py-3 px-6 text-gray-600 font-medium">{student.rollNo}</td>
                    <td className="py-3 px-6 text-gray-600">{student.userId?.email}</td>
                    <td className="py-3 px-6 text-gray-600">{student.class}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= Modal ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-sm relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => {
                setOpen(false);
                setError("");
                setSuccess("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-[#0F6B75] mb-2">
              Add Student
            </h2>

            <p className="text-sm text-gray-500 pb-4">
              Enter the email address to invite a student
            </p>

            {/* Email Input */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@edu.pk"
              className="w-full border border-gray-200 p-2.5 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-[#0F6B75] focus:border-transparent transition-all"
            />

            {/* Error Message */}
            {error && <p className="text-sm text-red-600 font-medium mb-2 mt-1">{error}</p>}

            {/* Success Message */}
            {success && <p className="text-sm text-green-600 font-medium mb-2 mt-1">{success}</p>}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#0F6B75] text-white text-sm font-medium py-2.5 rounded-md hover:bg-[#0c565e] disabled:opacity-50 disabled:cursor-not-allowed mt-4 transition-colors cursor-pointer shadow-sm"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentAdmin;
