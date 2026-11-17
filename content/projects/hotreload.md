---
title: hotreload
tagline: Save the file, and the Go server has already restarted.
year: 2025
featured: false
order: 4
status: Complete
stack: [Go, fsnotify, GitHub Actions]
tags: [Go, Developer Tools]
github: https://github.com/SakthiQ/hotreload
highlights:
  - About 700 lines of Go with a single dependency
  - Prints total reload time on every restart
---

A small hot-reload tool for Go. It watches your project, rebuilds on save and swaps the running process.

- `hotreload init` writes a `.hotreload.toml`; after that, `hotreload` is the whole workflow.
- **About 700 lines of Go and one dependency (`fsnotify`)**, small enough to read in a lunch break.
- Debounces file events, shuts the old process down gracefully and prints the total time from save to running process, so the tool's overhead is visible.
- CI with GitHub Actions.
