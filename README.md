# HeartWave

> Real-time collaborative listening rooms — synchronized playback, shared queues, and live chat.


> [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Clerk](https://img.shields.io/badge/Clerk-auth-6C47FF)](https://clerk.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/status-active--development-orange)](.)

---

# Screenshots

| Preview | Description |
|---|---|
| <img width="1919" height="857" alt="image" src="https://github.com/user-attachments/assets/22f65873-fdce-473c-9316-867277a35a46" /> | Landing Page |
| <img width="467" height="325" alt="image" src="https://github.com/user-attachments/assets/cf3b6f90-3cd8-4829-98d6-953959bd6219" /> | Room Lobby |
| <img width="1919" height="863" alt="image" src="https://github.com/user-attachments/assets/30255605-17e3-473b-90da-5c390a392ade" /> | Active Room — Player + Sidebar |
| <img width="319" height="518" alt="image" src="https://github.com/user-attachments/assets/633fc0c0-995a-46ea-aa9b-198bfc4cde5f" /> | Queue Management |
| <img width="251" height="279" alt="image" src="https://github.com/user-attachments/assets/40f26a67-fb52-4762-bd07-030802c78cd1" /> | Upgrade Modal |

---

# About The Project

HeartWave is a full-stack real-time platform that allows multiple users to watch and listen to YouTube videos in synchronized sessions. A host creates a room, shares a six-character code, and every participant hears the same audio at the same moment — regardless of where they are.

The engineering focus of this project was the synchronization problem: how do you keep playback state consistent across multiple clients over an unreliable network, without constant jarring seeks?

The solution uses:

- A server-authoritative state model
- A threshold-based drift correction algorithm on the client
- A server-side dead-reckoning heartbeat that estimates playback position between explicit state updates

Beyond synchronization, the project covers a meaningful cross-section of production engineering concerns:

- JWT-based authentication via Clerk
- Stripe subscription billing with webhook signature verification
- MongoDB persistence
- Zustand state management
- A WebRTC scaffolding layer for future voice/video

This is not a production deployment. It is a production-inspired prototype built to explore:

- Real-time systems design
- Full-stack architecture
- SaaS monetization patterns

---


# Project Type

| Attribute | Value |
|---|---|
| Category | Real-Time Full-Stack Web Application |
| Architecture | Client-Server with persistent WebSocket |
| Backend Pattern | Event-driven (Socket.io rooms) + REST API |
| Auth Model | Delegated (Clerk JWT) |
| Billing | Stripe subscriptions with webhook lifecycle |
| State | Server-authoritative, in-memory (prototype scope) |

---

# Project Status

## Active Development — Prototype

Core functionality is working:

- Room creation
- Synchronized playback
- Collaborative queue
- Chat
- Stripe billing

Several known limitations exist around scalability and a documented playback sync bug.

See:

- Known Issues
- Technical Debt

---

# Why I Built This

Most collaborative tools focus on text or video calls. Music listening is a fundamentally different synchronization problem — millisecond-level timing matters in a way it doesn't for shared documents.

I wanted to explore:

- How server-authoritative state models work in practice for media applications
- How to implement drift correction without causing constant disruptive seeks
- How the full Stripe subscription lifecycle works end-to-end
- How to compose a real-time system from WebSocket state and REST persistence without conflicting sources of truth

The project deliberately covers a wider stack surface than most tutorials:

- Auth
- Payments
- Real-time sync
- Persistent storage

Interview conversations go deeper when every layer was designed and debugged personally.

---

# Features

## Core Features

- Synchronized playback
- Room system with 6-character invite codes
- Collaborative queue
- Auto-advance playback
- Real-time chat
- Live member presence tracking

---

## Engineering Features

- Drift correction with 2-second dead-band threshold
- Server-side dead-reckoning heartbeat
- Reconnection handling
- Room lifecycle cleanup
- Debounced YouTube search

---

## Security Features

- JWT authentication via Clerk
- Stripe webhook HMAC verification
- Raw body preservation for webhook verification
- Host-only playback control validation

---

## Payment Features

- Stripe Checkout integration
- Subscription lifecycle handling
- Premium state synchronization
- Subscription retrieval and cancellation

---

## Developer Experience

- Full TypeScript frontend
- Zustand domain-separated stores
- Socket.io singleton architecture
- ES module Nodemon workflow

---

# Tech Stack

## Frontend

| Technology | Version | Role | Why |
|---|---|---|---|
| React | 19 | UI framework | Concurrent rendering support |
| TypeScript | 6.0 | Type safety | Compile-time validation |
| Vite | 8.0 | Build tool | Native ESM + fast HMR |
| Tailwind CSS | 4.2 | Styling | Utility-first workflow |
| Zustand | 5.0 | State management | Minimal boilerplate |
| Socket.io-client | 4.8 | WebSocket client | Reconnection + room abstractions |
| React YouTube | 10.x | YouTube wrapper | IFrame lifecycle abstraction |
| Clerk React | 5.x | Authentication | Managed auth flows |
| Lucide React | 1.x | Icons | Tree-shakeable SVGs |

---

## Backend

| Technology | Version | Role | Why |
|---|---|---|---|
| Node.js | 20+ | Runtime | Non-blocking I/O |
| Express | 5.x | HTTP framework | Mature ecosystem |
| Socket.io | 4.8 | WebSocket server | Room abstractions |
| Mongoose | 9.5 | MongoDB ODM | Schema modeling |
| Clerk SDK Node | 4.x | JWT verification | Cached JWKS auth |
| Stripe | 22.x | Payments | Subscription lifecycle |
| dotenv | 17.x | Environment config | Standardized config |

---

## Database

| Technology | Role | Notes |
|---|---|---|
| MongoDB | Persistence | User + room metadata |
| In-memory JS Objects | Real-time room state | Prototype-only scope |

---

## External APIs

| API | Usage | Constraint |
|---|---|---|
| YouTube Data API v3 | Video search | 10,000 quota/day |
| YouTube IFrame API | Playback | Browser-side only |
| Clerk API | Authentication | Cached after creation |
| Stripe API | Billing | Webhook required |

---

# Architecture

## High-Level System Design

```text
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│                                                             │
│ React SPA (Vite)                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐       │
│ │ Player   │ │ Queue    │ │ Chat     │ │ Search     │       │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘       │
│      │             │             │             │            │
│      └─────────────┴──── Zustand Stores ──────┘             │
│                         │           │                       │
│             Socket.io-client   REST fetch (JWT)             │
└─────────────────────────┼───────────┼───────────────────────┘
                          │ WSS       │ HTTPS
                          ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                      NODE.JS SERVER                         │
│                                                             │
│ Express 5                                                   │
│                                                             │
│ REST Routes              Socket.io                          │
│ /api/user/me             io.on("connection")                │
│ /api/room/create         join_room                          │
│ /api/room/join           play / pause / seek                │
│ /api/payment/*           add_to_queue                       │
│ /api/payment/webhook     send_message                       │
│                           song_ended                        │
│                           webrtc_*                          │
│                                                             │
│ In-Memory State                                             │
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐        │
│ │ roomUsers   │ │ roomState    │ │ roomQueue       │        │
│ └─────────────┘ └──────────────┘ └─────────────────┘        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │     MongoDB        │
                     │ Users | Rooms      │
                     └────────────────────┘
```

---

# Synchronization Flow

```text
Host clicks Play
      │
      ▼
socket.emit("play")
      │
      ▼
Server validates + updates roomState
      │
      ▼
io.to(room).emit("sync_state")
      │
      ▼
Clients compare drift
      │
      ├── if drift > 2s → seek
      └── otherwise continue playback
```

---

# Folder Structure

```text
heartwave/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── socket.ts
│   │   ├── store.ts
│   │   └── index.css
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

# Installation

## Prerequisites

- Node.js 20+
- MongoDB Atlas account
- Clerk account
- Stripe account
- Google Cloud Console project

---

# Clone Repository

```bash
git clone https://github.com/Heramb1221/heartwave

cd heartwave
```

---

# Install Dependencies

## Backend

```bash
cd backend

npm install
```

---

## Frontend

```bash
cd frontend

npm install
```

---

# Environment Variables

## Backend — `.env`

```env
PORT=5000

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/heartwave

CLERK_SECRET_KEY=sk_test_...

STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_ID=price_...

CLIENT_URL=http://localhost:5173
```

---

## Frontend — `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

VITE_BACKEND_URL=http://localhost:5000

VITE_YOUTUBE_API_KEY=AIza...
```

---

# Security Note

The YouTube API key is client-side.

Mitigation:

- Restrict key to your domain
- Proxy requests through backend

---

# Run Development Servers

## Backend

```bash
cd backend

npm run dev
```

---

## Frontend

```bash
cd frontend

npm run dev
```

---

# Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

---

# Stripe Webhook Local Testing

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

---

# Usage

## Creating a Room

1. Sign in
2. Create room
3. Share room code
4. Add songs to queue

---

## Joining a Room

1. Sign in
2. Enter room code
3. Playback synchronizes automatically

---

## Playback Controls

The host controls:

- Play
- Pause
- Seek
- Sync

---

## Queue Management

Any member can:

- Search songs
- Add to queue

The host can:

- Play specific songs
- Control playback order

---

# API Documentation

## Authentication

All protected routes require:

```text
Authorization: Bearer <clerk_session_token>
```

---

## Endpoints

### GET `/api/user/me`

Returns authenticated user.

---

### POST `/api/room/create`

Creates room.

---

### POST `/api/room/join`

Joins room.

---

### POST `/api/payment/create-checkout-session`

Creates Stripe checkout session.

---

### GET `/api/payment/subscription`

Returns subscription state.

---

### POST `/api/payment/cancel-subscription`

Cancels subscription.

---

# Socket.io Events

## Client → Server

| Event | Description |
|---|---|
| join_room | Join room |
| leave_room | Leave room |
| play | Play video |
| pause | Pause video |
| seek | Seek playback |
| add_to_queue | Add song |
| play_from_queue | Play queued item |
| song_ended | Advance queue |
| send_message | Chat message |

---

## Server → Client

| Event | Description |
|---|---|
| sync_state | Playback state |
| queue_updated | Queue update |
| room_users | Presence update |
| receive_message | Chat message |
| user_joined | Join notification |
| error | Server error |

---

# Performance Considerations

## Implemented Optimizations

- 2-second drift dead-band
- 250ms sync debounce
- 30s heartbeat estimation
- Zustand selector subscriptions
- 350ms YouTube search debounce

---

## Known Bottlenecks

- Progress bar re-render every second
- Sequential heartbeat iteration
- Unbounded chat message accumulation

---

# Security Considerations

## Implemented

- JWT verification
- Stripe webhook verification
- Raw body preservation
- Host-only controls

---

## Known Limitations

- Client-side YouTube API key
- Socket privilege forgery risk
- Missing schema validation
- No rate limiting

---

# Tradeoffs & Limitations

| Decision | Tradeoff | Rationale |
|---|---|---|
| In-memory room state | No persistence | Simpler prototype |
| Clerk auth | Vendor lock-in | Faster secure auth |
| MongoDB | Weak relational support | Flexible schema |
| Client-side YouTube search | Exposed API key | Simpler architecture |
| Single-server deployment | No horizontal scaling | MVP scope |

---

# Known Issues

| Issue | Severity | Description |
|---|---|---|
| Playback sync bug | High | Non-host clients may not sync reliably |
| Room code collision | Low | No collision check |
| User creation race condition | Medium | Duplicate create risk |
| Fake WebRTC UI | Low | Placeholder only |
| Chat memory growth | Low | No pagination |

---

# Challenges Faced

## Synchronization Without Constant Seeking

Naive synchronization caused constant visual jumps. The solution was a dead-band controller that only seeks when drift exceeds 2 seconds.

---

## Stripe Webhook Raw Body

Express JSON parsing altered request bytes and broke Stripe HMAC verification. Selective middleware exclusion solved this.

---

## YouTube IFrame Timing

`playerRef.current` needed to survive React re-renders and async callback cycles.

---

## Clerk + Express 5 Compatibility

Auth errors required normalization to consistently return HTTP 401 responses.

---

## Socket.io Reconnection State

Reconnections generate new socket IDs. Existing users had to be re-associated using Clerk IDs.

---

# What I Learned

- Distributed state synchronization
- Server-authoritative architecture
- Webhook idempotency
- HMAC raw body requirements
- Prototype vs scalability tradeoffs
- Vendor-managed authentication benefits

---

# Future Scope

## Near-Term

- Backend YouTube proxy
- Redis room state
- Zod validation
- Rate limiting
- Host security fixes

---

## Medium-Term

- Real WebRTC voice chat
- Host migration
- Docker setup
- CI/CD pipeline

---

## Long-Term

- Karaoke mode
- Reactions
- Analytics dashboard
- Mobile PWA
- Spotify playlist import

---

# Repository Philosophy

This repository is a production-inspired prototype.

The goal is not to ship immediately at massive scale, but to understand:

- Real-time architecture
- Synchronization systems
- SaaS infrastructure patterns
- Engineering tradeoffs

Known limitations are documented intentionally rather than hidden.

---

# Contributing

```bash
git checkout -b feature/your-feature-name

git commit -m "fix: resolve sync bug"

git push origin feature/your-feature-name
```

Please preserve TypeScript safety and avoid undocumented regressions.

---

# License

MIT License.

See `LICENSE`.

---

# Contact

**Heramb Chaudhari**

[![GitHub](https://img.shields.io/badge/GitHub-Heramb1221-black?style=for-the-badge&logo=github)](https://github.com/Heramb1221)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Heramb%20Chaudhari-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/heramb-chaudhari)

[![Email](https://img.shields.io/badge/Email-hchaudhari1221%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:hchaudhari1221@gmail.com)

---
