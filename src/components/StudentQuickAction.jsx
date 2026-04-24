import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinClass from "./JoinClass";

const StudentQuickAction = ({ onJoinClass }) => {
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Join Class",
      description: "Join a new class using a code",
      buttonText: "Join",
      image: "/createclass.png",
      onClick: () => setIsJoinClassOpen(true),
    },
    {
      title: "My Results",
      description: "Check your latest exam results",
      buttonText: "View",
      image: "/clasperfmce.png",
      onClick: () => navigate("/student-results"),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 relative border border-gray-200">
      <h2 className="text-2xl font-bold text-[#0F6B75] mb-6 pl-2">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {quickActions.map((e, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 flex justify-between items-center relative hover:shadow-md transition-shadow h-full"
          >
            <div className="flex flex-col items-start justify-between h-full gap-4 max-w-[60%]">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                  {e.title}
                </h3>
                <p className="text-sm text-gray-500 leading-snug">
                  {e.description}
                </p>
              </div>
              <button
                onClick={e.onClick}
                className="bg-[#0F6B75] text-white px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-[#0c565e] transition-colors mt-2 cursor-pointer"
              >
                {e.buttonText}
              </button>
            </div>

            <div className="shrink-0 ml-4">
              <img
                src={e.image}
                alt={e.title}
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <JoinClass
        isOpen={isJoinClassOpen}
        onClose={() => setIsJoinClassOpen(false)}
        onJoin={onJoinClass}
      />
    </div>
  );
};

export default StudentQuickAction;
