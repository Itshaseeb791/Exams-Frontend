import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Calendar, Clock, BookOpen, PenTool, AlertCircle, ShieldAlert } from "lucide-react";
import TakeExam from "./TakeExam";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

const StudentClassExam = () => {
  const [takingExam, setTakingExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingExamId, setStartingExamId] = useState(null); // per-card loading

  const attemptIdRef = useRef(null);
  const hasFlaggedRef = useRef(false);

  // ================= CHEATING DETECTION =================
  const flagCheating = useCallback(async () => {
    if (!attemptIdRef.current || hasFlaggedRef.current) return;
    hasFlaggedRef.current = true;

    try {
      await axios.patch(
        `${API_BASE_URL}/exams/${attemptIdRef.current}/flag-cheating` // ✅ fixed URL
      );
      console.warn("Cheating flagged: tab change detected");
    } catch (err) {
      console.error("Failed to flag cheating:", err);
      hasFlaggedRef.current = false;
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden") {
      flagCheating();
    }
  }, [flagCheating]);

  useEffect(() => {
    if (takingExam?.attemptId) {
      attemptIdRef.current = takingExam.attemptId;
      hasFlaggedRef.current = false;
      document.addEventListener("visibilitychange", handleVisibilityChange);
    } else {
      attemptIdRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [takingExam, handleVisibilityChange]);

  // ================= FETCH EXAMS =================
  useEffect(() => {
    const fetchAvailableExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/student-exams/available`);
        const apiExams = res.data?.data || [];

        const mapped = apiExams.map((exam) => {
          const start = exam.startTime ? new Date(exam.startTime) : null;

          const questionsList = [
            ...(exam.mcqQuestions || []).map((q, idx) => ({
              id: `mcq-${idx}`,
              text: q.question,
              type: "mcq",
              marks: q.marks,
              options: q.options,
            })),
            ...(exam.shortQuestions || []).map((q, idx) => ({
              id: `short-${idx}`,
              text: q.question,
              type: "subjective",
              marks: q.marks,
              options: [],
            })),
          ];

          const totalMarks =
            exam.totalMarks ??
            questionsList.reduce((sum, q) => sum + (q.marks || 0), 0);

          return {
            id: exam._id,
            title: exam.title,
            subject: "",
            questions: questionsList.length,
            status: "Available",
            date: start?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) || "",
            startTime: start?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) || "",
            duration: exam.durationMinutes || 0,
            totalMarks,
          };
        });

        setExams(mapped);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        // ✅ Extract backend message or fall back to generic
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load exams. Please try again.";
        setError({ type: "fetch", message });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableExams();
  }, []);

  // ================= START EXAM =================
  const handleTakeExam = async (exam) => {
    try {
      setStartingExamId(exam.id); // show spinner on that specific card
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const studentId = currentUser?.id || currentUser?._id;

      if (!studentId) {
        setError({ type: "start", examId: exam.id, message: "User session expired. Please log in again." });
        return;
      }

      // Start attempt
      const attemptRes = await axios.post(
        `${API_BASE_URL}/student-exams/${exam.id}/start`,
        { studentId }
      );
      const attempt = attemptRes.data?.data;

      // Fetch full exam details
      const res = await axios.get(`${API_BASE_URL}/student-exams/${exam.id}`);
      const backendExam = res.data?.data;

      if (!backendExam) {
        setError({ type: "start", examId: exam.id, message: "Exam details could not be loaded." });
        return;
      }

      const questionsList = [
        ...(backendExam.mcqQuestions || []).map((q, idx) => ({
          id: `mcq-${idx}`,
          text: q.question,
          type: "mcq",
          marks: q.marks,
          options: q.options,
        })),
        ...(backendExam.shortQuestions || []).map((q, idx) => ({
          id: `short-${idx}`,
          text: q.question,
          type: "subjective",
          marks: q.marks,
          options: [],
        })),
      ];

      const totalMarks =
        backendExam.totalMarks ??
        questionsList.reduce((sum, q) => sum + (q.marks || 0), 0);

      const start = backendExam.startTime ? new Date(backendExam.startTime) : null;

      setTakingExam({
        id: backendExam._id,
        title: backendExam.title,
        subject: "",
        questions: questionsList.length,
        status: "Available",
        date: start?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) || "",
        startTime: start?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) || "",
        duration: backendExam.durationMinutes || 0,
        totalMarks,
        questionsList,
        attemptId: attempt?._id,
      });

    } catch (err) {
      console.error("Failed to start exam:", err);

      const status = err.response?.status;
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again.";

      // ✅ Map status codes to user-friendly messages
      let message = backendMessage;
      if (status === 403) {
        message = `Access denied: ${backendMessage}`;
      } else if (status === 400) {
        message = backendMessage; // backend message is already descriptive (e.g. "Exam not started yet")
      } else if (status === 404) {
        message = "Exam not found. It may have been removed.";
      } else if (status === 500) {
        message = "Server error. Please try again later.";
      } else if (!err.response) {
        message = "Cannot reach server. Check your internet connection.";
      }

      setError({ type: "start", examId: exam.id, message });
    } finally {
      setStartingExamId(null);
    }
  };

  // ================= FINISH EXAM =================
  const handleFinishExam = () => {
    setTakingExam(null);
  };

  // ================= RENDER =================
  if (takingExam) {
    return <TakeExam exam={takingExam} onFinish={handleFinishExam} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-teal-700">
        <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading exams…</span>
      </div>
    );
  }

  // Full page fetch error
  if (error?.type === "fetch") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle size={40} className="text-red-400" strokeWidth={1.5} />
        <p className="text-gray-700 font-medium">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0F6B75] text-white text-sm rounded-lg hover:bg-[#0c565e] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F6B75] mb-6">Available Exams</h2>

      {exams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <BookOpen size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">No exams available right now.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => {
          const isStarting = startingExamId === exam.id;
          const examError = error?.type === "start" && error?.examId === exam.id ? error.message : null;

          return (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{exam.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      exam.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : exam.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}>
                      {exam.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 font-medium mb-3">{exam.subject}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-[#0F6B75]" />
                      <span>{exam.date} at {exam.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-[#0F6B75]" />
                      <span>{exam.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={16} className="text-[#0F6B75]" />
                      <span>{exam.questions} Qs ({exam.totalMarks} Marks)</span>
                    </div>
                  </div>

                  {/* ✅ Per-card error shown inline below exam info */}
                  {examError && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg">
                      <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">{examError}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {exam.status === "Completed" ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Your Score</p>
                      <p className="text-xl font-bold text-[#0F6B75]">
                        {exam.score} / {exam.totalMarks}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTakeExam(exam)}
                      disabled={exam.status !== "Available" || isStarting}
                      className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors min-w-[130px] justify-center ${
                        exam.status === "Available" && !isStarting
                          ? "bg-[#0F6B75] text-white hover:bg-[#0c565e] shadow-sm cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isStarting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Starting…
                        </>
                      ) : exam.status === "Available" ? (
                        <>
                          <PenTool size={18} />
                          Take Exam
                        </>
                      ) : (
                        <>
                          <Clock size={18} />
                          Scheduled
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentClassExam;