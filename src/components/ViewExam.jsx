import { ArrowLeft, Calendar, Clock, BookOpen, HelpCircle } from "lucide-react";

const ViewExam = ({ exam, onBack }) => {
  if (!exam) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#0F6B75]">{exam.title}</h2>
          <p className="text-gray-500 text-sm">{exam.subject}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-center
                ${
                  exam.status === "Published"
                    ? "bg-green-100 text-green-700"
                    : exam.status === "Scheduled"
                    ? "bg-yellow-100 text-yellow-700"
                    : exam.status === "Draft"
                    ? "bg-red-100 text-red-700"
                    : "bg-purple-100 text-purple-700"
                }`}
          >
            {exam.status}
          </span>
        </div>
      </div>

      {/* Exam Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-[#0F6B75] mb-2">
            <Calendar size={18} />
            <span className="font-semibold text-sm">Date & Time</span>
          </div>
          <p className="text-gray-900 font-medium text-sm">{exam.date}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-[#0F6B75] mb-2">
            <Clock size={18} />
            <span className="font-semibold text-sm">Duration</span>
          </div>
          <p className="text-gray-900 font-medium text-sm">
            {exam.duration || 60} minutes
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-[#0F6B75] mb-2">
            <BookOpen size={18} />
            <span className="font-semibold text-sm">Total Marks</span>
          </div>
          <p className="text-gray-900 font-medium text-sm">
            {exam.totalMarks || exam.questions * 2} Marks
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 text-[#0F6B75] mb-2">
            <HelpCircle size={18} />
            <span className="font-semibold text-sm">Questions</span>
          </div>
          <p className="text-gray-900 font-medium text-sm">
            {exam.questions} items
          </p>
        </div>
      </div>

      {/* Questions List (Mock or Actual) */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4">
          Questions
        </h3>

        {exam.questionsList && exam.questionsList.length > 0 ? (
          exam.questionsList.map((q, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <span className="font-bold text-gray-400">Q{idx + 1}.</span>
                  <p className="font-medium text-gray-900">{q.text}</p>
                </div>
                <span className="shrink-0 text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {q.marks} Marks
                </span>
              </div>

              {q.type === "mcq" && q.options && (
                <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`text-sm px-3 py-2 rounded-lg border ${
                        q.correctOption === optIdx
                          ? "bg-teal-50 border-teal-200 text-teal-800 font-medium"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    >
                      <span className="mr-2 font-bold">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          // Mock questions placeholder if no list exists in the exam object
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No question details available for this exam.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This might be a legacy mock data entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExam;
