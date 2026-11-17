# Sakthi's portfolio

A personal portfolio with a built-in AI assistant ("Ask Sakthi") that answers questions about my projects and can move around the site for the visitor.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, cmdk, Google Gemini (`@google/genai`). Hosted on Vercel.

## Features
- **AI chatbot:** streaming answers grounded only in this repo's content, suggested questions, recruiter mode (paste a job description to get a fit analysis), and page actions through Gemini function calling (open a project, filter the grid, scroll to a section, show contact details).
- **Interactive terminal** in the hero: try `help`, `projects`, `open atts-rag`, `ask <question>`.
- **Command palette:** Ctrl/⌘ + K.
- Case-study pages, a filterable project grid, skills linked to projects, live GitHub activity (refreshed hourly), and a timeline.
- Guardrails: on-topic only, no invented facts, prompt-injection resistant, per-IP rate limiting.

## Run locally
```bash
npm install
cp .env.example .env.local   # then add your GEMINI_API_KEY
npm run dev
```
Open http://localhost:3000. Get a free Gemini key at https://aistudio.google.com/apikey.

## Edit the content
- `lib/site.ts`: name, role, links, skills, timeline. Fill in the fields marked `TODO`.
- `content/projects/*.md`: one file per project (frontmatter + case study). Set `featured: true` to feature one.
- `content/knowledge/*.md`: extra facts for the chatbot (about, FAQ). Lines containing `TODO` are hidden from the bot.
- `public/resume.pdf`: add your resume, then set `resume: "/resume.pdf"` in `lib/site.ts`.

The chatbot reads the same files as the pages, so updating content updates its answers.

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com/new.
3. Add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`, `GITHUB_TOKEN`, `NEXT_PUBLIC_SITE_URL`) under Settings → Environment Variables.
4. Deploy.
