# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack on port 3000
npm run dev:daemon     # Run dev server in background (logs to logs.txt)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Run tests with Vitest
npm run db:reset       # Reset and re-run all migrations
```

To run a single test file: `npx vitest run <path/to/test.ts>`

Set `ANTHROPIC_API_KEY` in `.env` to use real Claude; without it the app falls back to a mock that returns static code.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in chat; Claude generates code using tool calls; the result renders live in a sandboxed iframe.

### Core data flow

```
User chat input
  → POST /api/chat (Vercel AI SDK streamText)
  → Claude with two tools: str_replace_editor, file_manager
  → Tool calls mutate the in-memory VirtualFileSystem
  → FileSystemContext detects changes, triggers preview rebuild
  → jsx-transformer (Babel) transforms JSX + builds import map
  → PreviewFrame renders result in isolated iframe via blob URLs
```

### Virtual file system

All generated files live in-memory (`src/lib/file-system.ts` — `VirtualFileSystem` class). Nothing is written to disk. The entrypoint for every project must be `/App.jsx` exporting a default React component. Authenticated users get their filesystem serialized and persisted to SQLite (via the `Project` model); anonymous users rely on session storage.

### State management

Two React contexts carry all application state:
- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`) — owns the `VirtualFileSystem` instance and handles incoming tool calls from Claude
- **ChatContext** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat` and manages message history

### AI tooling

The chat API route (`src/app/api/chat/route.ts`) gives Claude two tools:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/overwrite/patch files via string replacement
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename and delete files

The system prompt lives in `src/lib/prompts/generation.tsx`. The model is configured in `src/lib/provider.ts` (defaults to `claude-haiku-4-5`).

### Preview rendering

`PreviewFrame.tsx` uses `jsx-transformer.ts` to Babel-transform all virtual files, generate an import map for bare specifiers (React, etc.), and load them into a sandboxed iframe via blob URLs. This means previews work without a bundler or server-side execution.

### Auth

JWT-based sessions using `jose` (`src/lib/auth.ts`). Server actions in `src/actions/` handle sign-up, sign-in, sign-out, and project CRUD. Database schema is in `prisma/schema.prisma` (SQLite, two models: `User` and `Project`).

## Code style

Use comments sparingly. Only comment complex code.

## Tech stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS v4 · Prisma/SQLite · Vercel AI SDK · Anthropic Claude · Monaco Editor · Babel standalone · Vitest
