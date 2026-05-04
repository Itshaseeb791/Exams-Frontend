import { useState, useEffect, useMemo } from "react";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";
import axios from "axios";
import DropDownMenu from "../components/DropDownMenu";
import { API_URL } from "../config";

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

const TeacherReport = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [results, setResults] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Cheating logs state
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [cheatingLoading, setCheatingLoading] = useState(false);
  const [cheatingError, setCheatingError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const teacherId = currentUser.id;

  // Existing report fetch
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/results/teacher/${teacherId}/report`);
        setResults(data.results || []);
        setClassNames(data.classes || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [teacherId]);

  // ✅ Fetch cheating logs when tab is opened
  useEffect(() => {
    if (activeTab !== "Cheating Logs") return;

    const fetchCheatingLogs = async () => {
      try {
        setCheatingLoading(true);
        setCheatingError(null);
        const { data } = await axios.get(`${API_URL}/api/exams/cheating-attempts`, {
          params: { teacherId },
        });
        setCheatingLogs(data.data || []);
      } catch (err) {
        setCheatingError(
          err.response?.data?.message || "Failed to fetch cheating logs"
        );
      } finally {
        setCheatingLoading(false);
      }
    };

    fetchCheatingLogs();
  }, [activeTab, teacherId]);

  // ✅ Filter cheating logs by selected class
  const filteredCheatingLogs = useMemo(() => {
    if (selectedClass === "All Classes") return cheatingLogs;
    return cheatingLogs.filter((log) => log.className === selectedClass);
  }, [cheatingLogs, selectedClass]);

  const filteredResults = useMemo(() => {
    if (selectedClass === "All Classes") return results;
    return results.filter(
      (r) => r.examId?.classId?.className === selectedClass
    );
  }, [results, selectedClass]);

  const stats = useMemo(() => {
    if (!filteredResults.length)
      return { avgScore: "0%", passRate: "0%", flaggedCount: 0 };

    const avgScore =
      filteredResults.reduce(
        (sum, r) => sum + (r.obtainedMarks / r.totalMarks) * 100,
        0
      ) / filteredResults.length;

    const passed = filteredResults.filter((r) => r.isPassed).length;
    const passRate = (passed / filteredResults.length) * 100;

    return {
      avgScore: `${avgScore.toFixed(1)}%`,
      passRate: `${passRate.toFixed(1)}%`,
      flaggedCount: filteredCheatingLogs.length, // ✅ from dedicated API
    };
  }, [filteredResults, filteredCheatingLogs]);

  const performanceTrend = useMemo(() => {
    const examMap = {};
    filteredResults.forEach((r) => {
      const title = r.examId?.title || "Unknown";
      if (!examMap[title]) examMap[title] = { total: 0, count: 0 };
      examMap[title].total += (r.obtainedMarks / r.totalMarks) * 100;
      examMap[title].count += 1;
    });
    return Object.entries(examMap).map(([title, { total, count }]) => ({
      title,
      avg: Math.round(total / count),
    }));
  }, [filteredResults]);

  const studentPerformance = useMemo(() => {
    const studentMap = {};
    filteredResults.forEach((r) => {
      const id = r.studentId?._id;
      if (!id) return;
      if (!studentMap[id]) {
        studentMap[id] = {
          name: r.studentId?.name || "—",
          rollNo: r.studentId?.rollNo || "—",
          totalObtained: 0,
          totalMarks: 0,
          attempts: 0,
          passed: 0,
        };
      }
      studentMap[id].totalObtained += r.obtainedMarks;
      studentMap[id].totalMarks += r.totalMarks;
      studentMap[id].attempts += 1;
      if (r.isPassed) studentMap[id].passed += 1;
    });

    return Object.values(studentMap).sort(
      (a, b) => b.totalObtained / b.totalMarks - a.totalObtained / a.totalMarks
    );
  }, [filteredResults]);

  const classOptions = ["All Classes", ...classNames];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-[#0F6B75] font-medium">
        Loading report...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F6B75]">
          Reports
        </h1>
        <DropDownMenu
          options={classOptions}
          value={selectedClass}
          onChange={(val) => setSelectedClass(val)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Avg Class Score",
            value: stats.avgScore,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            title: "Pass Rate",
            value: stats.passRate,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Flagged Cases",
            value: stats.flaggedCount,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {["Overview", "Cheating Logs", "Student Performance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer outline-none ${
                activeTab === tab
                  ? "text-[#0F6B75] border-b-2 border-[#0F6B75] bg-teal-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
              {tab === "Cheating Logs" && filteredCheatingLogs.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredCheatingLogs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800">
                Avg Score Per Exam
              </h3>
              {performanceTrend.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  No exam data available.
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-2 md:gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {performanceTrend.map((exam, i) => (
                    <div
                      key={i}
                      className="w-full flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="w-full max-w-10 bg-[#0F6B75] rounded-t-md transition-all duration-500 group-hover:bg-[#0c565e] relative min-h-[4px]"
                        style={{ height: `${exam.avg}%` }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {exam.avg}%
                        </span>
                      </div>
                      <span
                        className="text-xs text-gray-500 font-medium text-center max-w-[60px] truncate"
                        title={exam.title}
                      >
                        {exam.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ Cheating Logs Tab */}
          {activeTab === "Cheating Logs" && (
            <div className="overflow-x-auto">
              {cheatingLoading ? (
                <div className="text-center py-16 text-[#0F6B75] font-medium">
                  Loading cheating logs...
                </div>
              ) : cheatingError ? (
                <div className="text-center py-16 text-red-500">
                  {cheatingError}
                </div>
              ) : filteredCheatingLogs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  No cheating cases detected.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Reg No</th>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4">Exam</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCheatingLogs.map((log, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {log.studentName}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {log.registrationNo || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {log.className}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {log.examTitle}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">
                          {log.cheatingReason || "Suspicious activity"}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {log.submittedAt
                            ? new Date(log.submittedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Student Performance Tab */}
          {activeTab === "Student Performance" && (
            <div className="overflow-x-auto">
              {studentPerformance.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  No student data available.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Roll No</th>
                      <th className="px-6 py-4 text-center">Exams Taken</th>
                      <th className="px-6 py-4 text-center">Total Score</th>
                      <th className="px-6 py-4 text-center">Avg Score</th>
                      <th className="px-6 py-4 text-center">Grade</th>
                      <th className="px-6 py-4 text-center">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentPerformance.map((s, idx) => {
                      const avgPct = Math.round(
                        (s.totalObtained / s.totalMarks) * 100
                      );
                      const grade = getGrade(s.totalObtained, s.totalMarks);
                      const passRate = Math.round(
                        (s.passed / s.attempts) * 100
                      );
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {s.name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{s.rollNo}</td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {s.attempts}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-[#0F6B75]">
                            {s.totalObtained}/{s.totalMarks}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {avgPct}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                grade.startsWith("A")
                                  ? "bg-green-100 text-green-700"
                                  : grade.startsWith("B")
                                    ? "bg-blue-100 text-blue-700"
                                    : grade.startsWith("C")
                                      ? "bg-yellow-100 text-yellow-700"
                                      : grade.startsWith("D")
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-red-100 text-red-700"
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                passRate >= 70
                                  ? "bg-green-100 text-green-700"
                                  : passRate >= 50
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {passRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherReport;