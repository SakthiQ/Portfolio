---
title: ATTS-RAG
tagline: A private document Q&A system where every sentence of every answer is checked and cited.
year: 2026
featured: true
order: 1
status: Active
stack: [Python, FastAPI, Ollama, Llama 3, Streamlit, Docker, NLI models, Hybrid search]
tags: [Python, AI/ML, Security, Backend]
github: https://github.com/SakthiQ/ATTS-RAG
highlights:
  - Three security layers around a fully local RAG pipeline
  - Every answer sentence verified against evidence with an NLI model
  - Multi-tenant accounts, clearance levels, 2FA and a hash-chained audit log
---

## The problem
Teams want to ask questions about their own documents with an LLM, but they can't risk three things: data leaving the building, prompt-injection attacks (including hidden instructions planted inside uploaded files), and confident answers the documents don't support.

## What I built
**ATTS-RAG** (Adaptive Threat-Intelligence Trusted & Secure RAG) answers questions over PDF, DOCX, TXT and Markdown files. It runs **entirely on the user's machine**: answers come from Llama 3 through Ollama, and embeddings, search and verification also use local models.

Around the usual retrieve-and-answer loop it adds three security layers:

- **Layer 1, query threat gate:** screens each question for prompt injection, jailbreaks and social engineering using rules, similarity to known attacks, a multilingual classifier and an authority-claim check. It gets stricter with a user who keeps probing.
- **Layer 2, trust gate:** keeps only evidence the user is allowed to see (tenant and clearance), whose content hash is intact and whose source is trusted enough. Personal data is masked.
- **Layer 3, evidence-to-answer gate:** checks every sentence of the draft answer against the evidence with a natural-language-inference model plus number, negation and table checks, and drops what isn't supported.

Uploaded documents are scanned for hidden instructions before indexing, and suspicious passages are quarantined. A per-user suspicion score, fed by all three layers and decaying over time, tightens every threshold for that user.

## Architecture
Question → threat gate → hybrid search (vector + keyword, reranked, scoped to tenant and clearance) → trust gate → local model drafts a cited answer → sentence-by-sentence verification → verified answer with `[E1]`, `[E2]` citations.

## Accounts and access
- Four roles: viewer, user, tenant admin, super admin.
- Clearance levels 1–3 on accounts and documents.
- 15-minute access tokens with single-use refresh tokens, and optional or required TOTP two-factor log-in.
- A hash-chained audit log that detects tampering, and per-network lock-out so nobody can lock someone else out.

## Stack
FastAPI backend, Streamlit frontend, Ollama (Llama 3), local embedding/reranking/classifier/NLI models, Docker Compose, pytest.
