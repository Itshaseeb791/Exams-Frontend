import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, ChevronDown } from "lucide-react";
import ManageExamTable from "./ManageExamTable";
import CreateExam from "./CreateExam";
import ConfirmationModal from "./ConfirmationModal";
import ViewExam from "./ViewExam";
import DropDownMenu from "./DropDownMenu";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

const TeacherClassExam = ({ classId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // Filters & Sorting
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [sortBy, setSortBy] = useState("Date");


  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/exams`, {
          params: classId ? { classId } : undefined,
        });

        const apiExams = res.data?.data || [];

        const mapped = apiExams.map((exam) => {
          const start = exam.startTime
            ? new Date(exam.startTime)
            : null;

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

          return {
            id: exam._id,
            title: exam.title,
            subject: "", // backend doesn't have subject; optional
            questions: mcqCount + shortCount,
            status:
              exam.status === "published"
                ? "Published"
                : exam.status === "completed"
                  ? "Completed"
                  : "Draft",
            // Fallback: treat published exams as active if isActive is undefined
            isActive:
              typeof exam.isActive === "boolean"
                ? exam.isActive
                : exam.status === "published",
            date: formattedDate,
            duration: exam.durationMinutes || 0,
            passingMarks: exam.passingMarks,
            questionsList,
          };
        });

        setExams(mapped);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      }
    };

    fetchExams();
  }, [classId]);

  const handleSaveExam = async (newExam) => {

    const mcqQuestions =
      (newExam.questions || [])
        .filter((q) => q.type === "mcq")
        .map((q) => ({
          question: q.text,
          options: q.options,
          correctOptionIndex: q.correctOption,
          marks: Number(q.marks),
        })) || [];

    const startTimeIso =
      newExam.date && newExam.startTime
        ? new Date(`${newExam.date}T${newExam.startTime}:00`).toISOString()
        : new Date().toISOString();

    const endTimeIso =
      newExam.date && newExam.endTime
        ? new Date(`${newExam.date}T${newExam.endTime}:00`).toISOString()
        : new Date().toISOString();

    const payload = {
      classId,
      title: newExam.title,
      description: "",
      passingMarks: Number(newExam.passingMarks || 0),
      totalMarks:
        typeof newExam.totalMarks === "number"
          ? newExam.totalMarks
          : mcqQuestions.reduce((sum, q) => sum + (q.marks || 0), 0),
      mcqQuestions,
      shortQuestions: [],
      randomizeQuestions: Boolean(newExam.randomize),
      startTime: startTimeIso,
      endTime: endTimeIso,
      durationMinutes: Number(newExam.duration || 0),
      status:
        newExam.status === "Published"
          ? "published"
          : newExam.status === "Completed"
            ? "completed"
            : "draft",
    };

    let apiExam;
    try {
      if (editingExam && editingExam.id) {

        const res = await axios.put(
          `${API_BASE_URL}/exams/${editingExam.id}`,
          payload,
        );
        apiExam = res.data?.data || null;
      } else {
        // Create new exam
        const res = await axios.post(`${API_BASE_URL}/exams`, payload);
        apiExam = res.data?.data || null;
      }
    } catch (err) {
      console.error("Failed to save exam:", err);
      return;
    }

    const formatDateTime = (dateStr, timeStr) => {
      // If date already formatted (from edit without change), return as it is
      if (!dateStr || !timeStr) return "TBD";
      if (dateStr.includes(",")) return dateStr; // Simple check if already formatted

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const [year, m, d] = dateStr.split("-");
      const monthName = months[parseInt(m) - 1] || "";

      let [hours, minutes] = timeStr.split(":");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${monthName} ${parseInt(d)}, ${year}, ${hours}:${minutes} ${ampm}`;
    };

    const formattedExam = {
      ...newExam,
      id: apiExam?._id || (editingExam ? editingExam.id : Date.now()),
      title: newExam.title || apiExam?.title || "Untitled Exam",
      questions: newExam.questions.length,
      status: newExam.status,
      isActive: newExam.status === "Published",
      date:
        newExam.date && newExam.date.includes(",")
          ? newExam.date
          : formatDateTime(newExam.date, newExam.startTime),
    };

    if (editingExam) {
      setExams(
        exams.map((ex) => (ex.id === editingExam.id ? formattedExam : ex)),
      );
    } else {
      setExams([formattedExam, ...exams]);
    }

    setIsCreating(false);
    setEditingExam(null);
  };

  const handleEdit = (exam) => {
    // Parse the date string "Nov 26, 2025, 10:00 AM" back to form values
    let parsedDate = "";
    let parsedStartTime = "";
    let parsedEndTime = "";

    try {
      if (exam.date && exam.date !== "TBD") {
        const parts = exam.date.split(", "); // ["Nov 26", "2025", "10:00 AM"]
        if (parts.length >= 3) {
          const [monthDay, year] = [parts[0], parts[1]];
          const [monthStr, day] = monthDay.split(" ");
          const timeStr = parts[2];

          const months = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12",
          };

          const month = months[monthStr];
          const formattedDay = parseInt(day).toString().padStart(2, "0");
          parsedDate = `${year}-${month}-${formattedDay}`;

          // Parse Start Time
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":");

          if (hours === "12") {
            hours = "00";
          }
          if (modifier === "PM") {
            hours = parseInt(hours, 10) + 12;
          }
          parsedStartTime = `${hours.toString().padStart(2, "0")}:${minutes}`;

          // Calculate End Time based on Duration
          if (exam.duration) {
            const startDate = new Date(`2000-01-01T${parsedStartTime}:00`);
            const endDate = new Date(
              startDate.getTime() + exam.duration * 60000,
            );
            const endHours = endDate.getHours().toString().padStart(2, "0");
            const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
            parsedEndTime = `${endHours}:${endMinutes}`;
          }
        }
      }
    } catch (e) {
      console.error("Error parsing date:", e);
    }

    const initialData = {
      ...exam,
      questions: exam.questionsList || [],
      totalMarks: exam.questionsList
        ? exam.questionsList.reduce((sum, q) => sum + parseInt(q.marks), 0)
        : 0,
      date: parsedDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    };
    setEditingExam(initialData);
    setIsCreating(true);
  };

  const handleDelete = (exam) => {
    setExamToDelete(exam);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/exams/${examToDelete.id}`);
      setExams(exams.filter((e) => e.id !== examToDelete.id));
    } catch (err) {
      console.error("Failed to delete exam:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  const handleView = async (exam) => {
    try {

      const res = await axios.get(
        `${API_BASE_URL}/exams/${exam.id}`,
      );
      const backendExam = res.data?.data;


      const mcqQuestions =
        backendExam?.mcqQuestions?.map((q, idx) => ({
          id: `mcq-${idx}`,
          type: "mcq",
          text: q.question,
          marks: q.marks,
          options: q.options,
          correctOption: q.correctOptionIndex,
        })) || [];

      const shortQuestions =
        backendExam?.shortQuestions?.map((q, idx) => ({
          id: `short-${idx}`,
          type: "subjective",
          text: q.question,
          marks: q.marks,
          options: [],
        })) || [];

      const questionsList = [...mcqQuestions, ...shortQuestions];

      const viewExamData = {
        ...exam,
        title: backendExam?.title || exam.title,
        questionsList,
        questions: questionsList.length,
        totalMarks:
          backendExam?.totalMarks ??
          questionsList.reduce((sum, q) => sum + (q.marks || 0), 0),
      };

      setViewingExam(viewExamData);
    } catch (err) {
      console.error("Failed to fetch exam details:", err);
      setViewingExam(exam);
    }
  };

  const handleToggleActive = async (exam) => {
    const nextIsActive = !exam.isActive;

    try {
      await axios.patch(`${API_BASE_URL}/exams/${exam.id}/active`, {
        isActive: nextIsActive,
      });

      setExams((prev) =>
        prev.map((e) =>
          e.id === exam.id
            ? {
              ...e,
              isActive: nextIsActive,
              status: nextIsActive ? "Published" : "Draft",
            }
            : e,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle exam active state:", err);
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedExams = [...exams]
    .filter(
      (exam) => filterStatus === "All Statuses" || exam.status === filterStatus,
    )
    .sort((a, b) => {
      if (sortBy === "A-Z") return a.title.localeCompare(b.title);
      if (sortBy === "Z-A") return b.title.localeCompare(a.title);
      if (sortBy === "Date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Newest first
      }
      return 0;
    });

  const statuses = ["All Statuses", ...new Set(exams.map((e) => e.status))];

  if (isCreating) {
    return (
      <CreateExam
        onBack={() => {
          setIsCreating(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        initialData={editingExam}
      />
    );
  }

  if (viewingExam) {
    return <ViewExam exam={viewingExam} onBack={() => setViewingExam(null)} />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-[#0F6B75]">Manage Exams</h2>
        <button
          onClick={() => {
            setEditingExam(null);
            setIsCreating(true);
          }}
          className="bg-[#0F6B75] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#0c565e] transition-colors cursor-pointer"
        >
          <PlusCircle size={20} />
          Create New Exam
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Filters */}
        <div className="p-4 flex flex-wrap gap-4 border-b border-gray-200">
          <DropDownMenu
            options={["Date", "A-Z", "Z-A"]}
            value={sortBy}
            onChange={setSortBy}
            prefix="Sort by:"
          />

          <DropDownMenu
            options={statuses}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>

        <ManageExamTable
          exams={filteredAndSortedExams}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${examToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default TeacherClassExam;
