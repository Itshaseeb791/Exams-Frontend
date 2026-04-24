import { Calendar, FileText } from "lucide-react";

const TeacherClassOverview = ({ classData }) => {
  return (
    <div className="space-y-8">
      {/* Class Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-[#0F6B75] mb-4">
          Class Overview
        </h2>
        <div className="flex flex-col md:flex-row gap-8 border-y border-gray-200 pb-8 pt-4 ">
          <div className="flex-1">
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#0F6B75] mb-2">
              Class Code
            </h3>
            <p className="text-gray-800 ">EXM-67890</p>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#0F6B75] mb-2">
              Join URL
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              examlytic.com/join/EXM-67890
            </p>
            <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer">
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Class Statistics Section */}
      <div>
        <h2 className="text-xl font-bold text-[#0F6B75] mb-4">
          Class Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0F6B75] mb-2">
              Average Score
            </h3>
            <p className="text-2xl font-bold text-[#0F6B75]">85%</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0F6B75] mb-2">
              Total Exams
            </h3>
            <p className="text-2xl font-bold text-[#0F6B75]">12</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-xl font-bold text-[#0F6B75] mb-6">
          Upcoming Events
        </h2>
        <div className="relative pl-4 border-l-2 border-gray-200 space-y-8 ml-2">
          <div className="relative">
            <div className="absolute -left-[25px] bg-white p-1">
              <Calendar size={20} className="text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className=" text-gray-800">Calculus Exam 2</h3>
              <p className="text-sm text-[#0F6B75]">October 20, 2024</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-[25px] bg-white p-1">
              <FileText size={20} className="text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-800">Assignment 3 Due</h3>
              <p className="text-sm text-[#0F6B75]">October 25, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassOverview;
