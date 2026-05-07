"use client";

import React, { useState } from 'react';
import AdmLayout from "../components/AdmLayout";
import { useBasePath } from "../components/useBasePath";

// Import all components
import TemplatesNavbar from './components/TemplatesSidebar';
import TemplatesHeader from './components/TemplatesHeader';
import TemplatesStats from './components/TemplatesStats';
import TemplatesGrid from './components/TemplatesGrid';
import TemplatesPreviewModal from './components/TemplatesPreviewModal';
import VisualTemplateEditor from './components/VisualTemplateEditor';
import TemplateDefaults from './components/TemplateDefaults';
import TemplateCategories from './components/TemplateCategories';

import './Templates.css';
import { Template, Category } from './types';

export default function Templates() {
  const basePath = useBasePath();
  const [activeSection, setActiveSection] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModal, setPreviewModal] = useState<Template | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Mock data for visual templates
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      schoolId: 1,
      name: 'Student ID Card',
      type: 'id_card',
      backgroundImage: '/api/placeholder/600/400',
      canvasSize: { width: 600, height: 400 },
      fields: [
        { key: 'school.name', x: 300, y: 50, fontSize: 24, color: '#000000', bold: true, align: 'center', fieldType: 'text' },
        { key: 'student.name', x: 150, y: 150, fontSize: 18, color: '#000000', bold: false, align: 'left', fieldType: 'text' },
        { key: 'student.class', x: 150, y: 180, fontSize: 16, color: '#000000', bold: false, align: 'left', fieldType: 'text' },
        { key: 'student.roll', x: 150, y: 210, fontSize: 16, color: '#000000', bold: false, align: 'left', fieldType: 'text' },
        { key: 'student.photo', x: 450, y: 120, width: 100, height: 120, fontSize: 14, color: '#000000', bold: false, align: 'center', fieldType: 'image' }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      schoolId: 1,
      name: 'School Letterpad',
      type: 'letterpad',
      backgroundImage: '/api/placeholder/800/600',
      canvasSize: { width: 800, height: 600 },
      fields: [
        { key: 'school.name', x: 400, y: 100, fontSize: 28, color: '#000000', bold: true, align: 'center', fieldType: 'text' },
        { key: 'school.address', x: 400, y: 140, fontSize: 16, color: '#000000', bold: false, align: 'center', fieldType: 'text' },
        { key: 'letter.content', x: 100, y: 250, fontSize: 14, color: '#000000', bold: false, align: 'left', fieldType: 'text' }
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      schoolId: 1,
      name: 'Fee Bill',
      type: 'bill',
      backgroundImage: '/api/placeholder/600/800',
      canvasSize: { width: 600, height: 800 },
      fields: [
        { key: 'school.name', x: 300, y: 80, fontSize: 22, color: '#000000', bold: true, align: 'center', fieldType: 'text' },
        { key: 'student.name', x: 100, y: 200, fontSize: 16, color: '#000000', bold: false, align: 'left', fieldType: 'text' },
        { key: 'student.class', x: 100, y: 230, fontSize: 16, color: '#000000', bold: false, align: 'left', fieldType: 'text' },
        { key: 'fee.amount', x: 100, y: 350, fontSize: 18, color: '#000000', bold: true, align: 'left', fieldType: 'text' },
        { key: 'fee.month', x: 100, y: 380, fontSize: 16, color: '#000000', bold: false, align: 'left', fieldType: 'text' }
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ]);

  // Mock data for categories
  const categories: Category[] = [
    { 
      id: '1', 
      name: 'Academic', 
      icon: '📚', 
      description: 'Academic templates for students and teachers',
      templateCount: 12,
      color: 'blue'
    },
    { 
      id: '2', 
      name: 'Finance', 
      icon: '💰', 
      description: 'Financial templates for billing and payments',
      templateCount: 8,
      color: 'green'
    },
    { 
      id: '3', 
      name: 'Administrative', 
      icon: '🏢', 
      description: 'Administrative templates for office use',
      templateCount: 15,
      color: 'orange'
    }
  ];

  // Default templates state
  const [defaultTemplates, setDefaultTemplates] = useState({
    idCard: '1',
    letterpad: '2',
    bill: '3',
    certificate: '4'
  });


  // Event handlers
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setEditorMode(null);
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = () => {
    setEditorMode('create');
    setSelectedTemplate(null);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewModal(template);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditorMode('edit');
  };

  const handleCloneTemplate = (template: Template) => {
    const clonedTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates([...templates, clonedTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleToggleDefault = (templateId: string) => {
    // Update default templates
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setDefaultTemplates({
      ...defaultTemplates,
      [template.type]: templateId
    });
  };

  const handleSaveTemplate = (templateData: Partial<Template>) => {
    if (editorMode === 'create') {
      const newTemplate: Template = {
        id: Date.now().toString(),
        schoolId: 1,
        name: templateData.name || 'New Template',
        type: templateData.type || 'id_card',
        backgroundImage: templateData.backgroundImage || '/api/placeholder/600/400',
        canvasSize: templateData.canvasSize || { width: 600, height: 400 },
        fields: templateData.fields || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTemplates([...templates, newTemplate]);
    } else if (editorMode === 'edit' && selectedTemplate) {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...templateData, updatedAt: new Date() }
          : t
      ));
    }
    
    setEditorMode(null);
    setSelectedTemplate(null);
    setActiveSection('templates');
  };

  const handleDefaultChange = (type: keyof typeof defaultTemplates, templateId: string) => {
    setDefaultTemplates({
      ...defaultTemplates,
      [type]: templateId
    });
  };

  const handleCancelEdit = () => {
    setEditorMode(null);
    setSelectedTemplate(null);
  };

  const handleClosePreview = () => {
    setPreviewModal(null);
  };


  // Render content based on active section
  const renderContent = () => {
    if (editorMode) {
      return (
        <VisualTemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancelEdit}
          isNew={editorMode === 'create'}
        />
      );
    }

    switch (activeSection) {
      case 'templates':
        return (
          <div className="templates-content">
            <TemplatesStats
              totalTemplates={templates.length}
              activeDefaults={Object.values(defaultTemplates).filter(Boolean).length}
              categoriesCount={categories.length}
              recentlyUpdated={templates.length > 0 ? templates[0].updatedAt.toLocaleDateString() : 'Never'}
            />
            <TemplatesGrid
              templates={templates.filter(t =>
                searchQuery === '' ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.type.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onPreview={handlePreviewTemplate}
              onEdit={handleEditTemplate}
              onClone={handleCloneTemplate}
              onDelete={handleDeleteTemplate}
              onToggleDefault={handleToggleDefault}
            />
          </div>
        );
      
      case 'create':
        return (
          <VisualTemplateEditor
            template={null}
            onSave={handleSaveTemplate}
            onCancel={handleCancelEdit}
            isNew={true}
          />
        );
      
      case 'edit':
        return (
          <VisualTemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onCancel={handleCancelEdit}
            isNew={false}
          />
        );
      
      case 'defaults':
        return (
          <TemplateDefaults
            templates={templates}
            defaultTemplates={defaultTemplates}
            onDefaultChange={handleDefaultChange}
          />
        );
      
      case 'categories':
        return (
          <TemplateCategories
            categories={categories}
            onCreateCategory={() => console.log('Create category')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <AdmLayout basePath={basePath}>
      <div className="templates-layout">
        <TemplatesNavbar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        
        <div className="templates-main">
          {!editorMode && (
            <TemplatesHeader
              onCreateTemplate={handleCreateTemplate}
              onSearch={setSearchQuery}
            />
          )}
          
          <div className="templates-content">
            {renderContent()}
          </div>
        </div>
      </div>

      {previewModal && (
        <TemplatesPreviewModal
          template={previewModal}
          onClose={handleClosePreview}
        />
      )}
    </AdmLayout>
  );
}
