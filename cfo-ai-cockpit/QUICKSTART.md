# Quick Start Guide - CFO AI Cockpit

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm or yarn

## Installation

```bash
# 1. Navigate to project directory
cd cfo-ai-cockpit

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## First Time Setup

No setup needed! The application uses a static JSON file for data.

## Using the Application

### Main Dashboard
- View overall AI portfolio metrics at the top (Total Value, Total Spend, ROI)
- See project distribution in the pie chart
- Browse all projects in the table
- Click any project row to see details

### Project Detail Page
- View detailed spend vs. value chart
- See business metrics for the project
- Read AI-generated insights and recommendations
- Click "Back to Dashboard" to return

## Demo Flow (For Presentations)

1. **Start on Dashboard** - Show the overview
2. **Click "Gen-AI Legal Review"** - Show the failing project (red insight)
3. **Return to Dashboard** - Click back button
4. **Click "AP Invoice Automation"** - Show the winning project (green insight)
5. **Conclude** - Return to dashboard for Q&A

## Customizing Data

Edit `public/data.json` to add/modify projects:

```json
{
  "kpis": {
    "totalValue": 14250000,
    "totalSpend": 9175000,
    "netROI": 1.553
  },
  "projects": [
    {
      "id": 1,
      "name": "Your Project Name",
      "status": "Scaling",  // or "In-Pilot", "At Risk"
      "spend": 1200000,
      "value": 4500000,
      "roi": 3.75,
      "details": {
        // ... see existing projects for full structure
      }
    }
  ]
}
```

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Port 5173 already in use
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.js
```

### Dependencies not installing
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Check Node.js version (needs 18+)
node --version

# Update dependencies
npm update
```

## Project Structure

```
cfo-ai-cockpit/
├── public/
│   └── data.json          # All project data
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Main view
│   │   ├── ProjectDetailPage.jsx  # Detail view
│   │   └── AIInsight.jsx          # Insight component
│   ├── App.jsx            # Main app
│   ├── main.jsx          # Entry point
│   └── index.css         # Styles
├── package.json
└── README.md
```

## Next Steps

1. **Customize the data** - Edit `public/data.json` with your projects
2. **Adjust styling** - Modify colors in `tailwind.config.js`
3. **Deploy** - See `DEPLOYMENT.md` for deployment options
4. **Demo** - Follow `DEMO_SCRIPT.md` for presentation guide

## Getting Help

- **README.md** - Comprehensive project documentation
- **DEPLOYMENT.md** - Deployment instructions
- **DEMO_SCRIPT.md** - Presentation guide
- **PRD** - Full product requirements

## Common Use Cases

### Adding a new project
1. Open `public/data.json`
2. Copy an existing project object
3. Update all fields with new data
4. Recalculate KPIs (totalValue, totalSpend, netROI)
5. Refresh the browser

### Changing colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#1e3a8a',    // Change these
      success: '#059669',
      warning: '#f59e0b',
      danger: '#dc2626',
    }
  }
}
```

### Adding more metrics
Edit the project's `details.metrics` object in `data.json`:
```json
"metrics": {
  "Your Metric Name": "Value",
  "Another Metric": "123",
  "Third Metric": "45%"
}
```

## Performance Tips

- The app is optimized for <100 projects
- For larger datasets, consider pagination
- Charts render efficiently with Recharts
- Static JSON = instant load times

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Ready to go?** Just run `npm run dev` and start exploring!
