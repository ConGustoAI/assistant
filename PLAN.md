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

## Todo

### Follow-ups from the port

- [ ] Media: image upload and the editor dialog are verified. PDF and video still are not - their
      tabs, frame extraction and page rendering have only been checked against the compiled CSS.
      Drive them the same way: open the upload panel, then set files on the hidden `#fileInput`
      (`agent-browser upload '#fileInput' <path>`).
- [ ] Rework the provider/model/assistant grids: their fixed column widths overflow even a 2K
      display, so Hide and Delete fall off the right edge. Pre-existing, not caused by the port.
- [ ] Decide what light mode should be. It is defined but unreachable: `system` is migrated to dark
      because the light palette was never finished.
- [ ] Revisit the vendored component tweaks (sizes, square corners, checkbox size) if shadcn's own
      scale turns out to be preferable to the daisyUI-era one.
- [ ] `.claude/orig` holds a worktree of `4c25f11` for side-by-side comparison on port 5174.
      Remove it when it stops being useful: `git worktree remove .claude/orig`.

### Unrelated

- [ ] Define explicit SVG upload behavior ([#186](https://github.com/ConGustoAI/chat/issues/186)).
- [ ] Decide which untracked workspace files belong in version control
      (`CLAUDE.md`, `.ignore`, `.vscode/settings.json`, `public_key.pem`, `test/mock-server/`,
      `test/gemini-flash-thinking/`).
