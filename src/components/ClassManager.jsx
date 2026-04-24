// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import axios from "axios";
// import { UserPlus, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const API = "http://localhost:5000/api/class";
// const TEACHER_API = "http://localhost:5000/api/teacher/list";

// export default function ClassManager() {
//   const navigate = useNavigate();

//   const [classes, setClasses] = useState([]);
//   const [teachers, setTeachers] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [teacherLoading, setTeacherLoading] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingClass, setEditingClass] = useState(null);

//   const [saving, setSaving] = useState(false);
//   const [serverError, setServerError] = useState("");

//   const [form, setForm] = useState({
//     className: "",
//     courseTitle: "",
//     classCode: "",
//     creditHours: "",
//     instructorId: "",
//     semester: "",
//     capacity: "",
//   });

//   const [errors, setErrors] = useState({});

//   // ================= FETCH CLASSES =================
//   const fetchClasses = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API);
//       setClasses(res.data?.data || []);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // ================= FETCH TEACHERS =================
//   const fetchTeachers = useCallback(async () => {
//     try {
//       setTeacherLoading(true);
//       const res = await axios.get(TEACHER_API);
//       setTeachers(res.data?.data || []);
//     } finally {
//       setTeacherLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchClasses();
//     fetchTeachers();
//   }, [fetchClasses, fetchTeachers]);

//   // ================= VALIDATION =================
//   const validate = () => {
//     const newErrors = {};
//     if (!form.className) newErrors.className = "Required";
//     if (!form.courseTitle) newErrors.courseTitle = "Required";
//     if (!form.classCode) newErrors.classCode = "Required";
//     if (!form.instructorId) newErrors.instructorId = "Select teacher";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ================= INPUT CHANGE =================
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   // ================= MODALS =================
//   const openAddModal = () => {
//     setEditingClass(null);
//     setServerError("");
//     setForm({
//       className: "",
//       courseTitle: "",
//       classCode: "",
//       creditHours: "",
//       instructorId: "",
//       semester: "",
//       capacity: "",
//     });
//     setIsModalOpen(true);
//   };

//   const openEditModal = (cls) => {
//     setEditingClass(cls);
//     setServerError("");
//     // Pre-fill form including instructorId
//     setForm({
//       className: cls.className || "",
//       courseTitle: cls.courseTitle || "",
//       classCode: cls.classCode || "",
//       creditHours: cls.creditHours || "",
//       instructorId: cls.instructorId || "", // default teacher
//       semester: cls.semester || "",
//       capacity: cls.capacity || "",
//     });
//     setIsModalOpen(true);
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     try {
//       setSaving(true);
//       if (editingClass) {
//         await axios.put(`${API}/${editingClass._id}`, form);
//       } else {
//         await axios.post(API, form);
//       }

//       setIsModalOpen(false);
//       fetchClasses();
//     } catch (err) {
//       setServerError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ================= DELETE =================
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this class?")) return;
//     await axios.delete(`${API}/${id}`);
//     fetchClasses();
//   };

//   // ================= TABLE ROWS =================
//   const rows = useMemo(() => {
//     return classes.map((cls) => (
//       <tr key={cls._id} className="border-b last:border-0 hover:bg-gray-50">
//         <td className="py-2 px-4">{cls.className}</td>
//         <td className="py-2 px-4">{cls.courseTitle}</td>
//         <td className="py-2 px-4">{cls.classCode}</td>
//         <td className="py-2 px-4">{cls.creditHours}</td>
//         <td className="py-2 px-4">{cls.semester}</td>
//         <td className="py-2 px-4 flex gap-2">
//           <button
//             onClick={() => openEditModal(cls)}
//             className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
//           >
//             Update
//           </button>

//           <button
//             onClick={() => handleDelete(cls._id)}
//             className="bg-red-600 text-white px-3 py-1 rounded-lg"
//           >
//             Delete
//           </button>
//         </td>
//       </tr>
//     ));
//   }, [classes]);

//   // ================= UI =================
//   return (
//     <div className="h-screen w-full flex flex-col">
//       {/* NAVBAR */}
//       <div className="h-17 bg-[#0F6B75] text-white flex items-center justify-center gap-2">
//         <img src="/logo.png" className="h-8 w-8 object-contain" />
//         <h1 className="text-xl font-bold">Examlytic</h1>
//       </div>

//       <div className="flex flex-1">
//         {/* SIDEBAR */}
//         <div
//           onClick={() => navigate("/admin")}
//           className="w-16 bg-[#0F6B75] flex justify-center items-start pt-6 cursor-pointer"
//         >
//           <UserPlus className="text-white" />
//         </div>

//         {/* MAIN */}
//         <div className="flex-1 p-6 bg-gray-100">
//           <div className="bg-white rounded-xl shadow p-6 relative h-full">
//             {/* Add Button */}
//             <button
//               onClick={openAddModal}
//               className="absolute top-6 right-6 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
//             >
//               + Add Class
//             </button>

//             <h2 className="text-lg font-semibold text-teal-700 mb-4">
//               Current Classes
//             </h2>

//             {loading ? (
//               <p>Loading classes...</p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border border-gray-200 rounded-lg">
//                   <thead className="bg-teal-700 text-white">
//                     <tr>
//                       <th className="py-2 px-4 text-left">Class</th>
//                       <th className="py-2 px-4 text-left">Course</th>
//                       <th className="py-2 px-4 text-left">Code</th>
//                       <th className="py-2 px-4 text-left">Credits</th>
//                       <th className="py-2 px-4 text-left">Semester</th>
//                       <th className="py-2 px-4 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>{rows}</tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* MODAL */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//           <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
//             {/* CANCEL BUTTON */}
//             <button
//               onClick={() => {
//                 setIsModalOpen(false);
//                 setServerError("");
//                 setErrors({});
//               }}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>

//             <h2 className="text-lg font-semibold text-teal-700 mb-4">
//               {editingClass ? "Update Class" : "Add Class"}
//             </h2>

//             {serverError && (
//               <p className="text-red-600 text-sm mb-3">{serverError}</p>
//             )}

//             <form onSubmit={handleSubmit} className="grid gap-3">
//               {[
//                 "className",
//                 "courseTitle",
//                 "classCode",
//                 "creditHours",
//                 "semester",
//                 "capacity",
//               ].map((field) => (
//                 <input
//                   key={field}
//                   name={field}
//                   value={form[field] || ""}
//                   onChange={handleChange}
//                   placeholder={field}
//                   className="border p-3 rounded focus:ring-2 focus:ring-teal-600"
//                 />
//               ))}

//               <select
//                 name="instructorId"
//                 value={form.instructorId || ""}
//                 onChange={handleChange}
//                 className="border p-3 rounded"
//               >
//                 <option value="">
//                   {teacherLoading ? "Loading teachers..." : "Select Teacher"}
//                 </option>

//                 {teachers.map((t) => (
//                   <option key={t.userId} value={t.userId}>
//                     {t.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.instructorId && (
//                 <p className="text-red-500 text-xs">{errors.instructorId}</p>
//               )}

//               <button className="bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-600">
//                 {saving ? "Saving..." : "Save"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
