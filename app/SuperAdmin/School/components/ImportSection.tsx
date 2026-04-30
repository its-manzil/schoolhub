'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUpload, 
  faFileCsv, 
  faFileExcel, 
  faCheckCircle, 
  faSpinner,
  faUserGraduate,
  faDownload,
  faChevronRight,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import '../styles/import.css';

interface SchoolOption {
  _id: string;
  schoolId: number;
  name: string;
}

interface ImportSectionProps {
  onClose: () => void;
  schools: SchoolOption[];
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const SYSTEM_FIELDS = [
  { id: 'name', label: 'Student Name (Required)', required: true },
  { id: 'gender', label: 'Gender', required: false },
  { id: 'dateOfBirth', label: 'Date of Birth', required: false },
  { id: 'phone', label: 'Phone', required: false },
  { id: 'email', label: 'Email', required: false },
  { id: 'address', label: 'Address', required: false },
  { id: 'fatherName', label: 'Father Name', required: false },
  { id: 'motherName', label: 'Mother Name', required: false },
  { id: 'fatherPhone', label: 'Father Phone', required: false },
  { id: 'motherPhone', label: 'Mother Phone', required: false },
  { id: 'className', label: 'Class Name', required: false },
  { id: 'section', label: 'Section', required: false },
  { id: 'rollNumber', label: 'Roll Number', required: false },
  { id: 'bloodGroup', label: 'Blood Group', required: false },
  { id: 'emergencyContact', label: 'Emergency Contact', required: false },
  { id: 'admissionDate', label: 'Admission Date', required: false },
  { id: 'profilePicture', label: 'Profile Picture (URL or Base64)', required: false }
];

export default function ImportSection({ onClose, schools, onShowToast }: ImportSectionProps) {
  const [step, setStep] = useState(1);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [searchSchool, setSearchSchool] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, string | number | null>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [, setJobId] = useState('');
  const [progress, setProgress] = useState({ 
    total: 0, 
    processed: 0, 
    errors: 0, 
    status: 'processing' as 'processing' | 'completed' | 'failed'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchSchool.toLowerCase()) || 
    s.schoolId.toString().includes(searchSchool)
  );

  const handleFileChange = (selectedFile: File) => {
    setFileError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setFileError('Please upload a .csv or .xlsx file');
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileChange(droppedFile);
  };

  const autoMapFields = useCallback((fileHeaders: string[]) => {
    const initialMapping: Record<string, string> = {};
    const customKeywords: Record<string, string[]> = {
      'className': ['class', 'grade', 'class name'],
      'rollNumber': ['roll', 'roll no', 'roll number'],
      'dateOfBirth': ['dob', 'birth', 'date of birth'],
      'fatherName': ['father', 'father name', 'dad'],
      'motherName': ['mother', 'mother name', 'mom'],
      'fatherPhone': ['father phone', 'father contact'],
      'motherPhone': ['mother phone', 'mother contact'],
      'emergencyContact': ['emergency', 'contact'],
      'admissionDate': ['admission', 'joined'],
      'profilePicture': ['photo', 'picture', 'image', 'profile picture']
    };

    fileHeaders.forEach(header => {
      const hLower = header.toLowerCase();
      let matchedId = '';
      
      for (const [id, keywords] of Object.entries(customKeywords)) {
        if (keywords.some(k => hLower.includes(k) || hLower === k)) {
          matchedId = id;
          break;
        }
      }

      if (!matchedId) {
        const match = SYSTEM_FIELDS.find(f => 
          hLower.includes(f.id.replace(/([A-Z])/g, ' $1').toLowerCase().trim()) || 
          hLower === f.id.toLowerCase()
        );
        if (match) matchedId = match.id;
      }

      initialMapping[header] = matchedId;
    });
    
    setMapping(initialMapping);
  }, []);

  const extractHeaders = async () => {
    if (!file) return;
    setIsParsing(true);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          preview: 20,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<Record<string, string>>) => {
            if (results.meta.fields) {
              setHeaders(results.meta.fields);
              setPreviewData(results.data as Record<string, string>[]);
              autoMapFields(results.meta.fields);
              setStep(2);
            } else {
              setFileError('Failed to extract headers from CSV.');
            }
            setIsParsing(false);
          },
          error: (error: Error) => {
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
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | null)[][];
          
          if (json && json.length > 0) {
            const extractedHeaders = json[0] as string[];
            setHeaders(extractedHeaders.filter(Boolean));
            
            const preview = json.slice(1, 21).map(row => {
               const rowData: Record<string, string | number | null> = {};
               extractedHeaders.forEach((header, index) => {
                 if (header) {
                   rowData[header] = row[index];
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
      console.error('File parsing error:', err);
      setFileError('Error processing file.');
      setIsParsing(false);
    }
  };

  const handleMappingChange = (header: string, systemField: string) => {
    setMapping(prev => ({ ...prev, [header]: systemField }));
  };

  const startImport = async () => {
    if (!selectedSchoolId || !file) return;
    
    const mappedValues = Object.values(mapping);
    if (!mappedValues.includes('name')) {
      onShowToast('The "Student Name" field must be mapped to proceed.', 'error');
      return;
    }

    setIsUploading(true);
    setStep(3);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('schoolId', selectedSchoolId);
    
    console.log("Selected schoolId:", selectedSchoolId);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:2056/api/import/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setJobId(data.jobId);
        pollProgress(data.jobId);
      } else {
        onShowToast(data.message || 'Import failed to start', 'error');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error connecting to server.', 'error');
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
            if (data.data.status === 'completed') {
              onShowToast(`Successfully imported ${data.data.processedRows} students!`, 'success');
            }
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2000);
  };

  const downloadTemplate = () => {
    const headers = SYSTEM_FIELDS.map(f => f.label.replace(' (Required)', ''));
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    onShowToast('Template downloaded successfully!', 'success');
  };

  return (
    <motion.div 
      className="import-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="import-header">
        <h2 className="import-title">
          <div className="import-title-icon">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
          Bulk Import Students
        </h2>
        <button className="close-import-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} /> Close
        </button>
      </div>

      <div className="import-steps">
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">{step > 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : '1'}</div>
          <span>Upload</span>
        </div>
        <div className={`step-divider ${step > 1 ? 'completed' : ''}`} />
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">{step > 2 ? <FontAwesomeIcon icon={faCheckCircle} /> : '2'}</div>
          <span>Map Columns</span>
        </div>
        <div className={`step-divider ${step > 2 ? 'completed' : ''}`} />
        <div className={`step-item ${step === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Import</span>
        </div>
      </div>

      <div className="import-body">
        {step === 1 && (
          <div className="step-content">
            <div className="school-select-section">
              <label className="form-label">Target School *</label>
              <input 
                type="text" 
                placeholder="Search school name or ID..."
                value={searchSchool}
                onChange={(e) => setSearchSchool(e.target.value)}
                className="school-search-input"
              />
              <div className="school-dropdown">
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
              <label className="form-label">Data File (.csv, .xlsx) *</label>
              <div 
                className={`file-drop-zone ${file ? 'has-file' : ''} ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  accept=".csv,.xlsx" 
                  style={{ display: 'none' }} 
                />
                {!file ? (
                  <>
                    <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                    <p className="drop-text">Drag and drop a file here, or click to browse</p>
                    <p className="drop-hint">Supports CSV and Excel files</p>
                  </>
                ) : (
                  <div className="file-info">
                    <FontAwesomeIcon icon={file.name.endsWith('csv') ? faFileCsv : faFileExcel} className="file-type-icon" />
                    <div className="file-details">
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>
              {fileError && (
                <p className="file-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {fileError}
                </p>
              )}
            </div>

            <div className="template-download">
              <span className="template-download-text">Need a template?</span>
              <button className="template-download-btn" onClick={downloadTemplate}>
                <FontAwesomeIcon icon={faDownload} />
                Download CSV Template
              </button>
            </div>

            <div className="import-actions">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button 
                className="btn btn-primary"
                onClick={extractHeaders}
                disabled={!file || !selectedSchoolId || isParsing}
              >
                {isParsing ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> Processing...</>
                ) : (
                  <>Next <FontAwesomeIcon icon={faChevronRight} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <p className="mapping-instruction">
              Match the columns from your file to the system fields. At minimum, Student Name must be mapped.
            </p>
            
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
                        {previewData[1] && <span className="preview-more">...</span>}
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

            <div className="import-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary" 
                onClick={startImport} 
                disabled={isUploading || !Object.values(mapping).includes('name')}
              >
                {isUploading ? 'Preparing...' : 'Start Import'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <div className="progress-section">
              {progress.status === 'processing' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="progress-spinner" />
                  <h3 className="progress-title">Importing Students...</h3>
                  <p className="progress-subtitle">Please don&apos;t close this window</p>
                </>
              ) : progress.status === 'completed' ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="progress-status-icon success" />
                  <h3 className="progress-title">Import Complete!</h3>
                  <p className="progress-subtitle">
                    Successfully processed {progress.processed} of {progress.total} students
                  </p>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="progress-status-icon error" />
                  <h3 className="progress-title">Import Failed</h3>
                  <p className="progress-subtitle">Please check the error details below</p>
                </>
              )}
              
              <div className="progress-stats-grid">
                <div className="progress-stat">
                  <span className="progress-stat-label">Total</span>
                  <span className="progress-stat-value">{progress.total}</span>
                </div>
                <div className="progress-stat">
                  <span className="progress-stat-label">Processed</span>
                  <span className={`progress-stat-value ${progress.status === 'completed' ? 'success' : ''}`}>
                    {progress.processed}
                  </span>
                </div>
                <div className="progress-stat">
                  <span className="progress-stat-label">Errors</span>
                  <span className={`progress-stat-value ${progress.errors > 0 ? 'error' : ''}`}>
                    {progress.errors}
                  </span>
                </div>
              </div>
              
              {progress.total > 0 && (
                <div className="progress-bar-container">
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${progress.status}`}
                      style={{ width: `${Math.min(100, Math.round((progress.processed / progress.total) * 100))}%` }}
                    />
                  </div>
                  <p className="progress-percentage">
                    {Math.round((progress.processed / progress.total) * 100)}%
                  </p>
                </div>
              )}

              {(progress.status === 'completed' || progress.status === 'failed') && (
                <div className="import-actions center">
                  <button className="btn btn-primary" onClick={onClose}>
                    {progress.status === 'completed' ? 'Done' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
