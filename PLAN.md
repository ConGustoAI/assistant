# Plan

## Direction

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
- daisyUI replaced by shadcn-svelte on Tailwind 4, with the pre-migration look preserved:
  palette, control sizes and type scale were matched against the original running side by side, and
  daisyUI plus `tailwind.config.js` are gone.
- Port fallout swept up: bits-ui checkboxes save again (they are buttons, so `onchange` never fired),
  utilities Tailwind 4 dropped are gone (`bg-opacity-*` had turned the media overlays opaque), and the
  daisyUI class names left with no CSS behind them are replaced. Repeated class strings became
  `.field`/`.kbd`/`.callout`, and only `@lucide/svelte` ships.
- `app.css` consolidated: one palette block per theme, dead shadcn tokens (chart, sidebar) and dead
  daisyUI rules dropped, and `.media-progress` moved into `@layer components` so the call sites'
  `h-*`/`w-*` win again - unlayered it had been forcing every progress bar to 0.5rem.

## Todo

### Follow-ups from the port

- [ ] Rework the provider/model/assistant grids: their fixed column widths overflow even a 2K
      display, so Hide and Delete fall off the right edge. Pre-existing, not caused by the port.
- [ ] Decide what light mode should be. It is defined but unreachable: `system` is migrated to dark
      because the light palette was never finished.
- [ ] Revisit the vendored component tweaks (sizes, square corners, checkbox size) if shadcn's own
      scale turns out to be preferable to the daisyUI-era one.
- [ ] `.claude/orig` holds a worktree of `4c25f11` for side-by-side comparison on port 5184.
      Remove it when it stops being useful: `git worktree remove .claude/orig`.

### Unrelated

- [ ] Define explicit SVG upload behavior ([#186](https://github.com/ConGustoAI/chat/issues/186)).
- [ ] Decide which untracked workspace files belong in version control
      (`.ignore`, `.vscode/settings.json`, `public_key.pem`, `test/mock-server/`,
      `test/gemini-flash-thinking/`).
