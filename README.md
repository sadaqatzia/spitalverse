# Spitalverse

A personal health records app I built using Next.js. It helps you keep track of medications, lab reports, appointments, and more — all stored locally in your browser.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8)

## What it does

**Dashboard** — See everything at a glance: your profile, active meds, upcoming appointments, and any lab values that need attention.

**Document Vault** — Upload PDFs and images of your medical documents. Filter by category (labs, prescriptions, imaging, discharge summaries).

**Medication Tracker** — Keep a list of what you're taking, dosages, schedules, and notes. Mark them as active or completed.

**Lab Reports** — Enter your lab values and see if they're in the normal range. Uses German/EU reference ranges. Supports CBC, blood sugar, lipids, thyroid, vitamins, kidney/liver function, and inflammation markers.

**Appointments** — Track past and upcoming doctor visits with location and notes.

**Symptom Checker** — Describe what you're feeling and get some guidance on whether it's self-care territory or worth seeing a doctor. Works best with an OpenAI API key, but there's a basic fallback without one.

**Health Tips** — Gets you daily health tips based on your profile, meds, and conditions. Categories include nutrition, exercise, sleep, stress management, etc.

**AI Summary** — Generates a summary of your health data with recommendations. Needs an OpenAI key for the full experience.

**My Data** — Export everything as JSON or wipe it all. Your data stays in your browser's localStorage — nothing gets sent to any server.

## The look

I went with a "Executive Wellness" vibe:
- Dark green (`#0E301C`) for the sidebar
- Gold accents (`#C5A059`) for buttons and highlights
- Cream/slate background (`#F3F4F1`)
- Red for warnings and allergies

Works on mobile too — sidebar collapses into a hamburger menu.

## Getting started

```bash
git clone https://github.com/yourusername/spitalverse.git
cd spitalverse
npm install
npm run dev
```

Then open http://localhost:3000

### Optional: Add OpenAI for better AI features

Create a `.env.local` file:

```
OPENAI_API_KEY=sk-your-key-here
```

Without it, the app still works but the symptom checker and health tips use simpler logic.

## Deploying

Easiest way is Vercel:

1. Push to GitHub
2. Import the repo on vercel.com
3. Add your `OPENAI_API_KEY` in environment variables if you want AI features
4. Deploy

Also works with Netlify, Railway, or anything else that runs Next.js.

## Project layout

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── documents/
│   ├── medications/
│   ├── lab-reports/
│   ├── appointments/
│   ├── symptom-checker/
│   ├── health-tips/
│   ├── ai-summary/
│   ├── privacy/              # My Data page
│   └── api/
│       ├── generate-summary/
│       ├── symptom-checker/
│       └── health-tips/
├── components/
│   ├── ProfileCard.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── DocumentVault.tsx
│   ├── MedicationList.tsx
│   ├── LabReportManager.tsx
│   ├── AppointmentManager.tsx
│   └── ...
├── store/                    # Zustand store
└── types/
```

## Built with

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Zustand for state (with localStorage persistence)
- Lucide icons
- date-fns
- OpenAI API (optional)

## Demo data

The app comes with sample data so you can see how it works right away. Go to My Data → Delete All My Data to start fresh.

## Heads up

- All data lives in localStorage. Clear your browser data and it's gone.
- This is for personal tracking, not medical advice. Always talk to a real doctor.
- Lab reference ranges are based on German/EU standards.

---

MIT License

© 2026 Spitalverse
