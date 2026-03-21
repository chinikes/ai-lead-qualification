"""Claude API integration for lead analysis."""

import os
import re
import json
import httpx
import logging

logger = logging.getLogger(__name__)


async def analyze_lead(lead: dict) -> dict | None:
    """
    Call Claude to produce structured ICP analysis.
    Returns a dict with company_summary, icp_fit_score, buying_signals, etc.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.warning("[ai] No ANTHROPIC_API_KEY — skipping analysis")
        return None

    prompt = _build_prompt(lead)

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 2000,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            if resp.status_code != 200:
                logger.error(f"[ai] Claude API error: {resp.status_code}")
                return None

            text = resp.json()["content"][0]["text"]
            match = re.search(r"\{[\s\S]*\}", text)
            if not match:
                logger.error("[ai] No JSON in Claude response")
                return None

            data = json.loads(match.group())

            # Map to our DB column names
            return {
                "ai_company_summary": data.get("company_summary", ""),
                "ai_icp_fit_narrative": data.get("icp_fit_narrative", ""),
                "ai_icp_fit_score": float(data.get("icp_fit_score", 0)),
                "ai_buying_signals": data.get("buying_signals", []),
                "ai_pain_points": data.get("pain_points", []),
                "ai_talking_points": data.get("recommended_talking_points", []),
                "ai_urgency": data.get("urgency_assessment", "exploratory"),
                "ai_confidence": float(data.get("confidence", 0)),
                "ai_reasoning": data.get("reasoning", ""),
            }
    except json.JSONDecodeError as e:
        logger.error(f"[ai] JSON parse error: {e}")
        return None
    except Exception as e:
        logger.error(f"[ai] Analysis error: {e}")
        return None


def _build_prompt(lead: dict) -> str:
    industry = lead.get("company_industry") or "Unknown"
    return f"""You are an expert B2B consultant sales analyst working for AgileDevs Consulting. Analyze this lead to determine if they are a good fit for our services. Respond with ONLY a JSON object.

## About AgileDevs Consulting
AgileDevs provides three core service lines:
1. **Project Management Consulting** — Agile delivery, program management, ERP/CRM implementations (Salesforce, NetSuite, Dynamics 365), SaaS/PaaS rollouts
2. **Workflow Automation** — Building automated workflows using n8n, Make.com, Zapier; integrating business tools (HubSpot, Jira, Slack, Airtable); process automation
3. **Atlassian Administration** — Jira, Confluence, Jira Service Management setup, configuration, migration, and optimization

Our ideal clients: Mid-market companies (20-2000 employees) in technology, SaaS, fintech, healthcare, professional services, or manufacturing who need help with digital transformation, tool consolidation, process automation, or scaling their operations. We work with CTOs, VPs of Engineering, IT Directors, Operations leaders, and Product/Program Managers.

## Lead to Analyze

### Company
- Name: {lead.get('company_legal_name') or lead.get('company_name') or 'Unknown'}
- Domain: {lead.get('company_domain') or 'Unknown'}
- Industry: {industry} / {lead.get('company_sub_industry') or 'Unknown'}
- Employees: {lead.get('company_employee_count') or 'Unknown'}
- Revenue: {lead.get('company_revenue') or 'Unknown'}
- Funding: {lead.get('company_funding_stage') or 'Unknown'}
- Location: {lead.get('company_hq_city') or ''}, {lead.get('company_hq_state') or ''}, {lead.get('company_hq_country') or ''}
- Description: {lead.get('company_description') or 'None'}
- Tech Stack: {', '.join((lead.get('company_technologies') or [])[:12])}

### Contact
- Name: {lead.get('contact_full_name') or lead.get('first_name', '') + ' ' + lead.get('last_name', '')}
- Title: {lead.get('contact_title') or lead.get('job_title') or 'Unknown'}
- Seniority: {lead.get('contact_seniority') or 'unknown'}
- Decision Maker: {lead.get('contact_is_decision_maker', False)}

### Message
{lead.get('message') or 'None'}

## Analysis Instructions
Evaluate this lead for AgileDevs' services. Consider:
- Does the company size and industry suggest they need external PM/automation consulting?
- Is the contact in a role that would hire or influence hiring consultants (CTO, VP Eng, IT Director, Ops Manager, PM)?
- Does their tech stack suggest Atlassian/Jira work, CRM implementation needs, or automation opportunities?
- Are there signals of growth, scaling challenges, tool sprawl, or process inefficiency?
- Would they benefit from n8n/Make workflow automation, Jira/Confluence administration, or Agile delivery consulting?

Respond with ONLY this JSON (no markdown fencing):
{{
  "company_summary": "2-3 sentences about the company and their likely operational context",
  "icp_fit_narrative": "why this lead does/doesn't match AgileDevs' ICP — reference specific service lines",
  "icp_fit_score": 0.0 to 1.0,
  "buying_signals": [{{"signal": "description", "source": "what indicates this", "strength": "strong|moderate|weak"}}],
  "pain_points": [{{"pain_point": "description", "evidence": "what suggests this", "relevance_to_product": "high|medium|low"}}],
  "recommended_talking_points": ["specific talking points for AgileDevs rep to use"],
  "urgency_assessment": "immediate|near_term|exploratory|not_ready",
  "confidence": 0.0 to 1.0,
  "reasoning": "step-by-step explanation of the scoring"
}}"""
