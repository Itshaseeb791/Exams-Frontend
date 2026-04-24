import { useState } from "react";
import { ArrowLeft, Users, UserCheck, FileText, Clock } from "lucide-react";
import TableTeacher from "./TableTeacher";
import TableStudent from "./TableStudent";
import TableExam from "./TableExam";

// Mock data to demonstrate the UI logic requested
const mockTeachers = [
  { id: 1, name: "Ahmad Hasan", department: "Computer Science", email: "ahmad@edu.pk", phone: "+92 300 1234567", qualification: "Ph.D. Computer Science", experience: "10 Years", classes: 4, students: 120, status: "Active" },
  { id: 2, name: "Sara Ahmed", department: "Mathematics", email: "sara@edu.pk", phone: "+92 333 7654321", qualification: "M.Phil Mathematics", experience: "5 Years", classes: 3, students: 95, status: "Active" },
  { id: 3, name: "Bilal Tariq", department: "Physics", email: "bilal@edu.pk", phone: "+92 321 9876543", qualification: "M.Sc Physics", experience: "3 Years", classes: 2, students: 60, status: "Pending" },
];

const mockStudents = [
  { id: 101, name: "Zain Ali", rollNo: "22-Arid-3654", email: "zain@edu.pk", department: "Computer Science", semester: "7th (Morning)", teacher: "Ahmad Hasan" },
  { id: 102, name: "Fatima Noor", rollNo: "21-Arid-443", email: "fatima@edu.pk", department: "Computer Science", semester: "5th (Morning)", teacher: "Ahmad Hasan" },
  { id: 103, name: "Usman Raza", rollNo: "22-Arid-890", email: "usman@edu.pk", department: "Mathematics", semester: "3rd (Evening)", teacher: "Sara Ahmed" },
  { id: 104, name: "Ayesha Khan", rollNo: "23-Arid-2766", email: "ayesha@edu.pk", department: "Physics", semester: "8th (Morning)", teacher: "Bilal Tariq" },
  { id: 105, name: "Ali Hassan", rollNo: "24-Arid-572", email: "ali@edu.pk", department: "Computer Science", semester: "1st (Evening)", teacher: "Ahmad Hasan" },
];

const mockExamsStats = {
  total: 24,
  pending: 5,
};

const mockExams = [
  { id: 201, title: "Midterm Physics", className: "BS Physics (Morning)", semester: "8th (Morning)", teacher: "Bilal Tariq", type: "Midterm", date: "Nov 15, 2026", students: 45, status: "Completed" },
  { id: 202, title: "Final Mathematics", className: "BS Math (Morning)", semester: "3rd (Evening)", teacher: "Sara Ahmed", type: "Final", date: "Dec 10, 2026", students: 60, status: "Schedule" },
  { id: 203, title: "Quiz 1 CS", className: "BS CS (Evening)", semester: "1st (Evening)", teacher: "Ahmad Hasan", type: "Quiz", date: "Oct 25, 2026", students: 50, status: "Completed" },
  { id: 204, title: "Final 1 CS", className: "BS CS (Evening)", semester: "5th (Morning)", teacher: "Ahmad Hasan", type: "Final", date: "Nov 01, 2026", students: 50, status: "Draft" },
];

const ViewAdminDetail = ({ admin, onClose }) => {
  const [activeTab, setActiveTab] = useState("Teachers");
  const tabs = ["Teachers", "Students", "Exams"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
      {/* Header section with back button and Admin Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#0F6B75]">{admin.name}</h2>
            <p className="text-gray-500 font-medium">{admin.institution} • {admin.email}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Created: {admin.date}</span>
          <span className={`px-3 py-1 rounded-full text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider border ${
            admin.status === 'Active' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {admin.status}
          </span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<UserCheck size={24} />} title="Total Teachers" value={mockTeachers.length} color="text-blue-600" />
        <StatCard icon={<Users size={24} />} title="Total Students" value={mockStudents.length} color="text-indigo-600" />
        <StatCard icon={<FileText size={24} />} title="Total Exams" value={mockExamsStats.total} color="text-teal-600" />
        <StatCard icon={<Clock size={24} />} title="Pending Exams" value={mockExamsStats.pending} color="text-orange-600" />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6 mt-4">
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                ${
                  activeTab === tab
                    ? "border-[#0F6B75] text-[#0F6B75]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6 animate-in fade-in duration-300">
        {activeTab === "Teachers" && <TableTeacher teachers={mockTeachers} itemsPerPage={30} />}
        {activeTab === "Students" && <TableStudent students={mockStudents} itemsPerPage={30} />}
        {activeTab === "Exams" && <TableExam exams={mockExams} itemsPerPage={30} />}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      <div className={color}>{icon}</div>
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default ViewAdminDetail;
