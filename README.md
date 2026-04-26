# Neurotech Internship Targeting App

A single-user web application for targeting, tracking, and converting internship applications at neurotech, computational biotech, defense research, and AI/ML companies.

This is **not** a generic job tracker — it's a targeting and timing tool for a curated set of high-value companies with AI-powered fit analysis and pitch generation.

## Setup

### Prerequisites

- Node.js 20+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free — for AI features)

### Install & Run

```bash
git clone https://github.com/nej296/Neurotech-Internship-Targeting-App.git
cd Neurotech-Internship-Targeting-App
npm install
```

Create `.env.local` in the project root:

```
GEMINI_API_KEY=your-key-here
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey) — no credit card required.

Set up the database and seed it:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma ORM (file: `./data/app.db`) |
| AI | Google Gemini 2.5 Flash (free tier) |
| Auth | None (single-user, localhost) |

## Data Model

**Company** — target companies with recruiting cycle windows, priority ranking, lane classification (neurotech/biotech/defense/ai_ml/academic_lab), prep checklists, warm intro notes, and AI-generated "why me" pitches.

**Application** — individual role applications linked to companies. Tracks status (target → applied → screen → interview → offer/rejected/ghosted), job descriptions, and AI fit analysis results.

**Project** — portfolio projects tagged with relevant company lanes. Used by the pitch generator to reference concrete work.

**Profile** — singleton record with master resume text, rated skills, and education. Feeds both AI endpoints.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — This Week alerts, 6-month recruiting calendar, pipeline summary |
| `/companies` | Filterable company list (by lane + priority) |
| `/companies/[id]` | Company detail — inline editing, prep checklist, applications, fit analysis, pitch generation |
| `/pipeline` | Kanban board — drag applications between status columns |
| `/projects` | Portfolio project tracker with lane tagging |
| `/profile` | Resume, skills, and education editor |

## AI Endpoints

### POST `/api/analyze-fit`

Compares your profile against a job description. Returns a structured analysis with fit score (0-100), matched requirements, gaps, and recommended actions. Saved to the application record.

### POST `/api/generate-pitch`

Generates a 3-4 sentence "why me" paragraph connecting your background to a specific company. References your projects and avoids generic enthusiasm. Saved to the company record.

Both endpoints use Gemini 2.5 Flash via the Google Generative AI SDK (free tier). Set `GEMINI_API_KEY` in `.env.local`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | For AI features | Free from [Google AI Studio](https://aistudio.google.com/apikey) |
| `DATABASE_URL` | Auto-configured | SQLite path (set in `.env`) |

## Seed Data

`data/seed-companies.json` contains 15 pre-configured companies across 5 lanes. Edit this file and re-run `npm run seed` to update. The seed script uses upsert, so it's safe to re-run without duplicating data.
