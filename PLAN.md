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
- `bun run check` and full Prettier/ESLint lint are green, with generated and local tooling excluded.
- `/public/` pages render anonymously again for logged-in viewers.

## Todo

- [ ] Define explicit SVG upload behavior ([#186](https://github.com/ConGustoAI/chat/issues/186)).
- [ ] Decide which untracked workspace files belong in version control
      (`CLAUDE.md`, `.ignore`, `.vscode/settings.json`, `public_key.pem`, `test/mock-server/`,
      `test/gemini-flash-thinking/`).
