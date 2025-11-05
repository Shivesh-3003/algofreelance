# CFO AI Cockpit

**Transform AI from a black-box cost center into a transparent value driver**

## The Problem (The CFO Headache)

CFOs are under immense pressure to invest millions in AI but are flying blind. They are caught in an "experimentation trap," funding dozens of pilots with no clear way to measure financial value or control costs. They cannot answer the board's #1 question: **"What is the financial ROI of our AI spend?"**

## The Solution (The "Control Tower")

The CFO AI Cockpit is a single-pane-of-glass "control tower" that transforms AI from a black-box cost center into a transparent value driver. It's the one screen the CFO uses to see—in real-time, in dollars—which AI projects are making money, and which ones are just burning it.

## Demo Story - The 3-Act User Experience

### Act 1: The 10,000-ft View (Main Dashboard)
- See the entire AI portfolio at a glance
- Key metrics: Net ROI, Total Value, Total Spend
- Identify projects that are "At Risk" and bleeding money

### Act 2: The "Problem" & Drill-Down (The Failing Project)
- Click on "Gen-AI Legal Review" project (Status: 🔴 At Risk)
- See why it's failing: Cost rising, Value flat at $0
- **"Wow" Moment:** AI-Generated Insight states: "This project is 95% likely to fail. User adoption is 3%. Recommendation: Pause funding."

### Act 3: The "Action" & Positive Contrast (The Winning Project)
- Click on "AP Invoice Automation" (Status: 🟢 Scaling)
- See what success looks like: Value skyrocketing
- **"Wow" Moment:** AI-Generated Insight states: "Project has exceeded goals. Recommendation: Scale this solution to 'Procurement' department for an estimated $2M in new value."

## Key Features

### F-01: Portfolio Dashboard (Main View)
- **KPI Bar:** Total AI Value, Total AI Spend, Net AI ROI %
- **Portfolio Status Chart:** Donut chart showing project distribution by status
- **Project Portfolio Table:** Sortable table with Project Name, Status, Spend, Value, ROI

### F-02: Project Detail Page
- **Project Header:** Name and Status
- **Cost vs. Value Chart:** Line chart showing spend vs. value over time
- **Live Metrics Block:** Key business metrics (User Adoption, Processing Time, etc.)

### F-03: AI-Generated Insight Component (The "Magic")
- Conditional styling (green for positive, red for negative, blue for neutral)
- Displays AI-powered title, analysis, and recommendation
- The centerpiece "wow" factor of the demo

## Technical Stack

- **Frontend:** React 18 + Vite 5
- **Styling:** TailwindCSS (professional, enterprise-grade UI)
- **Charts:** Recharts (polished line/donut charts)
- **Routing:** Simple useState hook (no router needed for demo)
- **Data Source:** Static JSON file (`public/data.json`)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
cfo-ai-cockpit/
├── public/
│   └── data.json              # Static "database" with all project data
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx      # Main dashboard with KPIs and project table
│   │   ├── ProjectDetailPage.jsx  # Detailed project view with charts
│   │   └── AIInsight.jsx      # AI-Generated Insight component
│   ├── App.jsx                # Main app component with routing logic
│   ├── main.jsx               # React entry point
│   └── index.css              # TailwindCSS imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Data Model

The entire application is powered by a single `data.json` file containing:

- **KPIs:** totalValue, totalSpend, netROI
- **Projects Array:** Each project includes:
  - Basic info: id, name, status, spend, value, roi
  - Details: description, chartData (monthly), metrics, aiInsight

## Hackathon Success Criteria

✅ **Pitch:** Judges can clearly articulate the CFO pain point and our solution
✅ **Demo:** The 3-act story is told flawlessly, with AI Insight boxes landing as "wow" moments
✅ **UX:** Professional, polished, and "enterprise-ready" UI

## Target User Persona: "CFO Catherine"

- **Role:** CFO at a large enterprise
- **Pain:** Skeptical of AI hype, accountable for $100M+ in tech spend
- **Needs:** Financial-grade data (not tech jargon), proactive risk alerts, and a clear line of sight from AI spend to P&L impact

## Features by Priority

### Must-Have (MVP)
- [x] Portfolio Dashboard with KPIs
- [x] Sortable project table
- [x] Project detail pages
- [x] Cost vs. Value charts
- [x] AI-Generated Insights
- [x] Responsive design

### Nice-to-Have (Future)
- [ ] Real-time data integration
- [ ] Export to PDF/Excel
- [ ] Custom date range filters
- [ ] Multiple portfolio views
- [ ] User authentication
- [ ] Historical trend analysis

## License

MIT License - Built for Hackathon

## Credits

Built with Claude Code and React
