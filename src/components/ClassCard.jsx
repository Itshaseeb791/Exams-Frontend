import { Trash2 } from "lucide-react";

const ClassCard = ({ classData, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-full relative group hover:shadow-xl transition-shadow p-3">
      
      {/* Static Image */}
      <div className="aspect-video overflow-hidden rounded-xl w-full bg-gray-100">
        <img
          src="/class.png"
          alt={classData.className}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="pt-4 px-2 pb-4 flex flex-col grow">
        <h3 className="text-lg font-bold text-gray-800">
          {classData.className}
        </h3>

        <p className="text-sm text-[#0F6B75] font-medium mb-1">
          {classData.courseTitle}
        </p>

        <p className="text-xs text-gray-500 mb-6">
          Semester: {classData.semester} | Credit Hours: {classData.creditHours}
        </p>

        <div className="mt-auto">
          <button
            onClick={onView}
            className="bg-[#0F6B75] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0c565e] transition-colors cursor-pointer"
          >
            View Class
          </button>
        </div>
      </div>

    </div>
  );
};

export default ClassCard;
