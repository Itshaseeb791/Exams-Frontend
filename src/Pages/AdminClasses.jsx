import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { X, Search, Loader2, BookOpen, Hash, Clock, CalendarDays, Users, UserCircle2, Pencil, Trash2 } from "lucide-react";
import { API_URL } from "../config";

const API = `${API_URL}/api/class`;
const TEACHER_API = `${API_URL}/api/teacher/list`;

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    className: "",
    courseTitle: "",
    classCode: "",
    creditHours: "",
    instructorId: "",
    semester: "",
    capacity: "",
  });

  const [errors, setErrors] = useState({});

  // ================= FETCH =================
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setClasses(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      setTeacherLoading(true);
      const res = await axios.get(TEACHER_API);
      setTeachers(res.data?.data || []);
    } finally {
      setTeacherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [fetchClasses, fetchTeachers]);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};
    if (!form.className) newErrors.className = "Required";
    if (!form.courseTitle) newErrors.courseTitle = "Required";
    if (!form.classCode) newErrors.classCode = "Required";
    if (!form.instructorId) newErrors.instructorId = "Select teacher";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ================= MODALS =================
  const openAddModal = () => {
    setEditingClass(null);
    setServerError("");
    setErrors({});
    setForm({ className: "", courseTitle: "", classCode: "", creditHours: "", instructorId: "", semester: "", capacity: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setServerError("");
    setErrors({});
    setForm({
      className: cls.className || "",
      courseTitle: cls.courseTitle || "",
      classCode: cls.classCode || "",
      creditHours: cls.creditHours || "",
      instructorId: cls.instructorId || "",
      semester: cls.semester || "",
      capacity: cls.capacity || "",
    });
    setIsModalOpen(true);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      if (editingClass) {
        await axios.put(`${API}/${editingClass._id}`, form);
      } else {
        await axios.post(API, form);
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await axios.delete(`${API}/${id}`);
    fetchClasses();
  };

  // ================= FILTERED LIST =================
  const filteredClasses = useMemo(() =>
    classes.filter((cls) =>
      [cls.className, cls.courseTitle, cls.classCode, cls.semester]
        .some((val) => val?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    ), [classes, searchQuery]
  );

  // Soft color per class based on class name
  const avatarColors = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const getAvatarColor = (name = "") =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  const getInitials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#0F6B75]">
          Classes Management
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B75] bg-white shadow-sm transition-all"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-[#0F6B75] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c565e] transition-colors shadow-sm whitespace-nowrap"
          >
            + Add Class
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-teal-700">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm font-medium">Loading classes…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredClasses.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <BookOpen size={48} strokeWidth={1.5} />
            <p className="text-sm font-medium">No classes found.</p>
            {searchQuery && (
              <p className="text-xs text-gray-400">Try a different search term.</p>
            )}
          </div>
        )}

        {!loading && filteredClasses.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50 border-b border-gray-100">
                    <th className="py-3.5 px-6">Class</th>
                    <th className="py-3.5 px-6">Code</th>
                    <th className="py-3.5 px-6">Credits</th>
                    <th className="py-3.5 px-6">Semester</th>
                    <th className="py-3.5 px-6">Capacity</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClasses.map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50/70 transition-colors">

                      {/* Class name + course title with avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarColor(cls.className)}`}>
                            {getInitials(cls.className)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm leading-tight">
                              {cls.className}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{cls.courseTitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Hash size={13} className="text-teal-500 shrink-0" />
                          {cls.classCode ?? "—"}
                        </span>
                      </td>

                      {/* Credits */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock size={13} className="text-teal-500 shrink-0" />
                          {cls.creditHours ?? "—"}
                        </span>
                      </td>

                      {/* Semester badge */}
                      <td className="py-3.5 px-6">
                        {cls.semester ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                            <CalendarDays size={11} />
                            {cls.semester}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Users size={13} className="text-teal-500 shrink-0" />
                          {cls.capacity ?? "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cls._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredClasses.map((cls) => (
                <div key={cls._id} className="px-4 py-4 flex gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${getAvatarColor(cls.className)}`}>
                    {getInitials(cls.className)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{cls.className}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cls.courseTitle}</p>
                      </div>
                      {cls.semester && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 shrink-0">
                          <CalendarDays size={10} />
                          {cls.semester}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Hash size={11} className="text-teal-500 shrink-0" />
                        {cls.classCode ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={11} className="text-teal-500 shrink-0" />
                        {cls.creditHours ?? "—"} credits
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={11} className="text-teal-500 shrink-0" />
                        {cls.capacity ?? "—"} seats
                      </span>
                    </div>

                    {/* Mobile action buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEditModal(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer count */}
            <div className="mt-auto px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">{filteredClasses.length}</span>{" "}
                {filteredClasses.length === 1 ? "class" : "classes"}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 relative shadow-2xl">
            <button
              onClick={() => { setIsModalOpen(false); setServerError(""); setErrors({}); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-[#0F6B75] mb-1">
              {editingClass ? "Update Class" : "Add Class"}
            </h2>
            <p className="text-sm text-gray-500 pb-4">
              {editingClass ? "Edit the details of the class below." : "Enter the details to create a new class."}
            </p>

            {serverError && (
              <p className="text-red-600 text-sm mb-3 font-medium bg-red-50 p-2 rounded">
                {serverError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "className", label: "Class Name", type: "text" },
                  { field: "courseTitle", label: "Course Title", type: "text" },
                  { field: "classCode", label: "Class Code", type: "text" },
                  { field: "semester", label: "Semester", type: "text" },
                  { field: "creditHours", label: "Credit Hours", type: "number" },
                  { field: "capacity", label: "Capacity", type: "number" },
                ].map(({ field, label, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      name={field}
                      type={type}
                      value={form[field] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${label}`}
                      className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75] focus:border-transparent transition-all"
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Teacher Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher</label>
                <select
                  name="instructorId"
                  value={form.instructorId || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75] focus:border-transparent transition-all bg-white"
                >
                  <option value="">
                    {teacherLoading ? "Loading teachers..." : "Select Teacher"}
                  </option>
                  {teachers.map((t) => (
                    <option key={t.userId} value={t.userId}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.instructorId && (
                  <p className="text-red-500 text-xs mt-1">{errors.instructorId}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0F6B75] text-white py-2.5 text-sm rounded-md hover:bg-[#0c565e] disabled:opacity-50 transition-colors font-medium mt-2 shadow-sm"
              >
                {saving ? "Saving..." : "Save Class"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}