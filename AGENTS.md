# Agent Guidelines 

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

Converge is a Real-time collaborative chat with an on-demand AI assistant. Built as a monorepo using pnpm workspaces and Turbo, with Next.js 16, React 19, TypeScript, and Drizzle.

## Repository Structure

```
apps/
  app/          - Main Next.js application
  storybook/    - Component documentation
packages/
  ai/           - AI/LLM utilities
  analytics/    - Analytics (PostHog)
  database/     - Drizzle database client
  design-system/ - Shared UI components (shadcn/ui)
  email/        - Email templates
  next-config/  - Shared Next.js config
  observability/ - Sentry integration
  seo/          - SEO utilities
  typescript-config/ - Shared TypeScript config
```

## Build & Development Commands

### Root Level

- `pnpm install` - Install all dependencies
- `pnpm dev` - Start all apps in dev mode (turbo)
- `pnpm build` - Build all apps and packages (turbo)
- `pnpm test` - Run all tests (turbo)
- `pnpm lint` - Run Oxlint linter across all packages (turbo)
- `pnpm lint:fix` - Auto-fix linting issues (turbo)
- `pnpm format` - Format code with Oxfmt across all packages (turbo)
- `pnpm format:check` - Check formatting without writing (turbo)
- `pnpm typecheck` - Type check all packages

### App-Specific

- `pnpm app dev` - Run main app in dev mode
- `pnpm app build` - Build main app
- `pnpm app test` - Run main app tests
- `pnpm email dev` - Run email dev server

### Running Single Tests

```bash
# From root (using turbo filter)
pnpm --filter app test

# From app directory
cd apps/app
pnpm test

# Run specific test file with vitest
cd apps/app
NODE_ENV=test npx vitest run __tests__/placeholder.test.tsx

# Watch mode for single test
NODE_ENV=test npx vitest __tests__/placeholder.test.tsx
```

## Code Style Guidelines

### Linting & Formatting

- **Linter**: Oxlint
- Always run `pnpm lint:fix` before committing

### Imports

```typescript
// External packages first
import { useState } from "react";
import { type NextConfig } from "next";

// Internal workspace packages
import { database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import { fonts } from "@repo/design-system/lib/fonts";

// Local imports
import { env } from "@/env";
import "./styles.css";
```

- Group imports: external → workspace (@repo/\*) → local (@/)
- Use `type` keyword for type-only imports
- Use workspace aliases (`@repo/*`) for internal packages
- Use `@/` alias for app-level imports

### Naming Conventions

- **Components**: PascalCase (`ModeToggle`, `DesignSystemProvider`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for env vars, camelCase for others
- **Props types**: `ComponentNameProperties` (not Props)

### Error Handling

```typescript
// Use Sentry for error tracking
import { captureException } from "@sentry/nextjs";

try {
  // risky operation
} catch (error) {
  captureException(error);
  throw error; // re-throw if needed
}

// Global error boundary in app/global-error.tsx
```

### Database

- Use Drizzle client from `@repo/database`
- Import: `import { database } from "@repo/database";`
- Run migrations in packages/database
- Schema in `packages/database/prisma/schema.prisma`

### Environment Variables

- Use `@t3-oss/env-nextjs` for type-safe env vars
- Define in `env.ts` at app level
- Extend from workspace package keys
- Never commit `.env.local` files

### Testing

- **Framework**: Vitest with jsdom
- **Location**: `__tests__/` directories or `.test.tsx` co-located
- **Testing Library**: @testing-library/react
- Write tests for new features (see PR checklist)

### Comments

- Use JSDoc for public APIs and complex functions
- Use ignore comments only when necessary with clear reason
- Prefer self-documenting code over comments
- Comment the "why", not the "what"

## Git Workflow

### Commits

- Follow conventional commit format
- Keep commits focused and atomic
- PR template requires:
  - Code style compliance
  - Self-review
  - Comments in complex areas
  - Tests for new features
  - Passing tests

### Pre-commit Checklist

1. Run `pnpm lint:fix`
2. Run `pnpm typecheck`
3. Run `pnpm test`
4. Ensure all files are formatted
5. Review your changes

## Important Notes

- This is a **pnpm workspace** with **Turbo monorepo**
- Use **Node.js >= 18**
- All packages use **ESM** (type: "module")
- UI components from **shadcn/ui** in design-system package
- Excluded from linting: generated files, shadcn components, email templates

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
