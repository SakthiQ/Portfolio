---
title: BitbyBit
tagline: A multi-tenant backup platform for MySQL, PostgreSQL and MongoDB.
year: 2025
featured: false
order: 3
status: Complete
stack: [Java 21, Spring Boot 3.5, React 19, MySQL, Quartz, AES-256-GCM, AWS S3, Azure Blob, GCS]
tags: [Java, Backend, Databases, Cloud]
github: https://github.com/SakthiQ/BitByBit
highlights:
  - Backs up three database engines to four destinations
  - Credentials encrypted with AES-256-GCM; restores verified with SHA-256
  - 112 passing tests
---

BitbyBit backs up *other people's* databases. Users register connection profiles and run backups on demand or on a Quartz cron schedule.

- **Three engines:** MySQL, PostgreSQL and MongoDB, through `mysqldump`, `pg_dump` and `mongodump`.
- **Four destinations:** local disk, AWS S3, Azure Blob Storage and Google Cloud Storage.
- **Encrypted at rest:** database passwords are stored with AES-256-GCM.
- **Verified restores:** a SHA-256 checksum recorded at backup time is checked before any restore.
- **Multi-tenant:** users only ever see their own profiles, jobs and schedules.
- **Two interfaces:** an interactive CLI and a REST API + React frontend sharing one service layer. Uses the strategy pattern per database engine and per storage provider.
