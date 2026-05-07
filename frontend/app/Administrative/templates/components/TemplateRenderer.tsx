'use client';

/**
 * TEMPLATE RENDERER - Unified Rendering Engine
 * 
 * This component is the SINGLE source of truth for rendering templates.
 * It handles Editor, Preview, and Print modes with the SAME rendering logic.
 * 
 * Golden Rule: Editor === Preview === Print (always)
 */

import React, { memo, useMemo, forwardRef } from 'react';
import { TemplateField } from '../types';
import './TemplateRenderer.css';

// FIXED BASE DIMENSIONS - All calculations use these
export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 500;

export type RenderMode = 'edit' | 'preview' | 'print';

interface TemplateRendererProps {
  backgroundImage: string;
  fields: TemplateField[];
  mode: RenderMode;
  showGrid?: boolean;
  showBounds?: boolean; // Debug mode
  selectedFieldKey?: string | null;
  // Edit mode specific
  onFieldSelect?: (field: TemplateField | null) => void;
  onFieldUpdate?: (fieldKey: string, updates: Partial<TemplateField>) => void;
  onFieldDelete?: (fieldKey: string) => void;
  snapLines?: { v: number | null; h: number | null };
  // Zoom for edit mode (only affects visual scale, not internal coordinates)
  zoom?: number;
}

// Get display value for field (sample data)
const getFieldDisplayValue = (field: TemplateField): string => {
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
};

// Static element for text fields (used in preview/print modes)
const StaticTextElement = memo(function StaticTextElement({
  field
}: {
  field: TemplateField;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: field.x,
    top: field.y,
    width: field.width || 'auto',
    height: field.height || 'auto',
    fontSize: `${field.fontSize || 14}px`,
    color: field.color || '#000000',
    fontWeight: field.bold ? 'bold' : 'normal',
    textAlign: field.align || 'left',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-family-istok, sans-serif)',
    lineHeight: 1.2,
  };

  return (
    <div style={style} className="template-text-element">
      {getFieldDisplayValue(field)}
    </div>
  );
});

// Static element for image/QR fields
const StaticMediaElement = memo(function StaticMediaElement({
  field
}: {
  field: TemplateField;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: field.x,
    top: field.y,
    width: field.width || 80,
    height: field.height || 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (field.fieldType === 'qrcode') {
    return (
      <div style={style} className="template-qr-element">
        <svg viewBox="0 0 100 100" className="qr-placeholder">
          <rect x="10" y="10" width="25" height="25" fill="#000" />
          <rect x="65" y="10" width="25" height="25" fill="#000" />
          <rect x="10" y="65" width="25" height="25" fill="#000" />
          <rect x="20" y="20" width="5" height="5" fill="#fff" />
          <rect x="75" y="20" width="5" height="5" fill="#fff" />
          <rect x="20" y="75" width="5" height="5" fill="#fff" />
          <rect x="40" y="10" width="5" height="80" fill="#000" />
          <rect x="10" y="40" width="80" height="5" fill="#000" />
          <rect x="45" y="45" width="10" height="10" fill="#000" />
        </svg>
      </div>
    );
  }

  return (
    <div style={style} className="template-image-element">
      <div className="photo-placeholder">
        <span>Photo</span>
      </div>
    </div>
  );
});

// Grid overlay for edit mode
const GridOverlay = memo(function GridOverlay() {
  return (
    <svg 
      className="template-grid-overlay" 
      width={BASE_WIDTH} 
      height={BASE_HEIGHT}
    >
      {Array.from({ length: Math.ceil(BASE_WIDTH / 20) + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 20}
          y1={0}
          x2={i * 20}
          y2={BASE_HEIGHT}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: Math.ceil(BASE_HEIGHT / 20) + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * 20}
          x2={BASE_WIDTH}
          y2={i * 20}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
});

// Snap guide lines for edit mode
const SnapGuides = memo(function SnapGuides({
  snapLines
}: {
  snapLines: { v: number | null; h: number | null };
}) {
  return (
    <>
      {snapLines.v !== null && (
        <div
          className="snap-guide vertical"
          style={{ left: snapLines.v }}
        />
      )}
      {snapLines.h !== null && (
        <div
          className="snap-guide horizontal"
          style={{ top: snapLines.h }}
        />
      )}
    </>
  );
});

// Debug bounds overlay
const DebugBounds = memo(function DebugBounds({
  fields
}: {
  fields: TemplateField[];
}) {
  return (
    <div className="debug-bounds-overlay">
      {fields.map((field) => (
        <div
          key={`debug-${field.key}`}
          className="debug-bound-box"
          style={{
            position: 'absolute',
            left: field.x,
            top: field.y,
            width: field.width || (field.fieldType === 'text' ? 100 : 80),
            height: field.height || (field.fieldType === 'text' ? 20 : 100),
          }}
        >
          <span className="debug-label">{field.key}</span>
        </div>
      ))}
    </div>
  );
});

const TemplateRenderer = forwardRef<HTMLDivElement, TemplateRendererProps>(
  function TemplateRenderer(
    {
      backgroundImage,
      fields,
      mode,
      showGrid = false,
      showBounds = false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      selectedFieldKey = null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onFieldSelect,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onFieldUpdate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onFieldDelete,
      snapLines = { v: null, h: null },
      zoom = 1,
    },
    ref
  ) {
    const isEditMode = mode === 'edit';
    const isPreviewMode = mode === 'preview' || mode === 'print';

    // Wrapper style for edit mode zoom (ONLY visual scaling)
    const wrapperStyle = useMemo(() => {
      if (!isEditMode) return undefined;
      return {
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      } as React.CSSProperties;
    }, [isEditMode, zoom]);

    return (
      <div 
        ref={ref}
        className={`template-render-root ${mode}-mode`}
        style={wrapperStyle}
        data-testid="template-renderer"
      >
        {/* Background Image - FIXED dimensions, never cropped */}
        {backgroundImage && (
          <div className="template-bg-wrapper">
            <img
              src={backgroundImage}
              alt="Template background"
              className="template-bg"
              draggable={false}
            />
          </div>
        )}

        {/* Grid Overlay - only in edit mode */}
        {isEditMode && showGrid && <GridOverlay />}

        {/* Snap Guides - only in edit mode */}
        {isEditMode && <SnapGuides snapLines={snapLines} />}

        {/* Fields Layer */}
        <div className="template-fields-layer">
          {fields.map((field) => {
            // In edit mode, we need draggable elements (handled by parent)
            // For preview/print, use static rendering
            if (isPreviewMode) {
              if (field.fieldType === 'text') {
                return (
                  <StaticTextElement
                    key={field.key}
                    field={field}
                  />
                );
              }
              return <StaticMediaElement key={field.key} field={field} />;
            }
            return null; // Edit mode fields are rendered by parent (DraggableElement)
          })}
        </div>

        {/* Debug Bounds - shows element boxes for troubleshooting */}
        {showBounds && <DebugBounds fields={fields} />}

        {/* Canvas Border - shows bounds in edit mode */}
        {isEditMode && (
          <div className="template-canvas-border">
            <span className="canvas-dimensions">{BASE_WIDTH} × {BASE_HEIGHT}px</span>
          </div>
        )}
      </div>
    );
  }
);

export default TemplateRenderer;
