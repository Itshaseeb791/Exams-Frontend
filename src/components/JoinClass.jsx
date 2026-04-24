import { useState } from "react";
import { X } from "lucide-react";
import { API_URL } from "../config";

const JoinClass = ({ isOpen, onClose, onSuccess }) => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setError("Class code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

const response = await fetch(`${API_URL}/api/enrollment/request`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    classCode: classCode.trim().toUpperCase(),
  }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Success
      setClassCode("");
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#0F6B75] mb-6 text-center">
          Join Class
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#0F6B75] font-bold mb-2 text-sm">
              Class Code
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter class code (e.g. XYZ-123)"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border ${
                error ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/50 text-gray-700`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0F6B75] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#0c565e] transition-colors shadow-md w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? "Sending Request..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClass;
