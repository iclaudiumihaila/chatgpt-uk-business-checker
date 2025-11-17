/**
 * Verify UK Business Tool
 * Performs comprehensive due diligence on a UK company
 */

import { z } from 'zod';
import type { CompaniesHouseClient } from '../utils/companiesHouseClient.js';
import {
  calculateTrustScore,
  getComplianceInfo,
  getOfficerSummary
} from '../utils/trustScoring.js';

export const VerifyInputSchema = z.object({
  company_number: z.string().describe(
    "UK Companies House registration number (8 digits, e.g., '12345678')"
  )
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;

export interface VerifyToolResponse {
  content: Array<{ type: string; text: string }>;
  structuredContent: {
    company: {
      name: string;
      number: string;
      status: string;
      type: string;
      incorporated: string;
      ageMonths: number;
      address: string;
    };
    trustAssessment: {
      trustScore: number;
      riskLevel: string;
      recommendation: string;
      redFlags: string[];
      warnings: string[];
      positiveIndicators: string[];
    };
    compliance: {
      accountsOverdue: boolean;
      confirmationStatementOverdue: boolean;
      lastAccountsDate?: string;
    };
    officers: {
      totalActive: number;
      directors: Array<{
        name: string;
        role: string;
        appointedOn: string;
      }>;
    };
  };
  _meta: {
    'openai/outputTemplate': string;
    'openai/widgetAccessible': boolean;
    fullCompanyData?: any;
    allOfficers?: any[];
  };
}

export async function handleVerify(
  input: VerifyInput,
  client: CompaniesHouseClient
): Promise<VerifyToolResponse> {
  try {
    // Fetch company profile and officers in parallel
    const [company, officersData] = await Promise.all([
      client.getCompanyProfile(input.company_number),
      client.getCompanyOfficers(input.company_number)
    ]);

    // Calculate trust assessment
    const trustAssessment = calculateTrustScore(company, officersData.items);
    const compliance = getComplianceInfo(company);
    const officers = getOfficerSummary(officersData.items);

    // Format address
    const addr = company.registered_office_address;
    const addressParts = [
      addr.address_line_1,
      addr.address_line_2,
      addr.locality,
      addr.postal_code
    ].filter(Boolean);
    const address = addressParts.join(', ');

    // Build response
    return {
      content: [{
        type: 'text',
        text: `Verification complete for ${company.company_name}. Trust Score: ${trustAssessment.trustScore}/100 (${trustAssessment.riskLevel} RISK)`
      }],
      structuredContent: {
        company: {
          name: company.company_name,
          number: company.company_number,
          status: company.company_status,
          type: company.type,
          incorporated: company.date_of_creation,
          ageMonths: trustAssessment.ageInMonths,
          address
        },
        trustAssessment: {
          trustScore: trustAssessment.trustScore,
          riskLevel: trustAssessment.riskLevel,
          recommendation: trustAssessment.recommendation,
          redFlags: trustAssessment.redFlags,
          warnings: trustAssessment.warnings,
          positiveIndicators: trustAssessment.positiveIndicators
        },
        compliance,
        officers
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/company-card.html',
        'openai/widgetAccessible': true,
        fullCompanyData: company,
        allOfficers: officersData.items
      }
    };
  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      content: [{
        type: 'text',
        text: `Failed to verify company: ${errorMessage}`
      }],
      structuredContent: {
        company: {
          name: 'Unknown',
          number: input.company_number,
          status: 'error',
          type: 'unknown',
          incorporated: '',
          ageMonths: 0,
          address: ''
        },
        trustAssessment: {
          trustScore: 0,
          riskLevel: 'VERY_HIGH',
          recommendation: `Unable to verify company: ${errorMessage}`,
          redFlags: [errorMessage],
          warnings: [],
          positiveIndicators: []
        },
        compliance: {
          accountsOverdue: false,
          confirmationStatementOverdue: false
        },
        officers: {
          totalActive: 0,
          directors: []
        }
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/company-card.html',
        'openai/widgetAccessible': false
      }
    };
  }
}
