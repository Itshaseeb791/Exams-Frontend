import { Plus, Trash2, Upload } from "lucide-react";

const AddQuestion = ({
  questions,
  totalMarks,
  newQuestion,
  setNewQuestion,
  onAddQuestion,
  onRemoveQuestion,
  onOptionChange,
  onFileUpload,
  questionErrors,
  errors,
}) => {
  return (
    <div className="space-y-8">
      {/* Add New Question Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Add New Question
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={newQuestion.type}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, type: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="subjective">Subjective (Long Answer)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks
            </label>
            <input
              type="number"
              min="0"
              value={newQuestion.marks}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, marks: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <textarea
            value={newQuestion.text}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, text: e.target.value })
            }
            placeholder="Enter your question here..."
            className={`w-full p-2 border ${
              questionErrors?.text ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none h-24`}
          />
          {questionErrors?.text && (
            <p className="text-red-500 text-xs mt-1">{questionErrors.text}</p>
          )}
        </div>

        {newQuestion.type === "mcq" && (
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Options (Select correct answer)
            </label>
            {newQuestion.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctOption"
                  checked={newQuestion.correctOption === idx}
                  onChange={() =>
                    setNewQuestion({ ...newQuestion, correctOption: idx })
                  }
                  className="w-4 h-4 text-[#0F6B75] focus:ring-[#0F6B75] cursor-pointer"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => onOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={`flex-1 p-2 border ${
                    questionErrors?.options && !opt.trim()
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
                />
              </div>
            ))}
            {questionErrors?.options && (
              <p className="text-red-500 text-xs mt-1">
                {questionErrors.options}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={onAddQuestion}
            className="w-full md:w-auto bg-[#0F6B75] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0c565e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Add Question
          </button>

          <label className="w-full md:w-auto cursor-pointer border border-[#0F6B75] text-[#0F6B75] px-6 py-2 rounded-lg font-medium hover:bg-teal-50 flex items-center justify-center gap-2 transition-colors">
            <Upload size={18} />
            Upload Question Bank
            <input
              type="file"
              className="hidden"
              onChange={onFileUpload}
              accept=".csv,.json,.xlsx"
            />
          </label>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Added Questions ({questions.length})
          </h3>
          <span className="text-sm font-medium bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            Total Marks: {totalMarks}
          </span>
        </div>

        {errors?.questions && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.questions}
          </div>
        )}

        {questions.length === 0 ? (
          <div
            className={`text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed ${
              errors?.questions ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          >
            No questions added yet.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-4 rounded-xl border border-gray-200 relative group"
            >
              <button
                onClick={() => onRemoveQuestion(q.id, q.marks)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
              <div className="flex gap-3">
                <span className="font-bold text-gray-400">Q{idx + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between pr-8">
                    <p className="font-medium text-gray-900">{q.text}</p>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap ml-2 h-fit">
                      {q.marks} Marks
                    </span>
                  </div>
                  <span className="text-xs text-[#0F6B75] font-medium uppercase mt-1 block">
                    {q.type}
                  </span>

                  {q.type === "mcq" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`text-sm px-3 py-1 rounded-md border ${
                            q.correctOption === optIdx
                              ? "bg-teal-50 border-teal-200 text-teal-800"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddQuestion;
