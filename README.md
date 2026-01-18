# 🏥 Spitalverse - Personal Health Records MVP

A modern, premium healthcare application for managing personal health records. Built with Next.js 16, featuring an Executive Wellness design theme with Spital Green and Gold accent colors.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8)

## ✨ Features

### 📊 Dashboard
- Quick health overview with profile card
- Active medications count
- Upcoming appointments
- Health alerts for abnormal lab values
- AI Summary call-to-action

### 📁 Document Vault
- Upload and store medical documents (PDF, images)
- Categorize by type (Lab Report, Prescription, Imaging, etc.)
- Preview and download functionality
- Category-based filtering

### 💊 Medication Tracker
- Track active and completed medications
- Dosage and frequency management
- Start/end date tracking
- Reminder toggle (UI)
- Notes for each medication

### 🧪 Lab Reports (German/EU Standards)
- **Complete Blood Count (CBC)**: Hemoglobin, RBC, WBC, Platelets, etc.
- **Blood Sugar Profile**: Fasting Glucose, HbA1c (% and IFCC mmol/mol)
- **Lipid Profile**: Total Cholesterol, HDL, LDL, Triglycerides
- **Thyroid Profile**: TSH, Free T3, Free T4
- **Vitamins & Minerals**: Vitamin D (25-OH), B12, Iron, Ferritin
- **Kidney Function (KFT)**: Creatinine, Urea, Uric Acid, Sodium, Potassium
- **Liver Function (LFT)**: ALT (GPT), AST (GOT), Bilirubin, Albumin
- **Inflammation Markers**: CRP, ESR
- Status badges: 🟢 Normal, 🟡 Low, 🔴 High
- AI suggestions for abnormal values

### 📅 Appointment Manager
- Book and manage doctor appointments
- Track upcoming and past appointments
- Doctor name, specialty, location, notes

### 🤖 AI Health Summary
- **GPT-4 Powered** (with OpenAI API key)
- **Local Fallback** (works without API key)
- Analyzes medications, lab values, allergies
- Personalized recommendations
- Risk level assessment (Low/Moderate/High)

### 🔒 Privacy & My Data
- View all stored data overview
- Export all data as JSON
- Delete all data with confirmation
- Local-first storage (browser localStorage)
- No server-side data storage

## 🎨 Design Theme: Executive Wellness

| Color | Hex | Usage |
|-------|-----|-------|
| Spital Green | `#0E301C` | Sidebar, headings, primary elements |
| Spital Gold | `#C5A059` | CTAs, accents, active states |
| Light Gold | `#E2CC9D` | Hover states, highlights |
| Spital Slate | `#F3F4F1` | Main background |
| Signal Red | `#EF4444` | Allergies, delete actions, high values |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spitalverse.git
cd spitalverse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

For AI-powered health summaries, create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Without the API key**, the app uses a local algorithm for summaries (still functional).

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Spitalverse MVP"
   git branch -M main
   git remote add origin https://github.com/yourusername/spitalverse.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables** (Optional)
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your key
   - Redeploy

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- AWS Amplify
- Docker

## 🗂️ Project Structure

```
spitalverse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── documents/          # Document Vault
│   │   ├── medications/        # Medication Tracker
│   │   ├── lab-reports/        # Lab Reports
│   │   ├── appointments/       # Appointments
│   │   ├── ai-summary/         # AI Health Summary
│   │   ├── privacy/            # Privacy & My Data
│   │   └── api/                # API routes
│   ├── components/             # Reusable components
│   ├── store/                  # Zustand state management
│   └── types/                  # TypeScript interfaces
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── package.json
```

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **AI**: OpenAI GPT-4o-mini (optional)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **IDs**: uuid

## 📱 Demo Data

The app comes pre-loaded with sample data for demonstration:
- **Profile**: John Doe, Age 39, Blood Group O+
- **Medications**: Metformin, Amlodipine, Atorvastatin, Vitamin D3
- **Lab Report**: Annual Health Checkup with 9 values
- **Appointments**: 2 upcoming doctor visits

To reset, go to **My Data** → **Delete All My Data**

## ⚠️ Important Notes

1. **Data Storage**: All data is stored in browser localStorage
   - Data persists across sessions
   - Data is device-specific (not synced)
   - Clearing browser data will delete health records

2. **Medical Disclaimer**: This app is for informational purposes only and does not replace professional medical advice.

3. **Lab Values**: Based on German/EU standards. Consult your doctor for interpretation.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Spitalverse** - Your Personal Health Records, Your Control.
