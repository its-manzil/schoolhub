import React, { useRef, useState } from 'react';
import { Upload, Image, FileImage, AlertCircle } from "lucide-react";
import './ImageUploader.css';

interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function ImageUploader({ 
  onUpload, 
  maxSize = 5, 
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'] 
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setUploadError('');

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Read and upload file
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onUpload(imageUrl);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <div className="header-icon" aria-label="Template icon">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image size={24} aria-hidden="true" />
        </div>
        <h3>Create Your Template</h3>
      </div>

      <div className="uploader-steps">
        <div className="step">
          <span className="step-number">1</span>
          <span className="step-text">Upload background image</span>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <span className="step-text">Drag & drop fields</span>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <span className="step-text">Export & print</span>
        </div>
      </div>

      <div className="uploader-description">
        <p>Upload a template background to get started.</p>
        <p>Recommended: 600×400px or higher • Max {maxSize}MB</p>
      </div>

      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          <Upload size={32} />
          <h4>Drop image here or click to browse</h4>
          <p>Supports: PNG, JPG (Max {maxSize}MB)</p>
        </div>

        <div className="upload-overlay">
          <FileImage size={24} />
          <span>Release to upload</span>
        </div>
      </div>

      {uploadError && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="uploader-tips">
        <h4>Pro Tips:</h4>
        <ul>
          <li>Use high-resolution images (300 DPI) for crisp prints</li>
          <li>Leave empty space for student data fields</li>
          <li>Match aspect ratio to your paper size (A4, ID card, etc.)</li>
          <li>Use PNG if you need transparent areas</li>
        </ul>
      </div>
    </div>
  );
}
