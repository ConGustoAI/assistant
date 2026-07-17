# Plan

## Direction

- Keep chat pipeline provider-agnostic.
- Make media processing bounded, explicit, and safe before upload/model submission.
- Keep client state and persisted DB records aligned.
- Prefer small fixes over new infrastructure.

## Current

- [x] Detect supported file types from binary signatures and text content.
- [x] Reject recognized unsupported binary signatures before text fallbacks.
- [x] Preserve detected MIME type through media creation and upload.
- [x] Reject corrupt or stalled video metadata, frame, and thumbnail processing.
- [x] Show placeholders for video formats the browser cannot preview while preserving direct-file upload.
- [x] Surface media processing failures in previews and editor.
- [x] Wait for media processing and prevent failed new media from being uploaded or submitted.
- [x] Bound upload waits and keep PDF processing counters balanced on failure.
- [x] Preserve existing message attachments through transient client processing failures.
- [x] Return fully encoded video frames instead of nested frame promises.
- [x] Capture initial video frames without relying on a no-op seek event.
- [x] Keep repeated audio synchronization idempotent and close audio contexts.
- [x] Cover MIME detection with Bun tests and browser-check valid/corrupt video fixtures.
- [x] Require and document Node.js 22+ for `file-type` 22.
- [x] Keep `bun run check` green.
- [x] Keep full formatting and ESLint checks green.
- [x] Exclude generated/local tooling from lint while keeping docs and useful agent state searchable.

## Todo

- [ ] Define explicit SVG upload behavior ([#186](https://github.com/ConGustoAI/chat/issues/186)).
- [x] Repair Prettier/Svelte plugin compatibility so full lint can run.
- [x] Remove existing lint violations in conversation/media components.
- [ ] Decide which unrelated untracked workspace files belong in version control.
