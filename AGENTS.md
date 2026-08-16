# AGENTS.md

Guidelines for AI coding agents working in the PageZERO CLI (`pagezero` on npm).

Bun CLI that bootstraps and upgrades PageZERO projects. Users run `bunx pagezero@latest init`.

**Stack**: Bun, TypeScript, Commander, `@inquirer/prompts`, Oxlint, Oxfmt

## Layout

```
├── bin/pagezero.ts            # Entrypoint (`#!/usr/bin/env bun`) — register commands here
├── src/
│   ├── commands/
│   │   ├── init.ts            # Clone starter, install, setup, fresh git repo
│   │   └── upgrade.ts         # rsync latest starter over the current project
│   └── utils.ts               # `spinner()` helper
├── index.ts                   # Unused leftover — do not treat as the CLI entry
└── .github/workflows/
    ├── test.yml               # check + types on push/PR
    └── publish.yml            # npm publish on GitHub release
```

`package.json` `bin` points at `./bin/pagezero.ts`. Published files: `bin/` and `src/`.

## Hard rules

- `import type` is required (`verbatimModuleSyntax`). Prefer `interface` for object shapes; export types next to implementations.
- Entrypoint is `bin/pagezero.ts`, not root `index.ts`.
- Bun only (`engines.bun >= 1.3.1`). Do not add npm/yarn install or run paths.
- `init` clones `https://github.com/pagezero-dev/pagezero.git`. Do not switch the source repo unless asked.
- `upgrade` requires `rsync` and a `wrangler.json` in the current directory (must be run inside a PageZERO project). It overwrites stack files; keep the warning prompt.
- Interactive prompts via `@inquirer/prompts`. Long-running work uses `spinner()` from `src/utils.ts`.
- Do not publish from a local machine. Publishing is `.github/workflows/publish.yml` on a GitHub release (prerelease → `npm publish --tag next`).

## How we do work

### New command

1. Add `src/commands/<name>.ts` exporting an async function.
2. Register it in `bin/pagezero.ts` with `program.command(...)`.
3. Keep user-facing copy short. Use `chalk`, `log-symbols`, and `boxen` the way `init` / `upgrade` already do.

```typescript
// bin/pagezero.ts
program.command("init").description("initialize a new project").action(init)
program.command("upgrade").description("upgrade pagezero stack").action(upgrade)
```

`init` flow: prompt for project name → shallow clone → `bun install` → `bun run setup` → `bun run setup:wrangler` → replace `.git` with a fresh `main` commit.

`upgrade` flow: confirm → require `rsync` and `wrangler.json` → clone latest starter into `pagezero-latest` → `rsync -a --delete` (excludes `.git`, `node_modules`, `pagezero-latest`) → remove the clone.

## Scripts

```bash
bun run check        # oxlint, oxfmt --check
bun run check:fix    # oxlint --fix + oxfmt
bun run check:types  # tsc
```

CI is `.github/workflows/test.yml` (check → types). Releases publish via `.github/workflows/publish.yml`.

## Environment

Bun >= 1.3. No `.env`. Local run: `bun bin/pagezero.ts init`.
