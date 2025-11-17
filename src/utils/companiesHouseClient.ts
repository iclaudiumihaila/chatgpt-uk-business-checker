/**
 * Companies House API Client
 * Handles all interactions with the UK Companies House REST API
 */

export interface CompanySearchResult {
  title: string;
  company_number: string;
  company_status: string;
  company_type: string;
  address_snippet: string;
  date_of_creation: string;
}

export interface CompanyProfile {
  company_name: string;
  company_number: string;
  company_status: string;
  type: string;
  date_of_creation: string;
  registered_office_address: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  accounts?: {
    next_due?: string;
    overdue?: boolean;
    last_accounts?: {
      made_up_to?: string;
      type?: string;
    };
  };
  confirmation_statement?: {
    next_due?: string;
    overdue?: boolean;
  };
  sic_codes?: string[];
}

export interface Officer {
  name: string;
  officer_role: string;
  appointed_on: string;
  resigned_on?: string;
  address?: {
    locality?: string;
    postal_code?: string;
  };
}

export interface OfficersResponse {
  items: Officer[];
  total_results: number;
}

export class CompaniesHouseClient {
  private readonly baseUrl = 'https://api.company-information.service.gov.uk';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Companies House API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get authorization header for Companies House API
   * Uses HTTP Basic Auth with API key as username and blank password
   */
  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`;
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string, limit: number = 5): Promise<CompanySearchResult[]> {
    const response = await fetch(
      `${this.baseUrl}/search/companies?q=${encodeURIComponent(query)}&items_per_page=${limit}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (response.status === 401) {
      throw new Error('API authentication failed. Please check COMPANIES_HOUSE_API_KEY');
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded (600 requests per 5 minutes). Please try again shortly');
    }

    if (!response.ok) {
      throw new Error(`Companies House API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get detailed company profile
   */
  async getCompanyProfile(companyNumber: string): Promise<CompanyProfile> {
    const response = await fetch(
      `${this.baseUrl}/company/${companyNumber}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (response.status === 404) {
      throw new Error(`Company number ${companyNumber} not found`);
    }

    if (response.status === 401) {
      throw new Error('API authentication failed. Please check COMPANIES_HOUSE_API_KEY');
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again shortly');
    }

    if (!response.ok) {
      throw new Error(`Companies House API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get company officers
   */
  async getCompanyOfficers(companyNumber: string): Promise<OfficersResponse> {
    const response = await fetch(
      `${this.baseUrl}/company/${companyNumber}/officers`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (response.status === 404) {
      // Some companies may not have officer data
      return { items: [], total_results: 0 };
    }

    if (response.status === 401) {
      throw new Error('API authentication failed. Please check COMPANIES_HOUSE_API_KEY');
    }

    if (!response.ok) {
      throw new Error(`Companies House API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
