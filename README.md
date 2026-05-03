# HardHeartHeard

> *Attention is currency. Silence is death.*

A dystopian poetry exchange platform where every word costs coins, and silence means permaban. Built with Next.js 14 App Router, Supabase, Prisma, and Tailwind CSS.

---

## Setup

### 1. Clone and install

```bash
cd C:\DEV\HardHeartHeard
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In **Settings → API** copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. In **Settings → Database** you need **two** connection strings:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL` — used by Prisma at runtime on Vercel serverless
   - **Direct connection** (port `5432`) → `DIRECT_URL` — used by Prisma for migrations
   - Both strings look like: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
   - Add `?pgbouncer=true&connection_limit=1` to the end of `DATABASE_URL`

### 3. Enable Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create OAuth 2.0 credentials
2. Add authorized redirect URIs:
   - `https://[your-supabase-ref].supabase.co/auth/v1/callback`
3. In Supabase: **Authentication → Providers → Google**, paste your Client ID and Secret
4. In Supabase: **Authentication → URL Configuration**, add your site URL and:
   - Redirect URL: `https://yourdomain.vercel.app/api/auth/callback`
   - Also add `http://localhost:3000/api/auth/callback` for local dev

### 4. Configure environment variables locally

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 5. Push the database schema

```bash
npx prisma db push
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/hardheardheard.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### 3. Add environment variables in Vercel

In the Vercel project settings → **Environment Variables**, add all variables from `.env.example`:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `DATABASE_URL` | Supabase → Settings → Database → Transaction pooler (port 6543) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection (port 5432) |

### 4. Deploy

Click **Deploy**. Vercel will run `prisma generate && next build` automatically.

### 5. Add your Vercel URL to Supabase

After deployment, copy your `.vercel.app` URL and:
1. In Supabase → **Authentication → URL Configuration** → add it as a Site URL
2. Add `https://yourdomain.vercel.app/api/auth/callback` to redirect URLs
3. In Google Cloud Console → add the same callback URL to authorized redirect URIs

---

## Admin Access

The admin panel at `/admin` is exclusively accessible by **peppendriver@gmail.com**. Sign in with that Google account and you'll have God mode access.

---

## Economy Rules

| Action | Cost |
|--------|------|
| Publish a post | **10 coins** |
| Post a comment | **3.48 coins** (stored as 3) |
| Tip a comment | Custom amount from your wallet |
| Spam punishment | 20 coins taken from spammer |
| Starting balance | **10,000 coins** |
| Hit 0 coins | **PERMABANNED** → Hall of Shame |

**Total coins in existence:** 1,440,000,000 (max 144,000 users)

---

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Auth:** Supabase Auth (Google OAuth)
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Fingerprinting:** FingerprintJS (open source)

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Navbar
│   ├── page.tsx            # Feed page
│   ├── write/              # Write a post
│   ├── post/[id]/          # View a post (comment enforced)
│   ├── profile/[username]/ # User profile
│   ├── hall-of-shame/      # The banned
│   ├── dm/[username]/      # Direct message + coin transfer
│   ├── admin/              # Admin panel (peppendriver@gmail.com only)
│   └── api/
│       ├── posts/          # Post CRUD
│       ├── comments/       # Comment CRUD
│       ├── coins/          # Transfer, tip, punish
│       ├── admin/          # Admin actions
│       ├── fingerprint/    # FingerprintJS logging
│       └── auth/callback/  # Supabase OAuth callback
├── components/
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   ├── CommentForm.tsx
│   ├── CoinBalance.tsx
│   ├── AdminTable.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Client and server Supabase clients
│   ├── prisma.ts           # Prisma singleton
│   ├── coins.ts            # All coin business logic
│   ├── fingerprint.ts      # Fingerprint utilities
│   ├── admin.ts            # Admin email constant
│   └── utils.ts            # cn() utility
└── types/
    └── index.ts            # Shared TypeScript types
```
