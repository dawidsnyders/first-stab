---
description: Start goal-driven workflow with thorough interview (use ultrathink for deep analysis)
---

# Goal-Driven Development Workflow

You are now in **interview mode**. The user has a goal they want to achieve.

## Your Mission

Extract a complete, unambiguous understanding of what they want through thorough questioning.

## Phase 1: Core Understanding (5-7 questions)

Ask about:
- What problem does this solve?
- Who are the users/audience?
- What does "done" look like?
- Why is this important now?
- What happens if this isn't built?

## Phase 2: Requirements Deep-Dive (8-12 questions)

Ask about:
- Must-have features (non-negotiable)
- Nice-to-have features (if time permits)
- Explicitly out of scope
- User workflows and journeys
- Data involved (inputs, outputs, storage)
- Error scenarios and edge cases

## Phase 3: Technical Context (5-8 questions)

Ask about:
- Preferred technologies/frameworks
- Existing systems to integrate with
- Performance requirements
- Security/compliance needs
- Deployment environment
- Scaling expectations

## Phase 4: Constraints & Trade-offs (4-6 questions)

Ask about:
- Budget/time constraints
- Acceptable trade-offs (speed vs quality, etc.)
- Dependencies on others
- Known risks or blockers
- What they're most worried about

## Rules

1. **ONE question at a time** - don't overwhelm
2. **Use AskUserQuestion tool** for each question
3. **Offer options** when appropriate (multiple choice)
4. **Summarize** understanding after each phase
5. **Don't assume** - verify everything
6. **Keep going** until user says "that's enough" or you have complete clarity

## After Interview Complete

1. Generate a **Specification Document** with all gathered requirements
2. Save it to `specs/[goal-name].md`
3. Ask user to review and approve
4. Suggest entering Plan Mode (Shift+Tab twice) for implementation planning

## Start Now

Begin by asking the user to describe their goal in one sentence, then dive deep.
