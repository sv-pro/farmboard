# Farming Mission Board 🚀

A dynamic React + TypeScript Web3 Farming Mission Board that displays farming missions grouped by networks (Scroll, zkSync, Base, Solana) with collapsible sections and interactive actions.

![Farming Mission Board](https://github.com/user-attachments/assets/f76f838d-ca14-4231-b210-6c20d6c87733)

## ✨ Features

- 🎯 **YAML-Driven Configuration** - Update missions by editing a single YAML file
- 🔥 **Hot Reload** - Changes to missions.yaml are instantly reflected during development
- 🌐 **Multi-Network Support** - Scroll, zkSync, Base, Solana with network priorities
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Clean UI** - Modern, professional interface with collapsible sections
- 📝 **Mission Details** - Each mission shows goals, protocols, steps, and difficulty
- 📊 **Logging System** - Record transaction hashes and explorer URLs
- 🔧 **Extensible** - Supports future fields without UI rewrites

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sv-pro/farmboard.git
cd farmboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
farmboard/
├── src/
│   ├── components/          # React components
│   │   ├── MissionCard.tsx  # Individual mission cards
│   │   ├── MissionModal.tsx # Mission detail modal with form
│   │   └── NetworkSection.tsx # Collapsible network sections
│   ├── data/
│   │   └── missions.yaml    # ⭐ Mission configuration file
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── configLoader.ts  # YAML parser and loader
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── package.json
├── vite.config.ts
└── vercel.json              # Vercel deployment config
```

## 📝 Configuring Missions

All mission content is defined in `src/data/missions.yaml`. Edit this file to add, remove, or modify missions.

### YAML Schema

```yaml
version: 1

networks:
  - key: scroll                    # Unique network identifier
    label: Scroll                  # Display name
    priority: 1                    # Lower = higher priority
    explorer: "https://scrollscan.com"
    missions:
      - id: mission_id             # Unique mission ID
        label: "Mission Name"      # Display name
        description: >             # Multi-line description
          Mission description here
        goal: "What this achieves" # Mission objective
        difficulty: low            # low, medium, high
        suggestedProtocols:        # List of protocols
          - "Protocol Name 1"
          - "Protocol Name 2"
        steps:                     # Step-by-step instructions
          - "Step 1"
          - "Step 2"
        logging:                   # Logging configuration
          requireTxHash: true
          requireExplorerUrl: true
          allowMultipleTxs: true
        meta:                      # Additional metadata
          recommendedFrequency: "2 tx within 48h"
```

### Example Mission

```yaml
- key: scroll
  label: Scroll
  priority: 1
  explorer: "https://scrollscan.com"
  missions:
    - id: scroll_bridge_twice
      label: "Bridge funds to Scroll (2x)"
      description: >
        Bridge to Scroll and back with small amounts
      goal: "Cross-chain activity & bridge usage on Scroll."
      difficulty: low
      suggestedProtocols:
        - "Official Scroll Bridge"
        - "Orbiter Finance"
      steps:
        - "Bridge small amount to Scroll"
        - "Wait for confirmations"
        - "Bridge back"
      logging:
        requireTxHash: true
        requireExplorerUrl: true
        allowMultipleTxs: true
```

## 🔥 Hot Reload

During development, any changes to `src/data/missions.yaml` will automatically trigger a hot reload, updating the UI instantly without manual refresh.

## 🌐 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sv-pro/farmboard)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

### Vercel Configuration

The project includes a `vercel.json` file with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## 🎨 Customization

### Network Icons and Colors

Network icons and colors are configured in `src/components/NetworkSection.tsx`:

```typescript
const getNetworkColor = () => {
  switch (network.key) {
    case 'scroll': return '#FFA726';
    case 'zksync': return '#8C7CFF';
    case 'base': return '#0052FF';
    case 'solana': return '#14F195';
    default: return '#3b82f6';
  }
};
```

### Styling

All component styles are in their respective `.css` files. Main app styling is in `src/App.css`.

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with hot module replacement
- **js-yaml** - YAML parsing
- **CSS3** - Styling with modern features

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Adding a New Network

1. Edit `src/data/missions.yaml`
2. Add a new network entry with missions:

```yaml
- key: arbitrum
  label: Arbitrum
  priority: 2
  explorer: "https://arbiscan.io"
  missions:
    - id: arb_mission
      label: "Mission Name"
      # ... mission details
```

3. The UI will automatically render the new network on save

### Extending the Schema

The type system supports future fields through index signatures:

```typescript
export interface Mission {
  id: string;
  label: string;
  // ... defined fields
  [key: string]: any; // Supports any future field
}
```

Add new fields to YAML without modifying TypeScript code:

```yaml
- id: mission_id
  label: "Mission"
  customField: "Custom value"
  anotherField: 123
```

## 📊 Mission Submission

Clicking on a mission opens a modal with:
- Mission details and goals
- Suggested protocols
- Step-by-step instructions
- Submission form (tx hash, explorer URL, notes)

Submissions are logged to the browser console. To persist data:

1. Implement API integration in `src/App.tsx`:
```typescript
const handleSubmission = async (submission: MissionSubmission) => {
  await fetch('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
};
```

2. Or use local storage:
```typescript
localStorage.setItem('submissions', JSON.stringify(submissions));
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 🔗 Links

- [GitHub Repository](https://github.com/sv-pro/farmboard)
- [Issue Tracker](https://github.com/sv-pro/farmboard/issues)

## 💡 Tips

- Keep mission descriptions concise and actionable
- Use difficulty levels consistently (low/medium/high)
- Include specific protocol names in `suggestedProtocols`
- Add explorer URLs for each network
- Use `allowMultipleTxs: true` for missions requiring multiple transactions

---

Built with ❤️ using React, TypeScript, and Vite
