"use client";

import { useState, useEffect } from "react";
import Modal from "../Components/Modal";
import { useLocalStorage } from "../Components/useLocalStorage";
import Layout from "../Components/Layout";

interface Notice {
  id: number;
  date: string;
  title: string;
  target: string;
  category: string;
  message: string;
  status: string;
  pin: boolean;
  attachment?: {
    name: string;
    data: string; // Base64 for demo purposes since we're using localStorage
  };
}

export default function NoticeBoardPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [notices, setNotices] = useLocalStorage<Notice[]>("sh_notices", [
    { id: 1, date: "2026-04-02", title: "Annual Sports Day Schedule", target: "All", category: "Academic", message: "Sports day is coming!", status: "Active", pin: true },
    { id: 2, date: "2026-04-05", title: "Spring Break Declaration", target: "Students", category: "Holiday", message: "Holidays are here!", status: "Scheduled", pin: false },
  ]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [formData, setFormData] = useState<{
    title: string;
    target: string;
    category: string;
    message: string;
    pin: boolean;
    attachment: { name: string; data: string } | null;
  }>({
    title: "",
    target: "All",
    category: "Academic",
    message: "",
    pin: false,
    attachment: null
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          attachment: {
            name: file.name,
            data: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingNotice) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingNotice({
          ...editingNotice,
          attachment: {
            name: file.name,
            data: reader.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
  };

  const removeEditAttachment = () => {
    if (editingNotice) {
      setEditingNotice({ ...editingNotice, attachment: undefined });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (editingNotice) {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setEditingNotice({ ...editingNotice, [name]: checked });
      } else {
        setEditingNotice({ ...editingNotice, [name]: value });
      }
    }
  };

  const handlePublish = () => {
    if (!formData.title || !formData.message) {
      alert("Please enter title and message");
      return;
    }
    const newNotice: Notice = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: formData.title,
      target: formData.target,
      category: formData.category,
      message: formData.message,
      status: "Active",
      pin: formData.pin,
      attachment: formData.attachment || undefined
    };
    setNotices(prev => [newNotice, ...prev]);
    setFormData({ title: "", target: "All", category: "Academic", message: "", pin: false, attachment: null });
    alert("Notice published successfully!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleEditClick = (notice: Notice) => {
    setEditingNotice(notice);
    setIsEditModalOpen(true);
  };

  const handleUpdateNotice = () => {
    if (editingNotice) {
      setNotices(prev => prev.map(n => n.id === editingNotice.id ? editingNotice : n));
      setIsEditModalOpen(false);
      setEditingNotice(null);
      alert("Notice updated successfully!");
    }
  };

  if (!hasMounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card">
        <div className="card-title">Create New Notice</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter notice title..."
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="target">Target Audience</label>
            <select 
              id="target" 
              name="target"
              value={formData.target} 
              onChange={handleInputChange}
            >
              <option>All</option>
              <option>Teachers</option>
              <option>Students</option>
              <option>Parents</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Notice Category</label>
            <select 
              id="category" 
              name="category"
              value={formData.category} 
              onChange={handleInputChange}
            >
              <option>Academic</option>
              <option>Holiday</option>
              <option>Event</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message Body</label>
          <textarea
            id="message"
            name="message"
            placeholder="Type your notice message here..."
            value={formData.message}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="action-row">
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="file"
                id="attachment"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label htmlFor="attachment" className="file-upload-btn">
                📎 Upload Attachment
              </label>
              {formData.attachment && (
                <div className="attachment-badge">
                  <span>{formData.attachment.name}</span>
                  <button onClick={removeAttachment}>×</button>
                </div>
              )}
            </div>
            <div className="toggle-wrapper">
              <input
                type="checkbox"
                id="pin"
                name="pin"
                checked={formData.pin}
                onChange={handleInputChange}
              />
              <label htmlFor="pin">Pin to Top</label>
            </div>
          </div>
          <button className="publish-btn" onClick={handlePublish}>Publish Notice</button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-title">Recent Notices</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Target</th>
              <th>Attachment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map(notice => (
              <tr key={notice.id}>
                <td>{notice.date}</td>
                <td>{notice.title}</td>
                <td>{notice.target}</td>
                <td>
                  {notice.attachment ? (
                    <a 
                      href={notice.attachment.data} 
                      download={notice.attachment.name}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      📎 {notice.attachment.name.length > 15 ? notice.attachment.name.substring(0, 15) + '...' : notice.attachment.name}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${notice.status.toLowerCase()}`}>
                    {notice.status}
                  </span>
                </td>
                <td>
                  <button className="btn-action btn-edit" onClick={() => handleEditClick(notice)}>Edit</button>
                  <button className="btn-action btn-delete" onClick={() => handleDelete(notice.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Notice"
      >
        {editingNotice && (
          <>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="edit-title">Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editingNotice.title}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-target">Target Audience</label>
                <select 
                  id="edit-target" 
                  name="target"
                  value={editingNotice.target} 
                  onChange={handleEditInputChange}
                >
                  <option>All</option>
                  <option>Teachers</option>
                  <option>Students</option>
                  <option>Parents</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select 
                  id="edit-category" 
                  name="category"
                  value={editingNotice.category} 
                  onChange={handleEditInputChange}
                >
                  <option>Academic</option>
                  <option>Holiday</option>
                  <option>Event</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="edit-message">Message Body</label>
              <textarea
                id="edit-message"
                name="message"
                value={editingNotice.message}
                onChange={handleEditInputChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Attachment</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="file"
                  id="edit-attachment"
                  style={{ display: "none" }}
                  onChange={handleEditFileChange}
                />
                <label htmlFor="edit-attachment" className="file-upload-btn">
                  📎 {editingNotice.attachment ? "Change Attachment" : "Upload Attachment"}
                </label>
                {editingNotice.attachment && (
                  <div className="attachment-badge">
                    <span>{editingNotice.attachment.name}</span>
                    <button onClick={removeEditAttachment}>×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="publish-btn" onClick={handleUpdateNotice}>Update Notice</button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
}
