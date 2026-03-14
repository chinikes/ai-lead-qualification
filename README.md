# AI Lead Qualification & CRM Automation System

A production-grade multi-agent system that automates lead qualification, enrichment, scoring, and routing using AI agents orchestrated through n8n, integrated with HubSpot CRM.

## Quick Start

```bash
pip install -r requirements.txt
python -m tests.test_research_agent   # Runs 5 test leads through mock enrichment
```

## Project Structure

```
ai-lead-qualification/
├── config/
│   ├── schemas.py              # Pydantic data models (full system contract)
│   └── settings.py             # ICP definition, API config, scoring weights
├── agents/
│   ├── research_agent.py       # Core research agent orchestrator
│   ├── enrichment_providers.py # Clearbit, Apollo, Hunter + Mock providers
│   └── hubspot_integration.py  # HubSpot CRM bidirectional sync
├── workflows/
│   └── research_agent_workflow.json  # Importable n8n workflow
├── tests/
│   └── test_research_agent.py  # Demo runner with 5 test scenarios
└── requirements.txt
```

## Research Agent Pipeline

| Stage | Description | Implementation |
|-------|-------------|----------------|
| 1. Intake | Webhook receives raw lead JSON | n8n webhook node |
| 2. Normalize | Clean emails, extract domain, detect free emails | n8n Code node + Python |
| 3. Enrich | Parallel API calls (Clearbit, Apollo, Hunter) | asyncio.gather |
| 4. AI Analysis | Claude structured JSON: ICP fit, signals, pain points | Anthropic API |
| 5. Validate | Confidence scoring, low-quality flagging | Weighted formula |
| 6. Output | HubSpot sync, Slack alerts, qualification queue | n8n integrations |

## Key Design Decisions

- **Parallel enrichment** — All providers fire simultaneously. 500ms vs 3s sequential.
- **Provider-agnostic merge** — "First non-null wins" for scalars, union for lists.
- **Structured LLM output** — Claude returns JSON matching a Pydantic schema.
- **Confidence-gated routing** — Below 40% → human review. 40-70% → flagged. 70%+ → auto-proceed.
- **Mock provider** — Deterministic fake data for portfolio demos (same input = same output).

## Environment Variables

```bash
CLEARBIT_API_KEY=sk_...
APOLLO_API_KEY=...
HUNTER_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
HUBSPOT_ACCESS_TOKEN=pat-...
```

## n8n Workflow Import

1. Open n8n → Workflows → Import from File
2. Select `workflows/research_agent_workflow.json`
3. Configure API credentials
4. Activate and test with: `POST /webhook/lead-intake`

## Data Schemas

| Model | Purpose |
|-------|---------|
| `RawLead` | Inbound data from any source |
| `CompanyEnrichment` | Enriched company profile |
| `ContactEnrichment` | Enriched contact profile |
| `AIAnalysis` | LLM output: ICP fit, signals, pain points |
| `EnrichedLead` | Research Agent output → Qualification Agent input |
| `LeadScore` | Qualification Agent output (scores + decision) |
| `RoutingDecision` | Routing Agent output (assignment + SLA) |

## Roadmap

- [x] **Phase 1**: Research Agent (enrichment + AI analysis)
- [ ] **Phase 2**: Qualification Agent (scoring + classification)
- [ ] **Phase 3**: Routing Agent (territory + round-robin)
- [ ] **Phase 4**: Engagement Agent (personalized sequences)
- [ ] **Phase 5**: Feedback loop (outcome tracking + model retraining)
