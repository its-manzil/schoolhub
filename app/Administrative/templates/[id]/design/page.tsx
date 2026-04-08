"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as fabric from 'fabric';
import { Save, ArrowLeft, Type, Bold, Italic, Underline } from 'lucide-react';
import './design.css';

interface Template {
  _id: string;
  name: string;
  category: string;
  type: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData?: string;
  layoutJson?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function TemplateDesign() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Text | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Font controls
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        console.log('Fetching template with ID:', params.id);
        const response = await fetch(`/api/templates/${params.id}`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch template: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Template data:', data);
        setTemplate(data.data);
      } catch (error) {
        console.error('Error fetching template:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = canvas;

    // Load background image
    if (template.fileData) {
      fabric.Image.fromURL(`data:${template.fileType};base64,${template.fileData}`, {
        crossOrigin: 'anonymous'
      }).then((img: fabric.Image) => {
        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const imgWidth = img.width || canvasWidth;
        const imgHeight = img.height || canvasHeight;
        
        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
          selectable: false,
          evented: false
        });
        
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }

    // Load existing layout if available
    if (template.layoutJson) {
      try {
        const layoutData = JSON.parse(template.layoutJson);
        canvas.loadFromJSON(layoutData, canvas.renderAll.bind(canvas));
      } catch (error) {
        console.error('Error loading layout:', error);
      }
    }

    // Handle selection
    canvas.on('selection:created', (e: { selected?: fabric.Object[] }) => {
      const obj = e.selected?.[0];
      if (obj instanceof fabric.Text) {
        setSelectedObject(obj);
        updateFontControls(obj);
      }
    });

    canvas.on('selection:updated', (e: { selected?: fabric.Object[] }) => {
      const obj = e.selected?.[0];
      if (obj instanceof fabric.Text) {
        setSelectedObject(obj);
        updateFontControls(obj);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    return () => {
      canvas.dispose();
    };
  }, [template]);

  // Update font controls based on selected object
  const updateFontControls = (obj: fabric.Text) => {
    setFontSize(obj.fontSize || 16);
    setFontColor(obj.fill as string || '#000000');
    setIsBold(obj.fontWeight === 'bold');
    setIsItalic(obj.fontStyle === 'italic');
    setIsUnderline(obj.underline || false);
  };

  // Add text element
  const addText = (text: string = 'New Text') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const textObj = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: fontColor,
      fontFamily: 'Arial',
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  // Add field placeholder
  const addField = (fieldName: string) => {
    addText(`{{${fieldName}}}`);
  };

  // Update selected object properties
  useEffect(() => {
    const obj = selectedObject;
    if (!obj || !fabricCanvasRef.current) return;

    obj.set({
      fontSize: fontSize,
      fill: fontColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline
    });

    fabricCanvasRef.current.renderAll();
  }, [fontSize, fontColor, isBold, isItalic, isUnderline, selectedObject]);

  // Save layout
  const saveLayout = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !template) return;

    setSaving(true);
    try {
      const layoutJson = JSON.stringify(canvas.toJSON());
      
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutJson
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save layout');
      }

      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="design-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="design-editor-error">
        <p>Error: {error}</p>
        <p>Please make sure the backend server is running on localhost:2056</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="design-editor-error">
        <p>Template not found</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="design-editor">
      {/* Top Toolbar */}
      <div className="design-toolbar">
        <div className="toolbar-left">
          <button 
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h2>{template.name} - Design Editor</h2>
        </div>
        
        <div className="toolbar-center">
          <div className="font-controls">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="8"
              max="72"
              className="font-size-input"
            />
            
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="font-color-input"
            />
            
            <button
              onClick={() => setIsBold(!isBold)}
              className={`btn ${isBold ? 'btn-active' : 'btn-secondary'}`}
            >
              <Bold size={16} />
            </button>
            
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`btn ${isItalic ? 'btn-active' : 'btn-secondary'}`}
            >
              <Italic size={16} />
            </button>
            
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`btn ${isUnderline ? 'btn-active' : 'btn-secondary'}`}
            >
              <Underline size={16} />
            </button>
          </div>
        </div>
        
        <div className="toolbar-right">
          <button
            onClick={saveLayout}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      <div className="design-content">
        {/* Canvas Area */}
        <div className="canvas-container">
          <canvas ref={canvasRef} />
        </div>

        {/* Right Sidebar */}
        <div className="design-sidebar">
          <h3>Elements</h3>
          
          <div className="sidebar-section">
            <h4>Text</h4>
            <button 
              onClick={() => addText()}
              className="btn btn-secondary btn-block"
            >
              <Type size={16} />
              Add Text
            </button>
          </div>
          
          <div className="sidebar-section">
            <h4>School Fields</h4>
            <button 
              onClick={() => addField('school.name')}
              className="btn btn-secondary btn-block"
            >
              School Name
            </button>
            <button 
              onClick={() => addField('school.address')}
              className="btn btn-secondary btn-block"
            >
              School Address
            </button>
          </div>
          
          <div className="sidebar-section">
            <h4>Student Fields</h4>
            <button 
              onClick={() => addField('student.name')}
              className="btn btn-secondary btn-block"
            >
              Student Name
            </button>
            <button 
              onClick={() => addField('student.class')}
              className="btn btn-secondary btn-block"
            >
              Student Class
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
