import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import resumeService from '../services/resumeService';

const Resume = () => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setError('Please select a resume file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to upload resume');
      }

      const data = await response.json();
      setUploadSuccess(true);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError(error.message || 'Error uploading resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload a resume file first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // First upload the resume to ensure it's saved
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const uploadResponse = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.msg || 'Failed to upload resume');
      }

      // Now analyze the resume
      const analysis = await resumeService.analyzeResume(resumeFile);
      setAnalysisResult(analysis);
      
      if (analysis.metadata && analysis.metadata.source === 'AI') {
        alert('Resume analysis completed with AI-powered insights!');
      } else {
        alert('Resume analysis completed!');
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError(error.message || 'Error analyzing resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setUploadSuccess(false);
    setAnalysisResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="resume-page">
      <div className="container">
        <h1 className="mb-4">Resume Analysis</h1>
        
        <div className="resume-layout">
          {/* Left Side - Upload Section */}
          <div className="resume-upload-section">
            <h2>Upload Your Resume</h2>
            <div className="upload-card">
              <div className="file-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  <div className="upload-icon">📄</div>
                  <p>Click to upload your resume (PDF only)</p>
                  <p className="file-info">Maximum file size: 5MB</p>
                </label>
              </div>
              
              {resumeFile && (
                <div className="file-preview">
                  <p><strong>Selected file:</strong> {resumeFile.name}</p>
                  <p><strong>File size:</strong> {(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}
              
              <div className="upload-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || !resumeFile}
                >
                  {isUploading ? 'Uploading...' : 'Upload Resume'}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeFile}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
              
              {uploadSuccess && (
                <div className="alert alert-success mt-3">
                  Resume uploaded successfully!
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side - Analysis Section */}
          <div className="resume-analysis-section">
            <h2>Analysis Results</h2>
            <div className="analysis-card">
              {analysisResult ? (
                <div className="analysis-results">
                  {analysisResult.metadata && (
                    <div className="metadata-badge">
                      <span className={`badge ${analysisResult.metadata.source === 'AI' ? 'badge-ai' : 'badge-mock'}`}>
                        {analysisResult.metadata.source === 'AI' ? '✨ AI-Powered Analysis' : 'Sample Analysis'}
                      </span>
                      {analysisResult.metadata.career && (
                        <span className="career-badge">Career: {analysisResult.metadata.career}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="score-section">
                    <h3>Relevance Score</h3>
                    <div className="score-display">
                      <span className="score">{analysisResult.relevance_score}</span>
                      <span className="score-max">/100</span>
                    </div>
                  </div>
                  
                  <div className="improvements-section">
                    <h3>Improvement Suggestions</h3>
                    <ul>
                      {analysisResult.improvements.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="recommendations-section">
                    <h3>General Recommendations</h3>
                    <ul>
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="no-analysis">
                  <p>Upload and analyze your resume to see detailed feedback and suggestions.</p>
                  <div className="placeholder-icon">📊</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .resume-page {
          padding: 2rem;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .resume-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .resume-layout {
            grid-template-columns: 1fr;
          }
        }
        
        .resume-upload-section h2,
        .resume-analysis-section h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .upload-card,
        .analysis-card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .file-upload-area {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .file-input {
          display: none;
        }
        
        .file-upload-label {
          display: block;
          padding: 2rem;
          border: 2px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.3s;
        }
        
        .file-upload-label:hover {
          border-color: #46abff;
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .file-info {
          font-size: 0.9rem;
          color: #666;
        }
        
        .file-preview {
          background-color: #f1f8ff;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
        
        .upload-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background-color: #46abff;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #3a8fd9;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #5a6268;
        }
        
        .btn-outline-secondary {
          background-color: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }
        
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: white;
        }
        
        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1rem;
        }
        
        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .analysis-results {
          text-align: left;
        }
        
        .score-section {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .score-display {
          font-size: 3rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        .score {
          color: #46abff;
        }
        
        .score-max {
          color: #666;
          font-size: 1.5rem;
        }
        
        .improvements-section,
        .recommendations-section {
          margin-bottom: 2rem;
        }
        
        .improvements-section h3,
        .recommendations-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .improvements-section ul,
        .recommendations-section ul {
          padding-left: 1.5rem;
        }
        
        .improvements-section li,
        .recommendations-section li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        .no-analysis {
          text-align: center;
          padding: 2rem;
        }
        
        .placeholder-icon {
          font-size: 4rem;
          margin: 1rem 0;
          opacity: 0.3;
        }
        
        .metadata-badge {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .badge-ai {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .badge-mock {
          background-color: #f0f0f0;
          color: #666;
        }
        
        .career-badge {
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Resume;