import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

const TeacherClassStudents = ({ classId }) => {
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    student: null,
    action: null,
  });

  // Get access token from localStorage (or wherever you store it)
  const accessToken = localStorage.getItem("accessToken");

  // Axios config with Authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Fetch pending requests for this class
        const pendingRes = await axios.get(
          `${API_BASE_URL}/enrollment/pending/${classId}`,
          axiosConfig
        );
        setPendingRequests(pendingRes.data);

        // Fetch approved students for this class
        const approvedRes = await axios.get(
          `${API_BASE_URL}/enrollment/class/${classId}/students`,
          axiosConfig
        );
        setApprovedStudents(approvedRes.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  const handleActionClick = (student, action) => {
    setActionModal({ isOpen: true, student, action });
  };

  const confirmAction = async () => {
    const { student, action } = actionModal;
    try {
      await axios.patch(
        `${API_BASE_URL}/enrollment/${student._id}`,
        { action },
        axiosConfig
      );

      if (action === "approved") {
        setApprovedStudents((prev) => [...prev, student]);
        setPendingRequests((prev) =>
          prev.filter((s) => s._id !== student._id)
        );
      } else if (action === "rejected") {
        setPendingRequests((prev) =>
          prev.filter((s) => s._id !== student._id)
        );
      }
    } catch (err) {
      console.error("Error updating enrollment status:", err);
    } finally {
      setActionModal({ isOpen: false, student: null, action: null });
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div>
      {/* Pending Requests Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0F6B75] mb-2">
          Pending Requests ({pendingRequests.length})
        </h2>
        <div className="space-y-4">
          {pendingRequests.length === 0 && <p>No pending requests</p>}
          {pendingRequests.map((enroll) => (
            <div
              key={enroll._id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-[#0F6B75] font-bold text-lg uppercase">
                  {enroll.studentId.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-[#0F6B75] text-lg">
                  {enroll.studentId.name.charAt(0).toUpperCase() + enroll.studentId.name.slice(1)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleActionClick(enroll, "approved")}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title="Approve"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleActionClick(enroll, "rejected")}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved Students Section */}
      <div>
        <h2 className="text-xl font-bold text-[#0F6B75] mb-2">
          Approved Students ({approvedStudents.length})
        </h2>
        <div className="space-y-4">
          {approvedStudents.length === 0 && <p>No approved students yet</p>}
          {approvedStudents.map((enroll) => (
            <div
              key={enroll._id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-[#0F6B75] font-bold text-lg uppercase">
                  {enroll.studentId.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-[#0F6B75] text-lg">
                  {enroll.studentId.name.charAt(0).toUpperCase() + enroll.studentId.name.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, student: null, action: null })
        }
        onConfirm={confirmAction}
        title={`${
          actionModal.action === "approved" ? "Approve" : "Reject"
        } Student`}
        message={`Are you sure you want to ${
          actionModal.action
        } ${actionModal.student?.studentId.name}?`}
        confirmText={actionModal.action === "approved" ? "Approve" : "Reject"}
        isDanger={actionModal.action === "rejected"}
      />
    </div>
  );
};

export default TeacherClassStudents;
