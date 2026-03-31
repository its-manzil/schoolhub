"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faFileCsv, faFileExcel, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface School {
  _id: string;
  schoolId: number;
  name: string;
}

interface StudentImportModalProps {
  onClose: () => void;
  schools: School[];
}

const SYSTEM_FIELDS = [
  { id: 'name', label: 'Name (Required)', required: true },
  { id: 'class', label: 'Class (Required)', required: true },
  { id: 'section', label: 'Section', required: false },
  { id: 'roll_no', label: 'Roll No', required: false },
  { id: 'phone', label: 'Phone', required: false },
  { id: 'address', label: 'Address', required: false },
  { id: 'dob', label: 'Date of Birth', required: false },
  { id: 'gender', label: 'Gender', required: false }
];

export default function StudentImportSection({ onClose, schools }: StudentImportModalProps) {
  const [step, setStep] = useState(1); // 1: Select & Upload, 2: Map Columns, 3: Progress
  
  // Step 1 states
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [searchSchool, setSearchSchool] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  
  // Step 2 states
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isParsing, setIsParsing] = useState(false);
  
  // Step 3 states
  const [jobId, setJobId] = useState('');
  const [progress, setProgress] = useState({ total: 0, processed: 0, errors: 0, status: 'processing' });
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter schools for dropdown
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchSchool.toLowerCase()) || 
    s.schoolId.toString().includes(searchSchool)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFileSelection(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFileSelection(droppedFile);
  };

  const processFileSelection = (selectedFile: File) => {
    setFileError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setFileError('Please upload a .csv or .xlsx file');
      return;
    }
    setFile(selectedFile);
  };

  const extractHeaders = async () => {
    if (!file) return;
    setIsParsing(true);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          preview: 20, // Only get first 20 rows
          worker: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            if (results.meta.fields) {
              setHeaders(results.meta.fields);
              setPreviewData(results.data);
              autoMapFields(results.meta.fields);
              setStep(2);
            } else {
              setFileError('Failed to extract headers from CSV.');
            }
            setIsParsing(false);
          },
          error: (error: any) => {
            setFileError(error.message);
            setIsParsing(false);
          }
        });
      } else if (ext === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (json && json.length > 0) {
            const extractedHeaders = json[0] as string[];
            setHeaders(extractedHeaders.filter(Boolean));
            
            // Format preview data map
            const preview = json.slice(1, 21).map(row => {
               const rowData: any = {};
               extractedHeaders.forEach((header, index) => {
                 if (header) {
                   rowData[header] = (row as any[])[index];
                 }
               });
               return rowData;
            });
            
            setPreviewData(preview);
            autoMapFields(extractedHeaders.filter(Boolean));
            setStep(2);
          } else {
            setFileError('Excel sheet appears empty.');
          }
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setFileError('Error processing file.');
      setIsParsing(false);
    }
  };

  const autoMapFields = (fileHeaders: string[]) => {
    const initialMapping: Record<string, string> = {};
    const lowerFields = SYSTEM_FIELDS.map(f => ({ id: f.id, keywords: f.id.replace('_', ' ') }));
    
    fileHeaders.forEach(header => {
      const hLower = header.toLowerCase();
      // Simple keyword matching for auto-mapping
      const match = lowerFields.find(f => hLower.includes(f.keywords) || hLower === f.id);
      if (match) {
        initialMapping[header] = match.id;
      } else {
        initialMapping[header] = ''; // Ignore by default
      }
    });
    setMapping(initialMapping);
  };

  const handleMappingChange = (header: string, systemField: string) => {
    setMapping(prev => ({
      ...prev,
      [header]: systemField
    }));
  };

  const startImport = async () => {
    if (!selectedSchoolId || !file) return;
    
    // Check required mappings
    const mappedValues = Object.values(mapping);
    const missingRequired = SYSTEM_FIELDS.filter(f => f.required && !mappedValues.includes(f.id));
    
    if (missingRequired.length > 0) {
      alert(`Missing required mappings: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setIsUploading(true);
    setStep(3);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('schoolId', selectedSchoolId);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:2056/api/import/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setJobId(data.jobId);
        pollProgress(data.jobId);
      } else {
        alert(data.message || 'Import failed to start');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
      setStep(2);
    } finally {
      setIsUploading(false);
    }
  };

  const pollProgress = (id: string) => {
    const token = localStorage.getItem('token');
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:2056/api/import/status/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setProgress({
            total: data.data.totalRows,
            processed: data.data.processedRows,
            errors: data.data.errors,
            status: data.data.status
          });
          
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2000);
  };

  return (
    <div className="import-section-container">
      <motion.div 
        className="import-section-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-header">
          <h2>Bulk Import Students</h2>
          <button className="close-section-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /> Close
          </button>
        </div>
        
        <div className="import-steps-container">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Upload</div>
          <div className="step-divider" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Map Columns</div>
          <div className="step-divider" />
          <div className={`step ${step === 3 ? 'active' : ''}`}>3. Finalize</div>
        </div>

        <div className="modal-body import-body">
          {step === 1 && (
            <div className="step-content step-1">
              <div className="form-group">
                <label>Target School *</label>
                <input 
                  type="text" 
                  placeholder="Search school name or ID..."
                  value={searchSchool}
                  onChange={(e) => setSearchSchool(e.target.value)}
                  className="search-input"
                />
                <div className="school-dropdown-list">
                  {filteredSchools.map(s => (
                    <div 
                      key={s._id} 
                      className={`school-dropdown-item ${selectedSchoolId === s.schoolId.toString() ? 'selected' : ''}`}
                      onClick={() => setSelectedSchoolId(s.schoolId.toString())}
                    >
                      <span>{s.name} (ID: {s.schoolId})</span>
                      {selectedSchoolId === s.schoolId.toString() && <FontAwesomeIcon icon={faCheckCircle} className="selected-icon"/>}
                    </div>
                  ))}
                  {filteredSchools.length === 0 && <p className="no-results">No schools found</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Data File (.csv, .xlsx) *</label>
                <div 
                  className={`file-drop-zone ${file ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".csv,.xlsx" 
                    style={{ display: 'none' }} 
                  />
                  {!file ? (
                    <>
                      <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                      <p>Drag and drop a file here, or click to browse</p>
                      <p className="file-hint">Supports up to 50,000+ rows</p>
                    </>
                  ) : (
                    <div className="file-info">
                      <FontAwesomeIcon icon={file.name.endsWith('csv') ? faFileCsv : faFileExcel} className="file-type-icon" />
                      <div>
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {fileError && <p className="error-text">{fileError}</p>}
              </div>

              <div className="form-actions right">
                <button 
                  className="btn-primary"
                  onClick={extractHeaders}
                  disabled={!file || !selectedSchoolId || isParsing}
                >
                  {isParsing ? 'Processing...' : 'Next: Map Columns'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content step-2">
              <p className="mapping-instruction">Match the columns from your file to the system fields. Required fields must be mapped.</p>
              
              <div className="mapping-table-container">
                <table className="mapping-table">
                  <thead>
                    <tr>
                      <th>File Column</th>
                      <th>Preview Data</th>
                      <th>System Field Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map(header => (
                      <tr key={header}>
                        <td className="file-column-name">{header}</td>
                        <td className="preview-data">
                          {previewData[0]?.[header] || ''} 
                          {previewData[1] ? <span className="preview-more">...</span> : ''}
                        </td>
                        <td>
                          <select 
                            value={mapping[header] || ''}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className={`mapping-select ${mapping[header] ? 'mapped' : ''}`}
                          >
                            <option value="">-- Ignore Column --</option>
                            {SYSTEM_FIELDS.map(sf => (
                              <option 
                                key={sf.id} 
                                value={sf.id}
                                disabled={Object.values(mapping).includes(sf.id) && mapping[header] !== sf.id}
                              >
                                {sf.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions space-between">
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary" onClick={startImport} disabled={isUploading}>
                  {isUploading ? 'Preparing Import...' : 'Start Import'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content step-3">
              <div className="progress-container">
                {progress.status === 'processing' ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="progress-spinner" />
                    <h3>Importing Students...</h3>
                  </>
                ) : progress.status === 'completed' ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="progress-success" />
                    <h3>Import Complete</h3>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTimes} className="progress-error-icon" />
                    <h3>Import Failed</h3>
                  </>
                )}
                
                <div className="progress-stats">
                  <div className="stat-card">
                    <span className="stat-label">Processed</span>
                    <span className="stat-value">{progress.processed} / {progress.total}</span>
                  </div>
                  <div className="stat-card error-card">
                    <span className="stat-label">Errors</span>
                    <span className="stat-value">{progress.errors}</span>
                  </div>
                </div>
                
                {progress.total > 0 && (
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, Math.round((progress.processed / progress.total) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
              
              {(progress.status === 'completed' || progress.status === 'failed') && (
                <div className="form-actions center">
                  <button className="btn-primary" onClick={onClose}>Finish</button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
