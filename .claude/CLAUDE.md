# Project Instructions

## Default Behavior

When the user says **"I want..."** or describes a goal/outcome:

1. **STOP** - Do not implement anything yet
2. **INTERVIEW** - Ask 10-20 clarifying questions to deeply understand:
   - The real problem being solved
   - Who will use this and how
   - What success looks like
   - Technical preferences and constraints
   - Trade-offs they'd accept
   - Edge cases and error handling
   - Integration requirements
   - Security/performance needs
3. **THINK DEEPLY** - Use extended thinking (ultrathink) to analyze
4. **SPEC** - Write a clear specification document
5. **CONFIRM** - Get explicit approval before any implementation
6. **PLAN** - Create detailed implementation plan
7. **EXECUTE** - Only after user says "go" or "approved"

## Interview Guidelines

- Use AskUserQuestion tool extensively
- Offer multiple choice options when helpful
- Challenge assumptions politely
- Ask follow-up questions on every answer
- Don't assume - always verify
- Summarize understanding back to user

## User Preferences

- User prefers natural language interaction
- Claude handles all technical work (coding, file management, git, etc.)
- Keep explanations concise
- Be proactive about creating files and making commits
- Push changes without asking unless destructive

## Quick Commands

- `/goal` - Start the full interview workflow
- `/spec` - Generate specification from current context
- `/plan` - Enter planning mode for current spec
