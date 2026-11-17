---
title: ChainJudge
tagline: Tamper-proof, anti-collusion hackathon judging on EVM smart contracts.
year: 2025
featured: false
order: 7
status: Complete
stack: [Solidity, Hardhat, React 18, ethers.js, IPFS, ERC-721]
tags: [Blockchain, React]
github: https://github.com/SakthiQ/blockchain-project
highlights:
  - Commit-reveal blind scoring and conflict-of-interest recusal
  - Soulbound ERC-721 winner certificates with on-chain SVG
  - 38 contract tests, all passing
---

An undergraduate capstone that expands a 4-module research-paper design into a 4-tier architecture with 17 features.

- **Commit-reveal blind scoring** so judges can't copy each other's scores.
- **Trimmed-mean, quorum-gated leaderboard** with deterministic 5-tier tie-breaking.
- **Dispute and appeal window** with a finalization guard.
- **Soulbound ERC-721 winner NFTs** with on-chain SVG, and IPFS media storage.
- Gas optimizations (storage caching, `viaIR`), and a React + ethers.js frontend with MetaMask.
