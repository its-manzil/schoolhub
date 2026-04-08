"use client";

import React, { useState } from 'react';
import AdmLayout from "../components/AdmLayout";
import { FileText, Download, Eye, Loader2, CheckCircle } from "lucide-react";
import "./Templates.css";

interface Template {
  id: string;
  name: string;
  type: string;
  size: string;
  updated: string;
}

interface TemplatesData {
  academic: Template[];
  admin: Template[];
  finance: Template[];
}

export default function Templates() {
  const [activeTab, setActiveTab] = useState('academic');
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const templatesData: TemplatesData = {
    academic: [
      { id: 'acad-1', name: "Report Card Template", type: "PDF/Word", size: "2.4 MB", updated: "2 days ago" },
      { id: 'acad-2', name: "Lesson Plan Structure", type: "Google Doc", size: "1.1 MB", updated: "1 week ago" },
      { id: 'acad-3', name: "Progress Report", type: "Excel", size: "4.5 MB", updated: "3 days ago" },
      { id: 'acad-4', name: "Internal Exam Question Format", type: "Word", size: "0.8 MB", updated: "5 days ago" },
    ],
    admin: [
      { id: 'adm-1', name: "Student ID Card Template", type: "Photoshop/AI", size: "15.2 MB", updated: "1 month ago" },
      { id: 'adm-2', name: "Staff Recruitment Letter", type: "Word", size: "1.2 MB", updated: "2 weeks ago" },
      { id: 'adm-3', name: "Transfer Certificate Format", type: "Word", size: "0.9 MB", updated: "1 week ago" },
      { id: 'adm-4', name: "Official Letterhead", type: "PDF", size: "3.1 MB", updated: "2 months ago" },
    ],
    finance: [
      { id: 'fin-1', name: "Monthly Fee Receipt", type: "PDF", size: "1.5 MB", updated: "3 days ago" },
      { id: 'fin-2', name: "Salary Slip Format", type: "Excel", size: "2.2 MB", updated: "1 week ago" },
      { id: 'fin-3', name: "Expense Tracking Sheet", type: "Excel", size: "5.8 MB", updated: "2 weeks ago" },
    ]
  };

  const handlePreview = (templateName: string) => {
    alert(`Opening preview for ${templateName}...`);
  };

  const handleDownload = (templateId: string, templateName: string) => {
    setLoadingTemplate(templateId);
    
    // Simulate download process
    setTimeout(() => {
      setLoadingTemplate(null);
      setDownloadSuccess(templateId);
      
      // Reset success message after 3 seconds
      setTimeout(() => setDownloadSuccess(null), 3000);
      
      console.log(`Downloaded: ${templateName}`);
    }, 1500);
  };

  return (
    <AdmLayout>
      <div className="templates-container">
        <div className="templates-hero">
          <h1>Template Library</h1>
          <p>Download and manage standard school document templates for your institution.</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          {['Academic', 'Admin', 'Finance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="templates-grid">
          {templatesData[activeTab as keyof TemplatesData].map((template: Template) => (
            <div key={template.id} className="template-card">
              <div className="template-card-header">
                <FileText className="template-icon" size={24} color="#2563eb" />
                <span className="template-type-badge">{template.type}</span>
              </div>
              <h3>{template.name}</h3>
              <p className="template-info">Size: {template.size} • Updated: {template.updated}</p>
              
              <div className="template-actions">
                <button 
                  className="btn-preview" 
                  onClick={() => handlePreview(template.name)}
                  disabled={loadingTemplate === template.id}
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button 
                  className="btn-download" 
                  onClick={() => handleDownload(template.id, template.name)}
                  disabled={loadingTemplate === template.id}
                  style={{ background: downloadSuccess === template.id ? '#10b981' : '' }}
                >
                  {loadingTemplate === template.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Downloading...
                    </>
                  ) : downloadSuccess === template.id ? (
                    <>
                      <CheckCircle size={16} />
                      Done
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdmLayout>
  );
}
