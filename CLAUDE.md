# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Purpose

A **Claude Code skills library** — custom `/skills` that help Claude produce SDLC documentation to industry standards. No build system, no runtime; the "code" is Markdown consumed by Claude at runtime.

## Skill structure

```
.claude/skills/<skill-name>/
├── skill.md          # Required: frontmatter + process (~80 lines max)
└── references/       # Detailed templates, examples, checklists — read on demand
```

`skill.md` frontmatter — the `description` field determines auto-trigger:

```yaml
---
name: skill-name
description: <natural-language trigger text>
---
```

Rules: `skill.md` stays under ~80 lines. Detail goes in `references/`, not here and not in `skill.md`.

## Skills

| Skill | Purpose |
|-------|---------|
| `prd-writer` | PRD — confirm scope with client before SRS; User Stories + testable AC + approval flow |
| `srs-writer` | SRS per IEEE 830 / ISO 29148 — formal requirements specification |
| `srs-reviewer` | Review SRS across 6 quality dimensions |
| `tad-writer` | TAD per ISO/IEC/IEEE 42010 + arc42 — system architecture document |
| `tad-reviewer` | Review TAD across 6 quality dimensions |
| `api-design-writer` | API Design Layer 1 — conventions + error format (RFC 7807) + endpoint overview |
| `db-design-writer` | Database Design — DBMS-agnostic ERD (DBML/Crow's Foot) + Data Dictionary |
| `db-design-postgres-writer` | Extension of db-design-writer — PostgreSQL types, indexes, pgvector |
| `test-plan-writer` | Test Plan per ISO/IEC/IEEE 29119-3:2021 — scope, criteria, risks |
| `test-design-writer` | Test Design Spec per 29119-3 — test conditions (TCOND) via EP/BVA/Decision Table/State Transition |
| `test-case-writer` | Test Case Spec per 29119-3 — steps, expected results, AI output patterns |

Design decisions for each skill live in that skill's own files — not here.

## Adding a skill

1. Create `.claude/skills/<name>/skill.md` with frontmatter + process instructions
2. Put templates, examples, and checklists in `references/` — one file per concern
3. In `skill.md`, tell Claude *which* reference file to read *when* — don't load everything upfront
4. Update the Skills table above and `README.md`

## Working in this repo

**Ask before assuming.** If a request has multiple valid interpretations, surface them — don't pick silently.

**Minimum viable content.** Add only what was asked. No extra sections, no speculative examples, no abstractions for single-use content.

**Surgical edits.** Touch only what the request requires. Don't fix adjacent issues silently — mention them instead.

**Plan multi-step work first.** State what changes and how to verify before starting. Clarifying questions come before edits, not after mistakes.
