# Treeban

A web app that helps you learn and remember plants through real-world encounters. Identify plants with AI, create flashcards tied to personal memories, and quiz yourself over time to build lasting recognition.

**Live app:** [treeban-ten.vercel.app](https://treeban-ten.vercel.app)

---

## Features

- **Plant Identification** — Upload a photo or use your camera. AI identifies the plant with a confidence score and common name.
- **Flashcards** — Optionally save any identification as a flashcard. Add a personal note to anchor it to a memory.
- **Timeline** — Browse all your past identifications grouped by day, month, and year.
- **Quiz Mode** — Test yourself on saved plants. Rate each answer (Easy / Medium / Hard) and the app schedules the next review using spaced repetition.

## Stack

- **Frontend:** Next.js 15 + TailwindCSS
- **Backend:** Next.js API Routes (serverless, deployed on Vercel)
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Storage:** Supabase Storage (plant images)
- **Plant identification:** [Plant.id API v3](https://plant.id)

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/treeban.git
cd treeban
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file at the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PLANT_API_KEY=your_plant_id_api_key
USE_MOCK=true
```

Set `USE_MOCK=true` during development to skip Plant.id API calls and return fixture data (saves your credits).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

The app uses four Supabase resources:

| Resource | Purpose |
|---|---|
| `plant_identifications` | One row per plant scan |
| `flashcards` | One row per saved flashcard |
| `quiz_history` | One row per quiz attempt |
| `plant-images` (Storage bucket) | Stores uploaded plant photos |

Row Level Security is enabled on all tables — users can only access their own data.

## Deployment

The app deploys to Vercel. Set the same environment variables from `.env` in your Vercel project dashboard (Settings → Environment Variables), with `USE_MOCK` omitted or set to `false`.

## Spaced Repetition Logic

| Rating | Next review |
|---|---|
| Hard | 1 day |
| Medium | 3 days |
| Easy | 7 days |
