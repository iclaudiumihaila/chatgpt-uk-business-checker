# UK Business Due Diligence Checker - ChatGPT App

A ChatGPT App that helps users verify UK businesses before doing business with them - preventing fraud and bad partnerships.

## What It Does

Protects users from business fraud by analyzing Companies House data and providing trust assessments:

- ✅ **Verify suppliers** - Check legitimacy before sending payment
- ✅ **Trust scoring** - Algorithmic assessment based on multiple factors
- ✅ **Red flag detection** - Dissolved companies, overdue filings, suspicious patterns
- ✅ **Officer vetting** - Check company directors
- ✅ **Clear recommendations** - AVOID / HIGH RISK / MODERATE / LOW RISK

## Why This Matters

**£130B+ annual UK business fraud**

Common scams this helps prevent:
- Phoenix companies (dissolved, restarted with similar name)
- Recently incorporated companies requesting large upfront payments
- Dissolved companies still claiming to operate
- Directors with history of multiple failures

## User Experience

```
User: "Should I trust ABC Supplies Ltd as a supplier?"

App Response:
Company: ABC SUPPLIES LIMITED (12345678)
Status: DISSOLVED ⚠️
Trust Score: 15/100
Risk Level: VERY HIGH

RED FLAGS:
- Company is DISSOLVED - legally no longer exists
- Accounts overdue for 2+ years

RECOMMENDATION: AVOID - Do not proceed. Company is no longer legally operating.
```

## Features

### Tool 1: Search UK Business
Find companies by name, get basic info

### Tool 2: Verify UK Business
Comprehensive due diligence with trust assessment based on:

**Analysis Factors:**
- Company status (active/dissolved/liquidation)
- Age (recently incorporated = risky)
- Accounts compliance (overdue = red flag)
- Officer count and history
- Filing history
- Company type

**Trust Score Algorithm:**
- Starts at 50/100 (neutral)
- Red flags: -20 points each
- Warnings: -10 points each
- Positive indicators: +15 points each

**Risk Levels:**
- VERY HIGH (0-29): AVOID
- HIGH (30-49): Exercise extreme caution
- MEDIUM (50-69): Acceptable with precautions
- LOW (70-100): Appears legitimate

## Technical Details

- **API:** Companies House REST API (4.5M+ UK companies)
- **Authentication:** HTTP Basic Auth (instant API key)
- **Protocol:** MCP (Model Context Protocol)
- **Language:** TypeScript
- **Rate Limit:** 600 requests per 5 minutes

## Setup

### 1. Get Companies House API Key (2 minutes)

1. Register: https://find-and-update.company-information.service.gov.uk/register
2. Sign in: https://developer.company-information.service.gov.uk/manage-applications
3. Create application: "ChatGPT Business Checker"
4. Create REST API key
5. Copy key (shown once)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.claude/settings.json`:

```json
{
  "environments": {
    "default": {
      "name": "Business Checker",
      "networkAccess": "limited",
      "environmentVariables": {
        "COMPANIES_HOUSE_API_KEY": "your_key_here"
      }
    }
  }
}
```

### 4. Build & Run

```bash
npm run build
npm run start
```

## Testing

### Golden Prompts

**Search:**
- "Find ABC Supplies Limited"
- "Search for Tesco PLC"
- "Is there a company called XYZ Trading?"

**Verify:**
- "Is company 00445790 trustworthy?"
- "Should I do business with ABC Ltd?"
- "Verify legitimacy of company 00000006"
- "Can I trust XYZ Supplies as a supplier?"

### Test with Real Companies

- **00000006** - MARINE AND GENERAL MUTUAL LIFE ASSURANCE SOCIETY (oldest company)
- **00445790** - TESCO PLC
- **Dissolved company** - Search for recently dissolved to see red flags

## Alignment with ChatGPT Apps Best Practices

From extensive user intelligence research:

- **Intent:** Asking-focused (49%, growing) - Decision support ✅
- **Topic:** Seeking Information (+10pp fastest growth) ✅
- **Work Activity:** Making Decisions (10.6%) + Getting Information (19.3%) ✅
- **Satisfaction:** High (advisory tasks rated higher) ✅
- **Utility:** Real decision support model cannot provide ✅

## Security

- Never commit API keys
- `.claude/settings.json` in `.gitignore`
- API key stored in environment variables only

## License

MIT

## Prompt for Claude Code Web

See `PROMPT.md` for complete implementation instructions.
