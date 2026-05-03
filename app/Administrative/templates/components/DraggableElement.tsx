'use client';

import React, { useRef, useCallback, useState, memo } from 'react';
import { X } from 'lucide-react';
import { TemplateField } from '../types';
import './DraggableElement.css';

interface DraggableElementProps {
  field: TemplateField;
  isSelected: boolean;
  isPreviewMode: boolean;
  displayValue: string;
  onSelect: () => void;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onDelete: () => void;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  onSnapPosition?: (x: number, y: number) => { x: number; y: number; snapLines: { v: number | null; h: number | null } };
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

const DraggableElement = memo(function DraggableElement({
  field,
  isSelected,
  isPreviewMode,
  displayValue,
  onSelect,
  onUpdate,
  onDelete,
  canvasWidth,
  canvasHeight,
  zoom,
  onSnapPosition
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  
  // Use refs to track drag state without re-rendering
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: field.x, y: field.y });
  const cursorOffset = useRef({ x: 0, y: 0 }); // For cursor-lock dragging
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: field.width || 100, height: field.height || 20 });

  // Update CSS transform without triggering React re-render
  const updateTransform = useCallback((x: number, y: number) => {
    if (elementRef.current) {
      elementRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  // Boundary constraints
  const constrainPosition = useCallback((x: number, y: number) => {
    const width = field.width || 100;
    const height = field.height || 20;
    return {
      x: Math.max(0, Math.min(x, canvasWidth - width)),
      y: Math.max(0, Math.min(y, canvasHeight - height))
    };
  }, [canvasWidth, canvasHeight, field.width, field.height]);

  // Handle pointer down for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    
    // CURSOR-LOCK: Calculate offset from cursor to element origin
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      cursorOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: field.x, y: field.y };
    
    if (elementRef.current) {
      elementRef.current.setPointerCapture(e.pointerId);
    }
  }, [field.x, field.y, isPreviewMode, onSelect]);

  // Handle pointer move for dragging
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging && !isResizing) return;

    e.preventDefault();
    
    if (isDragging) {
      // CURSOR-LOCK: Use cursor offset for tight drag sync
      // Calculate delta from drag start, adjusted for zoom
      const deltaX = (e.clientX - dragStartPos.current.x) / zoom;
      const deltaY = (e.clientY - dragStartPos.current.y) / zoom;
      
      const newX = elementStartPos.current.x + deltaX;
      const newY = elementStartPos.current.y + deltaY;
      
      // Apply snapping if provided
      let finalX = newX;
      let finalY = newY;
      if (onSnapPosition) {
        const snapped = onSnapPosition(newX, newY);
        finalX = snapped.x;
        finalY = snapped.y;
      }
      
      const constrained = constrainPosition(finalX, finalY);
      
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        updateTransform(constrained.x, constrained.y);
      });
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      let newWidth = resizeStartSize.current.width;
      let newHeight = resizeStartSize.current.height;
      
      if (isResizing === 'se') {
        newWidth = Math.max(20, resizeStartSize.current.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height + deltaY);
      } else if (isResizing === 'ne') {
        newWidth = Math.max(20, resizeStartSize.current.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height - deltaY);
      } else if (isResizing === 'sw') {
        newWidth = Math.max(20, resizeStartSize.current.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height + deltaY);
      } else if (isResizing === 'nw') {
        newWidth = Math.max(20, resizeStartSize.current.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height - deltaY);
      }
      
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.style.width = `${newWidth}px`;
          elementRef.current.style.height = `${newHeight}px`;
        }
      });
    }
  }, [isDragging, isResizing, constrainPosition, updateTransform, zoom, onSnapPosition]);

  // Handle pointer up - commit changes to state
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (elementRef.current) {
      elementRef.current.releasePointerCapture(e.pointerId);
    }
    
    if (isDragging) {
      setIsDragging(false);
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      const newX = elementStartPos.current.x + deltaX;
      const newY = elementStartPos.current.y + deltaY;
      const constrained = constrainPosition(newX, newY);
      
      // Only update React state at the end
      onUpdate({ x: constrained.x, y: constrained.y });
    }
    
    if (isResizing) {
      setIsResizing(null);
      
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      let newWidth = resizeStartSize.current.width;
      let newHeight = resizeStartSize.current.height;
      
      if (isResizing === 'se') {
        newWidth = Math.max(20, resizeStartSize.current.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height + deltaY);
      } else if (isResizing === 'ne') {
        newWidth = Math.max(20, resizeStartSize.current.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height - deltaY);
      } else if (isResizing === 'sw') {
        newWidth = Math.max(20, resizeStartSize.current.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height + deltaY);
      } else if (isResizing === 'nw') {
        newWidth = Math.max(20, resizeStartSize.current.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.current.height - deltaY);
      }
      
      onUpdate({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, constrainPosition, onUpdate]);

  // Handle resize handle pointer down
  const handleResizeStart = useCallback((e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsResizing(handle);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { width: field.width || 100, height: field.height || 20 };
    
    if (elementRef.current) {
      elementRef.current.setPointerCapture(e.pointerId);
    }
  }, [field.width, field.height]);

  // Get field icon and styling
  const getFieldStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: field.width || (field.fieldType === 'text' ? 'auto' : 80),
      height: field.height || (field.fieldType === 'text' ? 'auto' : 100),
      fontSize: `${field.fontSize || 14}px`,
      color: field.color || '#000000',
      fontWeight: field.bold ? 'bold' : 'normal',
      textAlign: field.align || 'left',
      cursor: isPreviewMode ? 'default' : 'move',
      userSelect: 'none',
      transform: `translate(${field.x}px, ${field.y}px)`,
    };

    if (field.fieldType === 'text') {
      return {
        ...baseStyles,
        padding: '4px 8px',
        backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        border: isSelected ? '2px solid #22c55e' : '1px dashed #ccc',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      };
    } else if (field.fieldType === 'image') {
      return {
        ...baseStyles,
        border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3b82f6',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '4px',
      };
    } else {
      // QR Code
      return {
        ...baseStyles,
        border: '2px dashed #8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b5cf6',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '4px',
      };
    }
  };

  return (
    <div
      ref={elementRef}
      className={`draggable-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPreviewMode ? 'preview-mode' : ''}`}
      style={getFieldStyles()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {field.fieldType === 'text' ? (
        <span className="field-content">{displayValue}</span>
      ) : (
        <div className="field-placeholder">
          {field.fieldType === 'image' ? 'Photo' : 'QR Code'}
        </div>
      )}

      {/* Delete button - only show when selected and not in preview mode */}
      {isSelected && !isPreviewMode && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={14} aria-hidden="true" role="img" />
        </button>
      )}

      {/* Resize handles - only show when selected and not in preview mode */}
      {isSelected && !isPreviewMode && (
        <>
          <div
            className="resize-handle nw"
            onPointerDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="resize-handle ne"
            onPointerDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="resize-handle sw"
            onPointerDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="resize-handle se"
            onPointerDown={(e) => handleResizeStart(e, 'se')}
          />
        </>
      )}
    </div>
  );
});

export default DraggableElement;
