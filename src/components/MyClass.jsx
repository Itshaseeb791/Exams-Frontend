import { useState, useEffect, useRef } from "react";
import ClassCard from "./ClassCard";
import CreateClass from "./CreateClass";
import ConfirmationModal from "./ConfirmationModal";
import { Plus } from "lucide-react";

const MyClass = ({ onViewClass, classes, onDeleteClass, onCreateClass }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      onDeleteClass(classToDelete._id); // ✅ FIXED
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-10 md:pt-6 relative border border-gray-200 mb-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#0F6B75]">
            My Classes
          </h1>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
          {classes.map((cls) => (
            <ClassCard
              key={cls._id}
              classData={cls}
              onView={() => onViewClass(cls)}
              onDelete={() => handleDeleteClick(cls)}
            />
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <CreateClass
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onCreate={onCreateClass}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${classToDelete?.className}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
};

export default MyClass;
