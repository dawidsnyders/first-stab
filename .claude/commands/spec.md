---
description: Generate a specification document from current conversation context
---

# Generate Specification

Based on our conversation, create a comprehensive specification document.

## Document Structure

```markdown
# [Project Name] Specification

## Overview
One paragraph summary of what we're building and why.

## Problem Statement
- What problem this solves
- Who has this problem
- Current pain points

## Goals
- Primary goal
- Secondary goals
- Success metrics

## Requirements

### Must Have (P0)
- [ ] Requirement 1
- [ ] Requirement 2

### Should Have (P1)
- [ ] Requirement 1

### Nice to Have (P2)
- [ ] Requirement 1

### Out of Scope
- Item 1
- Item 2

## User Stories
- As a [user], I want [feature] so that [benefit]

## Technical Requirements
- Stack/framework preferences
- Performance requirements
- Security requirements
- Integration requirements

## Constraints
- Time/budget constraints
- Technical constraints
- Dependencies

## Risks
- Risk 1: [description] - Mitigation: [plan]

## Open Questions
- Question 1?

## Approvals
- [ ] User approved this specification
```

## Actions

1. Create `specs/` directory if it doesn't exist
2. Save specification to `specs/[descriptive-name].md`
3. Display the full spec for user review
4. Ask for approval before proceeding
