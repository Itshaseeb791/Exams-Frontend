import { useState, useEffect, useMemo } from "react";
import { Award, Clock, CheckCircle, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import DropDownMenu from "../components/DropDownMenu";
import { jsPDF } from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// SAFE VALUE HELPERS — handle any unexpected data shape from backend
// ─────────────────────────────────────────────────────────────────────────────

const safeStr = (value, fallback = "—") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const joined = value.map((v) => safeStr(v, "")).filter(Boolean).join(", ");
    return joined || fallback;
  }
  if (typeof value === "object") {
    const readable = [
      "reason", "text", "description", "content", "message",
      "focus", "label", "title", "name", "topic", "value",
      "common_patterns", "what_to_study", "daily_plan",
    ];
    for (const key of readable) {
      if (value[key] && typeof value[key] === "string" && value[key].trim()) {
        return value[key].trim();
      }
    }
    try {
      return JSON.stringify(value).replace(/[{}"]/g, "").replace(/,/g, " · ") || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const safeArr = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value);
  return [];
};

const safeNum = (value, fallback = 0) => {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATOR — returns a blob URL, does NOT call window.open itself
// ─────────────────────────────────────────────────────────────────────────────
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

  const newPage   = () => { doc.addPage(); y = 20; };
  const checkPage = (needed = 12) => { if (y + needed > 275) newPage(); };

  const hLine = (color = "#e5e7eb", lw = 0.3) => {
    doc.setDrawColor(color);
    doc.setLineWidth(lw);
    doc.line(MARGIN, y, W - MARGIN, y);
  };

  const wrapText = (text, maxW, fontSize = 9) => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(safeStr(text), maxW);
  };

  const sectionTitle = (text) => {
    checkPage(18);
    y += 6;
    doc.setFillColor(LIGHT);
    doc.roundedRect(MARGIN, y, COL, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY);
    doc.text(safeStr(text).toUpperCase(), MARGIN + 4, y + 6);
    y += 13;
  };

  const pill = (text, x, py, bg, fg) => {
    const label = safeStr(text, "—");
    doc.setFillColor(bg);
    const tw = doc.getTextWidth(label);
    doc.roundedRect(x, py - 4, tw + 6, 6, 1.5, 1.5, "F");
    doc.setTextColor(fg);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(label, x + 3, py);
  };

  const levelColor = (level) => {
    const l = safeStr(level, "").toLowerCase();
    if (l === "strong" || l === "excellent")       return ["#d1fae5", "#065f46"];
    if (l === "average" || l === "good")           return ["#dbeafe", "#1e40af"];
    if (l === "weak" || l === "needs improvement") return ["#fee2e2", "#991b1b"];
    return ["#e5e7eb", GRAY];
  };

  const printLines = (rawText, color, fontStyle = "normal", fontSize = 9, indent = 0) => {
    const lines = wrapText(rawText, COL - indent - 4, fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    lines.forEach((l) => {
      checkPage(5);
      doc.text(l, MARGIN + indent, y);
      y += fontSize * 0.55;
    });
  };

  const summary     = report?.summary || {};
  const studentName = safeStr(report?.student_name, "Student");
  const subject     = safeStr(report?.subject, examTitle || "Exam");

  // ── HEADER ────────────────────────────────────────────────────────────────
  doc.setFillColor(PRIMARY);
  doc.rect(0, 0, W, 48, "F");
  doc.setFillColor("#0c565e");
  doc.rect(0, 42, W, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#ffffff");
  doc.text("Student Performance Report", MARGIN, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#b2e4e8");
  doc.text(`${studentName}  ·  ${subject}`, MARGIN, 30);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    MARGIN, 38
  );

  y = 60;

  // ── SUMMARY CARDS ─────────────────────────────────────────────────────────
  const cards = [
    { label: "Total Questions", value: safeStr(summary.total_questions, "—") },
    { label: "Correct",         value: safeStr(summary.correct, "—") },
    { label: "Incorrect",       value: safeStr(summary.incorrect, "—") },
    { label: "Score",           value: summary.percentage != null ? `${safeNum(summary.percentage)}%` : "—" },
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

  const [lvlBg, lvlFg] = levelColor(summary.overall_level);
  pill(`Overall: ${safeStr(summary.overall_level, "—")}`, MARGIN, y, lvlBg, lvlFg);
  y += 10;

  // ── TOPIC ANALYSIS ────────────────────────────────────────────────────────
  const topicAnalysis = safeArr(report?.topic_analysis);
  if (topicAnalysis.length > 0) {
    sectionTitle("Topic Analysis");
    topicAnalysis.forEach((t) => {
      if (!t) return;
      checkPage(22);
      const topicName  = safeStr(t.topic, "Unknown Topic");
      const levelLabel = safeStr(t.level, "—");
      const accuracy   = safeNum(t.accuracy_percentage, 0);
      const correct    = safeNum(t.correct_answers, 0);
      const total      = safeNum(t.total_questions, 0);
      const barW       = Math.round((accuracy / 100) * (COL - 60));
      const [bg, fg]   = levelColor(levelLabel);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      doc.text(topicName, MARGIN, y);
      pill(levelLabel, W - MARGIN - doc.getTextWidth(levelLabel) - 10, y, bg, fg);
      y += 5;

      doc.setFillColor("#e5e7eb");
      doc.roundedRect(MARGIN, y, COL - 60, 4, 1, 1, "F");
      if (barW > 0) {
        doc.setFillColor(PRIMARY);
        doc.roundedRect(MARGIN, y, barW, 4, 1, 1, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(GRAY);
      doc.text(`${correct}/${total} correct  ·  ${accuracy}%`, MARGIN + COL - 58, y + 3.5);
      y += 8;

      const keyIssues = safeStr(t.key_issues, "");
      if (keyIssues && keyIssues !== "null" && keyIssues !== "—") {
        printLines(`⚠ ${keyIssues}`, "#92400e", "italic", 8, 2);
        y += 2;
      }
      y += 3;
      hLine();
      y += 3;
    });
  }

  // ── QUESTION ANALYSIS ─────────────────────────────────────────────────────
  const questionAnalysis = safeArr(report?.question_analysis);
  if (questionAnalysis.length > 0) {
    sectionTitle("Question-by-Question Analysis");
    questionAnalysis.forEach((q, idx) => {
      if (!q) return;
      checkPage(35);

      const statusColors = {
        "correct":           ["#d1fae5", "#065f46"],
        "incorrect":         ["#fee2e2", "#991b1b"],
        "partially correct": ["#fef3c7", "#92400e"],
      };
      const statusKey    = safeStr(q.status, "").toLowerCase();
      const [sBg, sFg]   = statusColors[statusKey] || ["#e5e7eb", GRAY];
      const questionText = safeStr(q.question, `Question ${idx + 1}`);
      const topicLabel   = safeStr(q.topic, "General");
      const statusLabel  = safeStr(q.status, "—");

      doc.setFillColor(PRIMARY);
      doc.circle(MARGIN + 3.5, y + 1, 3.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor("#ffffff");
      doc.text(String(idx + 1), MARGIN + 3.5, y + 1.8, { align: "center" });

      const qLines = wrapText(questionText, COL - 12, 9);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      qLines.forEach((l) => { doc.text(l, MARGIN + 9, y + 2); y += 5; });

      pill(topicLabel, MARGIN + 9, y + 2, "#e0f2fe", "#0369a1");
      const topicPillW = doc.getTextWidth(topicLabel) + 12;
      pill(statusLabel, MARGIN + 9 + topicPillW, y + 2, sBg, sFg);
      y += 7;

      const concept = safeStr(q.concept_tested, "");
      if (concept && concept !== "—") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(GRAY);
        doc.text(`Concept: ${concept}`, MARGIN + 9, y);
        y += 5;
      }

      const studentAns = safeStr(q.student_answer, "No answer");
      const correctAns = safeStr(q.correct_answer, "—");
      const isCorrect  = statusKey === "correct";

      [
        { label: "Your Answer",    val: studentAns, color: isCorrect ? "#065f46" : "#991b1b" },
        { label: "Correct Answer", val: correctAns, color: "#065f46" },
      ].forEach(({ label, val, color }) => {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(GRAY);
        doc.text(`${label}:`, MARGIN + 9, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(color);
        const vLines = wrapText(val, COL - 50, 8);
        vLines.forEach((l, i) => { doc.text(l, MARGIN + 40, y + i * 4.5); });
        y += Math.max(5, vLines.length * 4.5);
      });

      const mistakeType = safeStr(q.mistake_type, "");
      if (mistakeType && mistakeType !== "null" && mistakeType !== "—") {
        checkPage(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor("#991b1b");
        doc.text("Mistake Type: ", MARGIN + 9, y);
        doc.setFont("helvetica", "normal");
        doc.text(mistakeType, MARGIN + 9 + doc.getTextWidth("Mistake Type: "), y);
        y += 5;
      }

      const explanation = safeStr(q.explanation, "");
      if (explanation && explanation !== "—") {
        checkPage(14);
        doc.setFillColor("#fffbeb");
        const expLines = wrapText(explanation, COL - 16, 8);
        const expH     = expLines.length * 4.5 + 6;
        doc.roundedRect(MARGIN + 9, y, COL - 9, expH, 1.5, 1.5, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor("#78350f");
        expLines.forEach((l, i) => { doc.text(l, MARGIN + 12, y + 4.5 + i * 4.5); });
        y += expH + 3;
      }

      y += 2;
      hLine("#e5e7eb", 0.2);
      y += 5;
    });
  }

  // ── WEAK AREAS ────────────────────────────────────────────────────────────
  const weakAreas = safeArr(report?.weak_areas);
  if (weakAreas.length > 0) {
    sectionTitle("Weak Areas Diagnosis");
    weakAreas.forEach((w) => {
      if (!w) return;
      checkPage(24);
      const topicName = safeStr(
        typeof w === "object" ? (w.topic || w.name || w.title) : w,
        "Unknown Topic"
      );
      const reason  = safeStr(typeof w === "object" ? w.reason : "", "");
      const pattern = safeStr(typeof w === "object" ? w.common_patterns : "", "");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#991b1b");
      doc.text(topicName, MARGIN + 3, y + 5);
      y += 9;

      if (reason && reason !== "—")  { printLines(reason, DARK, "normal", 8.5, 3); y += 2; }
      if (pattern && pattern !== "—") { printLines(`Pattern: ${pattern}`, GRAY, "italic", 8, 3); y += 2; }

      y += 4;
      hLine("#fca5a5", 0.2);
      y += 4;
    });
  }

  // ── STRENGTHS ─────────────────────────────────────────────────────────────
  const strengths = safeArr(report?.strengths);
  if (strengths.length > 0) {
    sectionTitle("Strengths");
    strengths.forEach((s) => {
      if (!s) return;
      checkPage(12);

      let displayText = "";
      if (typeof s === "string") {
        displayText = s;
      } else if (typeof s === "object") {
        const parts = [];
        if (s.topic)           parts.push(s.topic);
        if (s.reason)          parts.push(s.reason);
        if (s.common_patterns) parts.push(s.common_patterns);
        if (parts.length === 0) {
          Object.values(s).forEach((v) => {
            if (typeof v === "string" && v.trim()) parts.push(v.trim());
          });
        }
        displayText = parts.join(" — ");
      }

      if (!displayText) return;
      const lines = wrapText(`✓  ${displayText}`, COL - 4, 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor("#065f46");
      lines.forEach((l) => { checkPage(6); doc.text(l, MARGIN + 2, y); y += 5; });
      y += 2;
    });
    y += 2;
  }

  // ── STUDY PLAN ────────────────────────────────────────────────────────────
  const studyPlan = safeArr(report?.study_plan);
  if (studyPlan.length > 0) {
    sectionTitle("Personalized Study Plan");
    studyPlan.forEach((sp, i) => {
      if (!sp) return;
      checkPage(40);

      const priorityColors = {
        high:   ["#fee2e2", "#991b1b"],
        medium: ["#fef3c7", "#92400e"],
        low:    ["#d1fae5", "#065f46"],
      };
      const priorityKey = safeStr(sp.priority, "").toLowerCase();
      const [pBg, pFg]  = priorityColors[priorityKey] || ["#e5e7eb", GRAY];
      const topicLabel  = safeStr(sp.topic, `Topic ${i + 1}`);
      const priority    = safeStr(sp.priority, "—");

      doc.setFillColor("#f8fffe");
      doc.setDrawColor("#d1fae5");
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, COL, 8, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(PRIMARY);
      doc.text(`${i + 1}. ${topicLabel}`, MARGIN + 4, y + 5.5);
      pill(priority, W - MARGIN - 24, y + 5.5, pBg, pFg);
      y += 11;

      [
        { label: "What to study",    val: safeStr(sp.what_to_study) },
        { label: "Practice type",    val: safeStr(sp.practice_type) },
        { label: "Daily plan",       val: safeStr(sp.daily_plan) },
        { label: "Est. improvement", val: safeStr(sp.estimated_improvement_time) },
      ].forEach(({ label, val }) => {
        if (!val || val === "—") return;
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(GRAY);
        doc.text(`${label}:`, MARGIN + 4, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(DARK);
        const vLines = wrapText(val, COL - 52, 8);
        vLines.forEach((l, li) => { doc.text(l, MARGIN + 44, y + li * 4.5); });
        y += Math.max(6, vLines.length * 4.5);
      });
      y += 4;
    });
  }

  // ── 7-DAY PLAN ────────────────────────────────────────────────────────────
  const weeklyPlan = safeArr(report?.weekly_plan);
  if (weeklyPlan.length > 0) {
    sectionTitle("7-Day Study Plan");
    weeklyPlan.forEach((day, i) => {
      if (!day) return;
      checkPage(14);

      const dayLabel  = safeStr(
        typeof day === "object" ? (day.day || day.label || day.name || `Day ${i + 1}`) : day,
        `Day ${i + 1}`
      );
      const focusText = safeStr(
        typeof day === "object" ? (day.focus || day.description || day.content || day.text) : "",
        safeStr(day)
      );

      doc.setFillColor(i % 2 === 0 ? "#f0f9fa" : "#ffffff");
      doc.rect(MARGIN, y - 1, COL, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(PRIMARY);
      doc.text(dayLabel, MARGIN + 3, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(DARK);
      const fLines = wrapText(focusText, COL - 32, 8.5);
      fLines.forEach((l, li) => { checkPage(6); doc.text(l, MARGIN + 30, y + 5 + li * 5); });
      y += Math.max(9, fLines.length * 5 + 3);
    });
    y += 4;
  }

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  const recommendations = safeArr(report?.recommendations);
  if (recommendations.length > 0) {
    sectionTitle("Smart Recommendations");
    recommendations.forEach((rec, i) => {
      if (!rec) return;
      checkPage(12);
      const recText = safeStr(rec, "");
      if (!recText || recText === "—") return;
      const lines = wrapText(`${i + 1}.  ${recText}`, COL - 4, 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      lines.forEach((l) => { checkPage(6); doc.text(l, MARGIN + 2, y); y += 5; });
      y += 2;
    });
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(PRIMARY);
    doc.rect(0, 287, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor("#b2e4e8");
    doc.text(`${studentName} · ${subject} Performance Report`, MARGIN, 293);
    doc.text(`Page ${p} of ${totalPages}`, W - MARGIN, 293, { align: "right" });
  }

  // Return blob URL — caller opens the tab
  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
};

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const StudentResult = () => {
  const [results, setResults]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [reportLoading, setReportLoading] = useState({});
  const [reportError, setReportError]     = useState({});

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
    if (!attemptId) {
      setReportError((prev) => ({ ...prev, unknown: "Invalid attempt ID." }));
      return;
    }

    // Open the tab SYNCHRONOUSLY inside the click handler — BEFORE any await.
    // Browsers block window.open() called after an async operation (popup blocker).
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.document.write(`
        <html>
          <head><title>Generating Report...</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;
                       height:100vh;font-family:sans-serif;background:#f0f9fa;">
            <div style="text-align:center;color:#0F6B75;">
              <div style="font-size:2.5rem;margin-bottom:1rem;">📄</div>
              <h2 style="margin:0 0 0.5rem;font-size:1.4rem;">Generating your report…</h2>
              <p style="color:#6b7280;margin:0;font-size:0.9rem;">This usually takes a few seconds.</p>
            </div>
          </body>
        </html>
      `);
    }

    setReportLoading((prev) => ({ ...prev, [attemptId]: true }));
    setReportError((prev) => ({ ...prev, [attemptId]: null }));

    try {
      const { data } = await axios.get(`/api/exams/report/${attemptId}`);
      const pdfUrl = generatePDF(data.data, examTitle); // returns blob URL

      if (newTab) {
        newTab.location.href = pdfUrl; // navigate the waiting tab to the PDF
      }
    } catch (err) {
      if (newTab) newTab.close(); // close the waiting tab on error
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
        const end   = r.attemptId?.submittedAt;
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
              const pct       = Math.round((res.obtainedMarks / res.totalMarks) * 100);
              const grade     = getGrade(res.obtainedMarks, res.totalMarks);
              const timeTaken = getTimeTaken(
                res.attemptId?.startedAt,
                res.attemptId?.submittedAt
              );
              const date = res.submittedAt
                ? new Date(res.submittedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : "—";

              const aId        = res.attemptId?._id || res.attemptId;
              const isGenerating = reportLoading[aId];
              const genError     = reportError[aId];

              return (
                <div
                  key={res._id}
                  className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Left */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {res.examId?.title || "—"}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {res.examId?.classId?.className || "—"} ·{" "}
                      {res.examId?.classId?.courseTitle || ""}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{date}</p>
                    {genError && (
                      <p className="text-red-500 text-xs mt-1">{genError}</p>
                    )}
                  </div>

                  {/* Right */}
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
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                        res.isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
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
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                        res.gradingStatus === "graded"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {res.gradingStatus === "graded" ? "Graded" : "Pending"}
                      </span>
                    </div>

                    {/* Report Button */}
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