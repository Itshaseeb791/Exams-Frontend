import React, { useState, useEffect } from "react";
import axios from "axios";
import ManageExamTable from "../components/ManageExamTable";
import DropDownMenu from "../components/DropDownMenu";
import CreateExam from "../components/CreateExam";
import ViewExam from "../components/ViewExam";
import ConfirmationModal from "../components/ConfirmationModal";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

const TeacherExam = () => {
  const navigate = useNavigate();
  const [filterSubject, setFilterSubject] = useState("All Subjects");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const [exams, setExams] = useState([]);

  // ================= GET TEACHER ID =================
  const getTeacherId = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      return currentUser?.id || null;
    } catch {
      return null;
    }
  };

  // ================= FETCH EXAMS =================
  const fetchExams = async () => {
    try {
      const teacherId = getTeacherId();

      if (!teacherId) {
        console.error("No teacher ID found in localStorage");
        return;
      }

      console.log("Fetching exams for teacherId:", teacherId);

      const res = await axios.get(`${API_BASE_URL}/exams/my`, {
        headers: {
          "x-teacher-id": teacherId,
        },
      });

      const apiExams = res.data?.data || [];

      const mapped = apiExams.map((exam) => {
        const start = exam.startTime ? new Date(exam.startTime) : null;

        const formattedDate = start
          ? start.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "TBD";

        const mcqCount = Array.isArray(exam.mcqQuestions)
          ? exam.mcqQuestions.length
          : 0;
        const shortCount = Array.isArray(exam.shortQuestions)
          ? exam.shortQuestions.length
          : 0;

        const questionsList = [
          ...(exam.mcqQuestions || []).map((q, idx) => ({
            id: `mcq-${idx}`,
            type: "mcq",
            text: q.question,
            marks: q.marks,
            options: q.options,
            correctOption: q.correctOptionIndex,
          })),
          ...(exam.shortQuestions || []).map((q, idx) => ({
            id: `short-${idx}`,
            type: "subjective",
            text: q.question,
            marks: q.marks,
            options: [],
          })),
        ];

        const computedTotal =
          exam.totalMarks ??
          questionsList.reduce((sum, q) => sum + (q.marks || 0), 0);

        return {
          id: exam._id,
          title: exam.title,
          subject: exam.classId?.courseTitle || "",
          class: exam.classId?.className || "",
          questions: mcqCount + shortCount,
          questionsList,
          totalMarks: computedTotal,
          status:
            exam.status === "published"
              ? "Published"
              : exam.status === "completed"
                ? "Completed"
                : "Draft",
          date: formattedDate,
          duration: exam.durationMinutes || 0,
        };
      });

      setExams(mapped);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // ================= FILTERS =================
  const subjects = ["All Subjects", ...new Set(exams.map((e) => e.subject).filter(Boolean))];
  const classes = ["All Classes", ...new Set(exams.map((e) => e.class).filter(Boolean))];
  const statuses = ["All Statuses", ...new Set(exams.map((e) => e.status))];

  const filteredExams = exams.filter((exam) => {
    const matchSubject = filterSubject === "All Subjects" || exam.subject === filterSubject;
    const matchClass = filterClass === "All Classes" || exam.class === filterClass;
    const matchStatus = filterStatus === "All Statuses" || exam.status === filterStatus;
    return matchSubject && matchClass && matchStatus;
  });

  // ================= HANDLERS =================
  const handleView = (exam) => {
    setSelectedExam(exam);
    setIsViewMode(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam({ ...exam, questions: exam.questionsList || [] });
    setIsEditMode(true);
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setExams((prev) => prev.filter((e) => e.id !== selectedExam.id));
    setIsDeleteModalOpen(false);
    setSelectedExam(null);
  };

  const handleSaveExam = async (updatedExam) => {
    try {
      const mcqQuestions = (updatedExam.questions || [])
        .filter((q) => q.type === "mcq")
        .map((q) => ({
          question: q.text,
          options: q.options,
          correctOptionIndex: q.correctOption,
          marks: Number(q.marks),
        }));

      const startTimeIso =
        updatedExam.date && updatedExam.startTime
          ? new Date(`${updatedExam.date}T${updatedExam.startTime}:00`).toISOString()
          : undefined;

      const endTimeIso =
        updatedExam.date && updatedExam.endTime
          ? new Date(`${updatedExam.date}T${updatedExam.endTime}:00`).toISOString()
          : undefined;

      const payload = {
        title: updatedExam.title,
        description: "",
        passingMarks: Number(updatedExam.passingMarks || 0),
        totalMarks:
          typeof updatedExam.totalMarks === "number"
            ? updatedExam.totalMarks
            : mcqQuestions.reduce((sum, q) => sum + (q.marks || 0), 0),
        mcqQuestions,
        randomizeQuestions: Boolean(updatedExam.randomize),
        ...(startTimeIso && { startTime: startTimeIso }),
        ...(endTimeIso && { endTime: endTimeIso }),
        durationMinutes: Number(updatedExam.duration || 0),
        status:
          updatedExam.status === "Published"
            ? "published"
            : updatedExam.status === "Completed"
              ? "completed"
              : "draft",
      };

      await axios.put(`${API_BASE_URL}/exams/${updatedExam.id}`, payload);
      await fetchExams();
    } catch (err) {
      console.error("Failed to update exam:", err);
    }

    setIsEditMode(false);
    setSelectedExam(null);
  };

  // ================= VIEWS =================
  if (isViewMode && selectedExam) {
    return (
      <ViewExam
        exam={selectedExam}
        onBack={() => { setIsViewMode(false); setSelectedExam(null); }}
      />
    );
  }

  if (isEditMode && selectedExam) {
    return (
      <CreateExam
        initialData={selectedExam}
        onSave={handleSaveExam}
        onBack={() => { setIsEditMode(false); setSelectedExam(null); }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/teacher-home")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#0F6B75]" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F6B75]">
            All Exams
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <DropDownMenu options={subjects} value={filterSubject} onChange={setFilterSubject} />
          <DropDownMenu options={classes} value={filterClass} onChange={setFilterClass} />
          <DropDownMenu options={statuses} value={filterStatus} onChange={setFilterStatus} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <ManageExamTable
          exams={filteredExams}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${selectedExam?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
};

export default TeacherExam;