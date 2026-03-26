# StudyFlow AI 🎓⚡

> **Your AI co-pilot that turns chaotic student life into focused, productive flow**

Built for **LovHack Season 2** · Powered by modern AI tools

![StudyFlow AI](https://img.shields.io/badge/Next.js-15.5.14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?logo=supabase)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Lecture Summarizer** | Upload PDFs or paste notes → instant summary, bullet points, and flip flashcards |
| 📅 **Smart Scheduler** | Add your tasks + deadlines → AI builds an optimized Pomodoro daily flow |
| ⏱️ **Focus Mode** | Full-screen Pomodoro timer + Aria, your AI study coach chatbot |
| 📊 **History & Progress** | Track all past summaries, schedules, focus sessions, and study streaks |
| 🌙 **Dark/Light Mode** | Beautiful dark-first design with system preference support |
| 🔐 **Auth** | Email/password + Google sign-in via Supabase Auth |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- A **Supabase** project ([supabase.com](https://supabase.com))
- An **AI API key** (Grok, Claude, Gemini, or any OpenAI-compatible API)

### 1. Clone and Install

```bash
git clone https://github.com/ravigohel142996/StudyFlow-AI.git
cd StudyFlow-AI
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Provider (default: Grok via x.ai)
AI_API_KEY=your-ai-api-key
AI_API_URL=https://api.x.ai/v1/chat/completions
AI_MODEL=grok-beta
```

**Supported AI Providers:**

| Provider | API URL | Model |
|---|---|---|
| Grok (xAI) | `https://api.x.ai/v1/chat/completions` | `grok-beta` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o` |
| Claude (via proxy) | Your proxy URL | `claude-3-5-sonnet` |
| Gemini (via proxy) | Your proxy URL | `gemini-1.5-pro` |

### 3. Set Up Supabase Database

In your Supabase project → SQL Editor, run:

```sql
-- Create tables
create table summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  summary_text text,
  flashcards jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  schedule_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table focus_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  duration integer not null,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table summaries enable row level security;
alter table schedules enable row level security;
alter table focus_sessions enable row level security;

-- RLS Policies (users can only access their own data)
create policy "Users own summaries" on summaries for all using (auth.uid() = user_id);
create policy "Users own schedules" on schedules for all using (auth.uid() = user_id);
create policy "Users own focus_sessions" on focus_sessions for all using (auth.uid() = user_id);
```

To enable **Google OAuth**, go to Supabase → Authentication → Providers → Google and add your Google OAuth credentials.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🚀 Deploy to Vercel in 1 Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ravigohel142996/StudyFlow-AI)

After deploying, add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 🏗️ Project Structure

```
StudyFlow-AI/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + CSS variables
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in page
│   │   ├── signup/page.tsx       # Sign up page
│   │   └── callback/route.ts    # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard home
│   │   ├── summarizer/page.tsx   # AI Lecture Summarizer
│   │   ├── scheduler/page.tsx    # Smart Scheduler
│   │   ├── focus/page.tsx        # Focus Mode + AI Coach
│   │   └── history/page.tsx      # History & Progress
│   └── api/
│       ├── summarize/route.ts    # AI summarization endpoint
│       ├── schedule/route.ts     # AI schedule generation endpoint
│       └── chat/route.ts         # AI chat coach endpoint
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── navbar.tsx                # Landing page navbar
│   ├── sidebar.tsx               # Dashboard sidebar
│   ├── flashcard.tsx             # Flip card component
│   ├── theme-provider.tsx        # Dark/light mode provider
│   └── theme-toggle.tsx          # Theme toggle button
├── lib/
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client
│   ├── ai.ts                     # AI API helper
│   └── utils.ts                  # Utility functions
├── middleware.ts                  # Auth route protection
├── .env.example                  # Environment variable template
└── README.md
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + custom CSS variables
- **UI Components**: [Radix UI](https://radix-ui.com) primitives (shadcn/ui pattern)
- **Auth & Database**: [Supabase](https://supabase.com)
- **AI**: Direct fetch to any OpenAI-compatible API (Grok, GPT-4, Claude, Gemini)
- **Animations**: CSS animations + Framer Motion
- **Icons**: [Lucide React](https://lucide.dev)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🏆 Sponsor Tool Highlights

| Tool | How It's Used |
|---|---|
| **Supabase** | Authentication (email + Google OAuth), PostgreSQL database, Row Level Security |
| **Vercel** | Zero-config deployment, Edge Functions via API routes |
| **Grok (xAI)** | Default AI model for summaries, scheduling, and chat coaching |

---

Built with ❤️ for **LovHack Season 2**
