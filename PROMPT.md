# Build "UK Business Due Diligence Checker" - ChatGPT App

**For Claude Code Web at https://claude.ai/code**

---

## 🎯 WHAT YOU'RE BUILDING

A ChatGPT App that helps users verify UK businesses before doing business with them - preventing fraud and bad partnerships.

**User Experience:**
```
User: "Should I trust ABC Supplies Ltd as a supplier?"
→ ChatGPT invokes your app
→ Fetches real Companies House data
→ Returns: Company legitimacy, financial health, director info, red flags
→ Displays trust assessment with recommendation
```

**Why This is SUPER Interesting:**

- ✅ **Real decision-making utility** - Helps prevent business fraud (£130B+ annual UK fraud)
- ✅ **Data model doesn't know** - Live Companies House database with 4.5M+ companies
- ✅ **Instant API key** - No waiting (you already have it!)
- ✅ **Complex analysis** - Multi-factor trust scoring based on patterns
- ✅ **Actually protects people** - Identifies dissolved companies, phoenixing, suspicious patterns

---

## 💼 UK BUSINESS FRAUD CONTEXT

**Why People Need This:**

1. **Verify suppliers** - Is this company legitimate before sending payment?
2. **Check contractors** - Will they disappear after taking deposit?
3. **Partnership due diligence** - Are they financially stable?
4. **Fraud prevention** - Detect dissolved/recently incorporated suspicious companies
5. **Director vetting** - Check history of company directors

**Common Fraud Patterns to Detect:**

- **Phoenix companies** - Company dissolved, directors start new one with similar name
- **Recently incorporated** - Brand new company requesting large upfront payment
- **Multiple dissolutions** - Director has history of failed companies
- **Missing accounts** - Overdue financial filings (hiding problems)
- **Dissolved but still operating** - Claiming to be active when dissolved

**What the Model Doesn't Know:**
- Current company status (active/dissolved/liquidation)
- Real-time officer information
- Filing history and compliance
- Financial submission dates
- Specific company registration numbers

---

## 🔌 API DETAILS

**Companies House REST API**
- **Documentation:** https://developer.company-information.service.gov.uk/
- **Base URL:** `https://api.company-information.service.gov.uk`
- **Authentication:** HTTP Basic Auth with API key as username, blank password
- **Rate Limit:** 600 requests per 5 minutes (generous!)
- **Key Endpoints:**
  - Search: `/search/companies?q={query}`
  - Company Profile: `/company/{company_number}`
  - Officers: `/company/{company_number}/officers`
  - Filing History: `/company/{company_number}/filing-history`

**Authentication Example:**
```typescript
const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
const auth = Buffer.from(`${apiKey}:`).toString('base64');

headers: {
  'Authorization': `Basic ${auth}`
}
```

**Response Data Example:**
```json
{
  "company_name": "ABC SUPPLIES LIMITED",
  "company_number": "12345678",
  "company_status": "active",
  "date_of_creation": "2020-01-15",
  "type": "ltd",
  "registered_office_address": {
    "address_line_1": "123 High Street",
    "locality": "London",
    "postal_code": "SW1A 1AA"
  },
  "accounts": {
    "next_due": "2025-10-31",
    "overdue": false,
    "last_accounts": {
      "made_up_to": "2024-01-31"
    }
  },
  "confirmation_statement": {
    "next_due": "2025-01-29",
    "overdue": false
  },
  "sic_codes": ["46900"]
}
```

---

## 📋 YOUR TASK FOR CLAUDE CODE WEB

### COMPLETE IMPLEMENTATION PROMPT

Copy everything below the line into Claude Code Web:

---

I want to build a ChatGPT App called "UK Business Due Diligence Checker" that helps users verify UK businesses before doing business with them, using the Companies House API.

**PROJECT STRUCTURE:**

Create in the repository `chatgpt-uk-business-checker`:

```
chatgpt-uk-business-checker/
├── README.md
├── .gitignore
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts              # MCP server implementation
└── .claude/
    └── settings.json.example  # Environment template
```

---

## IMPLEMENTATION REQUIREMENTS

### 1. MCP Server (src/index.ts)

Build a TypeScript MCP server using `@modelcontextprotocol/sdk` with TWO tools:

#### Tool 1: `search_uk_business`

**Purpose:** Search for UK companies by name

**Tool Metadata:**
```typescript
{
  name: "search_uk_business",
  title: "Search UK Business",
  description: "Use when user wants to find a UK company, verify a business name, or check if a company exists. Examples: 'Find ABC Supplies Ltd', 'Is XYZ Trading legitimate?', 'Search for company named...'",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Company name or partial name to search for"
      }
    },
    required: ["query"]
  }
}
```

**Handler Logic:**
```typescript
async (args) => {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  const auth = Buffer.from(`${apiKey}:`).toString('base64');

  const response = await fetch(
    `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(args.query)}`,
    {
      headers: { 'Authorization': `Basic ${auth}` }
    }
  );

  const data = await response.json();

  // Return top 5 matches
  const companies = data.items.slice(0, 5).map(company => ({
    name: company.title,
    number: company.company_number,
    status: company.company_status,
    type: company.company_type,
    address: company.address_snippet,
    date_of_creation: company.date_of_creation
  }));

  return {
    structuredContent: {
      query: args.query,
      results_count: companies.length,
      companies: companies
    },
    content: [{
      type: "text",
      text: `Found ${companies.length} matching companies for "${args.query}"`
    }]
  };
}
```

