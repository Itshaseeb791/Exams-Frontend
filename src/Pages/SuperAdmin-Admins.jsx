import { useState, useEffect } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminTable from "../components/AdminTable";
import ConfirmationModal from "../components/ConfirmationModal";
import DropDownMenu from "../components/DropDownMenu";
import ViewAdminDetail from "../components/ViewAdminDetail";
import { API_URL } from "../config";

const SuperAdminAdmins = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [modalState, setModalState] = useState({ isOpen: false, type: "", admin: null });
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);

  const handleActionClick = (type, admin) => {
    setModalState({ isOpen: true, type, admin });
  };

  const confirmAction = () => {
    console.log(`Confirmed ${modalState.type} for admin ${modalState.admin?.name}`);
    // Backend API Logic goes here (suspend/delete)
    setModalState({ isOpen: false, type: "", admin: null });
  };

  // Fetch admins from backend
  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/all`);

      // Map backend data for UI table
      const adminList = data.admins.map((admin) => ({
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        institution: admin.institutionName,
        email: admin.userId?.email || "N/A",
        date: new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        status: admin.userId?.status === "Active" ? "Active" : "Suspended",
      }));

      setAdmins(adminList);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter and search logic
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "All Statuses" || admin.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {selectedAdmin ? (
        <ViewAdminDetail admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-[1.75rem] font-bold text-[#0F6B75]">Platform Admins</h2>
              <p className="text-gray-500 mt-1">Manage all institution administrators across Examlytic</p>
            </div>

            <button
              onClick={() => navigate("/superadmin/create-admin")}
              className="bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              Create New Admin
            </button>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, institution, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={18} className="text-gray-400" />
                <DropDownMenu
                  options={["All Statuses", "Active", "Suspended"]}
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                />
              </div>
            </div>

            {/* Admin Table */}
            <AdminTable
              admins={filteredAdmins}
              onActionClick={handleActionClick}
              onViewClick={setSelectedAdmin}
            />

            {filteredAdmins.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No administrators found matching your search or filter criteria.
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: "", admin: null })}
        onConfirm={confirmAction}
        title={
          modalState.type === "suspend"
            ? "Suspend Admin"
            : modalState.type === "unsuspend"
            ? "Unsuspend Admin"
            : "Delete Admin"
        }
        message={`Are you sure you want to ${modalState.type} ${modalState.admin?.name} (${modalState.admin?.institution})?`}
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

export default SuperAdminAdmins;