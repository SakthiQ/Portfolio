---
title: Medical Miscommunication Detector
tagline: Turns hard-to-read medical reports into plain language, without diagnosing or making things up.
year: 2026
featured: false
order: 6
status: Prototype
stack: [Python, FastAPI, NLP, pytest, Text-to-speech]
tags: [Python, AI/ML, Healthcare]
github: https://github.com/SakthiQ/nlp-medical-miscommunication-detector
highlights:
  - Detects negation ("No hydronephrosis") to avoid false alarms
  - Uses only vetted dictionary definitions and says so when none exist
---

Patients paste a lab or radiology report and get each medical term explained in plain language.

- Finds complex medical terms while ignoring common words.
- **Detects negation**, so "No hydronephrosis" is understood as the condition being absent.
- Looks up definitions only in a vetted medical dictionary, with sources. If a term isn't there, it says "No vetted definition available, please ask your doctor" instead of guessing.
- A language model rephrases only the verified definitions. It also offers Hindi translation and text-to-speech.
- Never diagnoses, prescribes or speculates.
