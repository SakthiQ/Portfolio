---
title: Pyramid DCT Forgery Detection
tagline: Finds tampered regions in images using multi-scale frequency analysis.
year: 2025
featured: false
order: 8
status: Complete
stack: [Python, FastAPI, NumPy, React, Vite, Docker]
tags: [Python, AI/ML, Computer Vision]
highlights:
  - Multi-scale DCT features with chi-square testing
  - Outputs heatmaps and masks of suspected tampering
---

A multi-scale image forgery detection system.

- Splits images into a pyramid of scales and runs **DCT (discrete cosine transform)** frequency analysis on each.
- Extracts kurtosis, entropy and variance features and applies **chi-square tests** to flag regions that don't match the rest of the image.
- Produces heatmaps and masks of tampered regions, served through a FastAPI backend and a React web interface for real-time analysis.
