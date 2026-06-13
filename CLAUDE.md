# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repository is a **Claude Code skills library** — a collection of custom `/skills` that extend Claude Code's capabilities for specific domains. There is no build system, runtime, or tests; the "code" is Markdown instruction files consumed by Claude Code at runtime.

## Skill Structure

Each skill lives in `.claude/skills/<skill-name>/` and follows this layout:

```
.claude/skills/<skill-name>/
├── skill.md                  # Required: frontmatter + instructions
└── references/               # Optional: reference files read on demand
    └── *.md
```

### `skill.md` frontmatter

```yaml
---
name: skill-name              # matches directory name
description: <trigger text>   # used by Claude to decide when to invoke this skill
---
```

The `description` field is critical — it determines when the skill auto-triggers. Write it to match the natural language a user would use, not technical jargon.

### Reference files

`skill.md` should stay under ~80 lines. Detailed criteria, examples, and patterns go in `references/` and are read on demand (the skill instructions tell Claude which file to read for which situation).

## Skills in this repo

| Skill | Purpose | Key reference files |
|-------|---------|-------------------|
| `srs-writer` | Write SRS documents per IEEE 830 / ISO 29148 (MSRS template) | `srs-structure.md`, `requirement-patterns.md` |
| `srs-reviewer` | Review SRS documents across 6 quality dimensions | `review-criteria.md`, `finding-guide.md` |
| `tad-writer` | Write Technical Architecture Documents per ISO/IEC/IEEE 42010 + arc42 | `tad-structure.md`, `adr-patterns.md` |
| `tad-reviewer` | Review TADs across 6 quality dimensions | `review-criteria.md`, `finding-guide.md` |
| `api-design-writer` | Write REST API Design docs (Layer 1 convention/contract) per Zalando Guidelines + RFC 7807 | `api-design-structure.md`, `conventions-checklist.md` |
| `db-design-writer` | Write Database Design docs (ERD + Data Dictionary, DBMS-agnostic) using Crow's Foot / DBML | `db-design-structure.md`, `erd-dbml-guide.md` |
| `db-design-postgres-writer` | Extension of db-design-writer — PostgreSQL-specific types, indexes, FK syntax, pgvector | `postgres-conventions.md` |
| `test-plan-writer` | Write Test Plans per ISO/IEC/IEEE 29119-3:2021 — scope, approach, measurable criteria, risks | `test-plan-structure.md`, `test-plan-example.md` |
| `test-design-writer` | Write Test Design Specifications per 29119-3 — derive test conditions (TCOND) using EP/BVA/Decision Table/State Transition | `test-design-structure.md`, `test-design-examples.md` |
| `test-case-writer` | Write Test Case Specifications per 29119-3 — full TC format, Independence/Atomicity principles, AI output CONTAINS/NOT CONTAINS pattern | `test-case-structure.md`, `test-case-examples.md` |
| `prd-writer` | Write PRD (Product Requirements Document) — business/user-language doc for client scope confirmation before SRS; User Stories with US-XXX IDs, testable AC, traceability placeholder, approval mechanism | `prd-structure.md`, `user-story-guide.md` |

### prd-writer design decisions
- PRD is document #1 in the SDLC chain: PRD → SRS → TAD → API/DB Design → Test Plan; sits before SRS and is the client-facing scope confirmation document
- "What & why" boundary is the primary quality gate — the "What vs How" table in `prd-structure.md` is a quick reference for catching implementation details that leak into the PRD
- US-XXX IDs are immutable like REQ-IDs in SRS — change content, not the ID; IDs never reused or deleted (mark as Rejected with reason instead)
- AC testability is the key quality criterion: each AC must be binary pass/fail; AC in PRD are the source for Test Conditions (TCOND) in TDS later — bad AC = untestable test conditions downstream
- Traceability placeholder `Derived REQ-ID(s): TBD` is structural, not optional — ensures srs-writer has a slot to back-fill, preventing traceability gap
- Baseline + Change Log pattern is adapted from outsourcing/freelance project governance: once client signs off, the Approved version is frozen; Change Requests modify scope through a tracked process, not direct edits
- Two AC formats: Checklist (for simple rules) and Given-When-Then (for complex scenarios or AI output behavior); GWT for AI output AC avoids exact-match trap, mirrors CONTAINS/NOT CONTAINS pattern from test-case-writer
- Two output modes: Single PRD (`prd.md`) for small-medium projects; Feature PRD (`prd-[feature].md`) for large projects with multiple independent feature teams

