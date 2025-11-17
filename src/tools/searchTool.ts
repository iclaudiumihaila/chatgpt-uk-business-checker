/**
 * Search UK Business Tool
 * Searches Companies House by company name
 */

import { z } from 'zod';
import type { CompaniesHouseClient } from '../utils/companiesHouseClient.js';

export const SearchInputSchema = z.object({
  query: z.string().describe('Company name or partial name to search for')
});

export type SearchInput = z.infer<typeof SearchInputSchema>;

export interface SearchToolResponse {
  content: Array<{ type: string; text: string }>;
  structuredContent: {
    query: string;
    results_count: number;
    companies: Array<{
      name: string;
      number: string;
      status: string;
      type: string;
      address: string;
      incorporated: string;
      ageMonths: number;
    }>;
  };
  _meta: {
    'openai/outputTemplate': string;
    'openai/widgetAccessible': boolean;
  };
}

export async function handleSearch(
  input: SearchInput,
  client: CompaniesHouseClient
): Promise<SearchToolResponse> {
  try {
    const results = await client.searchCompanies(input.query, 5);

    const companies = results.map(company => {
      // Calculate company age
      const creationDate = new Date(company.date_of_creation);
      const ageMonths = Math.floor(
        (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      return {
        name: company.title,
        number: company.company_number,
        status: company.company_status,
        type: company.company_type,
        address: company.address_snippet,
        incorporated: company.date_of_creation,
        ageMonths
      };
    });

    return {
      content: [{
        type: 'text',
        text: `Found ${companies.length} matching companies for "${input.query}". Select one to verify its legitimacy.`
      }],
      structuredContent: {
        query: input.query,
        results_count: companies.length,
        companies
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/search-carousel.html',
        'openai/widgetAccessible': true
      }
    };
  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      content: [{
        type: 'text',
        text: `Failed to search companies: ${errorMessage}`
      }],
      structuredContent: {
        query: input.query,
        results_count: 0,
        companies: []
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/search-carousel.html',
        'openai/widgetAccessible': false
      }
    };
  }
}
