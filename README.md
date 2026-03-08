# CDRS - Crisis Connect 🛡️

A real-time disaster response platform connecting people in crisis with safe routes, relief camps, and essential resources. Built for emergency situations where every second matters.

## 🚀 Live Features

- **No Login Required for Users** — Emergency access, zero friction
- **Resource Request System** — Request food, medicine, shelter, bedding
- **Interactive Grid Map** — Custom-built 15×15 pathfinding map (no external APIs)
- **Safe Route Finder** — BFS/Dijkstra-based routing that avoids danger zones
- **Relief Camp Directory** — Live capacity, supply, and demographic data
- **Coordinator Portal** — Signup/Login with simulated SMS verification
- **Camp Management** — Edit capacity, supplies, and demographics
- **Disaster Area Marking** — Coordinators mark danger zones on the map
- **Fully Responsive** — Works on mobile, tablet, and desktop
- **localStorage Persistence** — All data simulated locally

## 📁 Project Structure

```
Crisisconnect/
├── index.html              # Landing page
├── README.md
├── css/
│   ├── global.css          # Design system & shared styles
│   ├── landing.css         # Landing page styles
│   ├── user.css            # User dashboard styles
│   └── coordinator.css     # Coordinator styles
├── js/
│   ├── app.js              # Core app logic, toast, data seeding
│   ├── user.js             # User dashboard logic & pathfinding
│   ├── map.js              # Shared map module
│   └── coordinator.js      # Auth, camp management, disaster marking
└── pages/
    ├── user-dashboard.html
    ├── coordinator-auth.html
    └── coordinator-dashboard.html
```

## 🎨 Design System

| Token | Color | Usage |
|-------|-------|-------|
| Dark Blue | `#0B2447` | Primary, headers, navigation |
| Emergency Red | `#D21312` | Alerts, danger, CTA buttons |
| Soft Yellow | `#F5C518` | Warnings, accents, highlights |
| White | `#FFFFFF` | Backgrounds, text on dark |

**Typography:** Inter (Google Fonts)

## 🏗️ Deployment

### GitHub Pages
1. Push to GitHub
2. Go to Settings → Pages → Source: main branch
3. Site deploys automatically

### Vercel
1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Framework: Other / Static
3. Deploy — zero configuration needed

## 🗺️ Map & Routing

The map uses a custom 15×15 grid (no Google Maps API). Coordinators mark areas as:
- 🟢 **Safe** — Normal passage
- 🟡 **Moderate** — Passable with higher cost
- 🔴 **Danger** — Blocked, routing avoids these

Pathfinding uses a weighted BFS (Dijkstra-like) algorithm preferring safe routes.

## 📱 Responsive Breakpoints
- **Mobile:** < 480px
- **Tablet:** 480px – 768px
- **Desktop:** > 768px

## ⚡ Tech Stack
- HTML5, CSS3, Vanilla JavaScript
- CSS Grid & Flexbox for layouts
- localStorage for data persistence
- No frameworks, no external APIs

---

Built with ❤️ for humanity. Every second matters.
