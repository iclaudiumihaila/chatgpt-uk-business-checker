/**
 * Search Carousel Widget
 * Displays UK company search results in a horizontal scrollable carousel
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { useOpenAiField, useCallTool, useTheme } from './hooks/useOpenAiGlobal';

interface Company {
  name: string;
  number: string;
  status: string;
  type: string;
  address: string;
  incorporated: string;
  ageMonths: number;
}

interface SearchResults {
  query: string;
  results_count: number;
  companies: Company[];
}

function SearchCarousel() {
  const searchResults = useOpenAiField<SearchResults>('toolOutput', undefined, {
    query: '',
    results_count: 0,
    companies: []
  });

  const callTool = useCallTool();
  const theme = useTheme();

  const { companies } = searchResults;

  if (!companies || companies.length === 0) {
    return (
      <div className="empty-state">
        <p>No companies found matching your search.</p>
      </div>
    );
  }

  const handleVerify = async (companyNumber: string) => {
    await callTool('verify_uk_business', { company_number: companyNumber });
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'status-active';
    if (s === 'dissolved') return 'status-dissolved';
    return 'status-liquidation';
  };

  const formatAge = (ageMonths: number) => {
    if (ageMonths < 12) return `${ageMonths} months`;
    const years = Math.floor(ageMonths / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
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
          padding: 16px;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        }

        .carousel-container {
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: ${theme === 'dark' ? '#404040 #1a1a1a' : '#ccc #f5f5f5'};
        }

        .carousel-container::-webkit-scrollbar {
          height: 8px;
        }

        .carousel-container::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
        }

        .carousel-container::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#404040' : '#ccc'};
          border-radius: 4px;
        }

        .carousel {
          display: flex;
          gap: 16px;
          padding: 8px 0 16px 0;
        }

        .company-card {
          flex: 0 0 280px;
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .company-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'};
          border-color: ${theme === 'dark' ? '#555' : '#ccc'};
        }

        .company-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .company-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .company-info {
          flex: 1;
          min-width: 0;
        }

        .company-name {
          font-size: 15px;
          font-weight: 600;
          color: ${theme === 'dark' ? '#fff' : '#111'};
          line-height: 1.3;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .company-number {
          font-size: 12px;
          color: ${theme === 'dark' ? '#999' : '#666'};
          font-family: 'SF Mono', 'Monaco', monospace;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-active {
          background: ${theme === 'dark' ? '#1b5e20' : '#e8f5e9'};
          color: ${theme === 'dark' ? '#a5d6a7' : '#2e7d32'};
        }

        .status-dissolved {
          background: ${theme === 'dark' ? '#b71c1c' : '#ffebee'};
          color: ${theme === 'dark' ? '#ef9a9a' : '#c62828'};
        }

        .status-liquidation {
          background: ${theme === 'dark' ? '#e65100' : '#fff3e0'};
          color: ${theme === 'dark' ? '#ffcc80' : '#ef6c00'};
        }

        .company-meta {
          font-size: 13px;
          color: ${theme === 'dark' ? '#aaa' : '#666'};
          line-height: 1.6;
          margin-bottom: 12px;
          flex: 1;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .meta-icon {
          opacity: 0.7;
        }

        .verify-button {
          width: 100%;
          padding: 10px 16px;
          background: #111bf5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .verify-button:hover {
          background: #0a0fd1;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(17, 27, 245, 0.3);
        }

        .verify-button:active {
          transform: translateY(0);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: ${theme === 'dark' ? '#999' : '#666'};
        }
      `}</style>

      <div className="carousel-container">
        <div className="carousel">
          {companies.map((company) => (
            <div key={company.number} className="company-card">
              <div className="company-header">
                <div className="company-icon">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="company-info">
                  <div className="company-name">{company.name}</div>
                  <div className="company-number">#{company.number}</div>
                </div>
              </div>

              <span className={`status-badge ${getStatusClass(company.status)}`}>
                {company.status}
              </span>

              <div className="company-meta">
                <div className="meta-row">
                  <span className="meta-icon">📅</span>
                  <span>{formatAge(company.ageMonths)} old</span>
                </div>
                <div className="meta-row">
                  <span className="meta-icon">📍</span>
                  <span>
                    {company.address.length > 35
                      ? `${company.address.substring(0, 35)}...`
                      : company.address}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-icon">🏢</span>
                  <span>{company.type.toUpperCase()}</span>
                </div>
              </div>

              <button
                className="verify-button"
                onClick={() => handleVerify(company.number)}
              >
                <span>Verify Company</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Mount the component
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<SearchCarousel />);
}
