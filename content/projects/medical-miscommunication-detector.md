---
title: Medical Miscommunication Detector
tagline: Turns hard-to-read medical reports into plain language, without diagnosing or making things up.
year: 2026
featured: false
order: 6
status: Prototype
stack: [Python, FastAPI, PyTorch, Hugging Face Transformers, Llama 3, FAISS, Sentence-Transformers, JavaScript]
tags: [Python, AI/ML, Healthcare]
github: https://github.com/SakthiQ/nlp-medical-miscommunication-detector
highlights:
  - Term-detection recall raised from 74.5% to 96.0%
  - RAG over a cited knowledge base with 100% Recall@3; every generated sentence cites a source
  - Translation into Hindi, Tamil, Malayalam and Telugu, plus text-to-speech
---

Patients paste a lab or radiology report and get each medical term explained in plain language.

## How it works
- An end-to-end **NLP pipeline** combines biomedical named-entity recognition, **NegEx negation detection** and a dictionary matcher, raising term-detection recall from **74.5% to 96.0%**. Negation detection means "No hydronephrosis" is understood as the condition being absent, avoiding false alarms.
- **RAG with sentence embeddings and FAISS** over a cited knowledge base (**100% Recall@3**) grounds Llama 3's output in retrieved text only, with a template fallback. All 43 generated sentences in the evaluation cited a source.
- A **safety validator** catches unsafe model output. If a term has no vetted definition, it says "please ask your doctor" instead of guessing.
- Translation into **Hindi, Tamil, Malayalam and Telugu** (NLLB), plus text-to-speech.
- Served through **FastAPI** with a JavaScript web UI.

It never diagnoses, prescribes or speculates.
