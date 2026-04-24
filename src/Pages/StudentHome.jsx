import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StudentMyClass from "../components/StudentMyClass";
import StudentQuickAction from "../components/StudentQuickAction";
import StudentClass from "../components/StudentClass";
import axios from "axios";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

const StudentHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get("classId");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= GET STUDENT ID =================
  const getStudentId = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      return currentUser?.id || null;
    } catch {
      return null;
    }
  };

  // ================= FETCH ENROLLED CLASSES =================
  const fetchClasses = async () => {
    const studentId = getStudentId();

    if (!studentId) {
      console.error("No student ID found in localStorage");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/student/my-classes`, {
        headers: {
          "x-student-id": studentId,
        },
      });

      const apiClasses = res.data?.data || [];

      const mapped = apiClasses.map((cls) => ({
        id: cls._id,
        title: cls.className,
        section: cls.courseTitle || cls.classCode || "",
        image: "/class.png",
        className: cls.className,
        courseTitle: cls.courseTitle,
        semester: cls.semester,
        creditHours: cls.creditHours,
        enrollmentStatus: cls.enrollmentStatus,
        instructor: cls.instructorId?.name || "—",
      }));

      setClasses(mapped);
    } catch (err) {
      console.error("Failed to fetch enrolled classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ================= HANDLERS =================
  const selectedClass = classId
    ? classes.find((c) => c.id === classId)
    : null;

  const handleJoinClass = (classCode) => {
    console.log("Joining class with code:", classCode);
    // After join API is ready, call fetchClasses() here to refresh the list
    alert(`Successfully joined class: ${classCode}`);
  };

  const handleLeaveClass = (classId) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setSearchParams({});
  };

  // ================= UI =================
  return (
    <>
      {selectedClass ? (
        <StudentClass
          classData={selectedClass}
          onBack={() => setSearchParams({})}
          onLeaveClass={handleLeaveClass}
        />
      ) : (
        <>
          <StudentMyClass
            classes={classes}
            loading={loading}
            onViewClass={(cls) => setSearchParams({ classId: cls.id })}
            onJoinClass={handleJoinClass}
          />
          <StudentQuickAction onJoinClass={handleJoinClass} />
        </>
      )}
    </>
  );
};

export default StudentHome;