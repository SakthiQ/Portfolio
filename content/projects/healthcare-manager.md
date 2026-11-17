---
title: Healthcare Appointment & Follow-up Manager
tagline: Patient booking and doctor scheduling that can't double-book, even under load.
year: 2026
featured: true
order: 2
status: Active
stack: [Python, FastAPI, React 18, TypeScript, Vite, SQLAlchemy, PostgreSQL, Redis, Alembic, Docker, Nginx]
tags: [Python, Backend, React, Distributed Systems]
github: https://github.com/SakthiQ/Healthcare-Appointment-Follow-up-Manager
highlights:
  - Anti-double-booking engine using Redis locks plus database transaction checks
  - Transactional outbox so emails and calendar syncs are never lost
  - 137 unit, integration and concurrency tests
---

## The problem
Appointment systems break at the worst moment: when many patients try to book the same slot at once. Race conditions cause double bookings, and side effects like confirmation emails or calendar invites get lost when a service goes down.

## What I built
A patient appointment booking, doctor scheduling and automated follow-up platform with a **FastAPI** backend and a **React 18 + TypeScript + Vite** frontend.

- **Anti-double-booking concurrency engine:** combines Redis atomic `SET NX EX` distributed locks with transactional checks in the database, so two simultaneous bookings for the same slot can't both succeed.
- **Graceful in-memory fallback:** in local development without Redis, it falls back to thread-safe leased mutexes, so the app still runs.
- **Transactional outbox pattern:** email notifications, Google Calendar syncs and AI follow-ups are written to an outbox in the same transaction as the booking, then streamed out. Nothing is lost during an outage.
- **Mock and live providers:** a `DEMO_MODE` toggle switches OpenAI, Google Calendar OAuth2 and SMTP between mock and live.

## Architecture
React SPA → FastAPI ASGI gateway (4 workers) ↔ PostgreSQL (ACID storage + outbox) and Redis (Redlock + slot leases) → outbox event streamer (email, calendar, AI).

## Engineering
- SQLAlchemy ORM with Alembic migrations and Pydantic v2 settings and schemas.
- Repository layer, circuit breakers, and admin bootstrap and demo seed scripts.
- **137 tests** covering units, integration and concurrency.
- Multi-stage Docker build, plus a multi-replica Docker Compose + Nginx production setup.
