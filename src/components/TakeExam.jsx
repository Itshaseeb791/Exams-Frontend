import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShieldAlert,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

// ─────────────────────────────────────────────
// Cheating overlay shown when tab switch detected
// ─────────────────────────────────────────────
const CheatingOverlay = ({ message }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-2xl border border-red-200">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Exam Flagged</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-2">{message}</p>
      <p className="text-xs text-gray-400">
        Your teacher has been notified. You cannot continue this exam.
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Success screen after submission
// ─────────────────────────────────────────────
const SubmittedScreen = ({ score, totalMarks, onFinish }) => (
  <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-6">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
      <CheckCircle size={40} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h2>
      <p className="text-gray-500">You have successfully completed the exam.</p>
    </div>
    <div className="bg-gray-50 p-6 rounded-xl w-full">
      <p className="text-sm text-gray-500 uppercase font-bold mb-1">Your Score</p>
      <p className="text-4xl font-bold text-[#0F6B75]">
        {score}{" "}
        <span className="text-lg text-gray-400 font-medium">/ {totalMarks}</span>
      </p>
    </div>
    <button
      onClick={onFinish}
      className="w-full bg-[#0F6B75] text-white py-3 rounded-lg font-bold hover:bg-[#0c565e] transition-colors"
    >
      Return to Class
    </button>
  </div>
);

// ─────────────────────────────────────────────
// Main TakeExam component
// ─────────────────────────────────────────────
const TakeExam = ({ exam, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Cheating state
  const [isFlagged, setIsFlagged] = useState(false);
  const [flagMessage, setFlagMessage] = useState("");
  const hasFlaggedRef = useRef(false);

  // Stable ref so timer useEffect can call latest handleSubmit without re-subscribing
  const handleSubmitRef = useRef(null);

  // ── Cheating detection ──────────────────────
  const flagCheating = useCallback(async () => {
    // Guard: only flag once, and only if there's a valid attempt
    if (hasFlaggedRef.current || !exam.attemptId) return;
    hasFlaggedRef.current = true;

    // Lock UI immediately — don't wait for API
    const msg =
      "Tab switch detected. Your exam has been flagged for cheating and submission is now blocked.";
    setIsFlagged(true);
    setFlagMessage(msg);
    setSubmitError({ type: "cheating", message: msg });

    try {
      await axios.patch(`${API_BASE_URL}/exams/${exam.attemptId}/flag-cheating`);
    } catch (err) {
      console.error("Failed to flag cheating on server:", err);
      // Stay locked even if network fails — never unlock on error
    }
  }, [exam.attemptId]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flagCheating();
      }
    };

    // Only listen while exam is active
    if (!isSubmitted) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [flagCheating, isSubmitted]);

  // ── Submit logic ────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Hard guards — never submit if flagged or already submitting
    if (submitting || isFlagged || isSubmitted) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const mcqAnswers = exam.questionsList
        .map((q, index) => ({
          questionIndex: index,
          selectedOptionIndex: answers[q.id] !== undefined ? answers[q.id] : null,
        }))
        .filter((a) => a.selectedOptionIndex !== null);

      const payload = { mcqAnswers, shortAnswers: [] };

      if (exam.attemptId) {
        const res = await axios.post(
          `${API_BASE_URL}/student-exams/attempt/${exam.attemptId}/submit`,
          payload
        );
        const apiScore = res.data?.mcqScore;
        
        setScore(typeof apiScore === "number" ? apiScore : computeLocalScore());
      } else {
        setScore(computeLocalScore());
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit exam:", err);

      const status = err.response?.status;
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to submit. Please try again.";

      if (status === 403) {
        // Server also caught cheating — lock down
        setIsFlagged(true);
        hasFlaggedRef.current = true;
        const msg = `Submission blocked: ${backendMessage}`;
        setFlagMessage(msg);
        setSubmitError({ type: "cheating", message: msg });
      } else if (status === 400) {
        setSubmitError({ type: "warning", message: backendMessage });
      } else if (status === 404) {
        setSubmitError({ type: "error", message: "Exam attempt not found. Please contact your teacher." });
      } else if (status === 500) {
        setSubmitError({ type: "error", message: "Server error. Please try again in a moment." });
      } else if (!err.response) {
        setSubmitError({ type: "error", message: "Cannot reach server. Check your internet connection." });
      } else {
        setSubmitError({ type: "error", message: backendMessage });
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, isFlagged, isSubmitted, answers, exam]);

  // Keep ref in sync so timer always calls the latest version
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Local score fallback
  const computeLocalScore = useCallback(() => {
    let total = 0;
    exam.questionsList.forEach((q) => {
      if (answers[q.id] === q.correctOption) total += q.marks;
    });
    return total;
  }, [answers, exam.questionsList]);

  // ── Timer ───────────────────────────────────
  useEffect(() => {
    if (isSubmitted || isFlagged) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use ref to avoid stale closure
          handleSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isFlagged]);

  // ── Helpers ─────────────────────────────────
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    // Locked if submitted or flagged
    if (isSubmitted || isFlagged) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questionsList.length;
  const currentQuestion = exam.questionsList[currentQuestionIndex];

  // ── Render: submitted ───────────────────────
  if (isSubmitted) {
    return <SubmittedScreen score={score} totalMarks={exam.totalMarks} onFinish={onFinish} />;
  }

  // ── Render: exam UI ─────────────────────────
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative">

      {/* Cheating overlay — full screen block */}
      {isFlagged && <CheatingOverlay message={flagMessage} />}

      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center mb-4 shadow-sm">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{exam.title}</h2>
          <p className="text-sm text-gray-500">
            {answeredCount} of {totalQuestions} answered
          </p>
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg transition-colors ${
            timeLeft < 300 ? "bg-red-50 text-red-600 animate-pulse" : "bg-teal-50 text-[#0F6B75]"
          }`}
        >
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Error / warning banner */}
      {submitError && (
        <div
          className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border mb-4 ${
            submitError.type === "cheating"
              ? "bg-red-50 border-red-200 text-red-700"
              : submitError.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {submitError.type === "cheating" ? (
            <Lock size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {submitError.type === "cheating"
                ? "Submission Blocked"
                : submitError.type === "warning"
                ? "Warning"
                : "Submission Failed"}
            </p>
            <p className="text-sm mt-0.5">{submitError.message}</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex gap-6 items-start">

        {/* Question area */}
        <div className="flex-1 space-y-4">
          <div
            className={`bg-white p-8 rounded-2xl border shadow-sm min-h-[400px] flex flex-col transition-all ${
              isFlagged ? "border-red-200 opacity-60 pointer-events-none select-none" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
              </span>
            </div>

            <h3 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3 flex-1">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(currentQuestion.id, idx)}
                  disabled={isFlagged}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                    answers[currentQuestion.id] === idx
                      ? "border-[#0F6B75] bg-teal-50 text-[#0F6B75]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${isFlagged ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentQuestion.id] === idx
                        ? "border-[#0F6B75] bg-[#0F6B75]"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {answers[currentQuestion.id] === idx && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation footer */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              disabled={currentQuestionIndex === 0 || isFlagged}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || isFlagged}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  submitting || isFlagged
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0F6B75] hover:bg-[#0c565e] hover:scale-105 shadow-teal-700/20"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : isFlagged ? (
                  <>
                    <Lock size={18} />
                    Submission Blocked
                  </>
                ) : (
                  <>
                    Submit Exam
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))
                }
                disabled={isFlagged}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#0F6B75] hover:bg-[#0c565e] shadow-lg shadow-teal-700/20 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next Question
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <div className="hidden lg:block w-72 bg-white p-6 rounded-2xl border border-gray-200 sticky top-4">
          <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>
          <div className="grid grid-cols-4 gap-2">
            {exam.questionsList.map((q, idx) => (
              <button
                key={idx}
                onClick={() => !isFlagged && setCurrentQuestionIndex(idx)}
                disabled={isFlagged}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  currentQuestionIndex === idx
                    ? "ring-2 ring-[#0F6B75] ring-offset-2 bg-[#0F6B75] text-white"
                    : answers[q.id] !== undefined
                    ? "bg-teal-100 text-teal-800"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                } ${isFlagged ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#0F6B75]" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-100" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span>Not Answered</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-[#0F6B75] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Flagged warning in palette */}
          {isFlagged && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg">
              <Lock size={14} className="shrink-0" />
              <p className="text-xs font-semibold">Exam locked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;