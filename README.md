# ☤ PharmaGuard

**AI-Powered Pharmacogenomic Risk Prediction Platform**

> Upload a patient's genetic data (VCF). Get instant drug-gene interaction risk predictions with clinically actionable recommendations — explainable, accurate, life-saving.

Built for **RIFT 2026 — HealthTech Track**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Drugs & Genes](#supported-drugs--genes)
- [Risk Classification](#risk-classification)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Adverse drug reactions kill over **100,000 Americans every year**. Many of these deaths are preventable through pharmacogenomic testing — analyzing how genetic variants affect drug metabolism.

PharmaGuard bridges this gap by providing a web-based platform where clinicians can:

1. **Upload** a patient's VCF (Variant Call Format) file
2. **Select** one or more drugs to evaluate
3. **Receive** color-coded risk predictions, dosing recommendations, and AI-generated clinical explanations — all aligned with [CPIC guidelines](https://cpicpgx.org/)

---

## Features

| Feature | Description |
|---|---|
| **VCF Parsing** | VCF v4.2 parsing with automatic gene identification via rsID-to-gene mapping across 8 pharmacogenes |
| **Risk Prediction** | Rule-based risk engine classifying interactions with confidence scoring and severity levels |
| **LLM Explanations** | Clinically-grounded explanations powered by Google Gemini, with a deterministic fallback when the API is unavailable |
| **Multi-Drug Analysis** | Analyze multiple drugs in a single request with parallel processing |
| **Streaming Progress** | Real-time SSE (Server-Sent Events) streaming so the UI shows step-by-step progress |
| **Patient History** | Persistent report storage — review, reload, or delete past analyses |
| **Export** | Download analysis results as JSON |
| **Dark Mode** | Full dark/light theme support |
| **CPIC Aligned** | Dosing recommendations aligned with Clinical Pharmacogenetics Implementation Consortium guidelines |

---

## Supported Drugs & Genes

| Drug | Primary Gene | Additional Genes | Mechanism |
|---|---|---|---|
| **Codeine** | CYP2D6 | — | CYP2D6 converts codeine to morphine; PM = no analgesia, UM = toxicity risk |
| **Clopidogrel** | CYP2C19 | — | CYP2C19 activates clopidogrel; reduced function → decreased platelet inhibition |
| **Warfarin** | CYP2C9 | VKORC1 | CYP2C9 affects metabolism, VKORC1 affects sensitivity — both influence dosing |
| **Simvastatin** | SLCO1B1 | — | Reduced OATP1B1 transporter function increases systemic statin exposure and myopathy risk |
| **Azathioprine** | TPMT | NUDT15 | Reduced TPMT/NUDT15 activity increases thiopurine toxicity risk |
| **Fluorouracil** | DPYD | — | DPD deficiency reduces fluoropyrimidine metabolism → life-threatening toxicity |
| **Capecitabine** | DPYD | — | Same DPYD pathway as fluorouracil |

**Monitored Genes:** CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD, VKORC1, NUDT15

---

## Risk Classification

| Label | Meaning |
|---|---|
| 🟢 **Safe** | Standard dosing appropriate |
| 🟡 **Adjust Dosage** | Dose modification recommended |
| 🔴 **Toxic** | High risk of adverse reaction — avoid or use alternative |
| ⚪ **Ineffective** | Drug unlikely to work for this patient |
| ⚫ **Unknown** | Insufficient data for classification |

---

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** — REST API with async support
- **Pydantic** — request/response validation
- **Google Generative AI (Gemini)** — LLM-powered clinical explanations
- **Uvicorn** — ASGI server

### Frontend
- **React 18** with Vite
- **Tailwind CSS v4**
- **Lucide React** — icons
- **React Router v7** — SPA routing

---

## Project Structure

```
PharmaGuard/
├── app/                          # Backend (FastAPI)
│   ├── main.py                   # App entry point, CORS config
│   ├── api/
│   │   └── routes.py             # API endpoints (/analyze, /history, etc.)
│   ├── data/
│   │   ├── drug_rules.json       # Drug → gene mapping & mechanisms
│   │   ├── phenotype_rules.json  # Phenotype classification rules
│   │   ├── phenotype_tables.json # Diplotype → phenotype lookup tables
│   │   └── history/              # Persisted patient reports (JSON)
│   ├── models/
│   │   ├── request_models.py
│   │   └── response_models.py
│   ├── services/
│   │   ├── vcf_service.py        # VCF parsing & variant extraction
│   │   ├── pgx_service.py        # Pharmacogenomic interpretation
│   │   ├── phenotype_mapper.py   # Diplotype → phenotype mapping
│   │   ├── risk_engine.py        # Risk classification engine
│   │   ├── recommendation_engine.py
│   │   ├── llm_service.py        # Gemini LLM integration + fallback
│   │   └── history_service.py    # Report storage & retrieval
│   ├── utils/
│   │   └── validators.py         # Input validation helpers
│   └── __pycache__/
├── frontend/                     # Frontend (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Dev proxy to backend
│   └── src/
│       ├── App.jsx               # Main application shell
│       ├── main.jsx              # Entry point
│       ├── constants.js
│       ├── api/
│       │   └── client.js         # API client (fetch + SSE streaming)
│       ├── components/           # UI components
│       ├── context/
│       │   └── ThemeContext.jsx   # Dark/light mode
│       └── pages/
│           └── LandingPage.jsx   # Marketing landing page
├── .env                          # Environment variables
├── requirements.txt
├── pyproject.toml
└── TC_P1_PATIENT_001_Normal.vcf  # Sample VCF file for testing
```

---

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm**
- (Optional) A **Google Gemini API key** for AI-generated explanations — the app works without it using a deterministic fallback

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Ramsaheb/PW-Hackthone.git
cd PharmaGuard

# Create a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional — for LLM explanations)
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (proxies API calls to backend)
npm run dev
```

The frontend will be available at `http://localhost:5173`. The Vite dev server automatically proxies `/analyze`, `/history`, and `/debug` requests to the backend.

---

## Usage

1. Open the app in your browser at `http://localhost:5173`
2. **Upload** a `.vcf` file (a sample file `TC_P1_PATIENT_001_Normal.vcf` is included in the repo)
3. **Select** one or more drugs from the supported list (Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, Fluorouracil, Capecitabine)
4. Click **Analyze** — real-time progress updates stream to the UI
5. Review the results: risk label, confidence score, pharmacogenomic profile, clinical recommendations, and AI-generated explanations
6. **Export** the report as JSON or view past analyses in **Patient History**

---

## API Reference

### `POST /analyze`

Upload a VCF file and analyze drug-gene interactions.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | File (multipart) | Yes | `.vcf` file (max 5 MB) |
| `drugs` | string (form) | Yes | Comma-separated drug names |
| `patient_id` | string (form) | No | Custom patient ID (auto-generated if omitted) |

### `POST /analyze/stream`

Same as `/analyze` but returns results via **Server-Sent Events** with progress updates.

### `GET /history`

List all saved patient reports (metadata only).

### `GET /history/{patient_id}`

Retrieve the full report for a specific patient.

### `DELETE /history/{patient_id}`

Delete a patient's stored report.

### `POST /debug/vcf`

Upload a VCF file and view raw parsed rows and extracted variants (for development/debugging).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No | Google Gemini API key for AI-generated clinical explanations. If not set, the app uses a deterministic rule-based fallback. |

---

## Running Tests

```bash
pytest
```

---

## License

Built for **RIFT 2026 Hackathon**. © 2026 PharmaGuard.
