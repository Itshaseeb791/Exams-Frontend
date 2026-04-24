import { Eye, Edit2, Trash2 } from "lucide-react";

const ManageExamTable = ({ exams, onView, onEdit, onDelete, onToggleActive }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "Draft":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Safe date formatter
  const formatDate = (dateString) => {
    if (!dateString) return { date: "", time: "" };
    if (dateString.includes(",")) {
      const parts = dateString.split(",");
      if (parts.length >= 3) {
        return {
          date: `${parts[0]}, ${parts[1]}`,
          time: parts[2],
        };
      }
    }
    // Fallback for YYYY-MM-DD or other formats
    return { date: dateString, time: "" };
  };

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden">
        {exams.map((exam) => {
          const { date, time } = formatDate(exam.date);
          return (
            <div
              key={exam.id}
              className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{exam.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {exam.questions} Questions
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    exam.status,
                  )}`}
                >
                  {exam.status}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-600">
                  <p>{date}</p>
                  <p>{time}</p>
                </div>

                <div className="flex gap-3 text-gray-500">
                  <button
                    onClick={() => onView(exam)}
                    className="hover:text-[#0F6B75] transition-colors cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(exam)}
                    className="hover:text-[#0F6B75] transition-colors cursor-pointer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(exam)}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                  {onToggleActive && (
                    <button
                      onClick={() => onToggleActive(exam)}
                      className="text-xs font-semibold px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                      {exam.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Exam Title</th>
              <th className="px-6 py-4 text-center">Questions</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Scheduled Date</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exams.map((exam) => {
              const { date, time } = formatDate(exam.date);
              return (
                <tr
                  key={exam.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {exam.title}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {exam.questions}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        exam.status,
                      )}`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {date}
                    <br />
                    {time}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-3 text-gray-500">
                      <button
                        onClick={() => onView(exam)}
                        className="hover:text-[#0F6B75] transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(exam)}
                        className="hover:text-[#0F6B75] transition-colors cursor-pointer"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(exam)}
                        className="hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                      {onToggleActive && (
                        <button
                          onClick={() => onToggleActive(exam)}
                          className="text-xs font-semibold px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-100 cursor-pointer"
                        >
                          {exam.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManageExamTable;
