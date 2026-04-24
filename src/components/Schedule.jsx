import { Calendar, Clock } from "lucide-react";

const Schedule = ({ formData, updateFormData, errors }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData("date", e.target.value)}
              className={`w-full p-2 pl-10 border ${
                errors?.date ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
            />
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          {errors?.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData("startTime", e.target.value)}
                className={`w-full p-2 pl-10 border ${
                  errors?.startTime ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
              />
              <Clock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors?.startTime && (
              <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData("endTime", e.target.value)}
                className={`w-full p-2 pl-10 border ${
                  errors?.endTime ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
              />
              <Clock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors?.endTime && (
              <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Randomize Questions</p>
            <p className="text-sm text-gray-500">
              Shuffle questions for each student to minimize cheating.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.randomize}
              onChange={(e) => updateFormData("randomize", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B75]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
