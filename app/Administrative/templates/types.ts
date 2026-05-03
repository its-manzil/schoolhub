export interface TemplateField {
  key: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  fieldType: 'text' | 'image' | 'qrcode';
}

export interface Template {
  id: string;
  schoolId: number;
  name: string;
  type: 'id_card' | 'letterpad' | 'bill' | 'certificate';
  backgroundImage: string;
  canvasSize: {
    width: number;
    height: number;
  };
  fields: TemplateField[];
  createdAt: Date;
  updatedAt: Date;
  // UI-specific properties
  description?: string;
  category?: string;
  isDefault?: boolean;
  usedFor?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  templateCount: number;
  color: string;
}
