---
title: PayGuard
tagline: A wallet payment platform with fraud detection and idempotent transactions.
year: 2026
featured: false
order: 5
status: In progress
stack: [Java, Spring Boot, MySQL, MongoDB, React, TypeScript, Docker, Prometheus]
tags: [Java, Backend, Fintech, Security]
github: https://github.com/SakthiQ/Payguard
highlights:
  - Rule-based fraud detection with an analyst review queue
  - Idempotent, ACID transaction processing with audit logging
---

A production-inspired fintech backend for wallet-based payments.

- **Three roles:** customers (wallets, beneficiaries, transfers, history), fraud analysts (review, approve or decline flagged transactions with notes) and administrators (users, account freezes, fraud rules, blacklists).
- **Reliable money movement:** ACID transactions, idempotency keys and explicit transaction states.
- **Rule-based fraud detection** with explained reasons, plus audit logging.
- MySQL and MongoDB, Docker Compose and Prometheus metrics, with a React + TypeScript frontend.
