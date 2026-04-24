import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import DropDownMenu from "../components/DropDownMenu";

// Grade calculation based on percentage
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

const TeacherResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedExam, setSelectedExam] = useState("All Exams");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Replace with actual teacher ID from your auth context/store
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const teacherId = currentUser.id;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/results/teacher/${teacherId}`
        );
        setResults(data.results || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [teacherId]);

  /* ---------- Dynamic filter options from real data ---------- */
  const classOptions = useMemo(() => {
    const unique = [
      ...new Set(results.map((r) => r.examId?.classId?.className).filter(Boolean)),
    ];
    return ["All Classes", ...unique];
  }, [results]);

  const examOptions = useMemo(() => {
    const unique = [
      ...new Set(results.map((r) => r.examId?.title).filter(Boolean)),
    ];
    return ["All Exams", ...unique];
  }, [results]);

  /* ---------- Filtering ---------- */
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const studentName = res.studentId?.name?.toLowerCase() || "";
      const rollNo = res.studentId?.rollNo?.toLowerCase() || "";
      const className = res.examId?.classId?.className || "";
      const examTitle = res.examId?.title || "";
      const isPassed = res.isPassed;

      const matchesSearch =
        studentName.includes(searchQuery.toLowerCase()) ||
        rollNo.includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClass === "All Classes" || className === selectedClass;

      const matchesExam =
        selectedExam === "All Exams" || examTitle === selectedExam;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Passed" && isPassed) ||
        (selectedStatus === "Failed" && !isPassed);

      return matchesSearch && matchesClass && matchesExam && matchesStatus;
    });
  }, [results, searchQuery, selectedClass, selectedExam, selectedStatus]);

  /* ---------- Render states ---------- */
  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-[#0F6B75] font-medium">
        Loading results...
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F6B75]">
          Results
        </h1>
        <span className="text-sm text-gray-500">
          {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75]"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <DropDownMenu
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
            />
            <DropDownMenu
              options={examOptions}
              value={selectedExam}
              onChange={setSelectedExam}
            />
            <DropDownMenu
              options={["All", "Passed", "Failed"]}
              value={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredResults.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No results match your filters.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Grade</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Grading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((res) => {
                  const grade = getGrade(res.obtainedMarks, res.totalMarks);
                  return (
                    <tr
                      key={res._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {res.studentId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {res.studentId?.rollNo || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {res.examId?.classId?.className || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {res.examId?.title || "—"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#0F6B75]">
                        {res.obtainedMarks}/{res.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${gradeColor(grade)}`}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            res.isPassed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {res.isPassed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            res.gradingStatus === "graded"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {res.gradingStatus === "graded" ? "Graded" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherResult;