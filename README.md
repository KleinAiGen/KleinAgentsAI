# KleinAgentsAI

[![Project](https://img.shields.io/badge/project-KleinAgentsAI-6f42c1?style=for-the-badge)](https://github.com/KleinAiGen/KleinAgentsAI) [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](./LICENSE)

KleinAgentsAI is a modular framework for building, customizing, and running specialist AI agents. It provides a dark-mode developer UI, a community agent library, and tools to design, generate, and test agents safely.

---

## Quick demo

Agent Library

![Agent Library](screenshots/library.png)

Agent Skill Generator

![Agent Generator](screenshots/generator.png)

Streaming Chat UI

![Chat UI](screenshots/chat.png)

---

## What this project provides

- A curated Agent Library (productivity, development, security, data & AI, DevOps)
- One-click Agent Skill Generator (visual builder + templates)
- Multi-model orchestration and fallback (rescue agent patterns)
- Streaming chat UI and developer-focused tools
- Example templates and sandbox utilities for safe testing

---

## Quick start

Prerequisites: Node 16+ (frontend) and Python 3.9+ or Node for the backend. Docker is recommended for a full-stack local setup.

Clone the repo:

```bash
git clone https://github.com/KleinAiGen/KleinAgentsAI.git
cd KleinAgentsAI
```

Frontend (example):

```bash
cd frontend
npm install
npm run dev
```

Backend (example with FastAPI):

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Or run locally with Docker Compose:

```bash
docker-compose up --build
```

---

## Security & responsible use

This repository may include educational or sandboxed utilities such as test credit-card generators and security evaluation templates. These tools are for development, testing, and authorized security work only. Do not use them for real financial transactions or unauthorized testing.

Always:

- Obtain written authorization for security testing
- Run tests in isolated/sandboxed environments (Docker/VPC)
- Keep audit logs and follow responsible disclosure practices

---

## Contributing

We welcome contributions. Please fork, create a feature branch, add tests and documentation, and open a pull request. See CONTRIBUTING.md (or this README) for details.

A short checklist:

- Fork the repo
- Create a branch: `git checkout -b feat/your-feature`
- Add tests and documentation
- Open a PR with a clear description

---

## License & contact

This project is licensed under MIT — see LICENSE for details.

Issues & discussions: https://github.com/KleinAiGen/KleinAgentsAI/issues

Maintainer: @KleinAiGen

---

_Last updated: August 2026_
