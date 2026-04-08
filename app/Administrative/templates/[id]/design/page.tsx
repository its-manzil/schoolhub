"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as fabric from "fabric";
import {
  Save,
  ArrowLeft,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  List,
  ListOrdered,
  Square,
  Circle,
  Minus,
  Triangle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import "./design.css";

// ============================================================
// Types
// ============================================================
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

interface SchoolData {
  name: string;
  address: string;
  email: string;
  logo: string;
  principalSignature: string;
}

interface FieldList {
  student: string[];
  staff: string[];
}


// ============================================================
// Custom hook for logged-in school ID (replace with real auth)
// ============================================================
const useSchoolId = () => {
  // In production, get from session/context/JWT
  return "current-school-id";
};

// ============================================================
// Main Component
// ============================================================
export default function TemplateDesign() {
  const params = useParams();
  const router = useRouter();
  const schoolId = useSchoolId();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Data states
  const [template, setTemplate] = useState<Template | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [fieldList, setFieldList] = useState<FieldList>({
    student: [],
    staff: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLinethrough, setIsLinethrough] = useState(false);
  const [isOverline, setIsOverline] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);

  // ============================================================
  // Data Fetching
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [templateRes, schoolRes, fieldsRes] = await Promise.all([
          fetch(`/api/templates/${params.id}`),
          fetch(`/api/school/${schoolId}`),
          fetch(`/api/templates/fields/list?schoolId=${schoolId}`),
        ]);

        if (!templateRes.ok) throw new Error("Failed to fetch template");
        const templateData = await templateRes.json();
        setTemplate(templateData.data);

        if (schoolRes.ok) {
          const school = await schoolRes.json();
          setSchoolData(school);
        }

        if (fieldsRes.ok) {
          const fields = await fieldsRes.json();
          setFieldList(fields);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id && schoolId) {
      fetchData();
    }
  }, [params.id, schoolId]);

  // ============================================================
  // Canvas Initialization
  // ============================================================
  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Load background image (fixed, non-editable)
    if (template.fileData) {
      fabric.Image.fromURL(
        `data:${template.fileType};base64,${template.fileData}`,
        { crossOrigin: "anonymous" }
      ).then((img: fabric.Image) => {
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
          evented: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
        });

        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }

    // Load existing layout
    if (template.layoutJson) {
      try {
        const layoutData = JSON.parse(template.layoutJson);
        canvas.loadFromJSON(layoutData, () => {
          applyDynamicFieldHighlight(canvas);
          canvas.renderAll();
        });
      } catch (err) {
        console.error("Error loading layout:", err);
      }
    }

    // Event handlers
    const handleSelection = (e: { selected?: fabric.Object[] }) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObject(obj);
        syncToolbarFromObject(obj);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("object:modified", (e: any) => {
      if (e.target && e.target === selectedObject) {
        syncToolbarFromObject(e.target);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [template, selectedObject]);

  // Handle window resize to keep canvas coordinates in sync
  useEffect(() => {
    const handleResize = () => {
      const canvas: fabric.Canvas | null = fabricCanvasRef.current;
      if (!canvas) return;
      
      const container: HTMLElement | null = canvasRef.current;
      if (!container) return;
      
      // Get actual display size
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate scale to fit canvas in container
      const scaleX = containerWidth / 800;
      const scaleY = containerHeight / 600;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      // Apply scale to canvas
      canvas.setZoom(scale);
      canvas.setDimensions({
        width: 800,
        height: 600
      });
      
      canvas.renderAll();
    };

    // Initial resize
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const applyDynamicFieldHighlight = (canvas: fabric.Canvas) => {
    canvas.getObjects().forEach((obj) => {
      if (obj instanceof fabric.Text) {
        const text = obj.text || "";
        if (text.startsWith("{{") && text.endsWith("}}")) {
          obj.set({
            backgroundColor: "rgba(255, 235, 59, 0.3)",
            padding: 2,
          });
        }
      }
    });
  };


  const syncToolbarFromObject = (obj: fabric.Object) => {
    if (obj instanceof fabric.Text) {
      setFontFamily(obj.fontFamily || "Arial");
      setFontSize(obj.fontSize || 16);
      setFontColor((obj.fill as string) || "#000000");
      setIsBold(obj.fontWeight === "bold");
      setIsItalic(obj.fontStyle === "italic");
      setIsUnderline(obj.underline || false);
      setIsLinethrough(obj.linethrough || false);
      setIsOverline(obj.overline || false);
      // Superscript/subscript via text styles
      const styles = obj.styles;
      // For simplicity, check first character style
      if (styles && styles[0] && styles[0][0]) {
        const style = styles[0][0] as { fontSize?: number; deltaY?: number };
        setIsSuperscript(style.fontSize && style.fontSize < (obj.fontSize || 16) && style.deltaY && style.deltaY < 0 ? true : false);
        setIsSubscript(style.fontSize && style.fontSize < (obj.fontSize || 16) && style.deltaY && style.deltaY > 0 ? true : false);
      } else {
        setIsSuperscript(false);
        setIsSubscript(false);
      }
    }
  };

  // ============================================================
  // Toolbar Updates
  // ============================================================
  useEffect(() => {
    if (!selectedObject || !fabricCanvasRef.current) return;
    if (!(selectedObject instanceof fabric.Text)) return;

    selectedObject.set({
      fontFamily,
      fontSize,
      fill: fontColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      underline: isUnderline,
      linethrough: isLinethrough,
      overline: isOverline,
    });

    fabricCanvasRef.current.renderAll();
  }, [
    fontFamily,
    fontSize,
    fontColor,
    isBold,
    isItalic,
    isUnderline,
    isLinethrough,
    isOverline,
    selectedObject,
  ]);

  // Handle superscript/subscript separately because they affect fontSize/deltaY
  const toggleSuperscript = () => {
    if (!selectedObject || !(selectedObject instanceof fabric.Text)) return;
    const newVal = !isSuperscript;
    setIsSuperscript(newVal);
    setIsSubscript(false);

    if (newVal) {
      // Set superscript by adjusting text style
      const currentText = selectedObject.text || "";
      selectedObject.set({
        text: currentText,
        fontSize: (selectedObject.fontSize || 16) * 0.7,
        deltaY: -8
      });
    } else {
      // Reset to normal
      selectedObject.set({
        fontSize: selectedObject.fontSize ? selectedObject.fontSize / 0.7 : 16,
        deltaY: 0
      });
    }
    fabricCanvasRef.current?.renderAll();
  };

  const toggleSubscript = () => {
    if (!selectedObject || !(selectedObject instanceof fabric.Text)) return;
    const newVal = !isSubscript;
    setIsSubscript(newVal);
    setIsSuperscript(false);

    if (newVal) {
      // Set subscript by adjusting text style
      const currentText = selectedObject.text || "";
      selectedObject.set({
        text: currentText,
        fontSize: (selectedObject.fontSize || 16) * 0.7,
        deltaY: 8
      });
    } else {
      // Reset to normal
      selectedObject.set({
        fontSize: selectedObject.fontSize ? selectedObject.fontSize / 0.7 : 16,
        deltaY: 0
      });
    }
    fabricCanvasRef.current?.renderAll();
  };

  // ============================================================
  // Element Addition
  // ============================================================
  const addText = (text: string = "New Text") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const isDynamic = text.startsWith("{{") && text.endsWith("}}");
    const textObj = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: fontColor,
      fontFamily: fontFamily,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      underline: isUnderline,
      linethrough: isLinethrough,
      overline: isOverline,
      backgroundColor: isDynamic ? "rgba(255, 235, 59, 0.3)" : "transparent",
      padding: isDynamic ? 2 : 0,
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  const addShape = (type: "rect" | "circle" | "line" | "triangle" | "roundedRect" | "arrow") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object;
    const common = {
      left: 150,
      top: 150,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
    };

    switch (type) {
      case "rect":
        shape = new fabric.Rect({ ...common, width: 100, height: 80 });
        break;
      case "circle":
        shape = new fabric.Circle({ ...common, radius: 50 });
        break;
      case "line":
        shape = new fabric.Line([50, 100, 200, 100], { ...common, fill: undefined });
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...common, width: 100, height: 80 });
        break;
      case "roundedRect":
        shape = new fabric.Rect({ ...common, width: 100, height: 80, rx: 10, ry: 10 });
        break;
      case "arrow":
        // Create arrow as a path
        const arrowPath = "M 0 0 L 60 0 L 60 -10 L 100 0 L 60 10 L 60 0 Z";
        shape = new fabric.Path(arrowPath, {
          ...common,
          fill: "#000000",
          stroke: undefined,
          left: 150,
          top: 150,
          scaleX: 1,
          scaleY: 1,
        });
        break;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const addDynamicField = (fieldPath: string) => {
    addText(`{{${fieldPath}}}`);
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      active.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  // ============================================================
  // Text Formatting Helpers
  // ============================================================
  const insertBullet = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active instanceof fabric.Text) {
      const text = active.text || "";
      active.set("text", "• " + text);
      canvas.renderAll();
    } else {
      addText("• List item");
    }
  };

  const insertNumbering = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active instanceof fabric.Text) {
      const text = active.text || "";
      active.set("text", "1. " + text);
      canvas.renderAll();
    } else {
      addText("1. List item");
    }
  };

  // ============================================================
  // Save Layout
  // ============================================================
  const saveLayout = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !template) return;

    setSaving(true);
    try {
      const layoutJson = JSON.stringify(canvas.toJSON());

      const response = await fetch(`/api/templates/${template._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutJson }),
      });

      if (!response.ok) throw new Error("Failed to save layout");

      alert("Layout saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="design-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading template editor...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="design-editor-error">
        <p>Error: {error || "Template not found"}</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="design-editor">
      {/* Top Toolbar */}
      <div className="design-toolbar">
        <div className="toolbar-left">
          <button onClick={() => router.back()} className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <h2>{template.name} – Design Editor</h2>
        </div>

        <div className="toolbar-center">
          <div className="font-controls">
            {/* Font Family */}
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="font-family-select"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>

            {/* Font Size */}
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="8"
              max="72"
              className="font-size-input"
            />

            {/* Color Picker */}
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="font-color-input"
            />

            {/* Text Styles */}
            <button
              onClick={() => setIsBold(!isBold)}
              className={`btn ${isBold ? "btn-active" : "btn-secondary"}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`btn ${isItalic ? "btn-active" : "btn-secondary"}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`btn ${isUnderline ? "btn-active" : "btn-secondary"}`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
            <button
              onClick={() => setIsLinethrough(!isLinethrough)}
              className={`btn ${isLinethrough ? "btn-active" : "btn-secondary"}`}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
            <button
              onClick={toggleSuperscript}
              className={`btn ${isSuperscript ? "btn-active" : "btn-secondary"}`}
              title="Superscript"
            >
              <Superscript size={16} />
            </button>
            <button
              onClick={toggleSubscript}
              className={`btn ${isSubscript ? "btn-active" : "btn-secondary"}`}
              title="Subscript"
            >
              <Subscript size={16} />
            </button>

            {/* Bullets / Numbering */}
            <button
              onClick={insertBullet}
              className="btn btn-secondary"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={insertNumbering}
              className="btn btn-secondary"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={deleteSelected}
              className="btn btn-danger"
              title="Delete selected"
            >
              <Trash2 size={16} />
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
            {saving ? "Saving..." : "Save Layout"}
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
          <h3>Add Elements</h3>

          {/* Text Section */}
          <div className="sidebar-section">
            <h4>Text</h4>
            <button
              onClick={() => addText()}
              className="btn btn-secondary btn-block"
            >
              <Type size={16} /> Add Text
            </button>
          </div>

          {/* Shapes Section */}
          <div className="sidebar-section">
            <h4>Shapes</h4>
            <button
              onClick={() => addShape("rect")}
              className="btn btn-secondary btn-block"
            >
              <Square size={16} /> Rectangle
            </button>
            <button
              onClick={() => addShape("circle")}
              className="btn btn-secondary btn-block"
            >
              <Circle size={16} /> Oval
            </button>
            <button
              onClick={() => addShape("roundedRect")}
              className="btn btn-secondary btn-block"
            >
              <Square size={16} /> Rounded Rect
            </button>
            <button
              onClick={() => addShape("triangle")}
              className="btn btn-secondary btn-block"
            >
              <Triangle size={16} /> Triangle
            </button>
            <button
              onClick={() => addShape("line")}
              className="btn btn-secondary btn-block"
            >
              <Minus size={16} /> Line
            </button>
            <button
              onClick={() => addShape("arrow")}
              className="btn btn-secondary btn-block"
            >
              <ArrowRight size={16} /> Arrow
            </button>
          </div>

          {/* School Data */}
          {schoolData && (
            <div className="sidebar-section">
              <h4>School Details</h4>
              <button
                onClick={() => addDynamicField("school.name")}
                className="btn btn-secondary btn-block"
              >
                School Name
              </button>
              <button
                onClick={() => addDynamicField("school.address")}
                className="btn btn-secondary btn-block"
              >
                School Address
              </button>
              <button
                onClick={() => addDynamicField("school.email")}
                className="btn btn-secondary btn-block"
              >
                School Email
              </button>
              <button
                onClick={() => addDynamicField("school.logo")}
                className="btn btn-secondary btn-block"
              >
                School Logo
              </button>
              <button
                onClick={() => addDynamicField("principal.signature")}
                className="btn btn-secondary btn-block"
              >
                Principal Signature
              </button>
            </div>
          )}

          {/* Student Fields */}
          <div className="sidebar-section">
            <h4>Student Details</h4>
            {fieldList.student.length > 0 ? (
              fieldList.student.map((field) => (
                <button
                  key={field}
                  onClick={() => addDynamicField(`student.${field}`)}
                  className="btn btn-secondary btn-block"
                >
                  {`student.${field}`}
                </button>
              ))
            ) : (
              <p className="text-muted">No student fields available</p>
            )}
          </div>

          {/* Staff Fields */}
          <div className="sidebar-section">
            <h4>Staff Details</h4>
            {fieldList.staff.length > 0 ? (
              fieldList.staff.map((field) => (
                <button
                  key={field}
                  onClick={() => addDynamicField(`staff.${field}`)}
                  className="btn btn-secondary btn-block"
                >
                  {`staff.${field}`}
                </button>
              ))
            ) : (
              <p className="text-muted">No staff fields available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}