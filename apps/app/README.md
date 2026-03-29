# App Frontend Structure

This app uses a simplified, ad-hoc Feature-Sliced Design approach with only two layers:

- `shared` for reusable, cross-module code
- `modules` for page/domain slices (this is our renamed pages layer)

The goal is simple routing in `src/app`, with feature UI and logic living in `src/modules`.

## Layers

- `src/modules/*`
  - One slice per page/domain.
  - Contains local segments such as `components`, `hooks`, `utils`, `lib`, `types`, etc.
  - Exposes public API through `index.ts`.

- `src/shared/*`
  - Reusable building blocks used by multiple modules.
  - Typical segments: `ui`, `hooks`, `lib`, `utils`, `constants`, `assets`.

- `src/app/*`
  - Next.js App Router entrypoints.
  - Keep route files thin: metadata + render module `View`.

## Recommended Tree

```text
src/
  app/
    page.tsx
    privacy/
      page.tsx
    terms/
      page.tsx
  modules/
    home/
      components/
      hooks/
      utils/
      home.view.tsx
      index.ts
    privacy/
      components/
      privacy.view.tsx
      index.ts
  shared/
    ui/
    hooks/
    lib/
    utils/
    constants/
    assets/
```

## Public API Rule (Barrel)

Every module must export its public surface from `index.ts`.

```ts
// src/modules/home/index.ts
export { HomeView } from "./home.view";
```

Route files should import from the module barrel, not internal paths.

## Route Rendering Pattern

Each route in `src/app/**/page.tsx` renders a `View` from a module.

```tsx
// src/app/page.tsx
import { HomeView } from "@modules/home";

export default function Page() {
  return <HomeView />;
}
```

## Import Conventions

- From routes: prefer module public APIs (`@modules/<module>`).
- Avoid deep imports from module internals in route files.
- Use `src/shared` (via aliases) for cross-cutting code.
