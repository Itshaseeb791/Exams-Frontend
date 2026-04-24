import { useState } from "react";
import { Pencil } from "lucide-react";

import TeacherClassOverview from "./TeacherClassOverview";
import TeacherClassStudents from "./TeacherClassStudents";
import TeacherClassExam from "./TeacherClassExam";
import EditClass from "./EditClass";
import Material from "./Material";

const TeacherClass = ({ classData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-10 md:pt-6 relative border border-gray-200 mb-8 min-h-[80vh]">
      {/* Class Header */}
      <div className="mb-6 flex items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F6B75]">
              Class: {classData?.title}
            </h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-gray-400 hover:text-[#0F6B75] transition-colors p-1 rounded-full hover:bg-teal-50 cursor-pointer"
            >
              <Pencil size={18} />
            </button>
          </div>
          <p className="text-[#0F6B75] text-sm font-medium mt-1">
            {classData?.section}
          </p>
        </div>
      </div>

      {/* Navbar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          {["Overview", "Students", "Exams", "Material"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                ${activeTab === tab
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
        {activeTab === "Overview" && (
          <TeacherClassOverview classData={classData} />
        )}
        {activeTab === "Students" && <TeacherClassStudents classId={classData._id} />}
        {activeTab === "Exams" && (
          <TeacherClassExam classId={classData._id} />
        )}
        {activeTab === "Material" && (
          <Material role="Teacher" classId={classData._id} />
        )}
      </div>

      {/* Edit Class Modal */}
      <EditClass
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        classData={classData}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default TeacherClass;
