# Contributing to Farming Mission Board

Thank you for your interest in contributing to the Farming Mission Board! This document provides guidelines and helpful information for developers and code assistants.

## 🏗️ Project Architecture

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool with hot module replacement
- **js-yaml** - YAML parsing for mission configuration
- **CSS3** - Custom styling (no UI libraries)

### Directory Structure

```
farmboard/
├── src/
│   ├── components/          # React components
│   │   ├── MissionCard.tsx  # Individual mission display
│   │   ├── MissionModal.tsx # Mission detail modal with form
│   │   └── NetworkSection.tsx # Collapsible network sections
│   ├── data/
│   │   └── missions.yaml    # ⭐ Main configuration file
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── configLoader.ts  # YAML parser and validator
│   ├── App.tsx              # Main application component
│   ├── App.css              # Global styles
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── .github/                 # GitHub configuration
├── vercel.json             # Vercel deployment config
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎯 Key Design Principles

### 1. YAML-Driven Content
- **ALL mission content** should be defined in `src/data/missions.yaml`
- No hardcoded mission data in TypeScript/React components
- Components render dynamically based on YAML structure

### 2. Type Safety with Flexibility
- TypeScript interfaces use index signatures `[key: string]: any` to allow future extensions
- Add new fields to YAML without modifying TypeScript code
- Validation happens at runtime in `configLoader.ts`

### 3. Component Modularity
- Each component is self-contained with its own CSS
- Components accept data via props, no global state management
- Easy to add new components or modify existing ones

### 4. Hot Reload Development
- Changes to `missions.yaml` trigger instant UI updates
- Vite HMR ensures fast development iteration
- No build step needed during development

## 📝 Adding New Features

### Adding a New Network

1. Edit `src/data/missions.yaml`:
```yaml
- key: arbitrum
  label: Arbitrum One
  priority: 2
  explorer: "https://arbiscan.io"
  missions:
    - id: arb_mission_1
      label: "Mission Name"
      # ... mission details
```

2. (Optional) Add network-specific styling in `src/components/NetworkSection.tsx`:
```typescript
const getNetworkColor = () => {
  switch (network.key) {
    case 'arbitrum': return '#28A0F0';
    // ... other cases
  }
};
```

### Adding New Mission Fields

1. Add field to YAML:
```yaml
- id: mission_id
  label: "Mission"
  newField: "Some value"
  anotherField: 123
```

2. (Optional) Add TypeScript type if you want type checking:
```typescript
export interface Mission {
  // ... existing fields
  newField?: string;
  anotherField?: number;
}
```

3. Update components to display the new field if needed

### Adding a New Component

1. Create component file: `src/components/NewComponent.tsx`
2. Create styles: `src/components/NewComponent.css`
3. Import and use in parent component
4. Keep components pure and data-driven

## 🎨 Styling Guidelines

### CSS Conventions
- Use semantic class names (`.mission-card`, `.network-section`)
- Mobile-first responsive design
- Use CSS custom properties for theme colors if adding them
- Avoid inline styles except for dynamic values (like network colors)

### Color Palette
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)
- Background gradient: `#667eea` to `#764ba2` (purple)

### Responsive Breakpoints
- Mobile: `max-width: 640px`
- Tablet: `max-width: 768px`
- Desktop: `1200px max-width container`

## 🧪 Testing Changes

### Development Testing
```bash
npm run dev
# Visit http://localhost:5173
# Edit missions.yaml and see instant updates
```

### Build Testing
```bash
npm run build
npm run preview
```

### Validation Checklist
- [ ] YAML syntax is valid (no parsing errors)
- [ ] All required fields are present (id, label for missions/networks)
- [ ] UI renders correctly on desktop and mobile
- [ ] Modal opens and displays all mission information
- [ ] Form validation works (required fields enforced)
- [ ] Console has no errors or warnings
- [ ] Build completes successfully

## 🔧 Common Tasks

### Update Mission Content
1. Edit `src/data/missions.yaml`
2. Save file
3. UI updates automatically in dev mode

### Add Mission Submission Handler
In `src/App.tsx`, update `handleSubmission`:
```typescript
const handleSubmission = async (submission: MissionSubmission) => {
  // Option 1: API
  await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });
  
  // Option 2: Local Storage
  const existing = JSON.parse(localStorage.getItem('submissions') || '[]');
  localStorage.setItem('submissions', JSON.stringify([...existing, submission]));
};
```

### Modify Network Display Order
Edit the `priority` field in missions.yaml (lower number = higher priority):
```yaml
- key: scroll
  priority: 1  # Shows first
  
- key: base
  priority: 2  # Shows second
```

### Add New Difficulty Levels
1. Add to YAML:
```yaml
difficulty: critical
```

2. Update CSS in `src/components/MissionCard.css`:
```css
.difficulty-critical {
  background: #7c3aed;
  color: white;
}
```

## 📦 Dependencies

### Adding New Dependencies
```bash
npm install package-name
npm install --save-dev @types/package-name  # If TypeScript types needed
```

### Current Dependencies
- `react` - UI framework
- `react-dom` - React DOM rendering
- `js-yaml` - YAML parsing

### Dev Dependencies
- `typescript` - Type checking
- `vite` - Build tool
- `eslint` - Linting
- `@types/*` - TypeScript definitions

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Other Platforms
The app is a static SPA that can be deployed anywhere:
1. Run `npm run build`
2. Upload `dist/` folder to hosting
3. Configure to serve `index.html` for all routes

## 🐛 Debugging

### YAML Parsing Errors
- Check `src/utils/configLoader.ts` for validation logic
- Ensure proper indentation (spaces, not tabs)
- Validate YAML syntax with online tools

### Hot Reload Not Working
- Restart dev server
- Clear browser cache
- Check Vite configuration in `vite.config.ts`

### TypeScript Errors
- Run `npm run build` to see all type errors
- Check that type imports use `type` keyword for verbatimModuleSyntax
- Verify tsconfig.json settings

## 📚 Additional Resources

### YAML Schema Documentation
See `README.md` for complete YAML schema reference

### Component Props
Check TypeScript interfaces in component files for prop documentation

### Type Definitions
See `src/types/index.ts` for all type definitions

## 🤝 Code Review Guidelines

When reviewing code or making changes:
1. ✅ Ensure YAML changes don't break existing missions
2. ✅ Test on both desktop and mobile viewports
3. ✅ Verify TypeScript compilation succeeds
4. ✅ Check for console errors/warnings
5. ✅ Ensure hot reload still works
6. ✅ Test the build output
7. ✅ Update README if adding new features
8. ✅ Keep components simple and focused

## 💡 Tips for Code Assistants

### When Modifying This Project
1. **Always preserve YAML structure** - it's the source of truth
2. **Keep TypeScript types flexible** - use index signatures for extensibility
3. **Test hot reload** after any config changes
4. **Maintain component isolation** - each component should work independently
5. **Follow existing patterns** - consistency matters

### Common Requests
- **"Add a new network"** → Edit missions.yaml, add network object
- **"Add a new mission"** → Edit missions.yaml under appropriate network
- **"Change styling"** → Edit component-specific CSS file
- **"Add form field"** → Modify MissionModal.tsx and MissionSubmission type
- **"Deploy to X"** → Follow deployment section above

### Do NOT
- ❌ Hardcode mission data in components
- ❌ Remove the YAML configuration system
- ❌ Add heavy dependencies without justification
- ❌ Break hot reload functionality
- ❌ Remove type safety features

---

Questions? Check README.md or open an issue on GitHub.
