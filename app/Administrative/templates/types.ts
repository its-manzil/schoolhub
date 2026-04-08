export interface Template {
  _id?: string;
  name: string;
  category: string;
  type: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: string;
  layoutJson?: string;
  createdAt?: string;
  updatedAt?: string;
}
