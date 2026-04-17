# Euler AI: Step-by-Step Creation Guide

## Goal
Build **Euler**, a domain-specific AI assistant that handles:

1. Mathematics for actuarial work
2. Actuarial risk estimation explanations
3. Python-based visualization support

---

## Step 1: Define Product Boundaries

- Limit scope to actuarial mathematics and supporting statistics
- Reject unrelated topics (e.g., history, medicine, politics)
- Define user types: actuarial students, analysts, pricing teams, risk teams
- Define output style: clear, auditable, formula-first explanations

---

## Step 2: Define Core Use Cases

- Explain actuarial formulas step by step
- Estimate risk metrics from structured inputs
- Compare model assumptions and impacts
- Generate Python code for charts used in actuarial reporting

---

## Step 3: Design Knowledge Coverage

- Interest theory and discounting
- Life contingencies and survival models
- Credibility theory
- Loss models and severity/frequency
- Reserving and pricing foundations
- Capital/risk measures (VaR/TVaR)

Use `/home/runner/work/clion/clion/docs/euler-ai/02-domain-scope-actuarial-math.md`.

---

## Step 4: Prepare Training and Reference Data

- Build curated actuarial corpora
- Build Q&A pairs and worked-solution examples
- Build synthetic risk datasets for safe experimentation
- Add citation metadata for traceability

Use `/home/runner/work/clion/clion/docs/euler-ai/03-data-requirements-and-schema.md`.

---

## Step 5: Build the AI System Architecture

- Retrieval layer for trusted actuarial references
- LLM reasoning layer with domain guardrails
- Validator layer for formulas, units, and assumptions
- Visualization generator for Python code and chart interpretation

---

## Step 6: Add Safety and Domain Controls

- Block out-of-domain requests
- Require assumptions to be explicit
- Require uncertainty and limitation statements
- Prevent regulatory or financial advice claims beyond configured policy

---

## Step 7: Build Evaluation Pipeline

- Mathematical correctness tests
- Actuarial-method alignment tests
- Explanation clarity rubric
- Python visualization correctness tests

---

## Step 8: Launch in Phases

- Phase A: internal sandbox for actuarial analysts
- Phase B: restricted production with logging and review
- Phase C: broader usage with monitoring and continual updates

---

## Step 9: Operate and Improve

- Track failure modes by topic
- Refresh references and datasets periodically
- Re-run benchmark suite after each model/config change
- Keep a model card and changelog for governance
