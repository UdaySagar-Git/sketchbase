# Sketchbase

A lightweight, key-based visual workspace built on Excalidraw. No traditional auth — just enter a workspace key and start drawing.

## Concept

- Enter a workspace key on the homepage to access your personal dashboard
- Workspaces can be optionally password-protected
- Each workspace has projects, and each project has Excalidraw boards
- Boards auto-save every 2 seconds
- Individual boards can be password-protected

## Tech Stack

- **Next.js 16** — App Router, TypeScript, Turbopack
- **Tailwind CSS v4** — CSS-first configuration
- **Excalidraw** — Collaborative whiteboard canvas
- **Prisma 7** — Type-safe ORM with PostgreSQL adapter
- **Supabase** — PostgreSQL database (free tier)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Create a Supabase project and grab the connection strings from **Project Settings → Database → Connection String**.

```bash
cp .env.local.example .env.local
```

Fill in your `.env.local`:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

For local dev, use the Direct URL (port 5432) for both.

### 3. Run migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                  — Home: key entry + optional password
  dashboard/page.tsx        — Project grid
  project/[id]/page.tsx     — Board list for a project
  board/[id]/page.tsx       — Full-screen Excalidraw canvas
  settings/page.tsx         — Workspace settings (password, delete)
  actions.ts                — All server actions
  proxy.ts                  — Middleware (auth redirect)
components/
  ExcalidrawBoard.tsx       — Excalidraw wrapper with auto-save
  BoardSidebar.tsx          — Navigator dropdown (projects/boards tree)
  Navbar.tsx                — Top navigation bar
  ProjectCard.tsx           — Project card for dashboard grid
  BoardCard.tsx             — Board card for project grid
  PasswordOverlay.tsx       — Board-level password gate
lib/
  prisma.ts                 — Prisma client singleton
  auth.ts                   — Cookie helpers (keyHash)
  hash.ts                   — SHA-256 hashing (Web Crypto API)
prisma/
  schema.prisma             — Workspace → Project → Board models
```

## Database Schema

```
Workspace (keyHash, passHash?)
  └── Project (name, emoji?)
        └── Board (name, content JSON, passHash?)
```

## Security

- Workspace keys and passwords are SHA-256 hashed before storage
- `keyHash` stored in httpOnly cookie (7 days)
- Every server action verifies ownership chain (board → project → workspace)
- Board passwords checked client-side via server action, unlocked state in sessionStorage

## Deploy

Deploy to Vercel — just connect the repo and add the environment variables. Prisma will use `DATABASE_URL` (pooler, port 6543) at runtime and `DIRECT_URL` (direct, port 5432) for migrations.