#### Tool 2: `verify_uk_business`

**Purpose:** Get detailed verification and trust assessment for a specific company

**Tool Metadata:**
```typescript
{
  name: "verify_uk_business",
  title: "Verify UK Business",
  description: "Use when user wants to verify if a UK business is trustworthy, check company legitimacy, or do due diligence before working with them. Analyzes company status, financial health, director history, and red flags. Examples: 'Is ABC Ltd trustworthy?', 'Should I do business with company 12345678?', 'Verify XYZ Supplies'",
  inputSchema: {
    type: "object",
    properties: {
      company_number: {
        type: "string",
        description: "UK Companies House registration number (8 digits, e.g., '12345678')"
      }
    },
    required: ["company_number"]
  }
}
```

**Handler Logic - CRITICAL BUSINESS LOGIC:**

```typescript
async (args) => {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  const auth = Buffer.from(`${apiKey}:`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}` };

  // Fetch company profile
  const companyRes = await fetch(
    `https://api.company-information.service.gov.uk/company/${args.company_number}`,
    { headers }
  );

  if (companyRes.status === 404) {
    return {
      content: [{
        type: "text",
        text: `Company number ${args.company_number} not found. Please verify the number.`
      }],
      isError: true
    };
  }

  const company = await companyRes.json();

  // Fetch officers
  const officersRes = await fetch(
    `https://api.company-information.service.gov.uk/company/${args.company_number}/officers`,
    { headers }
  );
  const officers = await officersRes.json();

  // === TRUST ASSESSMENT ALGORITHM ===

  const redFlags: string[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];

  // 1. Company Status Check
  if (company.company_status === 'dissolved') {
    redFlags.push('Company is DISSOLVED - legally no longer exists');
  } else if (company.company_status === 'liquidation') {
    redFlags.push('Company is in LIQUIDATION - going out of business');
  } else if (company.company_status === 'administration') {
    redFlags.push('Company is in ADMINISTRATION - financial difficulties');
  } else if (company.company_status === 'active') {
    positives.push('Company is currently active');
  }

  // 2. Age Check (Recently Incorporated = Risky)
  const creationDate = new Date(company.date_of_creation);
  const ageInMonths = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (ageInMonths < 6) {
    warnings.push(`Very new company (${Math.round(ageInMonths)} months old) - limited track record`);
  } else if (ageInMonths < 12) {
    warnings.push(`Recently incorporated (${Math.round(ageInMonths)} months old) - be cautious with large commitments`);
  } else if (ageInMonths > 36) {
    positives.push(`Established company (${Math.round(ageInMonths / 12)} years in business)`);
  }

  // 3. Accounts Filing Check
  if (company.accounts?.overdue) {
    redFlags.push('Accounts are OVERDUE - potential financial problems or non-compliance');
  } else if (company.accounts?.last_accounts) {
    positives.push('Accounts filed on time - shows compliance');
  }

  // 4. Confirmation Statement Check
  if (company.confirmation_statement?.overdue) {
    warnings.push('Confirmation statement overdue - minor compliance issue');
  }

  // 5. Officer Count Check
  const activeOfficers = officers.items?.filter((o: any) => !o.resigned_on) || [];

  if (activeOfficers.length === 0) {
    redFlags.push('No active officers listed - highly suspicious');
  } else if (activeOfficers.length === 1) {
    warnings.push('Single director company - higher risk if they leave');
  }

  // 6. Company Type Check
  if (company.type === 'ltd') {
    positives.push('Limited company (standard business structure)');
  } else if (company.type === 'plc') {
    positives.push('Public Limited Company (higher regulatory oversight)');
  }

  // === TRUST SCORE CALCULATION ===

  let trustScore = 50; // Start at neutral

  // Red flags: -20 points each
  trustScore -= redFlags.length * 20;

  // Warnings: -10 points each
  trustScore -= warnings.length * 10;

  // Positives: +15 points each
  trustScore += positives.length * 15;

  // Clamp between 0-100
  trustScore = Math.max(0, Math.min(100, trustScore));

  // === RISK LEVEL & RECOMMENDATION ===

  let riskLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  let recommendation: string;

  if (trustScore < 30 || redFlags.length > 0) {
    riskLevel = 'VERY_HIGH';
    recommendation = 'AVOID - Serious concerns identified. Do not proceed without thorough investigation.';
  } else if (trustScore < 50 || warnings.length > 2) {
    riskLevel = 'HIGH';
    recommendation = 'HIGH RISK - Exercise extreme caution. Request upfront guarantees, avoid large payments.';
  } else if (trustScore < 70 || warnings.length > 0) {
    riskLevel = 'MEDIUM';
    recommendation = 'MODERATE RISK - Acceptable with standard precautions. Verify credentials and start with small transactions.';
  } else {
    riskLevel = 'LOW';
    recommendation = 'LOW RISK - Company appears legitimate and compliant. Standard business practices apply.';
  }

  // === STRUCTURED RESPONSE ===

  return {
    structuredContent: {
      company: {
        name: company.company_name,
        number: company.company_number,
        status: company.company_status,
        type: company.type,
        incorporated: company.date_of_creation,
        age_months: Math.round(ageInMonths),
        address: company.registered_office_address
      },
      trust_assessment: {
        trust_score: trustScore,
        risk_level: riskLevel,
        recommendation: recommendation,
        red_flags: redFlags,
        warnings: warnings,
        positive_indicators: positives
      },
      compliance: {
        accounts_overdue: company.accounts?.overdue || false,
        confirmation_statement_overdue: company.confirmation_statement?.overdue || false,
        last_accounts_date: company.accounts?.last_accounts?.made_up_to
      },
      officers: {
        total_active: activeOfficers.length,
        directors: activeOfficers.slice(0, 3).map((o: any) => ({
          name: o.name,
          role: o.officer_role,
          appointed: o.appointed_on
        }))
      }
    },
    content: [{
      type: "text",
      text: `Verification complete for ${company.company_name}. Trust Score: ${trustScore}/100 (${riskLevel} RISK)`
    }],
    _meta: {
      full_company_data: company,
      all_officers: officers.items
    }
  };
}
```

### 2. Error Handling

Handle all error scenarios:

```typescript
// 401 Unauthorized
if (response.status === 401) {
  return {
    content: [{
      type: "text",
      text: "API authentication failed. Please check COMPANIES_HOUSE_API_KEY environment variable."
    }],
    isError: true
  };
}

