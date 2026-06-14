# ☀️ SolarFit — Regional Solar Generation & Revenue Simulator

> A web service that helps solar installers estimate a site's **annual generation, expected
> revenue, payback period, and CO₂ reduction** in about 30 seconds and present it to clients.

**Introduction to AI Programming — Assignment 4** (PRD + AI-assisted web service implementation)

- 🔗 **Live Deployment (Vercel):** https://assignment4-51gw.vercel.app
- 📂 **GitHub Repository:** https://github.com/knameds-cmd/Assignment4
- 📄 **PRD & AI Development Report:** [`docs/PRD_SolarFit.pdf`](docs/PRD_SolarFit.pdf)

---

## 1. Project Overview

Small solar installers must calculate *"how much will this site generate and earn per year?"*
for every new site they evaluate. Because regional solar resource, system losses, and SMP/REC
prices change each time, they rebuild spreadsheets repeatedly and struggle to answer client
questions on the spot.

**SolarFit** automates this calculation with standard estimation formulas. Enter a region and
system conditions, and it instantly shows generation, revenue, payback period, and
environmental impact, and lets you save and compare multiple sites. It runs entirely in the
browser (localStorage) with no backend or database.

## 2. Main Features

| Feature | Description |
|---------|-------------|
| **Revenue simulator** | Enter region, capacity, performance ratio, and SMP/REC prices to compute annual generation, revenue (SMP + REC), payback period, 20-year cumulative revenue, and CO₂ reduction in real time. Grid-constrained regions such as Jeju are adjusted by a **curtailment rate** (sellable generation basis). |
| **Regional comparison** | A **choropleth map** of all 17 provinces/cities plus region-group filter, search, sort, and bar charts. Hovering/clicking the map highlights a region and syncs two-way with the comparison table. |
| **Generation data** | Charts based on Korean public statistics: **regional monthly generation pattern**, **national annual PV generation trend**, and **Jeju curtailment trend** (sources labeled). |
| **Shareable result link** | Encode inputs into a URL and copy it — sending it to a client opens **the exact same result screen** (a web-only capability that a spreadsheet cannot offer). |
| **Save & compare estimates** | Save results in the browser and automatically highlight the highest-revenue and shortest-payback estimates. |
| **Methodology disclosure** | Transparently explain all formulas, assumptions, data sources, and disclaimers. |

## 3. Page Structure

- `/` **Home** — Service overview, feature summary, how-to-use, data sources
- `/simulator` **Revenue Simulator** — Core interaction (input → real-time calculation → save → share link)
- `/regions` **Regional Comparison** — Generation-potential map + sort/filter for the 17 provinces
- `/data` **Generation Data** — Monthly pattern, national annual trend, Jeju curtailment trend (public statistics)
- `/saved` **Saved Estimates** — localStorage-based estimate management and comparison
- `/about` **Methodology** — Formulas, assumptions, data sources, disclaimer

## 4. Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **CSS Modules** + global CSS (design-token based, no external UI library)
- **localStorage** (estimate storage without a backend)
- **Vercel** deployment

## 5. Run Locally

Prerequisite: [Node.js](https://nodejs.org) 18 or later

```bash
# 1) Clone the repository
git clone https://github.com/knameds-cmd/Assignment4.git
cd Assignment4

# 2) Install dependencies
npm install

# 3) Start the dev server → http://localhost:3000
npm run dev

# 4) Production build / start
npm run build
npm start
```

## 6. Project Structure

```
.
├── app/                  # Next.js App Router
│   ├── layout.js         # Shared layout (Nav + Footer)
│   ├── page.js           # Home
│   ├── globals.css       # Design tokens · shared styles
│   ├── simulator/        # Revenue simulator (core interaction + share link)
│   ├── regions/          # Regional comparison (with map)
│   ├── data/             # Generation data (monthly/annual charts)
│   ├── saved/            # Saved estimates
│   └── about/            # Methodology
├── components/           # Nav, Footer, KoreaMap (shared components)
├── lib/
│   ├── regions.js        # 17 provinces: irradiance & curtailment-rate data
│   ├── calc.js           # Generation & revenue calculation engine
│   ├── storage.js        # localStorage helper
│   ├── solarHistory.js   # Monthly/annual generation statistics (from public data)
│   └── koreaGeo.js       # Province SVG paths (auto-generated, for the map)
├── scripts/
│   ├── build_pdf.py      # Markdown → PDF converter (for the PRD/report)
│   └── build_map.py      # GeoJSON → simplified SVG path generator
├── docs/
│   ├── PRD.md            # PRD + AI report (source)
│   └── PRD_SolarFit.pdf  # PRD + AI development report (submission copy)
└── README.md
```

## 7. Note — Data & Disclaimer

Regional irradiance, historical PV generation, and curtailment use **representative /
approximate values** referenced from Korean public sources — **Korea Meteorological
Administration (KMA) irradiance normals, Korea Energy Agency renewable-energy statistics, and
Korea Power Exchange (KPX) market statistics / non-central output-control information** — and
are simplified for an educational demo. The generation, revenue, and payback figures do not
guarantee actual business returns; precise analysis requires original data from sources such as
data.go.kr, the KMA open-data portal, and KOSIS. (See the in-app **Methodology** page for
details.)
