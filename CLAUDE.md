## Stack

Standalone agent-driven system. Package manager: **pnpm**.

- **Next.js 16** (App Router, TypeScript, `src/`, Turbopack) — in Next 16 use `proxy.ts`, not `middleware.ts`
- **Tailwind CSS v4** + **shadcn/ui** (base-nova preset; components in `src/components/ui`, `cn()` in `src/lib/utils.ts`)
- **AI SDK v7** (`ai@7`, `@ai-sdk/react@4`) — use `ToolLoopAgent`; call models via AI Gateway strings (e.g. `anthropic/claude-sonnet-4.6`)
- **Supabase** (DB / agent state), **Auth0** (auth), **Resend** (email) — keys in `.env.local` (template: `.env.example`)

### Commands
- `pnpm dev` — local dev (http://localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — eslint
- `pnpm dlx shadcn@latest add <component>` — add UI components

## Linear Project

- **Project**: Vercel Hackathon
- **Project ID**: b1c8af96-5c80-4520-8ddd-13fbfe969fad
- **Project URL**: https://linear.app/sypartners/project/vercel-hackathon-aea5545c7280
- **Team**: SYPartners
- **Team ID**: c270ed1a-4f84-4125-bb96-eeb32f267da1

### Issue Workflow
- When completing work, check for related Linear issues
- Update issue status when work is done
- Create new issues for discovered work items