### srs-writer design decisions
- Based on [jam01/SRS-Template](https://github.com/jam01/SRS-Template) aligned to IEEE 830 + ISO/IEC/IEEE 29148:2011/2017
- REQ template includes: `Status` (draft/active/deprecated/waived), `Priority`, `Owner` — fields from ISO 29148 attribute model
- Section 3.6 AI/ML is mandatory for any system with ML components; this is the key extension beyond classic IEEE 830
- Three output modes: monolithic `srs.md` / breakout per-REQ files / requirements-only (no wrapping SRS)

### tad-writer design decisions
- Based on arc42 template (12 sections) + ISO/IEC/IEEE 42010:2011 mandatory requirements
- ADR template is hybrid Nygard (Title/Context/Decision/Status/Consequences) + MADR (Options Considered with pros/cons) — captures both simplicity and decision transparency
- Writing ORDER differs from document ORDER: Context→Stakeholders→QualityGoals→Deployment→BB→Runtime→ADRs→SolutionStrategy; Section 4 written last but placed first — this is intentional
- Three output modes: Full TAD / Architecture Brief (Sections 1,3,5,9) / ADR-only
- AI/ML systems: Section 8 must cover chunking, embedding, prompt engineering, fallback — same principle as srs-writer's Section 3.6

### tad-reviewer design decisions
- 6 dimensions ordered from outside-in: Structure → Stakeholder Coverage → Decision Quality → View Consistency → Quality Traceability → Notation Clarity
- View Consistency (DIM-4) is unique to TAD review — catches the common bug where BB View and Deployment View describe different component sets
- ADR review (DIM-3) is stricter than most teams expect: missing alternatives = BLOCKER (not MAJOR)
- `finding-guide.md` has edge case calibration for: lightweight Architecture Brief mode, AI/ML chunking in Section 8 vs Section 9, Section 4 vs Section 9 duplication (intentional vs contradiction)

### srs-reviewer design decisions
- Adversarial by default — 6 dimensions applied in order: Structure → Format → Verifiability → Atomicity → Completeness → Consistency
- Severity: BLOCKER (can't use REQ) / MAJOR (affects testing/design) / MINOR (governance gap) / SUGGESTION
- Risk level RED/YELLOW/GREEN drives the REJECT/CONDITIONAL ACCEPT/ACCEPT recommendation
- `finding-guide.md` contains calibration for edge cases (compound REQs, AI-via-API systems, partial ACs)

### test-case-writer design decisions
- Skill was informed by the user's existing `test-case-guide-29119-3.md` (in Downloads) — that file is a comprehensive reference; this skill distills it into actionable principles without duplicating the full guide
- AI output testing pattern (CONTAINS / NOT CONTAINS / STRUCTURE) is the primary extension beyond classical ISTQB — addresses the non-deterministic nature of LLM responses; each TC must declare its `Evaluation` method (Manual / Automated keyword / LLM judge)
- Independence principle is the most common violation found in practice — examples file has an explicit "violation + fix" pair so the pattern is recognizable
- Atomicity rule has an exception: multiple assertions about the same atomic response object (HTTP status + body fields) are allowed in 1 TC; only split when testing genuinely separate concerns
- `test-case-guide-29119-3.md` in the user's Downloads is a full 29119-3 guide they may reference independently — this skill references principles from it without requiring it

### test-design-writer design decisions
- TDS sits between Test Plan (strategy) and Test Case Spec (execution) — skill.md opens with the 3-level hierarchy: Feature → Test Condition → Coverage Item → Test Case, with a concrete "lean" diagnostic: if you write "click" or "expect status 200" you've slipped into test case territory
- EP for natural language (RAG/chatbot) is the key extension beyond classical ISTQB: partition by semantic intent (in-scope/out-of-scope/ambiguous/adversarial) not by numeric range; this is explicitly called out because it's the non-obvious adaptation for AI systems
- Coverage items are the unit of coverage measurement: 1 TCOND can have N coverage items; each coverage item maps to ~1 test case in TCS (next doc)
- Decision table example includes the "merge rules" note — Rules 3+4 collapse when auth check precedes format check; understanding execution order matters for correct table construction
- Traceability: TDS is the "middle node" — receives REQ-IDs from SRS/Test Plan, will be consumed by TCS. The traceability table has a TC-ID column left as placeholder, to be filled when TCS is written

### test-plan-writer design decisions
- Follows ISO/IEC/IEEE 29119-3:2021 (supersedes IEEE 829); section names align to 29119-3 terminology but structure is compatible with legacy 829 readers
- Measurability is the primary quality criterion — all criteria (entry/exit/suspension/resumption) must have numeric thresholds; the reference file has explicit bad/good examples for this
- Test Plan vs Strategy vs Approach distinction is intentional: Plan is project/release-scoped; Strategy is org/product-level (separate doc); Approach is the "how" section within the Plan
- `test-plan-example.md` is a condensed but complete real-world pattern for a RAG/Document Q&A project — includes LLM-specific risks (API quota, output quality evaluation) and explains why some tests must stay manual (human judgment on AI output quality)
- Scale guidance: 1-team project → single 3–5 page plan; larger projects → Master + Level Test Plans (briefly explained in skill.md)

### db-design-postgres-writer design decisions
- Extension pattern: skill.md explicitly instructs "read db-design-writer first" — does not duplicate structure, only adds PostgreSQL-specific content for sections 3, 4, 5, 6, 7, 8
- pgvector handling: if user uses pgvector, vector table merges into main ERD (it's a normal Postgres table) instead of a separate Section 7 — skill.md explains this divergence from base skill
- UUID recommendation: `gen_random_uuid()` (PG 13+ built-in) preferred over `uuid_generate_v4()` (requires extension); BIGSERIAL for internal high-volume tables
- TIMESTAMPTZ always over TIMESTAMP — common bug source, explicitly called out
- ENUM type discouraged in favor of VARCHAR + CHECK constraint — ALTER TYPE to remove values is painful
- FK index: explicitly noted that PostgreSQL does NOT auto-create indexes for FK columns (unlike MySQL) — must add manually

### db-design-writer design decisions
- DBMS-agnostic by design — uses generic types (STRING, INTEGER, TIMESTAMP); DBMS-specific skills (db-design-postgres-writer etc.) layer on top with concrete types and index variants
- ERD source is DBML text (version-controllable), not image-only; render via dbdiagram.io
- Data Dictionary has two mandatory columns per field: business meaning (natural language) and technical spec — inspired by ISO/IEC 11179 but without full compliance burden
- Section 7 (Vector Store) is mandatory for AI/RAG systems and must stay separate from relational ERD
- Traceability to SRS REQ-IDs is embedded directly in DBML comments, not a separate matrix
- Skill explicitly warns: if user names a DBMS, check for a DBMS-specific extension skill before writing type details

### api-design-writer design decisions
- Two-layer split is the core invariant: Layer 1 (this doc, handwritten) = conventions/contracts; Layer 2 (code-generated) = schema detail. Never mix.
- Error format is RFC 7807 (Problem Details) — 5 mandatory fields: type, title, status, detail, instance. Extension fields allowed.
- Naming conventions derived from Zalando RESTful API Guidelines, trimmed for small/medium projects — full guidelines at opensourc.zalando.com/restful-api-guidelines
- FastAPI note is intentional: Pydantic + routes auto-generate OpenAPI (Layer 2) — document tells users not to write Swagger by hand
- `conventions-checklist.md` is a decision table, not a rules list — every row has "options" and "deciding question" so users record rationale, not just choices
- Section 5 (Endpoint Overview) is intentionally minimal: method + path + 1-line description + Layer 2 link only. No request/response bodies.

## Adding a new skill

1. Create `.claude/skills/<name>/skill.md` with frontmatter + instructions
2. Put detailed reference content in `references/` — one file per concern
3. The skill's instructions should tell Claude *which* reference file to read *when* — don't make Claude read everything upfront
4. Keep `skill.md` focused on process and decision logic; keep examples/criteria in `references/`

---

## Behavioral Guidelines

> These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### Think Before Writing

Don't assume. Don't hide confusion. Surface tradeoffs.

Before making any change to a skill file:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler structure exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### Simplicity First

Minimum content that solves the problem. Nothing speculative.

- No sections beyond what was asked.
- No abstractions or helper structures for single-use content.
- No "flexibility" or extra examples that weren't requested.
- If a skill instruction is 200 lines and could be 50, rewrite it.

Ask: "Would a reader say this is overcomplicated?" If yes, simplify.

### Surgical Changes

Touch only what you must. When editing existing skill files:
- Don't improve adjacent sections, fix unrelated wording, or reformat things not in scope.
- Match existing style and tone, even if you'd do it differently.
- If you notice an unrelated issue, mention it — don't fix it silently.
- Remove only what your changes made obsolete; leave pre-existing content alone unless asked.

Every changed line should trace directly to the user's request.

### Goal-Driven Execution

For multi-step skill work, state a brief plan before starting:

```
1. [What changes] → verify: [how to confirm it's right]
2. [What changes] → verify: [how to confirm it's right]
```

Clarifying questions come before edits, not after mistakes.
