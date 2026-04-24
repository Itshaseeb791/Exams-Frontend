// Material.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Video, Link as LinkIcon, Download,
  Plus, Pencil, Trash2, X, Upload, Loader2, Image
} from "lucide-react";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModal";
import DropDownMenu from "./DropDownMenu";
import { API_URL } from "../config";

const BASE_URL = `${API_URL}/api/resources`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = ["PDF Document", "Video", "Word Document", "Image", "External Link"];

const labelToType = {
  "PDF Document":  "pdf",
  "Video":         "video",
  "Word Document": "word",
  "Image":         "image",
  "External Link": "link",
};

const typeToLabel = {
  pdf:   "PDF Document",
  video: "Video",
  word:  "Word Document",
  image: "Image",
  link:  "External Link",
};

const isFileType = (type) => ["pdf", "video", "word", "image"].includes(type);

const getIcon = (type) => {
  switch (type) {
    case "pdf":   return <FileText className="text-red-500"    size={24} />;
    case "video": return <Video    className="text-blue-500"   size={24} />;
    case "link":  return <LinkIcon className="text-green-500"  size={24} />;
    case "image": return <Image    className="text-purple-500" size={24} />;
    default:      return <FileText className="text-gray-500"   size={24} />;
  }
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const MaterialModal = ({ isOpen, onClose, onSave, initialData, classId }) => {
  const [title, setTitle]             = useState(initialData?.title       || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [typeLabel, setTypeLabel]     = useState(typeToLabel[initialData?.resourceType] || "PDF Document");
  const [url, setUrl]                 = useState(initialData?.url         || "");
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const fileInputRef                  = useRef(null);

  const type      = labelToType[typeLabel];
  const needsFile = isFileType(type);
  const isEditing = !!initialData;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) return setError("Title is required.");

    if (!isEditing) {
      if (needsFile && !file)                        return setError("Please select a file to upload.");
      if (!needsFile && !url.trim())                 return setError("Please enter a valid URL.");
      if (!needsFile && !url.startsWith("http"))     return setError("URL must start with http:// or https://");
    }

    setLoading(true);
    try {
      if (isEditing) {
        const res = await axios.patch(`${BASE_URL}/${initialData._id}`, {
          title: title.trim(),
          description: description.trim(),
        });
        onSave(res.data.data);
      } else if (needsFile) {
        const form = new FormData();
        form.append("file",        file);
        form.append("classId",     classId);
        form.append("title",       title.trim());
        form.append("description", description.trim());

        const res = await axios.post(`${BASE_URL}/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSave(res.data.data);
      } else {
        const res = await axios.post(`${BASE_URL}/add-link`, {
          classId,
          title:       title.trim(),
          description: description.trim(),
          url:         url.trim(),
        });
        onSave(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0F6B75]">
            {isEditing ? "Edit Material" : "Add Material"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75]"
              placeholder="e.g., Lecture 1 Slides"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75]"
              placeholder="Brief description..."
            />
          </div>

          {/* Type — only when adding */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <DropDownMenu
                options={TYPE_OPTIONS}
                value={typeLabel}
                onChange={(label) => {
                  setTypeLabel(label);
                  setFile(null);
                  setUrl("");
                  setError("");
                }}
              />
            </div>
          )}

          {/* File upload — file types only, when adding */}
          {!isEditing && needsFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0F6B75] hover:bg-teal-50/30 transition-colors"
              >
                <Upload size={24} className="text-gray-400" />
                {file ? (
                  <p className="text-sm text-[#0F6B75] font-medium text-center break-all">{file.name}</p>
                ) : (
                  <p className="text-sm text-gray-400 text-center">
                    Click to browse &nbsp;·&nbsp;
                    {type === "pdf"   && "PDF files"}
                    {type === "image" && "Image files (JPG, PNG, GIF, WebP)"}
                    {type === "word"  && "Word files (DOC, DOCX)"}
                    {type === "video" && "Video files (MP4, MOV, AVI)"}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  type === "pdf"   ? ".pdf"                               :
                  type === "image" ? "image/*"                            :
                  type === "word"  ? ".doc,.docx"                         :
                  type === "video" ? "video/mp4,video/quicktime,.avi,.mkv" : "*"
                }
                onChange={(e) => { setFile(e.target.files[0] || null); setError(""); }}
              />
            </div>
          )}

          {/* URL field — external link only, when adding */}
          {!isEditing && !needsFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75]"
                placeholder="https://example.com/resource"
              />
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#0F6B75] text-white py-2 rounded-lg font-bold hover:bg-[#0c565e] transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Saving..." : "Save Material"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Material = ({ role = "Student", classId }) => {
  const [materials, setMaterials]                 = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState("");
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [editingMaterial, setEditingMaterial]     = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete]   = useState(null);
  const [deleteLoading, setDeleteLoading]         = useState(false);

  // ── Fetch materials ──
  useEffect(() => {
    if (!classId) return;
    const fetchMaterials = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BASE_URL}/class/${classId}`);
        setMaterials(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load materials.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [classId]);

  // ── Merge saved resource into state ──
  const handleSave = (savedResource) => {
    setMaterials((prev) => {
      const exists = prev.find((m) => m._id === savedResource._id);
      return exists
        ? prev.map((m) => (m._id === savedResource._id ? savedResource : m))
        : [savedResource, ...prev];
    });
    setEditingMaterial(null);
  };

  // ── Delete ──
  const handleDeleteClick = (material) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${BASE_URL}/${materialToDelete._id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== materialToDelete._id));
      setIsDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err.response?.data?.message || err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0F6B75]">Class Materials</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#0F6B75]">Class Materials</h2>
        {role === "Teacher" && (
          <button
            onClick={() => { setEditingMaterial(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#0F6B75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0c565e] transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Add Material
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Material list */}
      <div className="grid grid-cols-1 gap-4">
        {materials.map((item) => (
          // ── Entire card is clickable — opens resource in new tab ──
          <a
            key={item._id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md hover:border-[#0F6B75] transition-all cursor-pointer block"
          >
            {/* Left — icon + info */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIcon(item.resourceType)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-400">{item.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Posted on {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2">
              {role === "Teacher" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();      // stop card link
                      e.stopPropagation();     // stop event bubbling
                      setEditingMaterial(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-[#0F6B75] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();      // stop card link
                      e.stopPropagation();     // stop event bubbling
                      handleDeleteClick(item);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              ) : (
                // Student — just a visual hint that it's openable
                <div className="p-2 text-gray-400">
                  <Download size={20} />
                </div>
              )}
            </div>
          </a>
        ))}

        {/* Empty state */}
        {materials.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No materials uploaded yet.</p>
            {role === "Teacher" && (
              <p className="text-sm mt-1">Click "Add Material" to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <MaterialModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingMaterial(null); }}
          onSave={handleSave}
          initialData={editingMaterial}
          classId={classId}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setMaterialToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${materialToDelete?.title}"? This will permanently remove it from Cloudinary too.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default Material;