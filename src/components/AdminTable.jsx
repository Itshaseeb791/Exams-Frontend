import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, ShieldCheck, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const AdminTable = ({ admins, onActionClick, onViewClick, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page if admins line-up changes
  useEffect(() => {
    setCurrentPage(1);
  }, [admins]);

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, admins.length);
  const currentAdmins = admins.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Institution</th>
            <th className="px-6 py-4">Email Address</th>
            <th className="px-6 py-4">Created Date</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentAdmins.length > 0 ? (
            currentAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-6 py-4 font-bold text-[#012f36]">{admin.name}</td>
              <td className="px-6 py-4 text-gray-700 font-medium">{admin.institution}</td>
              <td className="px-6 py-4 text-gray-500">{admin.email}</td>
              <td className="px-6 py-4 text-gray-500 font-medium">{admin.date}</td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.7rem] font-extrabold uppercase tracking-wider border ${
                  admin.status === 'Active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {admin.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center items-center gap-3 text-gray-500">
                  <button 
                    onClick={() => onViewClick && onViewClick(admin)}
                    className="hover:text-[#0F6B75] transition-colors cursor-pointer" 
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onActionClick && onActionClick(admin.status === 'Suspended' ? 'unsuspend' : 'suspend', admin)}
                    className="hover:text-[#0F6B75] transition-colors cursor-pointer" 
                    title={admin.status === 'Suspended' ? "Unsuspend Admin" : "Suspend Admin"}
                  >
                    {admin.status === 'Suspended' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  </button>
                  <button 
                    onClick={() => onActionClick && onActionClick('delete', admin)}
                    className="hover:text-red-600 transition-colors cursor-pointer" 
                    title="Delete Admin"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                No admins found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Pagination Controls */}
      {admins.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{admins.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm font-medium text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
