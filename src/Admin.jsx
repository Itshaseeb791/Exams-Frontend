// import { useState, useEffect } from "react";
// import axios from "axios";
// import { UserPlus, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const Admin = () => {
//   const [open, setOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [teachers, setTeachers] = useState([]);
//   const [fetchingTeachers, setFetchingTeachers] = useState(false);
//   const navigate = useNavigate();

//   // ---------------- Email Validation ----------------
//   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   // ---------------- Fetch Teachers ----------------
//   const fetchTeachers = async () => {
//     setFetchingTeachers(true);
//     try {
//       const response = await axios.get("http://localhost:5000/api/teacher");
//       // Extract the array from response.data.data
//       setTeachers(response.data?.data || []);
//     } catch (err) {
//       console.error("Failed to fetch teachers:", err);
//     } finally {
//       setFetchingTeachers(false);
//     }
//   };

//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   // ---------------- Submit Handler ----------------
//   const handleSubmit = async () => {
//     setError("");
//     setSuccess("");

//     if (!email) {
//       setError("Email is required");
//       return;
//     }

//     if (!isValidEmail(email)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "http://localhost:5000/api/admin/invite-teacher",
//         { email }
//       );

//       setSuccess(response.data?.message || "Invitation sent successfully");
//       setEmail("");

//       // Refresh teacher list after successful invite
//       fetchTeachers();
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to send invitation. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen w-full flex flex-col">
//       {/* ================= Navbar ================= */}
//       <div className="h-17 bg-[#0F6B75] text-white flex items-center justify-center gap-2 px-4">
//         <img
//           src="/logo.png"
//           alt="Examlytic Logo"
//           className="h-20 w-20 sm:h-8 sm:w-8 lg:h-32 lg:w-15 object-contain"
//         />
//         <h1 className="text-lg sm:text-xl font-bold lg:text-3xl">Examlytic</h1>
//       </div>

//       <div className="flex flex-1">
//         {/* ================= Sidebar ================= */}
//         <div className="w-14 sm:w-16 bg-[#0F6B75] flex justify-center items-start pt-6 cursor-pointer">
//           <UserPlus className="text-white" size={20} />
//         </div>
//         <div className="w-14 sm:w-16 bg-[#0F6B75] flex justify-center items-start pt-6 cursor-pointer">
//           <UserPlus   onClick={() => navigate('/admin-classes')} className="text-white" size={20} />
//         </div>

//         {/* ================= Main ================= */}
//         <div className="flex-1 p-3 sm:p-6 bg-gray-100">
//           <div className="bg-white rounded-xl shadow p-4 sm:p-6 relative h-full">
//             {/* Add Staff Button */}
//             <button
//               onClick={() => setOpen(true)}
//               className="
//                 bg-teal-700 text-white
//                 px-4 py-2 rounded-lg
//                 hover:bg-teal-600 transition
//                 absolute bottom-6 left-1/2 -translate-x-1/2
//                 sm:top-6 sm:right-6 sm:left-auto sm:bottom-auto sm:translate-x-0
//               "
//             >
//               Add Staff
//             </button>

//             {/* ================= Teacher Table ================= */}
//             <div className="mt-16 sm:mt-10 overflow-x-auto">
//               <h2 className="text-lg font-semibold text-teal-700 mb-4">
//                 Current Teachers
//               </h2>

//               {fetchingTeachers ? (
//                 <p>Loading teachers...</p>
//               ) : teachers.length === 0 ? (
//                 <p>No teachers found.</p>
//               ) : (
//                 <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//                   <thead className="bg-teal-700 text-white">
//                     <tr>
//                       <th className="py-2 px-4 text-left">Name</th>
//                       <th className="py-2 px-4 text-left">Qualification</th>
//                       <th className="py-2 px-4 text-left">Email</th>
//                       <th className="py-2 px-4 text-left">Phone</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {teachers.map((teacher) => (
//                       <tr
//                         key={teacher._id}
//                         className="border-b last:border-b-0 hover:bg-gray-50"
//                       >
//                         <td className="py-2 px-4">{teacher.name}</td>
//                         <td className="py-2 px-4">{teacher.qualification}</td>
//                         <td className="py-2 px-4">{teacher.userId?.email}</td>
//                         <td className="py-2 px-4">{teacher.phone}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= Modal ================= */}
//       {open && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
//           <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-sm relative">
//             {/* Close */}
//             <button
//               onClick={() => {
//                 setOpen(false);
//                 setError("");
//                 setSuccess("");
//               }}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>

//             <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2">
//               Add Staff
//             </h2>

//             <p className="text-sm text-gray-600 mb-4">
//               Enter the email address to invite a staff member
//             </p>

//             {/* Email Input */}
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter email"
//               className="
//                 w-full border p-2 sm:p-3 rounded mb-2
//                 focus:outline-none focus:ring-2 focus:ring-teal-600
//               "
//             />

//             {/* Error Message */}
//             {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

//             {/* Success Message */}
//             {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="
//                 w-full bg-teal-700 text-white
//                 py-2 sm:py-2.5 rounded
//                 hover:bg-teal-600
//                 disabled:opacity-50 disabled:cursor-not-allowed
//               "
//             >
//               {loading ? "Sending..." : "Submit"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Admin;
