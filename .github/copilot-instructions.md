# GitHub Copilot Instructions for Farming Mission Board

## Project Overview
A React + TypeScript Web3 farming mission board where all content is defined in a YAML configuration file (`src/data/missions.yaml`). The UI dynamically renders based on this YAML, enabling content updates without code changes.

## Key Architecture Rules

### 1. YAML-Driven Content System
- **Source of Truth**: `src/data/missions.yaml` contains ALL mission content
- **Never hardcode** mission data in React components
- **Dynamic Rendering**: Components consume YAML data via props
- **Hot Reload**: Changes to YAML trigger instant UI updates in dev mode

### 2. TypeScript Type System
- Use `import type { ... }` for type imports (verbatimModuleSyntax enabled)
- Interfaces include `[key: string]: any` for extensibility
- New YAML fields should not require TypeScript changes
- Type safety with flexibility for future enhancements

### 3. Component Architecture
- Self-contained components with dedicated CSS files
- Pure, data-driven components (props in, JSX out)
- No global state management
- Component files: `ComponentName.tsx` + `ComponentName.css`

## Code Patterns to Follow

### TypeScript Imports
```typescript
// ✅ Correct - type-only imports
import type { Mission, Network } from './types';

// ❌ Incorrect - will cause build errors
import { Mission, Network } from './types';
```

### Component Structure
```typescript
import React from 'react';
import type { PropsType } from '../types';
import './ComponentName.css';

interface ComponentNameProps {
  data: PropsType;
  onAction: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  data, 
  onAction 
}) => {
  return (
    <div className="component-name">
      {/* Render based on props */}
    </div>
  );
};
```

### YAML Structure
```yaml
version: 1
networks:
  - key: unique_key      # Required
    label: "Display Name" # Required
    priority: 1          # Optional, for sorting
    explorer: "URL"      # Optional
    missions:
      - id: mission_id   # Required
        label: "Name"    # Required
        description: "Details"
        difficulty: low|medium|high
        suggestedProtocols: ["Protocol 1"]
        steps: ["Step 1", "Step 2"]
        logging:
          requireTxHash: true
          requireExplorerUrl: true
```

## Common Suggestions

### When User Asks to Add a Mission
Suggest editing `src/data/missions.yaml`:
```yaml
- id: new_mission
  label: "Mission Name"
  description: "What to do"
  goal: "Why do it"
  difficulty: low
  suggestedProtocols: ["Protocol Name"]
  steps: ["Step 1", "Step 2"]
```

### When User Asks to Change Styling
Direct to component-specific CSS file:
- `MissionCard.css` - mission card styles
- `MissionModal.css` - modal and form styles  
- `NetworkSection.css` - network section styles
- `App.css` - global styles and theme

### When User Asks About New Features
1. Check if YAML schema needs extension
2. Update types in `src/types/index.ts` (optional)
3. Update component rendering logic
4. Preserve hot reload functionality
5. Test on mobile viewport

## Code Suggestions Priority

### High Priority
1. Maintain YAML-driven architecture
2. Preserve hot reload functionality
3. Keep type-only imports
4. Ensure mobile responsiveness
5. Follow existing patterns

### Medium Priority
6. Add helpful comments
7. Extract reusable utilities
8. Improve error handling
9. Enhance accessibility

### Low Priority
10. Performance optimizations
11. Advanced TypeScript features
12. Additional type safety

## What to Avoid

### ❌ Never Suggest
- Hardcoding mission data in components
- Removing `[key: string]: any` from interfaces
- Breaking hot reload (e.g., wrong Vite config)
- Heavy dependencies without justification
- Inline styles (use CSS files)
- Removing YAML configuration system

### ⚠️ Be Cautious About
- Changing build configuration
- Modifying type import patterns
- Adding new dependencies
- Changing YAML parser logic
- Global state management libraries

## Testing Recommendations

When suggesting code changes, remind user to:
```bash
# Build test
npm run build

# Dev test with hot reload
npm run dev
# Then edit src/data/missions.yaml and verify instant updates
```

## File Purpose Quick Reference

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `src/data/missions.yaml` | Mission content | Very High |
| `src/types/index.ts` | Type definitions | Low |
| `src/utils/configLoader.ts` | YAML parser | Very Low |
| `src/components/*.tsx` | UI components | Medium |
| `src/components/*.css` | Styles | Medium |
| `src/App.tsx` | Main app logic | Low |
| `vite.config.ts` | Build config | Very Low |

## Deployment Context

- **Platform**: Vercel (primary), any static host (secondary)
- **Config**: `vercel.json` included
- **Build**: `npm run build` produces `dist/` folder
- **Type**: Static SPA (Single Page Application)

## Dependencies Philosophy

Current stack is minimal:
- `react` + `react-dom` - UI
- `js-yaml` - YAML parsing
- `typescript` - Type safety
- `vite` - Build tool

Before suggesting new dependencies, consider:
1. Is it essential?
2. Can we achieve it with existing tools?
3. Does it have good TS support?
4. What's the bundle size impact?

## Helpful Context for Suggestions

### Network Display
Networks are rendered in priority order (lower number = higher priority). Each network has:
- Collapsible section with icon
- Explorer link
- List of missions

### Mission Card
Each mission shows:
- Label and description
- Goal (what it achieves)
- Difficulty badge
- Suggested protocols
- Recommended frequency
- Click to open modal

### Mission Modal
Modal contains:
- Full mission details
- Suggested protocols list
- Step-by-step instructions
- Network explorer link
- Submission form (tx hash, URL, notes)
- Configurable validation

## When Generating New Components

Follow this checklist:
- [ ] Create `.tsx` and `.css` files
- [ ] Use `React.FC<Props>` pattern
- [ ] Accept data via props (no hardcoding)
- [ ] Use type-only imports
- [ ] Add mobile-responsive styles
- [ ] Export component from file
- [ ] Document props with JSDoc if complex

## Best Practices for This Project

1. **Content Changes** → Edit YAML
2. **Style Changes** → Edit CSS files
3. **Behavior Changes** → Edit component logic
4. **Type Changes** → Update interfaces (optional)
5. **Config Changes** → Rare, needs careful testing

Remember: The goal is to make mission management as simple as editing a text file. Keep this principle at the core of all suggestions.
