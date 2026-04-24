import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditClass = ({ isOpen, onClose, onUpdate, classData }) => {
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData && isOpen) {
      setFormData({
        name: classData.title || "",
        section: classData.section || "",
        description: classData.description || "",
      });
    }
  }, [classData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }

    if (!formData.section.trim()) {
      newErrors.section = "Class/Section is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validation passed
    if (onUpdate) {
      onUpdate({
        ...classData,
        title: formData.name,
        section: formData.section,
        description: formData.description,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#0F6B75] mb-6 text-center">
          Edit Class
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#0F6B75] font-bold mb-2 text-sm">
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Math 101"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/50 text-gray-700`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-[#0F6B75] font-bold mb-2 text-sm">
              Class:
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g: BSCS 7A MOR"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.section ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/50 text-gray-700`}
            />
            {errors.section && (
              <p className="text-red-500 text-xs mt-1">{errors.section}</p>
            )}
          </div>

          <div>
            <label className="block text-[#0F6B75] font-bold mb-2 text-sm">
              Description:
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide brief overview of the class..."
              rows="4"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/50 text-gray-700 resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              className="bg-[#0F6B75] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#0c565e] transition-colors shadow-md w-full sm:w-auto"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClass;
