import { useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import StudentClassExam from "./StudentClassExam";
import Material from "./Material";
import ConfirmationModal from "./ConfirmationModal";

const StudentClass = ({ classData, onBack, onLeaveClass }) => {
  const [activeTab, setActiveTab] = useState("Exams");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const tabs = ["Exams", "Material"];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-10 md:pt-6 relative border border-gray-200 mb-8 min-h-[80vh]">
      {/* Class Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F6B75]">
              Class: {classData.title}
            </h1>
            <p className="text-[#0F6B75] text-sm font-medium mt-1">
              {classData.section}
            </p>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100 cursor-pointer"
          >
            <LogOut size={18} />
            Leave Class
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
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
      <div className="mt-6">
        {activeTab === "Exams" && <StudentClassExam />}
        {activeTab === "Material" && <Material role="Student" classId={classData.id} />}
      </div>

      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={() => onLeaveClass(classData.id)}
        title="Leave Class"
        message={`Are you sure you want to leave "${classData.title}"? You will lose access to all class materials and exams.`}
        confirmText="Leave Class"
        isDanger={true}
      />
    </div>
  );
};

export default StudentClass;
