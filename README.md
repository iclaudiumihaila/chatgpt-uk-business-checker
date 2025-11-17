# UK Business Due Diligence Checker

**A ChatGPT App for verifying UK businesses and preventing fraud using Companies House data**

![ChatGPT App](https://img.shields.io/badge/ChatGPT-App-green?logo=openai)
![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)

---

## 🎯 What This App Does

This ChatGPT App helps users verify UK businesses before doing business with them - preventing fraud and bad partnerships by:

- ✅ **Searching Companies House** by company name (returns top 5 matches)
- ✅ **Comprehensive Due Diligence** with trust scoring algorithm (0-100)
- ✅ **Risk Assessment** (VERY_HIGH/HIGH/MEDIUM/LOW)
- ✅ **Red Flag Detection** (dissolved companies, overdue accounts, suspicious patterns)
- ✅ **Interactive Widgets** (search carousel + verification card with visual trust badges)
- ✅ **Conversational UX** (ChatGPT narrates findings naturally)

---

## 🏗️ Architecture

Built with the **official OpenAI Apps SDK** using:

- **MCP Server** (`@modelcontextprotocol/sdk`) - Backend tools and logic
- **Companies House REST API** - Live UK business data (4.5M+ companies)
- **Trust Scoring Algorithm** - Multi-factor analysis based on company age, status, filings, officers
- **Interactive Widgets** - Inline cards and carousels for visual UX
- **TypeScript** - Type-safe implementation

```
┌─────────────────────────────────────┐
│      ChatGPT Interface              │
│  ┌───────────────────────────────┐  │
│  │ Conversational Thread         │  │
│  │ ┌──────────────────────────┐  │  │
│  │ │ Search Carousel Widget   │  │  │
│  │ │ [Card] [Card] [Card]     │  │  │
│  │ └──────────────────────────┘  │  │
│  │ ┌──────────────────────────┐  │  │
│  │ │ Verification Card        │  │  │
│  │ │ Trust Score: 72/100      │  │  │
│  │ │ [Progress Bar] MEDIUM    │  │  │
│  │ └──────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↕ window.openai
┌─────────────────────────────────────┐
│      MCP Server (This App)          │
│  ├─ search_uk_business              │
│  ├─ verify_uk_business              │
│  ├─ Trust Scoring Algorithm         │
│  └─ Widget Templates                │
└─────────────────────────────────────┘
              ↕ HTTPS API
┌─────────────────────────────────────┐
│   Companies House REST API          │
│   (api.company-information.gov.uk)  │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **Companies House API Key** (free, instant - see below)
3. **ChatGPT Business/Enterprise/Edu** account (for app access)
4. **ngrok** (for local development tunneling)

### Get Companies House API Key

1. Go to https://developer.company-information.service.gov.uk/
2. Sign up for free (instant approval)
3. Create an API key (limit: 600 requests per 5 minutes)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chatgpt-uk-business-checker

# Install dependencies
npm install

# Build the project
npm run build

# Set your API key
export COMPANIES_HOUSE_API_KEY="your_api_key_here"

# Start the server
npm start
```

Server runs on `http://localhost:8787`

### Expose Locally with ngrok

```bash
# In a new terminal
ngrok http 8787
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.app`)

### Connect to ChatGPT

1. Open ChatGPT (Business/Enterprise/Edu account)
2. Go to **Settings → Developer Mode** (enable it)
3. Go to **Settings → Connectors**
4. Click **Add Connector**
5. Enter your ngrok URL with `/mcp`: `https://abc123.ngrok.app/mcp`
6. Authentication: **None**
7. Save

### Test It!

Try these prompts in ChatGPT:

```
"Find Tesco PLC"
"Search for ABC Supplies Limited"
"Verify company 00445790"
"Should I do business with company 12345678?"
"Is XYZ Trading legitimate?"
```

---

## 📖 How It Works

### Tool 1: `search_uk_business`

**Purpose:** Search Companies House by name

**Input:**
```json
{
  "query": "ABC Supplies Ltd"
}
```

**Output:**
- Top 5 matching companies
- Interactive carousel widget
- Each card shows: name, number, status, age, address
- "Verify →" button on each card

**ChatGPT Prompt Examples:**
- "Find ABC Supplies Ltd"
- "Search for Tesco"
- "Is there a company called XYZ Trading?"

---

### Tool 2: `verify_uk_business`

**Purpose:** Full due diligence with trust assessment

**Input:**
```json
{
  "company_number": "12345678"
}
```

**Output:**
- Trust Score (0-100)
- Risk Level (VERY_HIGH/HIGH/MEDIUM/LOW)
- Red Flags, Warnings, Positive Indicators
- Company details, officer info, compliance status
- Visual verification card widget

**ChatGPT Prompt Examples:**
- "Verify company 00445790"
- "Should I trust ABC Ltd (12345678)?"
- "Is this company legitimate?"

---

## 🎯 Trust Scoring Algorithm

**Starting Score:** 50 (neutral)

### Red Flags (-20 points each)
- Company status: dissolved/liquidation/administration
- Accounts overdue
- No active officers

### Warnings (-10 points each)
- Very new company (< 6 months)
- Recently incorporated (< 12 months)
- Single director
- Confirmation statement overdue

### Positive Indicators (+15 points each)
- Active status
- Established (> 3 years)
- Accounts filed on time
- Multiple officers
- PLC/Ltd company type

### Risk Levels

