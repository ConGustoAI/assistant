# Plan

## Direction

- Replace daisyUI with shadcn-svelte. Tailwind 4 first, then components route by route, so the app stays
  usable throughout - daisyUI 5 and shadcn coexist until the last daisyUI class is gone.
- Keep the chat pipeline provider-agnostic.
- Media processing must be bounded, explicit, and safe before upload or model submission.
- Keep client state and persisted DB records aligned.
- Prefer small fixes over new infrastructure.

## Done

- Media pipeline hardening: signature-based type detection, bounded video/PDF processing with explicit
  errors, failure surfaced in previews/editor, failed media kept out of uploads and submissions, existing
  message attachments preserved through transient failures.
- Filetype classifier covered by `bun test`; Node 22+ required and documented for `file-type` 22.
- `/public/` pages render anonymously again for logged-in viewers.
- Tailwind 4 + daisyUI 5. CSS-first config, `@tailwindcss/postcss`, autoprefixer dropped. Fallout fixed:
  daisyUI 5 modifier classes need the base class, `.navbar` no longer flexes plain children,
  `modal-box` outside a `<dialog class="modal">` is invisible, `tabs-lifted`/`label-text` are gone.
- `bun run check`, lint, `bun test`, and `bunx vite build` all green on Tailwind 4.

## Todo

### shadcn-svelte port

- [x] `shadcn-svelte init` with the vega preset, its CSS variables reconciled against daisyUI's,
      and the theme sources unified. Login buttons ported as the first real component.
- [ ] Port route by route, deleting daisyUI classes as each component moves. Baseline screenshots for
      comparison live in `.claude/scratch/baseline/`.
      Suggested order: settings pages (simple forms) -> sidebar/history -> chat header -> chat input
      -> media editor (heaviest).
- [ ] Drop daisyUI, `tailwind.config.js`, and the `@config` shim once nothing references them.
- [ ] Fold in the dead-class cleanup while porting: `input-bordered`, `textarea-bordered`,
      `select-bordered` compile to nothing under daisyUI 5.
- [ ] Decide what light mode should be. Today it is defined but unreachable without the settings toggle,
      and `mode-watcher` (`.dark` class) and daisyUI (`data-theme`) disagree about who owns the theme.

### Known cosmetic deltas from the daisyUI 5 bump

- [ ] Inputs and textareas draw a full-strength `base-content` border instead of the old muted one.
      Most visible on the chat input. Goes away when those become shadcn components.
- [ ] Checkboxes are rounded rather than square (`--radius-selector` default).

### Unrelated

- [ ] Define explicit SVG upload behavior ([#186](https://github.com/ConGustoAI/chat/issues/186)).
- [ ] Decide which untracked workspace files belong in version control
      (`CLAUDE.md`, `.ignore`, `.vscode/settings.json`, `public_key.pem`, `test/mock-server/`,
      `test/gemini-flash-thinking/`).
