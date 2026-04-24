import { useState, useEffect } from "react";
import { FileCheck, ChevronLeft, ChevronRight } from "lucide-react";

const TableExam = ({ exams, title = "Exams Detail", itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page if exams line-up changes
  useEffect(() => {
    setCurrentPage(1);
  }, [exams]);

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, exams.length);
  const currentExams = exams.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-bold text-[#012f36] flex items-center gap-2">
          <FileCheck size={20} className="text-[#0F6B75]" />
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="px-6 py-4">Exam Title</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Semester</th>
              <th className="px-6 py-4">Teacher</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Students</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentExams.length > 0 ? (
              currentExams.map(exam => (
                <tr key={exam.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-bold text-[#012f36]">{exam.title}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">{exam.className}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">{exam.semester}</td>
                <td className="px-6 py-4 text-gray-600">{exam.teacher}</td>
                <td className="px-6 py-4 text-gray-500">{exam.type}</td>
                <td className="px-6 py-4 text-gray-500">{exam.date}</td>
                <td className="px-6 py-4 text-center text-gray-700 font-medium">{exam.students}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.7rem] font-extrabold uppercase tracking-wider border ${
                    exam.status === 'Completed' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : exam.status === 'Schedule'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {exam.status}
                  </span>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {exams.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{exams.length}</span> results
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

export default TableExam;