| Score | Risk Level | Recommendation |
|-------|-----------|----------------|
| 0-29 | VERY_HIGH | 🚫 AVOID - Serious concerns |
| 30-49 | HIGH | ⚠️ Exercise extreme caution |
| 50-69 | MEDIUM | ⚡ Acceptable with precautions |
| 70-100 | LOW | ✅ Appears legitimate |

---

## 🎨 Widget Design

### Search Carousel Widget

- **Display Mode:** Inline carousel
- **Items:** 3-8 company cards
- **Interactions:** Click "Verify →" button to trigger verification
- **Dark Mode:** Fully supported

### Verification Card Widget

- **Display Mode:** Inline card
- **Features:**
  - Visual trust score progress bar
  - Color-coded risk badge
  - Expandable positive/warning/red flag lists
  - Company details (address, officers, filing dates)
- **Conversational:** ChatGPT narrates findings while widget shows visual summary

---

## 🛠️ Development

### Project Structure

```
chatgpt-uk-business-checker/
├── src/
│   ├── server.ts                 # MCP server (main entry point)
│   ├── tools/
│   │   ├── searchTool.ts         # Search tool handler
│   │   └── verifyTool.ts         # Verify tool handler
│   ├── utils/
│   │   ├── companiesHouseClient.ts  # API client
│   │   └── trustScoring.ts       # Trust algorithm
│   └── widgets/
│       ├── search-carousel/
│       │   └── index.html        # Search results widget
│       └── company-card/
│           └── index.html        # Verification widget
├── scripts/
│   └── build-widgets.js          # Widget build script
├── public/                       # Built widgets (generated)
├── dist/                         # Compiled TypeScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

```bash
# Development (watch mode)
npm run dev

# Build everything
npm run build

# Build server only
npm run build:server

# Build widgets only
npm run build:widgets

# Start production server
npm start
```

### Environment Variables

```bash
COMPANIES_HOUSE_API_KEY="your_key_here"  # Required
PORT=8787                                 # Optional (default: 8787)
```

### Testing

Test real company numbers:
- `00000006` - Oldest UK company
- `00445790` - Tesco PLC
- Search for dissolved companies to see red flags

---

## 🔒 Security

- ✅ API key stored in environment variables (never committed)
- ✅ HTTPS required for production (use ngrok for dev)
- ✅ No user data stored
- ✅ Rate limiting handled (600 requests per 5 minutes)
- ✅ Input validation with Zod schemas
- ✅ Error handling for all API calls

**Never commit:**
- `.env` files
- `.claude/settings.json`
- API keys in code

---

## 📚 API Details

**Companies House REST API**

- **Base URL:** `https://api.company-information.service.gov.uk`
- **Authentication:** HTTP Basic Auth (API key as username, blank password)
- **Rate Limit:** 600 requests per 5 minutes
- **Documentation:** https://developer.company-information.service.gov.uk/

**Endpoints Used:**
- `GET /search/companies?q={query}` - Search
- `GET /company/{company_number}` - Company profile
- `GET /company/{company_number}/officers` - Officers

---

## 🎯 Use Cases

1. **Supplier Verification** - Check if supplier is legitimate before payment
2. **Contractor Vetting** - Verify contractor won't disappear with deposit
3. **Partnership Due Diligence** - Assess financial stability before partnership
4. **Fraud Prevention** - Detect dissolved companies, phoenixing, suspicious patterns
5. **Director Background Checks** - Review director history

---

## 🚧 Common Fraud Patterns Detected

- 🚫 **Phoenix Companies** - Dissolved, directors start new one with similar name
- 🚫 **Recently Incorporated** - Brand new requesting large upfront payment
- 🚫 **Dissolved but Operating** - Claiming to be active when dissolved
- 🚫 **Overdue Filings** - Missing accounts (hiding problems)
- 🚫 **Multiple Dissolutions** - Director history of failed companies

---

## 🤝 Contributing

This is a reference implementation. Feel free to:

- Add more UK fraud detection patterns
- Enhance trust scoring algorithm
- Add fullscreen detailed report widget
- Integrate filing history timeline
- Add director cross-reference checks

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Credits

- **Companies House API** - UK government open data
- **OpenAI Apps SDK** - Model Context Protocol
- **ChatGPT** - Conversational AI platform

---

## 📞 Support

For issues or questions:
- Check Companies House API status
- Verify API key is valid
- Ensure ngrok tunnel is active
- Check ChatGPT Developer Mode is enabled

---

## 🎉 Example Conversation

```
User: "Find ABC Supplies Limited"

ChatGPT: "I found 5 companies matching 'ABC Supplies Limited'.
Here are the most relevant matches:"

[Carousel Widget Shows 5 Companies]

User: "Verify the first one"

ChatGPT: "I've completed a full due diligence check on ABC
SUPPLIES LIMITED (12345678). Here's my assessment:"

[Verification Card Shows:]
- Trust Score: 72/100 (MEDIUM RISK)
- ✅ Active status, 3 years established
- ⚠️ Single director, recently incorporated
- 🚫 No red flags

ChatGPT continues: "This company shows MEDIUM RISK. It's been
active for 3 years and maintains compliance with filing
requirements, which are positive signs. However, it operates
with a single director, which increases risk if they leave.

RECOMMENDATION: Acceptable with standard precautions. Start
with smaller transactions, verify credentials, and avoid large
upfront commitments."
```

---

**Built with ❤️ using the official OpenAI Apps SDK**
