---
title: Relational-to-NoSQL Schema Migration Tool
tagline: Recommends MongoDB document schemas from SQL DDL and workload queries, and explains the trade-offs.
year: 2026
featured: false
order: 9
status: Prototype
stack: [Python, FastAPI, SQLGlot, MongoDB, React, Vite]
tags: [Python, Databases]
highlights:
  - Parses DDL and workload queries into a relational graph
  - Explains each embed-or-reference decision
---

A team project (with Anish Jaiswal and Savar Gambhir) for a NoSQL Databases course.

- Accepts SQL DDL, representative workload queries, optional row counts and explicit embed/reference overrides.
- Parses entities, keys, relationships and access patterns with **SQLGlot**, and estimates foreign-key fan-out.
- A transparent, deterministic rule engine generates a MongoDB document schema and **explains every recommendation** and its trade-offs.
- Each run is saved in MongoDB and shown in a React dashboard.
