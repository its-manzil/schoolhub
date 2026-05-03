'use client';

/**
 * TEMPLATE CANVAS
 * 
 * Wraps the unified TemplateRenderer and provides:
 * - Editor controls (zoom, grid, etc.)
 * - Draggable elements layer
 * - PDF/PNG export
 * - Toolbar with alignment tools
 */

import React, { useRef, useCallback, useState, memo } from 'react';
import { ZoomIn, ZoomOut, Grid, Eye, EyeOff, Download, Printer, AlignLeft, AlignCenter, AlignRight, AlignHorizontalJustifyCenter, ChevronUp, ChevronDown, Monitor, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DraggableElement from './DraggableElement';
import TemplateRenderer, { BASE_WIDTH, BASE_HEIGHT } from './TemplateRenderer';
import { TemplateField } from '../types';
import './TemplateCanvas.css';

interface TemplateCanvasProps {
  backgroundImage: string;
  canvasSize: { width: number; height: number };
  fields: TemplateField[];
  selectedField: TemplateField | null;
  onFieldUpdate: (fieldKey: string, updates: Partial<TemplateField>) => void;
  onFieldSelect: (field: TemplateField | null) => void;
  onFieldDelete: (fieldKey: string) => void;
  onExport?: () => void;
}

const TemplateCanvas = memo(function TemplateCanvas({
  backgroundImage,
  canvasSize,
  fields,
  selectedField,
  onFieldUpdate,
  onFieldSelect,
  onFieldDelete,
  onExport
}: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [snapLines, setSnapLines] = useState<{ v: number | null; h: number | null }>({ v: null, h: null });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Export canvas as PNG
  const exportCanvas = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    const wasInPreview = isPreviewMode;
    setIsPreviewMode(true); // Hide UI elements during export

    try {
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
      });

      // Convert to blob and download
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export template. Please try again.');
    } finally {
      setIsExporting(false);
      if (!wasInPreview) setIsPreviewMode(false);
    }
  }, [isPreviewMode]);

  // Export as PDF
  const exportPDF = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsGeneratingPDF(true);
    const wasInPreview = isPreviewMode;
    setIsPreviewMode(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
      });

      // Create PDF with exact dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [BASE_WIDTH, BASE_HEIGHT],
        hotfixes: ['px_scaling'],
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add image at full size
      pdf.addImage(imgData, 'PNG', 0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      pdf.save(`template-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      if (!wasInPreview) setIsPreviewMode(false);
    }
  }, [isPreviewMode]);

  // Print template
  const handlePrint = useCallback(() => {
    // Create a temporary window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Template</title>
          <style>
            @page { size: ${BASE_WIDTH}px ${BASE_HEIGHT}px; margin: 0; }
            body { margin: 0; padding: 0; }
            .print-container { width: ${BASE_WIDTH}px; height: ${BASE_HEIGHT}px; }
          </style>
        </head>
        <body>
          <div class="print-container" id="print-root"></div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Use setTimeout to allow the document to load
    setTimeout(async () => {
      try {
        if (!canvasRef.current) return;
        
        const canvas = await html2canvas(canvasRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
        });
        
        const printRoot = printWindow.document.getElementById('print-root');
        if (printRoot) {
          printRoot.appendChild(canvas);
          printWindow.print();
        }
      } catch (error) {
        console.error('Print failed:', error);
        printWindow.close();
      }
    }, 500);
  }, []);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  // Handle zoom reset
  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    const container = canvasRef.current?.parentElement;
    if (container) {
      const containerWidth = container.clientWidth - 80;
      const containerHeight = container.clientHeight - 80;
      const scaleX = containerWidth / canvasSize.width;
      const scaleY = containerHeight / canvasSize.height;
      setZoom(Math.min(scaleX, scaleY, 2));
    }
  }, [canvasSize.width, canvasSize.height]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
    }
  }, []);

  // ALIGNMENT TOOLS (using BASE dimensions)
  const handleAlignLeft = useCallback(() => {
    if (selectedField) {
      onFieldUpdate(selectedField.key, { x: 0 });
    }
  }, [selectedField, onFieldUpdate]);

  const handleAlignCenter = useCallback(() => {
    if (selectedField) {
      const width = selectedField.width || 100;
      onFieldUpdate(selectedField.key, { x: (BASE_WIDTH - width) / 2 });
    }
  }, [selectedField, onFieldUpdate]);

  const handleAlignRight = useCallback(() => {
    if (selectedField) {
      const width = selectedField.width || 100;
      onFieldUpdate(selectedField.key, { x: BASE_WIDTH - width });
    }
  }, [selectedField, onFieldUpdate]);

  const handleAlignTop = useCallback(() => {
    if (selectedField) {
      onFieldUpdate(selectedField.key, { y: 0 });
    }
  }, [selectedField, onFieldUpdate]);

  const handleAlignMiddle = useCallback(() => {
    if (selectedField) {
      const height = selectedField.height || 20;
      onFieldUpdate(selectedField.key, { y: (BASE_HEIGHT - height) / 2 });
    }
  }, [selectedField, onFieldUpdate]);

  const handleAlignBottom = useCallback(() => {
    if (selectedField) {
      const height = selectedField.height || 20;
      onFieldUpdate(selectedField.key, { y: BASE_HEIGHT - height });
    }
  }, [selectedField, onFieldUpdate]);

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onFieldSelect(null);
      setSnapLines({ v: null, h: null });
    }
  }, [onFieldSelect]);

  // SNAP SYSTEM: Calculate snap position with guide lines
  const handleSnapPosition = useCallback((x: number, y: number) => {
    const SNAP_DISTANCE = 6;
    const elementWidth = 100; // approximate
    const elementHeight = 20;
    
    let snapX = x;
    let snapY = y;
    let snapV: number | null = null;
    let snapH: number | null = null;
    
    // Snap to canvas center (using BASE dimensions)
    const centerX = BASE_WIDTH / 2;
    const centerY = BASE_HEIGHT / 2;
    
    if (Math.abs(x + elementWidth / 2 - centerX) < SNAP_DISTANCE) {
      snapX = centerX - elementWidth / 2;
      snapV = centerX;
    }
    if (Math.abs(y + elementHeight / 2 - centerY) < SNAP_DISTANCE) {
      snapY = centerY - elementHeight / 2;
      snapH = centerY;
    }
    
    // Snap to edges
    if (Math.abs(x) < SNAP_DISTANCE) {
      snapX = 0;
      snapV = 0;
    }
    if (Math.abs(y) < SNAP_DISTANCE) {
      snapY = 0;
      snapH = 0;
    }
    if (Math.abs(x + elementWidth - BASE_WIDTH) < SNAP_DISTANCE) {
      snapX = BASE_WIDTH - elementWidth;
      snapV = BASE_WIDTH;
    }
    if (Math.abs(y + elementHeight - BASE_HEIGHT) < SNAP_DISTANCE) {
      snapY = BASE_HEIGHT - elementHeight;
      snapH = BASE_HEIGHT;
    }
    
    setSnapLines({ v: snapV, h: snapH });
    return { x: snapX, y: snapY, snapLines: { v: snapV, h: snapH } };
  }, []);

  // Get display value for field
  const getFieldDisplayValue = useCallback((field: TemplateField): string => {
    const fieldMap: { [key: string]: string } = {
      'student.name': 'John Doe',
      'student.class': 'Grade 10',
      'student.roll': '12345',
      'student.section': 'A',
      'school.name': 'Sample School',
      'school.address': '123 Education Street',
      'school.phone': '+977-1234567890',
      'school.logo': 'Logo',
      'fee.amount': 'Rs. 5,000',
      'fee.month': 'January',
      'certificate.title': 'Academic Excellence',
      'letter.content': 'Lorem ipsum...',
      'custom.text': 'Custom Text',
      'qrcode': 'QR',
      'student.photo': 'Photo'
    };
    return fieldMap[field.key] || field.key;
  }, []);

  return (
    <div className="template-canvas-wrapper">
      {/* Toolbar */}
      <div className="canvas-toolbar">
        {/* Zoom Controls */}
        <div className="toolbar-section zoom-section">
          <span className="toolbar-label">Zoom:</span>
          <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} aria-hidden="true" role="img" />
          </button>
          <input
            type="range"
            min="25"
            max="200"
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
            className="zoom-slider"
            title="Zoom Slider"
          />
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} aria-hidden="true" role="img" />
          </button>
          <button className="toolbar-btn" onClick={handleZoomReset} title="Reset to 100%">
            100%
          </button>
          <button className="toolbar-btn" onClick={handleFitToScreen} title="Fit to Screen">
            <Monitor size={16} aria-hidden="true" role="img" />
          </button>
        </div>

        {/* Alignment Tools */}
        {selectedField && !isPreviewMode && (
          <div className="toolbar-section alignment-section">
            <span className="toolbar-label">Align:</span>
            <button className="toolbar-btn" onClick={handleAlignLeft} title="Align Left">
              <AlignLeft size={16} aria-hidden="true" role="img" />
            </button>
            <button className="toolbar-btn" onClick={handleAlignCenter} title="Align Center">
              <AlignCenter size={16} aria-hidden="true" role="img" />
            </button>
            <button className="toolbar-btn" onClick={handleAlignRight} title="Align Right">
              <AlignRight size={16} aria-hidden="true" role="img" />
            </button>
            <div className="toolbar-divider" />
            <button className="toolbar-btn" onClick={handleAlignTop} title="Align Top">
              <ChevronUp size={16} aria-hidden="true" role="img" />
            </button>
            <button className="toolbar-btn" onClick={handleAlignMiddle} title="Align Middle">
              <AlignHorizontalJustifyCenter size={16} aria-hidden="true" role="img" />
            </button>
            <button className="toolbar-btn" onClick={handleAlignBottom} title="Align Bottom">
              <ChevronDown size={16} aria-hidden="true" role="img" />
            </button>
          </div>
        )}

        <div className="toolbar-section">
          <button
            className={`toolbar-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <Grid size={16} aria-hidden="true" role="img" />
          </button>
          <button
            className={`toolbar-btn ${isPreviewMode ? 'active' : ''}`}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title="Preview Mode"
          >
            {isPreviewMode ? <EyeOff size={16} aria-hidden="true" role="img" /> : <Eye size={16} aria-hidden="true" role="img" />}
          </button>
          <button
            className="toolbar-btn export"
            onClick={exportPDF}
            disabled={isGeneratingPDF}
            title="Export PDF"
          >
            {isGeneratingPDF ? (
              <span className="spinner" />
            ) : (
              <FileText size={16} aria-hidden="true" role="img" />
            )}
          </button>
          <button
            className="toolbar-btn export"
            onClick={onExport || exportCanvas}
            disabled={isExporting}
            title="Export PNG"
          >
            {isExporting ? (
              <span className="spinner" />
            ) : (
              <Download size={16} aria-hidden="true" role="img" />
            )}
          </button>
          <button
            className="toolbar-btn"
            onClick={handlePrint}
            title="Print Template"
          >
            <Printer size={16} aria-hidden="true" role="img" />
          </button>
        </div>
      </div>

      {/* Canvas Container - Uses unified TemplateRenderer */}
      <div className="canvas-scroll-container" onWheel={handleWheel}>
        <div
          ref={canvasRef}
          className="canvas-inner"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onClick={handleCanvasClick}
        >
          {/* Unified Template Renderer - BASE dimensions */}
          <TemplateRenderer
            ref={canvasRef}
            backgroundImage={backgroundImage}
            fields={fields}
            mode={isPreviewMode ? 'preview' : 'edit'}
            showGrid={showGrid && !isPreviewMode}
            snapLines={snapLines}
            zoom={1} // Zoom is applied to wrapper, not renderer
          />

          {/* Draggable Elements Layer - Only in Edit Mode */}
          {!isPreviewMode && (
            <div className="draggable-layer">
              {fields.map((field) => (
                <DraggableElement
                  key={field.key}
                  field={field}
                  isSelected={selectedField?.key === field.key}
                  isPreviewMode={isPreviewMode}
                  displayValue={getFieldDisplayValue(field)}
                  onSelect={() => onFieldSelect(field)}
                  onUpdate={(updates) => onFieldUpdate(field.key, updates)}
                  onDelete={() => onFieldDelete(field.key)}
                  canvasWidth={BASE_WIDTH}
                  canvasHeight={BASE_HEIGHT}
                  zoom={zoom}
                  onSnapPosition={handleSnapPosition}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="canvas-info-bar">
        <span>Canvas: {BASE_WIDTH} × {BASE_HEIGHT}px (Fixed)</span>
        <span>Fields: {fields.length}</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>Mode: {isPreviewMode ? 'Preview' : 'Edit'}</span>
        <span className="aspect-ratio">Ratio: 16:10 (Landscape Card)</span>
        {isExporting && <span className="exporting-indicator">Exporting PNG...</span>}
        {isGeneratingPDF && <span className="exporting-indicator">Generating PDF...</span>}
      </div>
    </div>
  );
});

export default TemplateCanvas;
