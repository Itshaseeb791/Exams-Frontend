import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import MyClass from "../components/MyClass";
import QuickAction from "../components/QuickAction";
import TeacherClass from "../components/TeacherClass";
import { API_URL } from "../config";

const TeacherHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get("classId");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Fetch classes on load
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Authentication token not found. Please login again.");
        }

        const response = await axios.get(
          `${API_URL}/api/class/my-classes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClasses(response.data.data || []);
      } catch (err) {
        console.error("Fetch classes error:", err);

        if (err.response) {
          // Server responded with error
          setError(
            err.response.data.message ||
              "Unable to load your classes at the moment."
          );
        } else if (err.request) {
          // No response
          setError(
            "Server is not responding. Please check your internet connection."
          );
        } else {
          // Something else
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const selectedClass = classId
    ? classes.find((c) => c._id === classId)
    : null;

  const handleAddClass = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const handleUpdateClass = (updatedClass) => {
    setClasses((prev) =>
      prev.map((c) => (c._id === updatedClass._id ? updatedClass : c))
    );
  };

  const handleDeleteClass = (id) => {
    setClasses((prev) => prev.filter((c) => c._id !== id));

    if (selectedClass && selectedClass._id === id) {
      setSearchParams({});
    }
  };

  // 🔵 Loading State
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading your classes...
      </div>
    );
  }

  // 🔴 Error State
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  // 🟡 No Classes State
  if (!classes.length) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-xl font-semibold text-gray-800">
          No Classes Assigned Yet
        </h2>
        <p className="text-gray-500 mt-3">
          You currently do not have any classes assigned to your profile.
          Once a class is assigned, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {selectedClass ? (
        <TeacherClass
          classData={selectedClass}
          onUpdate={handleUpdateClass}
        />
      ) : (
        <>
          <MyClass
            classes={classes}
            onDeleteClass={handleDeleteClass}
            onCreateClass={handleAddClass}
            onViewClass={(cls) =>
              setSearchParams({ classId: cls._id })
            }
          />
          <QuickAction onCreateClass={handleAddClass} />
        </>
      )}
    </>
  );
};

export default TeacherHome;
