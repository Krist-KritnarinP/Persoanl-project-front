<div align="center">

# ✈️ AI LHOUNG (ไอหลง) — Frontend Client
### Next-Generation AI Travel Planner, Interactive Routing & Group Expense Dashboard

> *"นี่ไม่ใช่เครื่องมือกันหลงเธอ แต่ไว้กันหลงทาง"* 🐶

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-v5.7-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)](https://daisyui.com/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://persoanl-project-front.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passed-success?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

[🌐 Live Production Website](https://persoanl-project-front.vercel.app) • [🔌 Backend API Repository](https://github.com/Krist-KritnarinP/Persoanl-project-Back) • [📋 Report Bug / Request Feature](https://github.com/Krist-KritnarinP/Persoanl-project-front/issues)

</div>

---

## 📖 Overview

**AI LHOUNG (ไอหลง)** is an all-in-one travel planner and group adventure platform built to eliminate the chaos of travel organization. By consolidating fragmented itineraries scattered across notes, group chats, Excel spreadsheets, and weather apps into a seamless, reactive interface, AI LHOUNG empowers travelers to organize their journeys with confidence.

Featuring **Google Gemini AI** generation, interactive **Leaflet mapping**, **real-time microclimate forecasting**, **satang-precision group expense splitting**, and **print-ready PDF itinerary export with scannable Google Maps QR codes**, AI LHOUNG provides an end-to-end travel experience from initial ideation to on-the-road execution.

---

## ✨ Key Features

### 1. 🤖 AI-Powered Itinerary Generator
- Generate complete multi-day, time-slotted travel itineraries in seconds by supplying your destination, dates, budget tier, and travel style.
- Integrated directly with Google Gemini Flash models with real-time stream simulation and quota protection.

### 2. 🗺️ Interactive Maps & Intelligent Geocoding
- Real-time geospatial visualization powered by **Leaflet** and **OpenStreetMap / Esri World Imagery**.
- Custom location category markers (🏨 Accommodation, ✈️ Transport, 🍽️ Dining, 🏛️ Attraction).
- Dual-engine fallback geocoding (**Photon + Nominatim**) with automatic destination country anchoring (e.g. translating "ไอซ์แลนด์" -> "Iceland" to prevent cross-continent coordinate mismatches).

### 3. 🌤️ Weather Forecast & Climate Guidance
- Gemini-powered meteorological summaries tailored to travel dates and scheduled outdoor activities.
- Microclimate tracking and manual observations on days and individual activities (temperature °C, wind gusts, rainfall probability, freezing spray, and clothing/safety recommendations).

### 4. 💸 Fair Group Expense Splitting (Trip Billing)
- Transparent group travel ledger supporting multiple payers, equal or custom itemized splits, and proportional service charge / VAT calculations.
- Exact **satang-precision** integer math preventing floating-point rounding errors.
- Real-time debt simplification matrix showing who owes whom with one-click settlement logging.

### 5. 📄 Printable PDF Itinerary Export with Google Maps QR Codes
- Direct browser print engine (`window.print()`) with custom `@media print` styling for clean, pagination-friendly A4 exports.
- **Two Flexible Modes:**
  - **Full Detail Mode (แบบเต็ม):** Comprehensive itinerary with trip overview, daily schedule cards, time badges, activity details, flight notes, and QR codes.
  - **Compact Mode (แบบย่อ):** Space-saving summary table format ideal for physical paper carry.
- **Precision QR Codes:** Every destination generates a scannable vector SVG QR code linked directly to Google Maps coordinates (`lat,lng`) for instant smartphone navigation on the road.

### 6. 👥 Collaboration & Social Network
- Invite travel companions via username or shareable public web links (`/share/:token`).
- Manage friend requests, member roles, and real-time activity notifications.

### 7. 🌐 Full Internationalization (i18n)
- Seamless multilingual switching across 4 languages:
  - 🇹🇭 **ไทย (Thai)**
  - 🇺🇸 **English**
  - 🇨🇳 **中文 (Simplified Chinese)**
  - 🇰🇷 **한국어 (Korean)**
- Localized date formatting, number formatting, and currency display.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **React 19.2** | Modern React with concurrent rendering and optimized hooks |
| **Build Tool** | **Vite 8.1** | Lightning-fast HMR and optimized production bundling |
| **Styling & UI** | **Tailwind CSS v4** + **DaisyUI v5** | Modern utility-first styling with accessible, responsive UI themes |
| **State Management** | **Zustand 5** | Lightweight, reactive centralized stores with localStorage persistence |
| **Routing** | **React Router v7 / v8** | Declarative client-side routing with guarded routes (Protected / Guest) |
| **Mapping & Geospatial** | **Leaflet** + **React-Leaflet** | Interactive map layers, custom vector markers, and tile caching |
| **QR Generation** | **qrcode.react** | SVG-rendered responsive QR codes for Google Maps navigation |
| **Forms & Validation** | **React Hook Form** + **Zod** | Type-safe form handling, schema validation, and instant UX feedback |
| **Icons** | **Lucide React** + **React Icons** | Crisp, lightweight vector iconography |
| **Code Quality** | **Oxlint** | High-performance Rust-based linter enforcing clean code standards |
| **Testing** | **Node.js Test Runner** + **Playwright** | Native unit testing suite and browser end-to-end validation |
| **Hosting & CI/CD** | **Vercel** | Edge network deployment with automated Git continuous deployment |

---

## 📂 Project Architecture

```
PersonalProject_Front/
├── public/                 # Static assets, SVG icons, and favicons
│   ├── _headers            # Security & caching headers for production
│   └── _redirects          # SPA client-side routing rules
├── src/
│   ├── assets/             # Images, illustrations, and mascot graphics
│   ├── components/         # Reusable atomic & composite components
│   │   ├── trips/          # Trip modals, cards, and PDF export templates
│   │   │   ├── TripPdfDocument.jsx    # Print & PDF rendering layout
│   │   │   └── TripPdfExportModal.jsx # Export customization modal
│   │   ├── ActivityItem.jsx           # Activity card with weather tags
│   │   ├── ActivityModal.jsx          # Activity creation/edit modal
│   │   ├── GoogleSignInButton.jsx     # Google OAuth credential button
│   │   ├── ManualWeather.jsx          # Climate input & summary badges
│   │   ├── Navbar.jsx                 # Responsive navigation header
│   │   └── TripMap.jsx                # Leaflet geospatial map integration
│   ├── constants/          # Weather codes, activity categories, themes
│   ├── hooks/              # Custom React hooks (geocoding, geolocation)
│   ├── i18n/               # Multilingual translations (TH, EN, ZH, KO)
│   ├── layouts/            # App shell, authenticated sidebar, guest layout
│   ├── pages/              # Routed view controllers
│   │   ├── AiPlanner.jsx   # Gemini AI automated trip generation
│   │   ├── Dashboard.jsx   # Trips catalog, search, and metrics
│   │   ├── Landing.jsx     # Marketing landing page with SSR prerendering
│   │   ├── Login.jsx       # Authentication portal (JWT + Google OAuth)
│   │   ├── TripBilling.jsx # Group expense splitting & debt ledger
│   │   ├── TripMapPage.jsx # Fullscreen route & destination map
│   │   ├── TripsActivity.jsx # Day-by-day itinerary management
│   │   └── ShareTripView.jsx # Read-only public shared itinerary
│   ├── routes/             # AppRouter with ProtectedRoute / GuestRoute
│   ├── store/              # Zustand stores (userStore, tripStore, etc.)
│   └── utils/              # Helper utilities (axios, geocode, gmaps, dates)
├── tests/                  # Automated unit test suites (19 test cases)
├── vercel.json             # Vercel deployment configuration
└── vite.config.js          # Vite build pipeline & plugin configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- Running instance of **[PersonalProject_API](https://github.com/Krist-KritnarinP/Persoanl-project-Back)** (running on port `8899`)

### 1. Clone the Repository

```bash
git clone https://github.com/Krist-KritnarinP/Persoanl-project-front.git
cd Persoanl-project-front
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Refer to `.env.example` for local environment configuration options.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

The frontend client includes comprehensive automated tests covering date transformations, geocoding resolvers, password strength heuristics, and Google Maps URL generators:

```bash
# Run all unit tests with Node native test runner
npm test

# Run Oxlint code quality verification
npm run lint

# Build production assets (including SSR landing prerender)
npm run build
```

> **Test Suite Status:** `19 passing (100%), 0 failures, 0 lint errors`

---

## 🌐 Production Deployment

The frontend is continuously deployed on **Vercel** with automatic triggers on pushes to the `main` branch.

- **Production URL:** [https://persoanl-project-front.vercel.app](https://persoanl-project-front.vercel.app)
- **Security Features:** Automated HTTPS, HTTP Security Headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), and Single Page Application rewrite rules (`vercel.json`).

---

## 📄 License & Author

Developed with ❤️ by **Kritnarin P.** for Codecamp 23 Personal Project.

[![GitHub](https://img.shields.io/badge/GitHub-Krist--KritnarinP-181717?style=flat-square&logo=github)](https://github.com/Krist-KritnarinP)
