---
description: Create implementation plan from approved specification
---

# Implementation Planning Mode

Create a detailed, actionable implementation plan from the approved specification.

## Planning Process

1. **Read the spec** - Load the relevant specification from `specs/`
2. **Analyze complexity** - Break down into manageable chunks
3. **Identify dependencies** - What needs to happen first?
4. **Create phases** - Logical groupings of work
5. **Detail tasks** - Specific, actionable items

## Plan Structure

```markdown
# Implementation Plan: [Project Name]

## Overview
Brief summary of the implementation approach.

## Architecture
High-level architecture diagram or description.

## Phases

### Phase 1: Foundation
**Goal:** [what this phase achieves]

- [ ] Task 1.1: [specific task]
- [ ] Task 1.2: [specific task]

### Phase 2: Core Features
**Goal:** [what this phase achieves]

- [ ] Task 2.1: [specific task]
- [ ] Task 2.2: [specific task]

### Phase 3: Polish & Deploy
**Goal:** [what this phase achieves]

- [ ] Task 3.1: [specific task]

## File Structure
```
project/
├── src/
│   └── ...
└── ...
```

## Testing Strategy
How we'll verify each phase works.

## Rollback Plan
How to undo if something goes wrong.
```

## Actions

1. Save plan to `plans/[project-name]-plan.md`
2. Present plan for user review
3. Ask: "Ready to execute? Say 'go' to start Phase 1"
