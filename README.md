# roomie.sg

NUS / NTU student dorm roommate matching platform.

## Stack
- **Frontend**: React + Vite + Tailwind CSS (Person A)
- **Backend**: Supabase (Auth, PostgreSQL, Storage) (Person B)
- **Hosting**: Vercel

## Repo Structure

```
roomie-sg/
├── src/
│   ├── components/       # Reusable UI components (Person A)
│   ├── pages/            # Screen-level components (Person A)
│   ├── hooks/            # Custom React hooks (Person A)
│   ├── lib/              # Supabase client + helpers (shared)
│   ├── algorithm/        # Matching scoring logic (Person B)
│   └── types/            # Shared TypeScript types (Person B)
├── supabase/
│   ├── migrations/       # Database schema migrations (Person B)
│   └── functions/        # Edge functions (Person B)
└── public/
```

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (ask Person B for keys)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/roomie-sg.git
cd roomie-sg
npm install
cp .env.example .env.local
# Fill in your Supabase keys in .env.local
npm run dev
```

## Person B — Backend Setup

See `/supabase/migrations/` for full database setup instructions.

Run migrations in order:
1. `001_profiles.sql`
2. `002_likes.sql`
3. `003_activity.sql`
4. `004_functions.sql`
5. `005_rls.sql`

## Branching

- `main` — production, always deployable
- `dev` — integration branch, both people merge here
- `feat/person-a-[feature]` — Person A branches
- `feat/person-b-[feature]` — Person B branches

Never push directly to `main`.