// 404 Not Found
if (response.status === 404) {
  return {
    content: [{
      type: "text",
      text: `Company not found. Please verify the company number or try searching by name first.`
    }],
    isError: true
  };
}

// 429 Rate Limit
if (response.status === 429) {
  return {
    content: [{
      type: "text",
      text: "Rate limit exceeded (600 requests per 5 minutes). Please try again shortly."
    }],
    isError: true
  };
}

// Network errors
try {
  // API calls
} catch (error) {
  return {
    content: [{
      type: "text",
      text: `Failed to fetch company data: ${error.message}`
    }],
    isError: true
  };
}
```

### 3. Dependencies (package.json)

```json
{
  "name": "chatgpt-uk-business-checker",
  "version": "1.0.0",
  "description": "ChatGPT App for UK business verification and due diligence",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js"
  },
  "keywords": [
    "chatgpt",
    "mcp",
    "companies-house",
    "uk",
    "business",
    "due-diligence"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 4. TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 5. Environment Setup (.claude/settings.json.example)

```json
{
  "environments": {
    "default": {
      "name": "Business Checker Environment",
      "networkAccess": "limited",
      "environmentVariables": {
        "COMPANIES_HOUSE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 6. README.md

Include:
- Project description and purpose
- Setup instructions (API key from Companies House)
- Environment configuration
- Testing guide with example queries
- Trust assessment explanation
- Security notes

### 7. .gitignore

```
node_modules/
dist/
.env
*.log
.DS_Store
.claude/settings.json
```

---

## TESTING REQUIREMENTS

### Golden Prompts (Should Trigger)

**Search Tool:**
- ✅ "Find ABC Supplies Limited"
- ✅ "Search for Tesco PLC"
- ✅ "Is there a company called XYZ Trading?"
- ✅ "Look up British Airways"

**Verify Tool:**
- ✅ "Is company 00445790 trustworthy?"
- ✅ "Should I do business with ABC Ltd (12345678)?"
- ✅ "Verify legitimacy of company 00000006"
- ✅ "Can I trust XYZ Supplies as a supplier?"
- ✅ "Check if company 87654321 is legit"

### Negative Prompts (Should NOT Trigger)

- ❌ "What's the weather in London?"
- ❌ "Tell me about companies in general"
- ❌ "How do I start a business?"
- ❌ "What are good business practices?"

### Edge Cases to Handle

- Invalid company number format
- Company not found (404)
- Dissolved companies
- Recently incorporated (< 6 months)
- Overdue accounts
- No active officers
- API errors (401, 429, 500)

---

## SUCCESS CRITERIA

✅ **Functionality:**
- Both tools work correctly
- Calls Companies House API successfully
- Parses all responses accurately
- Trust scoring algorithm works
- All error scenarios handled

✅ **Discovery:**
- >90% precision on golden prompts
- 0% triggering on negative prompts
- Clear action-oriented metadata
- ChatGPT understands when to invoke

✅ **Value:**
- Provides actionable trust assessment
- Identifies red flags accurately
- Gives clear recommendations
- Helps prevent fraud

✅ **Code Quality:**
- TypeScript with proper types
- Clean, documented code
- No hardcoded values
- Comprehensive error handling

---

## DELIVERABLES

1. Complete MCP server with 2 tools
2. Trust assessment algorithm
3. Working package.json
4. TypeScript configuration
5. Comprehensive README
6. Test cases documented
7. .gitignore with security

**Build this now and make it production-ready!**

---

### END OF PROMPT

