'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Trophy, 
  TrendingDown, 
  BarChart3,
  Medal,
  Target,
  Loader2
} from 'lucide-react';
import './analytics.css';
import { 
  getExams, 
  getAcademicYears,
  getExamAnalytics,
  Exam 
} from '../lib/examService';
import { toBS, formatBSDateWithMonth } from '@/app/utils/dateConverter';

interface AnalyticsData {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  averageScore: number;
  subjectWiseStats: Record<string, { passed: number; failed: number }>;
  classToppers: { studentId: string; studentName: string; percentage: number }[];
}

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  const [filters, setFilters] = useState({
    year: '',
    exam: '',
    class: ''
  });

  // Load exams and years on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [examsData, yearsData] = await Promise.all([
        getExams(),
        getAcademicYears()
      ]);
      setExams(examsData);
      setYears(yearsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Load analytics when filters change
  useEffect(() => {
    if (filters.year && filters.exam && filters.class) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Find selected exam
      const exam = exams.find(e => 
        e.academicYear === filters.year &&
        e.term === filters.exam &&
        e.className === filters.class
      );
      setSelectedExam(exam || null);

      if (exam?._id) {
        const analyticsData = await getExamAnalytics(exam._id);
        setAnalytics(analyticsData);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique exam types for the selected year
  const examTypes = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year)
      .map(e => e.term)
  )];

  // Get unique classes for the selected year and exam
  const availableClasses = [...new Set(
    exams
      .filter(e => e.academicYear === filters.year && e.term === filters.exam)
      .map(e => e.className)
  )];

  // Calculate subject failure ranking
  const subjectRanking = analytics?.subjectWiseStats 
    ? Object.entries(analytics.subjectWiseStats)
        .map(([subject, stats]) => ({
          subject,
          failCount: stats.failed,
          passCount: stats.passed,
        }))
        .sort((a, b) => b.failCount - a.failCount)
        .map((item, idx) => ({ ...item, rank: idx + 1 }))
        .filter(item => item.failCount > 0)
    : [];

  // Get school topper
  const schoolTopper = analytics?.classToppers?.[0];

  if (loading) {
    return (
      <div className="analytics-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Filters */}
      <section className="dropdown-roadmap" style={{ marginBottom: '1.5rem' }}>
        <div className="dropdown-group">
          <label>Academic Year</label>
          <select 
            value={filters.year}
            onChange={(e) => setFilters({ year: e.target.value, exam: '', class: '' })}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year} BS</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Exam Type</label>
          <select 
            value={filters.exam}
            onChange={(e) => setFilters({ ...filters, exam: e.target.value, class: '' })}
            disabled={!filters.year}
          >
            <option value="">Select Exam</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="dropdown-group">
          <label>Class</label>
          <select 
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            disabled={!filters.exam}
          >
            <option value="">Select Class</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
      </section>

      {!filters.class ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          Select year, exam, and class to view analytics
        </div>
      ) : !analytics || analytics.totalStudents === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No data available. Ensure marks are entered for the selected exam.
        </div>
      ) : (
        <>
          {/* School Topper Highlights */}
          {schoolTopper && (
            <div className="school-topper-card">
              <div className="topper-avatar-large">
                <Medal size={64} />
              </div>
              <div className="school-topper-info">
                <p className="subtitle">Class Topper</p>
                <h2>{schoolTopper.studentName}</h2>
                <p>Class {filters.class}</p>
                <div className="school-topper-stats">
                  <div className="topper-stat-item">
                    <span className="label">GPA</span>
                    <span className="val">{(schoolTopper.percentage / 25).toFixed(2)}</span>
                  </div>
                  <div className="topper-stat-item">
                    <span className="label">Percentage</span>
                    <span className="val">{schoolTopper.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="topper-stat-item">
                    <span className="label">Rank</span>
                    <span className="val">#1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High Level Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Students</h3>
                <span className="value">{analytics.totalStudents}</span>
                <p className="trend up">Total Appeared</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>Passed Students</h3>
                <span className="value">{analytics.passedStudents}</span>
                <p className="trend up">{analytics.passRate}% Pass Rate</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                <UserX size={24} />
              </div>
              <div className="stat-info">
                <h3>Failed Students</h3>
                <span className="value">{analytics.failedStudents}</span>
                <p className="trend down">{(100 - analytics.passRate).toFixed(1)}% Fail Rate</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
                <Target size={24} />
              </div>
              <div className="stat-info">
                <h3>Avg. Score</h3>
                <span className="value">{analytics.averageScore}%</span>
                <p className="trend up">Class Average</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            {/* Class Performance - Single Class View */}
            <div className="academic-card">
              <div className="card-header">
                <h2>Class Performance Summary</h2>
                <BarChart3 size={20} color="#6b7280" />
              </div>
              <div className="academic-table-wrapper">
                <table className="academic-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Class</td>
                      <td style={{ fontWeight: 600 }}>Class {filters.class}</td>
                    </tr>
                    <tr>
                      <td>Total Students</td>
                      <td style={{ color: '#2563eb', fontWeight: 600 }}>{analytics.totalStudents}</td>
                    </tr>
                    <tr>
                      <td>Passed</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{analytics.passedStudents}</td>
                    </tr>
                    <tr>
                      <td>Failed</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>{analytics.failedStudents}</td>
                    </tr>
                    <tr>
                      <td>Pass Rate</td>
                      <td style={{ fontWeight: 600 }}>{analytics.passRate}%</td>
                    </tr>
                    <tr>
                      <td>Average Score</td>
                      <td style={{ fontWeight: 600 }}>{analytics.averageScore}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Failure Ranking */}
            <div className="academic-card">
              <div className="card-header">
                <h2>Subject Performance</h2>
                <TrendingDown size={20} color="#ef4444" />
              </div>
              {subjectRanking.length > 0 ? (
                <div className="ranking-list">
                  {subjectRanking.map((item) => (
                    <div key={item.subject} className="ranking-item">
                      <div className="subject-info">
                        <span className="rank-badge">{item.rank}</span>
                        <span className="subject-name">{item.subject}</span>
                      </div>
                      <span className="fail-count" style={{ 
                        color: item.failCount > item.passCount ? '#ef4444' : '#6b7280'
                      }}>
                        {item.failCount} Failed / {item.passCount} Passed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  All students passed all subjects!
                </div>
              )}
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
                {analytics.classToppers.map((topper, idx) => (
                  <div key={topper.studentId} className="topper-item">
                    <div className="topper-avatar">
                      {topper.studentName.charAt(0)}
                    </div>
                    <div className="topper-details">
                      <span className="name">{topper.studentName}</span>
                      <span className="class-info">Rank #{idx + 1}</span>
                    </div>
                    <div className="topper-score">
                      <span className="score-value">{topper.percentage.toFixed(1)}%</span>
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
                <p>The <strong>{selectedExam?.name || filters.exam}</strong> examination was conducted from <strong>{selectedExam?.startDate ? formatBSDateWithMonth(toBS(selectedExam.startDate)) : 'TBD'}</strong> to <strong>{selectedExam?.endDate ? formatBSDateWithMonth(toBS(selectedExam.endDate)) : 'TBD'}</strong> for Class {filters.class}.</p>
                <br />
                <p>Overall performance: <strong>{analytics.passRate}% pass rate</strong> with an average score of {analytics.averageScore}%.</p>
                {subjectRanking.length > 0 && (
                  <>
                    <br />
                    <p><strong>{subjectRanking[0].subject}</strong> has the most failures ({subjectRanking[0].failCount} students). Additional attention may be needed for this subject.</p>
                  </>
                )}
                <br />
                <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>Action Items:</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {analytics.failedStudents > 0 && (
                      <li>Schedule remedial classes for {analytics.failedStudents} failed students</li>
                    )}
                    {subjectRanking.length > 0 && (
                      <li>Focus on improving performance in {subjectRanking[0].subject}</li>
                    )}
                    <li>Prepare certificates for class toppers</li>
                    <li>Share results with parents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
