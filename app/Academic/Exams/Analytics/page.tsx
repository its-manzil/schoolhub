'use client';

import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Trophy, 
  TrendingDown, 
  BarChart3,
  Medal,
  Target
} from 'lucide-react';
import './analytics.css';

export default function AnalyticsPage() {
  // Mock data for UI representation
  const classwiseStats = [
    { class: 'Class 10', passed: 45, failed: 5, topper: 'Siddharth Sharma', score: '98.2%' },
    { class: 'Class 9', passed: 48, failed: 2, topper: 'Anjali Gupta', score: '97.5%' },
    { class: 'Class 8', passed: 42, failed: 8, topper: 'Rohan Verma', score: '96.8%' },
    { class: 'Class 7', passed: 50, failed: 0, topper: 'Priya Rai', score: '99.1%' },
  ];

  const subjectRanking = [
    { subject: 'Mathematics', failCount: 15, rank: 1 },
    { subject: 'Science', failCount: 12, rank: 2 },
    { subject: 'Social Studies', failCount: 8, rank: 3 },
    { subject: 'English', failCount: 5, rank: 4 },
  ];

  return (
    <div className="analytics-container">
      {/* School Topper Highlights */}
      <div className="school-topper-card">
        <div className="topper-avatar-large">
          <Medal size={64} />
        </div>
        <div className="school-topper-info">
          <p className="subtitle">Overall School Topper</p>
          <h2>Priya Rai</h2>
          <p>Class 7 • Section A</p>
          <div className="school-topper-stats">
            <div className="topper-stat-item">
              <span className="label">GPA</span>
              <span className="val">4.0</span>
            </div>
            <div className="topper-stat-item">
              <span className="label">Percentage</span>
              <span className="val">99.1%</span>
            </div>
            <div className="topper-stat-item">
              <span className="label">Rank</span>
              <span className="val">#1</span>
            </div>
          </div>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <span className="value">450</span>
            <p className="trend up">Total Appeared</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Passed Students</h3>
            <span className="value">415</span>
            <p className="trend up">92.2% Pass Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <h3>Failed Students</h3>
            <span className="value">35</span>
            <p className="trend down">7.8% Fail Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>Avg. Score</h3>
            <span className="value">78.5%</span>
            <p className="trend up">+2.4% from last term</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        {/* Classwise Performance */}
        <div className="academic-card">
          <div className="card-header">
            <h2>Classwise Performance</h2>
            <BarChart3 size={20} color="#6b7280" />
          </div>
          <div className="academic-table-wrapper">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Pass %</th>
                </tr>
              </thead>
              <tbody>
                {classwiseStats.map((stat, idx) => (
                  <tr key={idx}>
                    <td>{stat.class}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{stat.passed}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{stat.failed}</td>
                    <td>{((stat.passed / (stat.passed + stat.failed)) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Failure Ranking */}
        <div className="academic-card">
          <div className="card-header">
            <h2>Subject Failure Ranking</h2>
            <TrendingDown size={20} color="#ef4444" />
          </div>
          <div className="ranking-list">
            {subjectRanking.map((item) => (
              <div key={item.subject} className="ranking-item">
                <div className="subject-info">
                  <span className="rank-badge">{item.rank}</span>
                  <span className="subject-name">{item.subject}</span>
                </div>
                <span className="fail-count">{item.failCount} Failed</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="toppers-section">
        {/* Class Toppers List */}
        <div className="academic-card">
          <div className="card-header">
            <h2>Class Toppers</h2>
            <Trophy size={20} color="#f59e0b" />
          </div>
          <div className="topper-list">
            {classwiseStats.map((stat, idx) => (
              <div key={idx} className="topper-item">
                <div className="topper-avatar">
                  {stat.topper.charAt(0)}
                </div>
                <div className="topper-details">
                  <span className="name">{stat.topper}</span>
                  <span className="class-info">{stat.class}</span>
                </div>
                <div className="topper-score">
                  <span className="score-value">{stat.score}</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Summary Note */}
        <div className="academic-card">
          <div className="card-header">
            <h2>Exam Overview</h2>
            <BarChart3 size={20} color="#6b7280" />
          </div>
          <div className="overview-content" style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.6' }}>
            <p>The <strong>First Terminal Examination 2081</strong> has been completed across all classes. The overall performance shows a significant improvement in Science and Languages compared to the previous year.</p>
            <br />
            <p>Mathematics remains a challenging subject with the highest failure count (15 students). Remedial classes are recommended for students scoring below 40%.</p>
            <br />
            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
              <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>Action Items:</h4>
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li>Schedule parent-teacher meeting for Class 8</li>
                <li>Verify marks entry for Class 5 Section B</li>
                <li>Prepare certificates for class toppers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
