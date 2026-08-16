# KleinAgentsAI

[![Project](https://img.shields.io/badge/project-KleinAgentsAI-6f42c1?style=for-the-badge)](https://github.com/KleinAiGen/KleinAgentsAI)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/KleinAiGen/KleinAgentsAI?style=social)](https://github.com/KleinAiGen/KleinAgentsAI/stargazers)
[![Status](https://img.shields.io/badge/status-Active-brightgreen?style=for-the-badge)](https://github.com/KleinAiGen/KleinAgentsAI)

> **A modular, extensible framework for building, customizing, and deploying specialist AI agents at scale.** Production-ready patterns, sandboxed testing utilities, and a vibrant community agent library.

---

## 🎯 Overview

**KleinAgentsAI** empowers developers to prototype, customize, and operationalize AI agent workloads with enterprise-grade tooling:

- 🏗️ **Agent Library** — 115+ pre-built specialist agents across Productivity, Development, Security, Data & AI, and DevOps categories
- ⚡ **One-Click Agent Skill Generator** — Design and generate custom agents in seconds via visual builder
- 🔄 **Multi-Model Cascades** — Chain agents, define fallbacks, and orchestrate complex prompt pipelines
- 🛡️ **Safety by Design** — Built-in sandboxing patterns, educational test utilities, and responsible-use guidelines
- 🎨 **Dark-mode Developer UI** — Optimized for deep focus; card-based navigation, dynamic prompt templates, and streaming chat

**Perfect for:** e-commerce platforms, payment gateways, security evaluation, code generation, and custom enterprise workflows.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ or Python 3.9+
- Git, Docker (optional but recommended)

### Clone & Install

```bash
git clone https://github.com/KleinAiGen/KleinAgentsAI.git
cd KleinAgentsAI
```

**Frontend (Node.js + React/Vue):**
```bash
npm install
npm run dev
```

**Backend (Python FastAPI example):**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Docker (full stack):**
```bash
docker-compose up --build
```

> 💡 **Tip:** Check your project's actual scripts in `package.json` or `Makefile` for exact commands. Configurations may vary per deployment.

---

## 📦 Key Features

### Agent Library
Browse **115+ specialist agents** organized by domain:
- **Productivity** — General Assistant, Task Planning, Email & Calendar Automation
- **Development** — Code Reviewer, Refactoring, Test Generator, Documentation, Debugging, Architecture
- **Security** — Vulnerability Scanner, Red-Teaming, Penetration Testing
- **Data & AI** — Data Pipeline Builder, ML Model Advisor, Analytics
- **DevOps & Infrastructure** — Deployment, Monitoring, Cloud Configuration

**Get started:** Navigate to the Agent Library in the UI and click "Launch" on any agent. No configuration required.

### One-Click Agent Skill Generator
Rapid-fire custom agent creation:

1. **Click "Create / Generate"** in the Agent Library
2. **Fill in core specs:**
   - Agent Name (e.g., "Automated Red-Teaming Agent")
   - Category (Productivity, Development, Security, Custom)
   - Icon (9 pre-designed sets: Sparkles, CPU, Terminal, Code, Brain, Shield, Database, Zap, Wrench)
   - Description & System Instruction (prompt persona)
3. **Preview & Save** → Agent is instantly available in your library

**Example:** Create an "Automated Security Evaluator" in 30 seconds.

### Advanced Features
- **Multi-step Prompt Pipelines** — Chain multiple agents or models; define cascading logic and fallbacks
- **Rescue Agent Pattern** — Fallback handlers for model failures, rate limits, or timeout recovery
- **Streaming Chat UI** — Real-time token-by-token feedback with visual command shortcuts
- **Session Management** — Track agent runs, replay conversations, audit logs
- **Dynamic Prompts** — Template-driven, context-aware system instructions

---

## 📚 Workflows & Examples

### Workflow 1: Launch a Pre-built Agent

```
1. Open Agent Library
   ↓
2. Select "General Assistant" or any domain specialist
   ↓
3. Review system instruction (or customize)
   ↓
4. Click "Start Session"
   ↓
5. Begin multi-turn conversation
```

### Workflow 2: Generate a Custom Agent

```
1. Click "Create / Generate"
   ↓
2. Choose "Designer" or "One-Click AI Generator"
   ↓
3. Fill: Name, Icon, Category, Description, System Prompt
   ↓
4. (Optional) Pick from inspirations:
   - Python Backend Pro
   - Cybersecurity Auditor
   - React UI Architect
   - Hungarian AI Assistant
   ↓
5. Click "Generate Agent"
   ↓
6. Review & "Save to Library"
   ↓
7. Launch immediately or share with team
```

### Workflow 3: Red-Teaming / Security Evaluation

For **educational and internal security testing only**:

1. Start from the **Automated Red-Teaming Agent** template
2. Customize evaluation scope (APIs, models, data flows)
3. Run stress tests in a **sandboxed environment** (Docker container or isolated VPC)
4. Review findings and audit trail
5. Document fixes and re-test

⚠️ **Always** obtain written authorization, follow responsible disclosure, and comply with all applicable laws.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────┐
│         Dark-Mode Browser UI            │
│  (React/Vue + Streaming WebSocket)      │
├─────────────────────────────────────────┤
│      API Gateway & Rate Limiter         │
├─────────────────────────────────────────┤
│  Agent Orchestrator & Model Router      │
│  ├─ Single Model (GPT-4, Claude, etc.)  │
│  ├─ Multi-Model Cascades                │
│  └─ Fallback / Rescue Agents            │
├─────────────────────────────────────────┤
│    Storage & Session Management         │
│  ├─ Postgres / MongoDB (session history)│
│  ├─ JSON Templates (agent definitions)  │
│  └─ Vector DB (semantic search)         │
├─────────────────────────────────────────┤
│   Sandboxed Execution Layer             │
│  ├─ Docker containers                   │
│  ├─ Kubernetes (optional)               │
│  └─ Function-as-a-Service (AWS/GCP)     │
└─────────────────────────────────────────┘
```

**Technology Choices:**
- **Frontend:** React 18+, TypeScript, Tailwind CSS, WebSocket client
- **Backend:** Node.js (Express) or Python (FastAPI/Django)
- **Database:** Postgres 14+ (primary), MongoDB (optional, document-based)
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions, GitLab CI, or Jenkins
- **Monitoring:** Prometheus + Grafana, Sentry for error tracking

---

## 📂 Project Structure

```
KleinAgentsAI/
├── README.md                      # This file
├── LICENSE                        # MIT License
├── docker-compose.yml             # Full-stack local dev setup
├── Makefile                       # Common dev tasks
│
├── agents/                        # Agent definitions
│   ├── productivity/              # General Assistant, Task Planner, etc.
│   ├── development/               # Code Reviewer, Test Generator, etc.
│   ├── security/                  # Red-Teaming, Vulnerability Scanner
│   ├── data-ai/                   # ML Model Advisor, Analytics
│   └── devops/                    # Deployment, Monitoring
│
├── templates/                     # Reusable prompt templates
│   ├── system-prompts/
│   ├── function-calls/
│   └── cascades/
│
├── frontend/                      # React / Vue application
│   ├── src/
│   │   ├── components/            # UI components (Library, Generator, Chat)
│   │   ├── pages/
│   │   ├── styles/                # Tailwind config, dark-mode theme
│   │   └── hooks/
│   └── package.json
│
├── backend/                       # Node.js or Python API
│   ├── routes/                    # API endpoints
│   ├── models/                    # DB schemas
│   ├── services/                  # Business logic (orchestration, sandboxing)
│   ├── middleware/                # Auth, logging, rate limiting
│   └── requirements.txt (or package.json)
│
├── tests/                         # Unit, integration, e2e tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── screenshots/                   # Documentation images
│   ├── library.png                # Agent Library view
│   ├── generator.png              # Agent Skill Generator
│   └── chat.png                   # Chat UI & streaming
│
└── docs/                          # Extended documentation
    ├── ARCHITECTURE.md
    ├── SECURITY.md
    ├── DEPLOYMENT.md
    └── API.md
```

---

## 🛡️ Important: Disclaimer & Responsible Use

### Educational & Test Utilities

This repository **may include** educational/sandboxed utilities, such as:
- **Test credit-card generators** (Luhn algorithm validation for e-commerce testing)
- **Dummy authentication flows** (OAuth/JWT stubs for UI prototyping)
- **Security evaluation templates** (for internal penetration testing only)

**These are strictly for:**
- ✅ Educational purposes
- ✅ Sandboxed software testing (non-production environments)
- ✅ Authorized security audits and red-teaming
- ✅ CI/CD pipeline integration testing

**These are NOT for:**
- ❌ Real financial transactions
- ❌ Unauthorized access or testing
- ❌ Production systems without explicit approval
- ❌ Violating any applicable law or regulation

### Security & Ethics Guidelines

1. **Authorization First** — Always obtain written consent before security testing.
2. **Sandboxing** — Run agents in isolated environments (Docker, VPC, or staging).
3. **Audit Logging** — Maintain detailed logs of all agent actions and decisions.
4. **Responsible Disclosure** — Report vulnerabilities privately to affected parties.
5. **Privacy Compliance** — Mask PII, follow GDPR/CCPA, and honor data retention policies.
6. **Rate Limiting & Monitoring** — Implement abuse detection and resource guards.
7. **Regular Security Audits** — Periodically review agent prompts, integrations, and access controls.

---

## 🔧 Development Setup

### Local Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/docs (if using FastAPI)
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws

# Backend
DATABASE_URL=postgresql://user:password@db:5432/kleinagents
REDIS_URL=redis://redis:6379
MODEL_API_KEY=sk-...  # OpenAI, Anthropic, etc.
LOG_LEVEL=debug
```

### Running Tests

```bash
# Unit tests
npm run test          # Frontend
pytest tests/         # Backend

# Integration tests
npm run test:e2e      # Frontend E2E

# Coverage report
npm run test:coverage
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Update environment variables (secrets manager)
- [ ] Enable HTTPS & configure TLS certificates
- [ ] Set up database backups and replication
- [ ] Configure CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Enable monitoring & alerting (Prometheus, Grafana, Sentry)
- [ ] Implement rate limiting & DDoS protection
- [ ] Conduct security audit & penetration test
- [ ] Document runbooks & incident response procedures

### Deploy to Kubernetes

```bash
# Build Docker image
docker build -t kleinagensal:latest .

# Push to registry
docker push your-registry/kleinagents:latest

# Deploy with Helm or kubectl
kubectl apply -f k8s/
```

### Deploy to AWS / GCP

Refer to `docs/DEPLOYMENT.md` for cloud-specific instructions.

---

## 🗺️ Roadmap

### Q3 2025 (Immediate)
- [ ] Finalize API documentation (OpenAPI/Swagger)
- [ ] Add GitHub Actions CI/CD workflows
- [ ] Deploy example instance to public cloud
- [ ] Community contribution guidelines

### Q4 2025 (Near-term)
- [ ] Agent versioning & A/B testing framework
- [ ] Role-based access control (RBAC)
- [ ] Audit logging & compliance reports
- [ ] Plugin system for custom integrations

### 2026 (Mid-term)
- [ ] Community marketplace for agent sharing
- [ ] Visual workflow editor (DAG-based)
- [ ] Multi-agent orchestration (swarm patterns)
- [ ] Local LLM support (Ollama, LLaMA)
- [ ] Edge deployment (Cloudflare Workers, Lambda@Edge)

### Long-term Vision
- Enterprise SLA guarantees
- Managed service offering
- Advanced observability & cost tracking
- Global model arbitrage

---

## 🤝 Contributing

We welcome contributions from developers, researchers, and security professionals!

### How to Contribute

1. **Fork** the repository
2. **Create a feature branch:**
   ```bash
   git checkout -b feat/agent-scheduler
   ```
3. **Implement your changes** with tests
4. **Open a pull request** with:
   - Clear description of changes
   - Link to related issue (if any)
   - Test coverage & screenshots
5. **Participate in code review** and iterate

### Commit Message Convention

```
feat:     Add new feature or agent
fix:      Bug fix or security patch
docs:     Documentation update
style:    Code style (formatting, linting)
refactor: Refactoring without behavior change
test:     Add or improve tests
chore:    Build, CI, or dependency updates
```

**Example:**
```
feat(agents): add "Document Summarizer" agent to data-ai category
```

### Code Standards

- **TypeScript / Python:** ESLint + Prettier / Black
- **Tests:** Jest / Pytest with >80% coverage target
- **Types:** Strict mode enabled
- **Docs:** Docstrings for all public methods

---

## 📖 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design & internals
- **[SECURITY.md](./docs/SECURITY.md)** — Security best practices & threat model
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Production deployment guide
- **[API.md](./docs/API.md)** — REST API reference
- **[AGENTS.md](./docs/AGENTS.md)** — Agent design patterns & templates

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

**TL;DR:** You can use, modify, and distribute this software freely, provided you include the original license and don't hold the maintainers liable.

---

## 💬 Community & Support

- **Issues & Bugs:** [GitHub Issues](https://github.com/KleinAiGen/KleinAgentsAI/issues)
- **Discussions:** [GitHub Discussions](https://github.com/KleinAiGen/KleinAgentsAI/discussions)
- **Email:** support@kleinaigenai.dev (if applicable)
- **Maintainer:** [@KleinAiGen](https://github.com/KleinAiGen)

---

## 🎓 Citation

If you use **KleinAgentsAI** in research or production, please cite:

```bibtex
@software{kleinagentsai2025,
  title={KleinAgentsAI: Modular Framework for Specialist AI Agents},
  author={KleinAiGen},
  url={https://github.com/KleinAiGen/KleinAgentsAI},
  year={2025}
}
```

---

## Acknowledgments

Built with ❤️ by the KleinAiGen community.

Special thanks to:
- Contributors and beta testers
- Open-source projects: FastAPI, React, Docker, Kubernetes
- AI model providers: OpenAI, Anthropic, Meta

---

**Last updated:** August 2025

For the latest updates and announcements, ⭐ star this repository!
