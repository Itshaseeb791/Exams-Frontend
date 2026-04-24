import { useState, useEffect, useMemo } from "react";
import { Award, Clock, CheckCircle, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import DropDownMenu from "../components/DropDownMenu";
import { jsPDF } from "jspdf";

// ─── PDF generator (uses jsPDF loaded via CDN — add to index.html) ───────────
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

const generatePDF = (report, examTitle) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const PRIMARY = "#0F6B75";
  const DARK    = "#1a1a2e";
  const GRAY    = "#6b7280";
  const LIGHT   = "#f0f9fa";
  const W       = 210;
  const MARGIN  = 16;
  const COL     = W - MARGIN * 2;
  let y         = 0;

  // ── helpers ────────────────────────────────────────────────────────────────
  const newPage = () => { doc.addPage(); y = 20; };

  const checkPage = (needed = 12) => {
    if (y + needed > 275) newPage();
  };

  const hLine = (color = "#e5e7eb", lw = 0.3) => {
    doc.setDrawColor(color);
    doc.setLineWidth(lw);
    doc.line(MARGIN, y, W - MARGIN, y);
  };

  const sectionTitle = (text) => {
    checkPage(18);
    y += 6;
    doc.setFillColor(LIGHT);
    doc.roundedRect(MARGIN, y, COL, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY);
    doc.text(text.toUpperCase(), MARGIN + 4, y + 6);
    y += 13;
  };

  const pill = (text, x, py, bg, fg) => {
    doc.setFillColor(bg);
    doc.roundedRect(x, py - 4, doc.getTextWidth(text) + 6, 6, 1.5, 1.5, "F");
    doc.setTextColor(fg);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(text, x + 3, py);
  };

  const levelColor = (level) => {
    if (!level) return ["#e5e7eb", GRAY];
    const l = level.toLowerCase();
    if (l === "strong" || l === "excellent") return ["#d1fae5", "#065f46"];
    if (l === "average" || l === "good")     return ["#dbeafe", "#1e40af"];
    return ["#fee2e2", "#991b1b"];
  };

  const wrapText = (text, maxW, fontSize = 9) => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(String(text || ""), maxW);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — HEADER
  // ════════════════════════════════════════════════════════════════════════════
  doc.setFillColor(PRIMARY);
  doc.rect(0, 0, W, 48, "F");

  // accent stripe
  doc.setFillColor("#0c565e");
  doc.rect(0, 42, W, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#ffffff");
  doc.text("Student Performance Report", MARGIN, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#b2e4e8");
  doc.text(`${report.student_name}  ·  ${report.subject}`, MARGIN, 30);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN, 38);

  y = 60;

  // ── SUMMARY CARDS ──────────────────────────────────────────────────────────
  const cards = [
    { label: "Total Questions", value: report.summary?.total_questions ?? "—" },
    { label: "Correct",         value: report.summary?.correct ?? "—" },
    { label: "Incorrect",       value: report.summary?.incorrect ?? "—" },
    { label: "Score",           value: `${report.summary?.percentage ?? 0}%` },
  ];

  const cw = (COL - 9) / 4;
  cards.forEach((c, i) => {
    const cx = MARGIN + i * (cw + 3);
    doc.setFillColor("#f8fffe");
    doc.setDrawColor(PRIMARY);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, y, cw, 22, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(PRIMARY);
    doc.text(String(c.value), cx + cw / 2, y + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(GRAY);
    doc.text(c.label, cx + cw / 2, y + 18, { align: "center" });
  });

  y += 28;

  // overall level badge
  const [lvlBg, lvlFg] = levelColor(report.summary?.overall_level);
  pill(`Overall: ${report.summary?.overall_level ?? "—"}`, MARGIN, y, lvlBg, lvlFg);
  y += 8;

  // ════════════════════════════════════════════════════════════════════════════
  // TOPIC ANALYSIS
  // ════════════════════════════════════════════════════════════════════════════
  sectionTitle("Topic Analysis");

  (report.topic_analysis || []).forEach((t) => {
    checkPage(20);
    const barW = Math.round(((t.accuracy_percentage || 0) / 100) * (COL - 60));
    const [bg, fg] = levelColor(t.level);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    doc.text(t.topic || "—", MARGIN, y);

    pill(t.level || "—", W - MARGIN - doc.getTextWidth(t.level || "—") - 10, y, bg, fg);

    y += 5;

    // progress bar bg
    doc.setFillColor("#e5e7eb");
    doc.roundedRect(MARGIN, y, COL - 60, 4, 1, 1, "F");
    // progress bar fill
    if (barW > 0) {
      doc.setFillColor(PRIMARY);
      doc.roundedRect(MARGIN, y, barW, 4, 1, 1, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRAY);
    doc.text(
      `${t.correct_answers}/${t.total_questions} correct  ·  ${t.accuracy_percentage ?? 0}%`,
      MARGIN + COL - 58, y + 3.5
    );

    y += 8;

    if (t.key_issues && t.key_issues !== "null") {
      const lines = wrapText(`⚠ ${t.key_issues}`, COL, 8);
      doc.setTextColor("#92400e");
      doc.setFont("helvetica", "italic");
      lines.forEach((l) => { checkPage(5); doc.text(l, MARGIN + 2, y); y += 4.5; });
    }

    y += 3;
    hLine();
    y += 3;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // QUESTION ANALYSIS
  // ════════════════════════════════════════════════════════════════════════════
  sectionTitle("Question-by-Question Analysis");

  (report.question_analysis || []).forEach((q, idx) => {
    checkPage(30);

    const statusColors = {
      "Correct":           ["#d1fae5", "#065f46"],
      "Incorrect":         ["#fee2e2", "#991b1b"],
      "Partially Correct": ["#fef3c7", "#92400e"],
    };
    const [sBg, sFg] = statusColors[q.status] || ["#e5e7eb", GRAY];

    // question number chip
    doc.setFillColor(PRIMARY);
    doc.circle(MARGIN + 3.5, y + 1, 3.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor("#ffffff");
    doc.text(String(idx + 1), MARGIN + 3.5, y + 1.8, { align: "center" });

    // question text
    const qLines = wrapText(q.question, COL - 12, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    qLines.forEach((l) => { doc.text(l, MARGIN + 9, y + 2); y += 5; });

    // topic + status pills
    pill(q.topic || "General", MARGIN + 9, y + 2, "#e0f2fe", "#0369a1");
    pill(q.status || "—", MARGIN + 9 + doc.getTextWidth(q.topic || "General") + 12, y + 2, sBg, sFg);
    y += 7;

    // answers
    const answerRows = [
      { label: "Your Answer",    val: q.student_answer, color: q.status === "Correct" ? "#065f46" : "#991b1b" },
      { label: "Correct Answer", val: q.correct_answer, color: "#065f46" },
    ];
    answerRows.forEach(({ label, val, color }) => {
      checkPage(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(GRAY);
      doc.text(`${label}:`, MARGIN + 9, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(color);
      const vLines = wrapText(val || "—", COL - 50, 8);
      vLines.forEach((l, i) => {
        doc.text(l, MARGIN + 38, y + i * 4.5);
      });
      y += Math.max(5, vLines.length * 4.5);
    });

    // explanation
    if (q.explanation) {
      checkPage(10);
      doc.setFillColor("#fffbeb");
      const expLines = wrapText(q.explanation, COL - 14, 8);
      const expH = expLines.length * 4.5 + 5;
      doc.roundedRect(MARGIN + 9, y, COL - 9, expH, 1.5, 1.5, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor("#78350f");
      expLines.forEach((l, i) => { doc.text(l, MARGIN + 12, y + 4 + i * 4.5); });
      y += expH + 3;
    }

    y += 2;
    hLine("#e5e7eb", 0.2);
    y += 4;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WEAK AREAS
  // ════════════════════════════════════════════════════════════════════════════
  if ((report.weak_areas || []).length > 0) {
    sectionTitle("Weak Areas Diagnosis");
    (report.weak_areas || []).forEach((w) => {
      checkPage(22);
      doc.setFillColor("#fff1f2");
      doc.setDrawColor("#fca5a5");
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, COL, 1, 1, 1, "F"); // placeholder, will resize
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#991b1b");
      doc.text(w.topic || "—", MARGIN + 3, y + 5);
      y += 8;

      const lines = wrapText(w.reason || "", COL - 6, 8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(DARK);
      lines.forEach((l) => { checkPage(5); doc.text(l, MARGIN + 3, y); y += 4.5; });

      if (w.common_patterns) {
        const pLines = wrapText(`Pattern: ${w.common_patterns}`, COL - 6, 8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(GRAY);
        pLines.forEach((l) => { checkPage(5); doc.text(l, MARGIN + 3, y); y += 4.5; });
      }
      y += 5;
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STRENGTHS
  // ════════════════════════════════════════════════════════════════════════════
  if ((report.strengths || []).length > 0) {
    sectionTitle("Strengths");
    (report.strengths || []).forEach((s) => {
      checkPage(10);
      const lines = wrapText(`✓  ${s}`, COL - 4, 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor("#065f46");
      lines.forEach((l) => { doc.text(l, MARGIN + 2, y); y += 5; });
    });
    y += 4;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STUDY PLAN
  // ════════════════════════════════════════════════════════════════════════════
  if ((report.study_plan || []).length > 0) {
    sectionTitle("Personalized Study Plan");
    (report.study_plan || []).forEach((sp, i) => {
      checkPage(36);
      const priorityColors = {
        High:   ["#fee2e2", "#991b1b"],
        Medium: ["#fef3c7", "#92400e"],
        Low:    ["#d1fae5", "#065f46"],
      };
      const [pBg, pFg] = priorityColors[sp.priority] || ["#e5e7eb", GRAY];

      doc.setFillColor("#f8fffe");
      doc.setDrawColor("#d1fae5");
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, COL, 8, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(PRIMARY);
      doc.text(`${i + 1}. ${sp.topic || "—"}`, MARGIN + 4, y + 5.5);
      pill(sp.priority || "—", W - MARGIN - 22, y + 5.5, pBg, pFg);
      y += 11;

      const rows = [
        { label: "What to study",      val: sp.what_to_study },
        { label: "Practice type",       val: sp.practice_type },
        { label: "Daily plan",          val: sp.daily_plan },
        { label: "Est. improvement",    val: sp.estimated_improvement_time },
      ];
      rows.forEach(({ label, val }) => {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(GRAY);
        doc.text(`${label}:`, MARGIN + 4, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(DARK);
        const vLines = wrapText(val || "—", COL - 50, 8);
        vLines.forEach((l, li) => doc.text(l, MARGIN + 42, y + li * 4.5));
        y += Math.max(6, vLines.length * 4.5);
      });
      y += 4;
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 7-DAY PLAN
  // ════════════════════════════════════════════════════════════════════════════
  if ((report.weekly_plan || []).length > 0) {
    sectionTitle("7-Day Study Plan");
    (report.weekly_plan || []).forEach((day, i) => {
      checkPage(12);
      const isEven = i % 2 === 0;
      doc.setFillColor(isEven ? "#f0f9fa" : "#ffffff");
      doc.rect(MARGIN, y - 1, COL, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(PRIMARY);
      doc.text(day.day || `Day ${i + 1}`, MARGIN + 3, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(DARK);
      const fLines = wrapText(day.focus || "—", COL - 30, 8.5);
      fLines.forEach((l, li) => doc.text(l, MARGIN + 28, y + 4.5 + li * 5));
      y += Math.max(8, fLines.length * 5 + 2);
    });
    y += 4;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  if ((report.recommendations || []).length > 0) {
    sectionTitle("Smart Recommendations");
    (report.recommendations || []).forEach((rec, i) => {
      checkPage(10);
      const lines = wrapText(`${i + 1}.  ${rec}`, COL - 4, 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      lines.forEach((l) => { checkPage(5); doc.text(l, MARGIN + 2, y); y += 5; });
      y += 2;
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FOOTER on every page
  // ════════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(PRIMARY);
    doc.rect(0, 287, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#b2e4e8");
    doc.text(`${report.student_name} · ${report.subject} Performance Report`, MARGIN, 293);
    doc.text(`Page ${p} of ${totalPages}`, W - MARGIN, 293, { align: "right" });
  }

  // open in new tab
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGrade = (obtained, total) => {
  if (!total) return "N/A";
  const pct = (obtained / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "A-";
  if (pct >= 75) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 65) return "B-";
  if (pct >= 60) return "C+";
  if (pct >= 55) return "C";
  if (pct >= 50) return "D";
  return "F";
};

const gradeColor = (grade) => {
  if (grade.startsWith("A")) return "bg-green-100 text-green-700";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
  if (grade.startsWith("D")) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const getTimeTaken = (startedAt, submittedAt) => {
  if (!startedAt || !submittedAt) return null;
  const diff = new Date(submittedAt) - new Date(startedAt);
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m` : "<1m";
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [reportLoading, setReportLoading] = useState({}); // { [attemptId]: true/false }
  const [reportError, setReportError] = useState({});     // { [attemptId]: "error msg" }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = currentUser.id;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/results/student/${userId}`);
        setResults(data.results || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [userId]);

  // ── Generate Report ────────────────────────────────────────────────────────
  const handleGenerateReport = async (attemptId, examTitle) => {
    setReportLoading((prev) => ({ ...prev, [attemptId]: true }));
    setReportError((prev) => ({ ...prev, [attemptId]: null }));

    try {
      const { data } = await axios.get(`/api/exams/report/${attemptId}`);
      generatePDF(data.data, examTitle);
    } catch (err) {
      setReportError((prev) => ({
        ...prev,
        [attemptId]: err.response?.data?.error || "Failed to generate report.",
      }));
    } finally {
      setReportLoading((prev) => ({ ...prev, [attemptId]: false }));
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const classOptions = useMemo(() => {
    const unique = [
      ...new Set(results.map((r) => r.examId?.classId?.className).filter(Boolean)),
    ];
    return ["All Classes", ...unique];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedClass === "All Classes") return results;
    return results.filter((r) => r.examId?.classId?.className === selectedClass);
  }, [results, selectedClass]);

  const stats = useMemo(() => {
    if (!results.length) return { avgPct: 0, completed: 0, avgTime: null };
    const avgPct =
      results.reduce((sum, r) => sum + (r.obtainedMarks / r.totalMarks) * 100, 0) /
      results.length;
    const timings = results
      .map((r) => {
        const start = r.attemptId?.startedAt;
        const end = r.attemptId?.submittedAt;
        if (!start || !end) return null;
        return (new Date(end) - new Date(start)) / 60000;
      })
      .filter((t) => t !== null && t > 0);
    const avgTime = timings.length
      ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
      : null;
    return { avgPct: avgPct.toFixed(1), completed: results.length, avgTime };
  }, [results]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-[#0F6B75] font-medium">
        Loading results...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
    );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#0F6B75]">My Results</h1>
        <DropDownMenu
          options={classOptions}
          value={selectedClass}
          onChange={setSelectedClass}
          prefix="Filter by:"
        />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-linear-to-br from-[#0F6B75] to-[#0c565e] p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <Award size={24} />
            <span className="font-medium">Average Score</span>
          </div>
          <h2 className="text-4xl font-bold">{stats.avgPct}%</h2>
          <p className="text-sm opacity-75 mt-2">
            {stats.avgPct >= 85
              ? "Excellent performance"
              : stats.avgPct >= 70
              ? "Good performance"
              : stats.avgPct >= 50
              ? "Needs improvement"
              : "Keep practicing"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <CheckCircle size={24} className="text-green-500" />
            <span className="font-medium">Exams Completed</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{stats.completed}</h2>
          <p className="text-sm text-gray-400 mt-2">
            {results.filter((r) => r.isPassed).length} passed ·{" "}
            {results.filter((r) => !r.isPassed).length} failed
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Clock size={24} className="text-blue-500" />
            <span className="font-medium">Avg Time / Exam</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {stats.avgTime ? `${stats.avgTime}m` : "—"}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {stats.avgTime ? "Average completion time" : "No timing data yet"}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-bold text-gray-800 p-6 border-b border-gray-200">
          Recent Exams
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""})
          </span>
        </h3>

        {filteredResults.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No results found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredResults.map((res) => {
              const pct = Math.round((res.obtainedMarks / res.totalMarks) * 100);
              const grade = getGrade(res.obtainedMarks, res.totalMarks);
              const timeTaken = getTimeTaken(
                res.attemptId?.startedAt,
                res.attemptId?.submittedAt
              );
              const date = res.submittedAt
                ? new Date(res.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              const aId = res.attemptId?._id || res.attemptId;
              const isGenerating = reportLoading[aId];
              const genError = reportError[aId];

              return (
                <div
                  key={res._id}
                  className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Left — exam info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {res.examId?.title || "—"}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {res.examId?.classId?.className || "—"} ·{" "}
                      {res.examId?.classId?.courseTitle || ""}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{date}</p>

                    {/* Error message under exam title */}
                    {genError && (
                      <p className="text-red-500 text-xs mt-1">{genError}</p>
                    )}
                  </div>

                  {/* Right — stats + report button */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</p>
                      <p className="font-bold text-xl text-gray-800">
                        {res.obtainedMarks}/{res.totalMarks}
                      </p>
                      <p className="text-xs text-gray-400">{pct}%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Grade</p>
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${gradeColor(grade)}`}>
                        {grade}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                          res.isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {res.isPassed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    {timeTaken && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time</p>
                        <p className="font-bold text-gray-800">{timeTaken}</p>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Grading</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                          res.gradingStatus === "graded"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {res.gradingStatus === "graded" ? "Graded" : "Pending"}
                      </span>
                    </div>

                    {/* ── Generate Report Button ── */}
                    <button
                      onClick={() => handleGenerateReport(aId, res.examId?.title)}
                      disabled={isGenerating}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isGenerating
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#0F6B75] text-white hover:bg-[#0c565e] active:scale-95 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText size={15} />
                          Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentResult;