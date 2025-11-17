/**
 * Company Verification Card Widget
 * Displays comprehensive due diligence results with trust score
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useOpenAiField, useTheme, useWidgetState } from './hooks/useOpenAiGlobal';

interface Company {
  name: string;
  number: string;
  status: string;
  type: string;
  incorporated: string;
  ageMonths: number;
  address: string;
}

interface TrustAssessment {
  trustScore: number;
  riskLevel: string;
  recommendation: string;
  redFlags: string[];
  warnings: string[];
  positiveIndicators: string[];
}

interface Compliance {
  accountsOverdue: boolean;
  confirmationStatementOverdue: boolean;
  lastAccountsDate?: string;
}

interface Officers {
  totalActive: number;
  directors: Array<{
    name: string;
    role: string;
    appointedOn: string;
  }>;
}

interface VerificationData {
  company: Company;
  trustAssessment: TrustAssessment;
  compliance: Compliance;
  officers: Officers;
}

function CompanyCard() {
  const data = useOpenAiField<VerificationData>('toolOutput', undefined, {} as VerificationData);
  const theme = useTheme();

  const [expandedSection, setExpandedSection] = useWidgetState<string | null>('expandedSection', null);

  if (!data.company) {
    return <div className="error">Error loading company data</div>;
  }

  const { company, trustAssessment, compliance, officers } = data;

  const getProgressColor = (score: number) => {
    if (score >= 70) return '#2e7d32';
    if (score >= 50) return '#ef6c00';
    if (score >= 30) return '#d84315';
    return '#c62828';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'LOW') return theme === 'dark' ? '#1b5e20' : '#e8f5e9';
    if (risk === 'MEDIUM') return theme === 'dark' ? '#e65100' : '#fff3e0';
    if (risk === 'HIGH') return theme === 'dark' ? '#bf360c' : '#fff3e0';
    return theme === 'dark' ? '#b71c1c' : '#ffebee';
  };

  const getRiskTextColor = (risk: string) => {
    if (risk === 'LOW') return theme === 'dark' ? '#a5d6a7' : '#2e7d32';
    if (risk === 'MEDIUM') return theme === 'dark' ? '#ffcc80' : '#ef6c00';
    if (risk === 'HIGH') return theme === 'dark' ? '#ffab91' : '#d84315';
    return theme === 'dark' ? '#ef9a9a' : '#c62828';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAge = (ageMonths: number) => {
    if (ageMonths < 12) return `${ageMonths} months`;
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          padding: 20px;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        }

        .verification-card {
          max-width: 600px;
          margin: 0 auto;
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px ${theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'};
        }

        .company-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid ${theme === 'dark' ? '#404040' : '#f0f0f0'};
        }

        .company-title {
          font-size: 22px;
          font-weight: 700;
          color: ${theme === 'dark' ? '#fff' : '#111'};
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .company-subtitle {
          font-size: 14px;
          color: ${theme === 'dark' ? '#999' : '#666'};
          font-family: 'SF Mono', 'Monaco', monospace;
        }

        .trust-score-section {
          margin: 24px 0;
          padding: 20px;
          background: ${theme === 'dark' ? '#1f1f1f' : '#f8f9fa'};
          border-radius: 12px;
        }

        .trust-score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .trust-score-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#999' : '#666'};
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .trust-score-value {
          font-size: 32px;
          font-weight: 700;
          color: ${getProgressColor(trustAssessment.trustScore)};
        }

        .risk-badge {
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: ${getRiskColor(trustAssessment.riskLevel)};
          color: ${getRiskTextColor(trustAssessment.riskLevel)};
        }

        .progress-bar {
          height: 12px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          background-color: ${getProgressColor(trustAssessment.trustScore)};
          border-radius: 6px;
          transition: width 0.5s ease;
          width: ${trustAssessment.trustScore}%;
        }

        .recommendation {
          font-size: 14px;
          line-height: 1.6;
          padding: 12px;
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
          border-radius: 8px;
          border-left: 4px solid #111bf5;
        }

        .indicators-section {
          margin: 24px 0;
        }

        .indicator-group {
          margin-bottom: 16px;
        }

        .indicator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: ${theme === 'dark' ? '#1f1f1f' : '#f8f9fa'};
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .indicator-header:hover {
          background: ${theme === 'dark' ? '#2a2a2a' : '#f0f0f0'};
        }

        .indicator-title {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .indicator-count {
          font-size: 13px;
          color: ${theme === 'dark' ? '#999' : '#666'};
          font-weight: 500;
        }

        .indicator-list {
          list-style: none;
          padding: 12px 12px 0 12px;
        }

        .indicator-list li {
          font-size: 14px;
          padding: 8px 0;
          padding-left: 24px;
          line-height: 1.5;
          color: ${theme === 'dark' ? '#bbb' : '#555'};
          border-bottom: 1px solid ${theme === 'dark' ? '#333' : '#f0f0f0'};
        }

        .indicator-list li:last-child {
          border-bottom: none;
        }

        .expand-icon {
          transition: transform 0.2s;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .company-details {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .detail-row {
          display: flex;
          padding: 8px 0;
          font-size: 14px;
        }

        .detail-label {
          font-weight: 600;
          width: 140px;
          color: ${theme === 'dark' ? '#999' : '#666'};
          flex-shrink: 0;
        }

        .detail-value {
          flex: 1;
          color: ${theme === 'dark' ? '#ddd' : '#333'};
        }

        .overdue {
          color: #c62828;
          font-weight: 600;
        }

        .error {
          padding: 20px;
          text-align: center;
          color: ${theme === 'dark' ? '#ef9a9a' : '#c62828'};
        }
      `}</style>

      <div className="verification-card">
        <div className="company-header">
          <div className="company-title">{company.name}</div>
          <div className="company-subtitle">Company #{company.number}</div>
        </div>

        <div className="trust-score-section">
          <div className="trust-score-header">
            <div>
              <div className="trust-score-label">Trust Score</div>
              <div className="trust-score-value">
                {trustAssessment.trustScore}/100
              </div>
            </div>
            <span className="risk-badge">
              {trustAssessment.riskLevel.replace('_', ' ')}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <div className="recommendation">
            {trustAssessment.recommendation}
          </div>
        </div>

        <div className="indicators-section">
          {trustAssessment.positiveIndicators.length > 0 && (
            <div className="indicator-group">
              <div
                className="indicator-header"
                onClick={() => toggleSection('positives')}
              >
                <div className="indicator-title">
                  <span>✅</span>
                  <span>Positive Indicators</span>
                </div>
                <div className="indicator-count">
                  {trustAssessment.positiveIndicators.length}
                  <span className={`expand-icon ${expandedSection === 'positives' ? 'expanded' : ''}`}> ▼</span>
                </div>
              </div>
              {expandedSection === 'positives' && (
                <ul className="indicator-list">
                  {trustAssessment.positiveIndicators.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {trustAssessment.warnings.length > 0 && (
            <div className="indicator-group">
              <div
                className="indicator-header"
                onClick={() => toggleSection('warnings')}
              >
                <div className="indicator-title">
                  <span>⚠️</span>
                  <span>Warnings</span>
                </div>
                <div className="indicator-count">
                  {trustAssessment.warnings.length}
                  <span className={`expand-icon ${expandedSection === 'warnings' ? 'expanded' : ''}`}> ▼</span>
                </div>
              </div>
              {expandedSection === 'warnings' && (
                <ul className="indicator-list">
                  {trustAssessment.warnings.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {trustAssessment.redFlags.length > 0 ? (
            <div className="indicator-group">
              <div
                className="indicator-header"
                onClick={() => toggleSection('redflags')}
              >
                <div className="indicator-title">
                  <span>🚫</span>
                  <span>Red Flags</span>
                </div>
                <div className="indicator-count">
                  {trustAssessment.redFlags.length}
                  <span className={`expand-icon ${expandedSection === 'redflags' ? 'expanded' : ''}`}> ▼</span>
                </div>
              </div>
              {expandedSection === 'redflags' && (
                <ul className="indicator-list">
                  {trustAssessment.redFlags.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div style={{ color: '#2e7d32', fontSize: '14px', padding: '12px' }}>
              ✅ No red flags detected
            </div>
          )}
        </div>

        <div className="company-details">
          <div className="detail-row">
            <div className="detail-label">Status:</div>
            <div className="detail-value">{company.status}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Incorporated:</div>
            <div className="detail-value">
              {formatDate(company.incorporated)} ({formatAge(company.ageMonths)})
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Type:</div>
            <div className="detail-value">{company.type.toUpperCase()}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Address:</div>
            <div className="detail-value">{company.address}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Active Officers:</div>
            <div className="detail-value">{officers.totalActive}</div>
          </div>
          {officers.directors.length > 0 && (
            <div className="detail-row">
              <div className="detail-label">Directors:</div>
              <div className="detail-value">
                {officers.directors.map((d, idx) => (
                  <div key={idx}>{d.name} ({d.role})</div>
                ))}
              </div>
            </div>
          )}
          {compliance.lastAccountsDate && (
            <div className="detail-row">
              <div className="detail-label">Last Accounts:</div>
              <div className="detail-value">
                {formatDate(compliance.lastAccountsDate)}
                {compliance.accountsOverdue && <span className="overdue"> (OVERDUE)</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Mount the component
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<CompanyCard />);
}
