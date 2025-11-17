# Claude Code Web Development Guide

## What to Build

UK Business Due Diligence Checker - 2 MCP tools for verifying UK businesses.

## Tools to Implement

### 1. search_uk_business
- Search Companies House by name
- Return top 5 matches with basic info

### 2. verify_uk_business
- Full due diligence check
- Trust score algorithm (0-100)
- Risk assessment (VERY_HIGH/HIGH/MEDIUM/LOW)
- Red flag detection
- Clear recommendation

## API Details

**Base URL:** `https://api.company-information.service.gov.uk`

**Auth:** HTTP Basic with API key
```typescript
const auth = Buffer.from(`${process.env.COMPANIES_HOUSE_API_KEY}:`).toString('base64');
headers: { 'Authorization': `Basic ${auth}` }
```

**Endpoints:**
- Search: `/search/companies?q={query}`
- Profile: `/company/{company_number}`
- Officers: `/company/{company_number}/officers`

## Trust Scoring Algorithm

Start at 50, adjust based on:

**Red Flags (-20 each):**
- Status dissolved/liquidation/administration
- Accounts overdue
- No active officers

**Warnings (-10 each):**
- Very new (< 6 months)
- Recently incorporated (< 12 months)
- Single director
- Confirmation statement overdue

**Positives (+15 each):**
- Status active
- Established (> 3 years)
- Accounts filed on time
- Multiple officers
- PLC/Ltd type

**Risk Levels:**
- 0-29: VERY_HIGH - AVOID
- 30-49: HIGH - Exercise extreme caution
- 50-69: MEDIUM - Acceptable with precautions
- 70-100: LOW - Appears legitimate

## Error Handling

- 404: Company not found
- 401: Bad API key
- 429: Rate limit (600/5min)
- Network errors

## Testing

Use real company numbers:
- 00000006 (oldest)
- 00445790 (Tesco)
- Search for dissolved companies

## See PROMPT.md for Complete Spec

Read PROMPT.md for full implementation details including exact code structure, response formats, and all requirements.
