/**
 * Trust Scoring Algorithm for UK Business Verification
 * Analyzes company data and assigns a trust score (0-100) with risk assessment
 */

import type { CompanyProfile, Officer } from './companiesHouseClient.js';

export type RiskLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TrustAssessment {
  trustScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
  redFlags: string[];
  warnings: string[];
  positiveIndicators: string[];
  ageInMonths: number;
}

export interface ComplianceInfo {
  accountsOverdue: boolean;
  confirmationStatementOverdue: boolean;
  lastAccountsDate?: string;
}

export interface OfficerSummary {
  totalActive: number;
  directors: Array<{
    name: string;
    role: string;
    appointedOn: string;
  }>;
}

/**
 * Calculate comprehensive trust assessment for a UK company
 */
export function calculateTrustScore(
  company: CompanyProfile,
  officers: Officer[]
): TrustAssessment {
  const redFlags: string[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];

  // Starting score at neutral
  let score = 50;

  // === 1. COMPANY STATUS CHECK ===
  const status = company.company_status?.toLowerCase();

  if (status === 'dissolved') {
    redFlags.push('Company is DISSOLVED - legally no longer exists');
    score -= 20;
  } else if (status === 'liquidation') {
    redFlags.push('Company is in LIQUIDATION - going out of business');
    score -= 20;
  } else if (status === 'administration') {
    redFlags.push('Company is in ADMINISTRATION - financial difficulties');
    score -= 20;
  } else if (status === 'active') {
    positives.push('Company is currently active');
    score += 15;
  }

  // === 2. COMPANY AGE CHECK ===
  const creationDate = new Date(company.date_of_creation);
  const now = new Date();
  const ageInMonths = Math.floor(
    (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (ageInMonths < 6) {
    warnings.push(
      `Very new company (${ageInMonths} months old) - limited track record`
    );
    score -= 10;
  } else if (ageInMonths < 12) {
    warnings.push(
      `Recently incorporated (${ageInMonths} months old) - be cautious with large commitments`
    );
    score -= 10;
  } else if (ageInMonths > 36) {
    const years = Math.floor(ageInMonths / 12);
    positives.push(`Established company (${years} years in business)`);
    score += 15;
  }

  // === 3. ACCOUNTS FILING CHECK ===
  if (company.accounts?.overdue) {
    redFlags.push('Accounts are OVERDUE - potential financial problems or non-compliance');
    score -= 20;
  } else if (company.accounts?.last_accounts?.made_up_to) {
    positives.push('Accounts filed on time - shows compliance');
    score += 15;
  }

  // === 4. CONFIRMATION STATEMENT CHECK ===
  if (company.confirmation_statement?.overdue) {
    warnings.push('Confirmation statement overdue - minor compliance issue');
    score -= 10;
  }

  // === 5. OFFICER COUNT CHECK ===
  const activeOfficers = officers.filter(o => !o.resigned_on);

  if (activeOfficers.length === 0) {
    redFlags.push('No active officers listed - highly suspicious');
    score -= 20;
  } else if (activeOfficers.length === 1) {
    warnings.push('Single director company - higher risk if they leave');
    score -= 10;
  } else if (activeOfficers.length >= 2) {
    positives.push(`Multiple officers (${activeOfficers.length}) - better governance`);
    score += 15;
  }

  // === 6. COMPANY TYPE CHECK ===
  const type = company.type?.toLowerCase();

  if (type === 'ltd') {
    positives.push('Limited company (standard business structure)');
    score += 15;
  } else if (type === 'plc') {
    positives.push('Public Limited Company (higher regulatory oversight)');
    score += 15;
  }

  // === 7. CLAMP SCORE TO 0-100 ===
  score = Math.max(0, Math.min(100, Math.round(score)));

  // === 8. DETERMINE RISK LEVEL & RECOMMENDATION ===
  let riskLevel: RiskLevel;
  let recommendation: string;

  if (score < 30 || redFlags.length > 0) {
    riskLevel = 'VERY_HIGH';
    recommendation = '🚫 AVOID - Serious concerns identified. Do not proceed without thorough investigation.';
  } else if (score < 50 || warnings.length > 2) {
    riskLevel = 'HIGH';
    recommendation = '⚠️ HIGH RISK - Exercise extreme caution. Request upfront guarantees, avoid large payments.';
  } else if (score < 70 || warnings.length > 0) {
    riskLevel = 'MEDIUM';
    recommendation = '⚡ MODERATE RISK - Acceptable with standard precautions. Verify credentials and start with small transactions.';
  } else {
    riskLevel = 'LOW';
    recommendation = '✅ LOW RISK - Company appears legitimate and compliant. Standard business practices apply.';
  }

  return {
    trustScore: score,
    riskLevel,
    recommendation,
    redFlags,
    warnings,
    positiveIndicators: positives,
    ageInMonths
  };
}

/**
 * Extract compliance information from company profile
 */
export function getComplianceInfo(company: CompanyProfile): ComplianceInfo {
  return {
    accountsOverdue: company.accounts?.overdue || false,
    confirmationStatementOverdue: company.confirmation_statement?.overdue || false,
    lastAccountsDate: company.accounts?.last_accounts?.made_up_to
  };
}

/**
 * Get officer summary for display
 */
export function getOfficerSummary(officers: Officer[]): OfficerSummary {
  const activeOfficers = officers.filter(o => !o.resigned_on);

  return {
    totalActive: activeOfficers.length,
    directors: activeOfficers.slice(0, 3).map(o => ({
      name: o.name,
      role: o.officer_role,
      appointedOn: o.appointed_on
    }))
  };
}
