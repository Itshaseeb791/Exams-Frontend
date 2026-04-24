import { useState, useEffect } from "react";
import { UserCheck, ChevronLeft, ChevronRight, Phone, GraduationCap, Briefcase, Mail } from "lucide-react";

const TableTeacher = ({ teachers, title = "Teachers Detail", itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [teachers]);

  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, teachers.length);
  const currentTeachers = teachers.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base sm:text-lg font-bold text-[#012f36] flex items-center gap-2">
          <UserCheck size={20} className="text-[#0F6B75]" />
          {title}
        </h3>
      </div>

      {/* Empty State */}
      {currentTeachers.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <UserCheck size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">No teachers found.</p>
        </div>
      )}

      {currentTeachers.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Qualification</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50/70 transition-colors">

                    {/* Name + Email with avatar */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(teacher.name)}`}>
                          {getInitials(teacher.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{teacher.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone size={13} className="text-teal-500 shrink-0" />
                        {teacher.phone}
                      </span>
                    </td>

                    {/* Qualification */}
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                        <GraduationCap size={13} className="text-teal-500 shrink-0" />
                        {teacher.qualification}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                        <Briefcase size={13} className="text-teal-500 shrink-0" />
                        {teacher.experience}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${teacher.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          teacher.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                        }`} />
                        {teacher.status ?? "Active"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {currentTeachers.map((teacher) => (
              <div key={teacher.id} className="px-4 py-4 flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${getAvatarColor(teacher.name)}`}>
                  {getInitials(teacher.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{teacher.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${teacher.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        teacher.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                      }`} />
                      {teacher.status ?? "Active"}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} className="text-teal-500 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={12} className="text-teal-500 shrink-0" />
                      {teacher.phone}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <GraduationCap size={12} className="text-teal-500 shrink-0" />
                      {teacher.qualification}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Briefcase size={12} className="text-teal-500 shrink-0" />
                      {teacher.experience}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {teachers.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-gray-900">{endIndex}</span> of{" "}
            <span className="font-medium text-gray-900">{teachers.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs sm:text-sm font-medium text-gray-700 px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableTeacher;