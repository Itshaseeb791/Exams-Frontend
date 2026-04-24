import { useState } from "react";
import { ArrowLeft, ArrowRight, Save, Check, CheckCircle } from "lucide-react";
import AddQuestion from "./AddQuestion";
import Schedule from "./Schedule";

const CreateExam = ({ onBack, onSave, initialData }) => {
  // ... (state remains same)
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      subject: "",
      duration: 60, // minutes
      totalMarks: 0,
      passingMarks: 0,
      questions: [],
      date: "",
      startTime: "",
      endTime: "",
      randomize: false,
    },
  );

  // Step 2: Question State
  const [newQuestion, setNewQuestion] = useState({
    type: "mcq", // mcq | subjective
    text: "",
    marks: 1,
    options: ["", "", "", ""],
    correctOption: 0,
  });

  const steps = [
    { number: 1, title: "Exam Details" },
    { number: 2, title: "Add Questions" },
    { number: 3, title: "Schedule Exam" },
    { number: 4, title: "Review & Save" },
  ];

  // Error State
  const [errors, setErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Exam title is required";
      if (!formData.subject.trim()) newErrors.subject = "Subject is required";
      if (formData.duration <= 10)
        newErrors.duration = "Duration must be more than 10 minutes";
      if (formData.passingMarks < 0)
        newErrors.passingMarks = "Passing marks cannot be negative";
    }

    if (step === 2) {
      if (formData.questions.length === 0) {
        newErrors.questions = "At least one question must be added";
      }
    }

    if (step === 3) {
      if (!formData.date) newErrors.date = "Date is required";
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";

      if (
        formData.startTime &&
        formData.endTime &&
        formData.startTime >= formData.endTime
      ) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  // ... (handleBack remains same)
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const addQuestion = () => {
    const newQErrors = {};
    let isValid = true;

    if (!newQuestion.text.trim()) {
      newQErrors.text = "Question text is required";
      isValid = false;
    }
    if (parseInt(newQuestion.marks) <= 0) {
      newQErrors.marks = "Marks must be positive";
      isValid = false;
    }

    if (newQuestion.type === "mcq") {
      // Validate options
      // We can use an array of errors or simple check
      if (newQuestion.options.some((opt) => !opt.trim())) {
        newQErrors.options = "All options must be filled";
        isValid = false;
      }
    }

    if (!isValid) {
      setQuestionErrors(newQErrors);
      return;
    }

    // Success path
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...newQuestion, id: Date.now() }],
      totalMarks: formData.totalMarks + parseInt(newQuestion.marks),
    });

    // Reset new question and errors
    setNewQuestion({
      type: "mcq",
      text: "",
      marks: 1,
      options: ["", "", "", ""],
      correctOption: 0,
    });
    setQuestionErrors({});

    // Also clear global 'questions' error if it exists
    if (errors.questions) {
      setErrors({ ...errors, questions: null });
    }
  };

  const removeQuestion = (id, marks) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== id),
      totalMarks: formData.totalMarks - marks,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
    if (questionErrors.options) {
      setQuestionErrors({ ...questionErrors, options: null });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully! (Mock)`);
    }
  };

  const examDetails = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exam Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="Midterm Calculus Exam"
          className={`w-full p-2 border ${
            errors.title ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject / Course
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => updateFormData("subject", e.target.value)}
          placeholder="Mathematics"
          className={`w-full p-2 border ${
            errors.subject ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="10"
            value={formData.duration}
            onChange={(e) => updateFormData("duration", e.target.value)}
            className={`w-full p-2 border ${
              errors.duration ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
          />
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Marks
          </label>
          <input
            type="number"
            min="0"
            value={formData.passingMarks}
            onChange={(e) => updateFormData("passingMarks", e.target.value)}
            className={`w-full p-2 border ${
              errors.passingMarks ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-[#0F6B75] outline-none`}
          />
          {errors.passingMarks && (
            <p className="text-red-500 text-xs mt-1">{errors.passingMarks}</p>
          )}
        </div>
      </div>
    </div>
  );

  const addQuestions = () => (
    <AddQuestion
      questions={formData.questions}
      totalMarks={formData.totalMarks}
      newQuestion={newQuestion}
      setNewQuestion={setNewQuestion}
      onAddQuestion={addQuestion}
      onRemoveQuestion={removeQuestion}
      onOptionChange={handleOptionChange}
      onFileUpload={handleFileUpload}
      questionErrors={questionErrors}
      errors={errors}
    />
  );

  const scheduleExam = () => (
    <Schedule
      formData={formData}
      updateFormData={updateFormData}
      errors={errors}
    />
  );

  const saveExam = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 flex items-start gap-4">
        <CheckCircle className="text-[#0F6B75] mt-1 shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-bold text-[#0F6B75]">
            Ready to Publish!
          </h3>
          <p className="text-teal-700">
            Please review the details below before publishing the exam.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <div>
            <p className="text-sm text-gray-500">Exam Title</p>
            <p className="font-medium text-gray-900">{formData.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium text-gray-900">{formData.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-medium text-gray-900">
              {formData.date} | {formData.startTime} - {formData.endTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Format</p>
            <p className="font-medium text-gray-900">
              {formData.questions.length} Questions | {formData.totalMarks}{" "}
              Marks
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium text-gray-900">
              {formData.duration} mins
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Randomization</p>
            <p className="font-medium text-gray-900">
              {formData.randomize ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-20 md:mb-0">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#0F6B75] mb-8">
        Create New Exam
      </h2>

      {/* Stepper */}
      <div className="flex items-center justify-between px-2 md:px-10 mb-10 relative overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 translate-y-[-50%]"></div>
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex flex-col items-center gap-2 relative z-10 min-w-20 md:min-w-0 ${
              step.number <= currentStep ? "text-[#0F6B75]" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-colors ${
                step.number < currentStep
                  ? "bg-[#0F6B75] text-white"
                  : step.number === currentStep
                    ? "bg-white border-2 border-[#0F6B75] text-[#0F6B75]"
                    : "bg-white border-2 border-gray-200 text-gray-400"
              }`}
            >
              {step.number < currentStep ? <Check size={16} /> : step.number}
            </div>
            <span className="text-xs md:text-sm font-medium bg-white px-2 whitespace-nowrap">
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mb-10">
        {currentStep === 1 && examDetails()}
        {currentStep === 2 && addQuestions()}
        {currentStep === 3 && scheduleExam()}
        {currentStep === 4 && saveExam()}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row justify-between pt-6 border-t border-gray-100 gap-4">
        <button
          onClick={handleBack}
          className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors order-2 md:order-1 cursor-pointer"
        >
          <ArrowLeft size={18} />
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto order-1 md:order-2">
          {currentStep === 4 ? (
            <>
              <button
                onClick={() => onSave({ ...formData, status: "Draft" })}
                className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-[#0F6B75] border border-[#0F6B75] hover:bg-teal-50 transition-colors cursor-pointer"
              >
                Save Draft
              </button>
              <button
                onClick={() => onSave({ ...formData, status: "Published" })}
                className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white bg-[#0F6B75] hover:bg-[#0c565e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save size={18} />
                Publish Exam
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white bg-[#0F6B75] hover:bg-[#0c565e] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Next Step
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
