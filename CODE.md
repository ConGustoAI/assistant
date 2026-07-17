# Codebase

## Stack

- SvelteKit 2 application using Svelte 5 runes and TypeScript.
- Bun is package manager and script runner.
- Node.js 22+ is supported for Node-based installs and deployment.
- `@sveltejs/adapter-node` builds the production server.
- PostgreSQL persistence through Drizzle ORM.
- Vercel AI SDK provides browser-side model streaming for OpenAI, Anthropic, and Google providers.
- Tailwind CSS and daisyUI provide shared styling.

## Application state

`src/lib/appstate.svelte.ts` exports global reactive state `A`.

It holds current user, conversation, assistants, models, providers, API keys, media editor state, and chat/media activity counters. Components and client utilities mutate this state directly.

## Chat flow

`src/lib/components/conversation/ChatInput.svelte` creates user and assistant messages, attaches active media not already included in prior messages, and invokes the supplied conversation submit function.

`src/lib/utils/chat.svelte.ts`:

- resolves assistant, model, provider, and API key;
- uploads conversation media;
- converts persisted messages and media to AI SDK core messages;
- streams the model response;
- updates token and cost accounting;
- persists messages, prompts, API-key usage, and conversation state.

`src/lib/components/conversation/ChatMessage.svelte` handles message rendering, editing, regeneration, persistence, and per-message media.

## Media flow

`src/lib/utils/filetype.ts` classifies images, video, audio, text, and PDF files. Binary signatures take precedence over browser MIME hints. Detection returns both application media category and MIME type so uploads preserve detected content type.

`src/lib/utils/media_utils.svelte.ts` creates media records and synchronizes browser files, object URLs, metadata, derived content, and thumbnails. `syncMedia` records failures in transient `MediaInterface.processingError`; callers can request rethrowing at the chat boundary.

Video processing in `src/lib/utils/video.svelte.ts` has bounded waits and explicit errors for:

- metadata loading;
- frame extraction;
- thumbnail generation;
- canvas encoding.

Detected video formats unsupported by the browser video element use a neutral placeholder. They can still be uploaded as original files when the selected assistant supports direct video; frame extraction remains unavailable.

Failed media is shown in previews/editor, excluded from new uploads and message associations, and blocks submission while it is a new active attachment. Existing message associations survive transient processing failures. Uploads wait for media processing to finish. Audio decoding is skipped once duration is known, and temporary `AudioContext` instances are closed.

Chat submission accepts text, media, or both once active media processing completes successfully.

Files are persisted through `src/lib/utils/files_client.svelte.ts` and media/file API routes. Google-supported attachments may additionally use the Gemini Files API.

## Persistence

Drizzle schemas live in `src/lib/db/schema/`. DB access helpers live in `src/lib/db/utils/`; client API wrappers live in `src/lib/api/`; SvelteKit API routes live in `src/routes/api/`.

Conversations contain ordered messages and media. Messages persist media IDs. Media references original and optional thumbnail file records; derived browser objects remain client-only.

## Validation

- `bun test` runs Bun tests. Current classifier tests use the valid video fixture under `test/`; its corrupt counterpart supports browser processing checks.
- `bun run lint` checks repository formatting and ESLint rules. Generated docs, local agent state, and large test fixtures are excluded from lint; `.rgignore` keeps Lovely Docs and useful `.pi` files searchable.
- `bun run check` runs SvelteKit sync and `svelte-check`.
- `bunx vite build` performs a production build without running DB migration/seed scripts.
- Full `bun run build` also migrates and seeds the configured database.

Prettier uses the Svelte 5-compatible Svelte and Tailwind plugins configured in `.prettierrc`.
Rendered Markdown is sanitized before syntax highlighting, KaTeX, and other trusted AST transforms.
