# Converge

Real-time collaborative team chat with an on-demand AI assistant (`@copilot`), built as a pnpm/Turbo monorepo with a NestJS backend and Next.js frontend.

---

## 1) Project Overview

Converge provides:

- **Human-to-human real-time chat** in rooms
- **Room membership and invitation flows**
- **Presence + typing indicators**
- **On-demand AI copilot** invoked from chat text via `@copilot`
- **Voice support**:
  - Speech-to-text (`/ai/voice/transcribe`)
  - Text-to-speech (`/ai/voice/speak`)

Core behavior:

1. Users authenticate (email/password or Google OAuth through Better Auth).
2. Users create rooms and invite members.
3. Messages are sent via Socket.IO and persisted in Postgres.
4. If a message contains `@copilot`, a background job is queued.
5. Worker generates an AI response using room context and posts it back as a normal chat message.

## Quick demo access (read this first)

- API Base URL: [https://converge-api.emmanuelisenah.com/api](https://converge-api.emmanuelisenah.com/api)
- Frontend URL: [https://converge.emmanuelisenah.com](https://converge.emmanuelisenah.com)
- Docs URL: [https://converge-api.emmanuelisenah.com/api/docs](https://converge-api.emmanuelisenah.com/api/docs)
- Queue dashboard URL: [https://converge-api.emmanuelisenah.com/api/queues](https://converge-api.emmanuelisenah.com/api/queues)

### Seeded accounts

| Name          | Email                 | Password      | Notes               |
| ------------- | --------------------- | ------------- | ------------------- |
| Alice Johnson | `alice@example.com`   | `password123` | Human test account  |
| Bob Smith     | `bob@example.com`     | `password123` | Human test account  |
| Charlie Brown | `charlie@example.com` | `password123` | Optional third user |

---

## 2) Architecture Overview

### High-level components

- **Frontend**: `apps/app` (Next.js 16 + React 19)
- **Backend API**: `apps/api` (NestJS 11, REST + Socket.IO)
- **Worker process**: `apps/api/src/worker.ts` (BullMQ consumers)
- **Database**: PostgreSQL (via Drizzle)
- **Cache/realtime state + queues**: Redis + BullMQ
- **Auth**: Better Auth (mounted under `/api/auth`)
- **AI**: OpenAI-compatible provider via `@repo/ai`

### Request/data flow

```text
Frontend (Next.js)
  ├─ REST calls -> Nest API (/api/*)
  └─ Socket.IO -> Nest Gateway namespace (/api/chat)

Nest API
  ├─ AuthGuard / Socket auth (Better Auth bearer session)
  ├─ Drizzle -> Postgres (chat + auth persistence)
  ├─ Presence/typing -> Redis
  └─ @copilot message -> BullMQ enqueue

Worker (Nest application context)
  ├─ consumes copilot queue
  ├─ builds context (messages + optional summary)
  ├─ calls OpenAI-compatible model
  ├─ inserts AI chat message in Postgres
  └─ queue-completed event emits websocket "message:new"
```

---

## 3) Tech Stack and Why

### Backend (primary)

- **NestJS 11**: modular DI, guards, gateway/worker support
- **Drizzle ORM**: typed SQL schema + query building
- **Better Auth**: email/password + Google + bearer sessions
- **Socket.IO**: room-based low-latency realtime events
- **Redis + BullMQ**: ephemeral state (presence/typing), async AI/email processing
- **OpenAI-compatible SDK (`ai` + `@ai-sdk/openai`)**: chat, transcription, speech generation
- **Zod**: DTO validation and contract schemas

### Frontend

- **Next.js 16 / React 19**: App Router UI
- **TanStack Query**: REST query caching
- **socket.io-client**: realtime event stream
- **Generated SDK (`@repo/sdk`)** from OpenAPI for typed API calls

### Infra

- **AWS CDK** (`infra/`) for backend infra provisioning
- Pipeline artifacts include **EC2 + ECR + CodeBuild + CodeDeploy + CodePipeline** definitions

---

## 4) Monorepo Structure

```text
apps/
  app/        Next.js frontend
  api/        NestJS API + Socket gateway + worker

packages/
  ai/             AI provider and model wrappers
  analytics/      PostHog/Vercel analytics glue
  auth/           Better Auth setup shared package
  database/       Drizzle schema, migrations, seed
  design-system/  shared UI components
  email/          React Email templates
  next-config/    shared Next.js/env config
  observability/  Sentry helpers
  sdk/            generated TypeScript API client
  typescript-config/

infra/
  AWS CDK stacks for backend and CI/CD resources
```

---

## 5) Backend (PRIMARY)

## 5.1 Modules and responsibilities

`apps/api/src/app.module.ts` imports:

- `AuthModule`: creates Better Auth instance and mounts auth in bootstrap
- `DrizzleModule`: database client provider
- `RedisModule`: Redis connectivity + throttler storage provider
- `BullMqModule`: BullMQ + BullBoard (`/queues` with basic auth)
- `EmailModule`: email queue producer/consumer
- `AiModule`: voice endpoints
- `ChatModule`: room APIs + websocket gateway + copilot queue integration

Worker-specific root module (`WorkerModule`) loads BullMQ + Email + Copilot processors without HTTP server.

## 5.2 Data model (tables/entities, relationships)

Defined in `packages/database/schemas/*`.

### Auth tables (Better Auth)

- `user`
- `session`
- `account`
- `verification`

### Chat tables

- `chat_room` (owner, metadata)
- `chat_member` (room-user membership, role: `owner|member`)
- `chat_message` (persisted messages; human + AI)
- `chat_invitation` (pending/accepted/declined/expired)
- `chat_message_summary` (AI context compaction summaries)

Special AI user constants:

- `COPILOT_USER_ID = "copilot"`
- `COPILOT_USER_EMAIL = "copilot@converge.local"`

When creating a room, backend automatically inserts:

1. creator as `owner`
2. copilot user as `member`

## 5.3 AuthN / AuthZ approach

### Authentication

- Better Auth mounted at `/{APP_PREFIX}/auth` (default `/api/auth`)
- Supports:
  - email/password (email verification required)
  - Google social provider
  - bearer token plugin

Frontend stores bearer token in cookie (`converge_access_token`) and sends:

- REST: `Authorization: Bearer <token>`
- WebSocket handshake: `auth.token`

### Authorization

- `AuthGuard` on protected HTTP controllers
- `SocketIOAuthGuard` + `SocketIOAuthService` for websocket session validation
- `ChatMembershipGuard` for room member endpoints
- `ChatOwnershipGuard` for owner-only operations (delete room, invite path protection by service + guards)

## 5.4 REST API overview and key endpoints

Base prefix defaults to `/api`.

### Chat endpoints

- `POST /api/chat/rooms` create room
- `GET /api/chat/rooms` list user rooms
- `GET /api/chat/rooms/:id` room details + members
- `GET /api/chat/rooms/:id/members`
- `GET /api/chat/rooms/:id/messages?limit=50&cursor=...`
- `GET /api/chat/rooms/:id/presence`
- `GET /api/chat/rooms/:id/typing`
- `POST /api/chat/rooms/:id/invite`
- `GET /api/chat/invitations`
- `POST /api/chat/invitations/:id/accept`
- `POST /api/chat/invitations/:id/decline`
- `POST /api/chat/rooms/:id/leave`
- `DELETE /api/chat/rooms/:id`

### Voice endpoints

- `POST /api/ai/voice/transcribe` (`multipart/form-data`, field: `audio`)
- `POST /api/ai/voice/speak` (`{ text, voice? }`)

### Quick curl examples

```bash
# Example: list rooms
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4448/api/chat/rooms"

# Example: create room
curl -X POST "http://localhost:4448/api/chat/rooms" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Backend Debug Room"}'
```

## 5.5 WebSocket events

Gateway namespace: **`/api/chat`**

### Client -> server

- `join_room` `{ roomId }`
- `leave_room` `{ roomId }`
- `send_message` `{ roomId, content }`
- `typing_start` `{ roomId }`
- `typing_stop` `{ roomId }`

### Server -> client

- `message:new`
- `user:presence`
- `user:typing`
- `error`

Example payloads:

```json
{
  "id": "msg_123",
  "roomId": "room_1",
  "senderId": "copilot",
  "senderName": "Copilot",
  "senderEmail": "copilot@converge.local",
  "content": "Here is what I found...",
  "createdAt": "2026-04-01T09:00:00.000Z"
}
```

```json
{ "userId": "user-1", "roomId": "room_1", "status": "online" }
```

```json
{ "userId": "user-2", "roomId": "room_1", "isTyping": true }
```

## 5.6 Presence + typing architecture

Stored in Redis:

- Presence keys:
  - `presence:user:{userId}` => set of socket IDs
  - `presence:room:{roomId}` => set of user IDs
  - `presence:rooms:{userId}` => rooms where user is present
- Typing key:
  - `typing:room:{roomId}` => hash(userId -> timestamp), TTL 3 seconds

On socket connect:

1. authenticate token
2. load user rooms from DB
3. auto-join socket.io rooms
4. mark user online in Redis

On disconnect:

1. remove socket from `presence:user:{userId}`
2. if no sockets remain, remove user from all presence room sets

## 5.7 AI copilot architecture

### Invocation mechanism

- Trigger is currently text pattern match in `ChatService.createMessage()`:
  - if message content contains `@copilot` (case-insensitive), enqueue job

Slash commands UI exists on frontend, but backend invocation is based on `@copilot` string matching.

### Queueing / worker model

- Queue: `copilot-queue`
- Job name: `copilot-message`
- Enqueued from API process
- Processed by `CopilotProcessor` in worker runtime
- On completion, `CopilotQueueEvents` fetches AI message from DB and emits `message:new` to room

### Context window handling and compaction

`CopilotAiService.buildContext(roomId)`:

- Pulls up to `MAX_MESSAGES_FETCH=500` recent messages
- Uses tokenizer (`tiktoken`) to stay within ~80% of model context
- If summary exists in `chat_message_summary`, prepends it as system-like prior context
- Can queue compaction job when threshold reached

Compaction path:

- Queue: `compaction-queue`
- Processor uses LLM summary prompt and stores summary rows in `chat_message_summary`

### Rate limits

Copilot-specific limiter (`CopilotRateLimit`):

- 5 invocations / user / 60s window
- If exceeded, job is delayed by one rate window (not rejected)

### Failure handling

- Processor catches AI errors
- On final retry failure path, inserts a fallback chat message from Copilot explaining error
- Queue failure/completion events are logged

## 5.8 Voice features (transcription + TTS)

`AiVoiceController`:

- `POST /ai/voice/transcribe`
  - Auth required
  - accepts audio file up to 10MB
  - allowed MIME: webm/mp4/mpeg/ogg/wav
  - model: whisper-1
- `POST /ai/voice/speak`
  - Auth required
  - input text max 4096 chars
  - voices: alloy/echo/fable/onyx/nova/shimmer
  - model: tts-1

## 5.9 Security considerations

- Endpoint access protected by guards; room-level authorization enforced
- CORS controlled by `APP_TRUSTED_ORIGINS`
- Better Auth secret + provider keys required via env
- BullBoard protected with basic auth (`admin:<BULL_BOARD_PASSWORD>`, default fallback `admin` if unset)
- Input validation with Zod for key API payloads and websocket payloads

## 5.10 Error handling strategy

- Uses Nest HTTP exceptions (`NotFoundException`, `ForbiddenException`, `UnauthorizedException`) in service/guards
- Validation errors return structured `400` payloads via `ZodValidationPipe`
- WebSocket invalid payloads emit `error` event
- Worker errors logged; final copilot failures surfaced as chat message

---

## 6) Frontend (concise but complete)

- Main chat UI is in `apps/app/src/modules/chat`
- Route layer (`src/app/chat/*`) stays thin and renders module views
- REST data fetched via generated SDK + TanStack Query
- Realtime integration via `ChatProvider` + `useChatSocket`
  - auto-joins selected room
  - listens for `message:new`, `user:presence`, `user:typing`
- Mention UX:
  - input shows mention menu and inserts `@copilot`
  - placeholder explicitly hints AI invocation
- Voice UX:
  - microphone button records browser audio and calls transcribe endpoint
  - message cards support play/stop TTS for any message

---

## 7) Infra / Operations

## 7.1 Required services

Minimum for local backend:

- PostgreSQL (or Aurora Data API mode)
- Redis
- SMTP server
- API process + Worker process

Optional tooling:

- BullBoard (`/queues`)
- Scalar docs (`/docs`, development mode)

## 7.2 Env vars overview

Primary reference: `apps/api/.env.example`.

Important groups:

- App: `APP_PORT`, `APP_PREFIX`, `APP_FRONTEND_URL`, `APP_TRUSTED_ORIGINS`
- DB: `DB_DRIVER`, `DB_URL` (or Aurora vars)
- Redis: `REDIS_URL`
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google OAuth keys
- AI: `OPENAI_API_KEY`, `OPENAI_BASE_URL`
- Email: `SMTP_URL`

Frontend requires:

- `NEXT_PUBLIC_API_BASE_URL`

## 7.3 Local development commands

From repo root:

```bash
pnpm install
pnpm dev
```

Focused commands:

```bash
# API HTTP server
pnpm --filter @repo/api dev

# Worker process (copilot/email jobs)
pnpm --filter @repo/api worker:dev

# Frontend
pnpm --filter @repo/app dev

# Bring local API redis stack (apps/api/docker-compose.yml)
pnpm --filter @repo/api dx
```

## 7.4 Build/test/lint/typecheck

From root:

```bash
pnpm build
pnpm test
pnpm lint
pnpm lint:fix
pnpm typecheck
```

## 7.5 Queue/worker running model

- API process enqueues jobs
- Worker process consumes jobs
- In production template, API and Worker run as separate containers

## 7.6 API docs location

- Runtime docs UI (development only): `http://localhost:<APP_PORT>/docs`
- Generated OpenAPI snapshot: `packages/sdk/openapi.json`

---

## 8) API Documentation Section

## 8.1 How to authenticate

Authentication is handled by Better Auth under `/api/auth/*`.

Practical options:

1. Sign in via frontend (`/auth/sign-in`) and extract bearer token cookie (`converge_access_token`).
2. Use Better Auth endpoints from `/docs` “Auth” schema and capture `set-auth-token` header.

Then send:

```http
Authorization: Bearer <TOKEN>
```

## 8.2 How to test REST quickly

```bash
TOKEN="<YOUR_TOKEN>"
BASE="http://localhost:4448/api"

curl -H "Authorization: Bearer $TOKEN" "$BASE/chat/rooms"
```

## 8.3 How to test WebSocket manually

Provided helper script:

```bash
node apps/app/test-socket.mjs http://localhost:4448 <TOKEN> <OPTIONAL_ROOM_ID>
```

It connects to `http://localhost:4448/api/chat` and prints all events.

## 8.4 How to invoke AI assistant

Send a normal chat message containing `@copilot`:

```text
@copilot what are common causes of websocket reconnect loops in production?
```

Backend behavior:

1. User message is persisted.
2. Copilot job enqueued.
3. Worker generates response from context.
4. AI reply appears as `message:new` with sender `copilot`.

---

## 9) Testing & Quality

- Unit-style tests exist for `ChatService` (`chat.service.spec.ts`)
- Basic e2e smoke test exists for root endpoint (`app.e2e-spec.ts`)
- Validation: Zod schemas for REST payloads and WS event payloads
- Lint/format/typecheck/test pipelines are wired in Turbo and package scripts

---

## 10) Assumptions, tradeoffs, known limitations

### Assumptions

- Copilot is represented as a synthetic user (`id="copilot"`).
- AI invocation requires explicit mention text (`@copilot`) in message content.
- Redis is available for both realtime state and queue backend.

### Tradeoffs

- **Simple trigger model** (`@copilot` string scan) keeps UX explicit, but is less flexible than command parsing.
- **Asynchronous AI responses** (queue + worker) improves responsiveness and resilience, but adds operational complexity.
- **REST + Socket split** keeps APIs clear, but requires careful state merge on client.

### Known limitations (current implementation)

- `getMessages` accepts `cursor` but currently does not apply cursor filtering in DB query.
- Frontend unknown senders render as “Unknown”; copilot identity enrichment is emitted from server event rather than room member data.
- Global `RateLimitModule` exists but is not imported in `AppModule`; only copilot-specific Redis limiter is effectively active.
- Compaction processor currently only loads messages when a prior summary exists, which can prevent first summary creation path.
- Auth token is stored in a client-readable cookie (not httpOnly), trading simplicity for weaker token storage hardening.

---

## 11) What to improve with more time

1. Implement true cursor pagination in message history.
2. Fix compaction bootstrap path and add automated tests around summary lifecycle.
3. Enable and tune global request throttling by wiring `RateLimitModule`.
4. Harden auth token handling (httpOnly strategy, CSRF posture review).
5. Add integration tests for websocket flows (presence/typing/reconnect).
6. Add robust copilot observability (latency metrics, queue depth, token usage).
7. Expand API error model consistency (structured error envelope everywhere).
