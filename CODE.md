# Codebase

## Stack

- SvelteKit 2 app, Svelte 5 runes, TypeScript. Bun is package manager and script runner; Node 22+ supported.
- `@sveltejs/adapter-node` builds the production server. PostgreSQL via Drizzle ORM.
- Vercel AI SDK streams models **from the browser** with the user's own API keys (OpenAI, Anthropic, Google).
  The server stores data and hands out file URLs; it never proxies model traffic.
- Tailwind CSS + daisyUI.
- Domain types are ambient globals in `src/app.d.ts` (`*Interface`), never imported.
  One interface covers DB columns plus client-only fields; comments mark what is not persisted.

## Application state

`src/lib/appstate.svelte.ts` exports `A`, a single global `$state` object: user, conversations, current
conversation, assistants, models, providers, API keys, hidden items, media editor target, UI flags, and
chat/media activity counters. Components and client utils mutate it directly - no stores.

## Chat flow

`ChatInput.svelte` creates the user + assistant message pair and attaches active media not already carried
by earlier messages, then calls the supplied submit function.

`src/lib/utils/chat.svelte.ts` (client-side) resolves assistant -> model -> provider -> API key, uploads
conversation media, converts persisted messages and media into AI SDK core messages, streams the response,
then updates accounting and persists.

Non-obvious:

- Assistant `apiKeyID === defaultsUUID` means "first available key for this provider".
- The last two messages must be user then assistant; non-empty assistant text is a prefill and requires
  assistant support.
- System prompts are content-addressed: `promptHash` is the row id in the prompts table, messages keep `promptID`.
- Accounting flows per-message tokens/cost -> conversation totals -> API key `usage`/`remainder`.
- Stream errors are stored on the message and pushed through a synthetic `onFinish` so accounting and
  persistence still run. On abort the client persists conversation and messages itself, since the server
  side never completed.

`ChatMessage.svelte` handles rendering, editing, regeneration, persistence, and per-message media.
`MarkdownMessage.svelte` runs remark -> rehype; sanitization happens before highlight, KaTeX, and the local
AST mods so their generated markup survives.

## Media flow

`src/lib/utils/filetype.ts` classifies image, video, audio, text, and PDF. Binary signatures beat browser
MIME hints, recognized-but-unsupported binaries are rejected before any text fallback, and detection returns
both media category and MIME type so uploads keep the detected type.

`src/lib/utils/media_utils.svelte.ts` creates media records and syncs browser files, object URLs, metadata,
derived content, and thumbnails. `syncMedia` records failures in transient `MediaInterface.processingError`;
callers can ask it to rethrow at the chat boundary.

`video.svelte.ts` and `pdf.svelte.ts` derive frames/pages, metadata, and thumbnails. All video steps have
bounded waits and explicit errors. Video formats the browser cannot decode get a neutral placeholder and can
still be uploaded as original files when the assistant supports direct video; frame extraction stays unavailable.

Failed media shows in previews/editor, is excluded from uploads and message associations, and blocks
submission while it is a new active attachment. Existing message associations survive transient failures.
Uploads wait up to one minute for processing. Submission accepts text, media, or both.

## Files and storage

`files_server.ts` talks to S3-compatible storage under `upload/<fileID>` and `thumbnail/<fileID>` keys.
Uploads always use an S3 presigned PUT; download URLs are CloudFront-signed, S3-presigned, or direct
depending on `FILES_URL_TYPE`.

`files_client.svelte.ts` upserts the file row to get an upload URL, PUTs via XHR for progress, then upserts
again with the final status.

`googleUpload.svelte.ts` additionally pushes files to the Gemini Files API for Google providers, re-uploading
when the reference is missing or expires within the hour.

## Persistence and API

Drizzle schemas in `src/lib/db/schema/`, session-scoped access helpers in `src/lib/db/utils/`, SvelteKit
routes in `src/routes/api/`, thin client wrappers in `src/lib/api/`.

- User `00000000-0000-0000-0000-000000000000` (`defaultsUUID`) owns the default assistants, models, and
  providers everyone sees; `hidden_items` hides any of them per user by item id.
- Conversations own ordered messages and media. Messages persist media ids; media references an original and
  optional thumbnail file row. Derived browser objects (frames, PDF pages, object URLs) stay client-only.
- Search is `ILIKE` over the user's own message text and returns conversation ids.

## Auth and public pages

Hand-rolled sessions: random token in the `congusto_session` cookie, its SHA-256 is the session row id,
30-day expiry refreshed when under 15 days remain. Login is OAuth only (GitHub, Google via `arctic`);
`login/pwreset` and `login/verify` are inert leftovers from the Supabase era.

`hooks.server.ts` validates the cookie into `locals.session` and injects OG/Twitter meta for `/public/<uuid>`
pages. `DEV_LOGIN_USER` mints a fake admin session for local development.

## Validation

- `bun test` runs the filetype classifier tests against `test/corrupt-video-source.mp4` (valid) and its
  corrupt counterpart `test/corrupt-video-broken.mp4`, used for browser processing checks.
- `bun run check` runs SvelteKit sync and `svelte-check`.
- `bun run lint` runs Prettier and ESLint. Generated docs, local agent state, and large fixtures are excluded;
  `.rgignore` keeps Lovely Docs and useful `.pi` files searchable.
- `bunx vite build` builds without DB scripts. Full `bun run build` also copies the pdf.js worker into
  `static/`, migrates, and seeds the configured database.
