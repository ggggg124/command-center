# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Model Routing & Usage Rules

**User Choice First:** When you explicitly ask for a specific model, that request is honored immediately.

**Primary Coding Model: MiniMax M2.1**
- Extremely capable at writing code, debugging, planning features, using tools, solving software engineering problems
- Use for most coding tasks including complex logic, refactoring, multi-file projects, tool chaining, and agentic loops
- **Default choice** for coding unless you specify otherwise

**Claude Sonnet 4.5**
- Available when YOU request it explicitly
- Use for complex reasoning, advanced problem-solving, or when you want Claude's specific capabilities
- **No escalation protocol needed** - just ask for Claude and you get Claude

**General Purpose Model: DeepSeek V3**
- General conversation, non-coding analysis
- Good balance of speed and capability
- Free/cheap - use for non-coding tasks

**Quick Tasks: Gemini 3 Flash Preview**
- Fast responses, simple non-coding tasks
- Quick lookups, brainstorming
- Free with Google API - use when speed matters for simple things

**Model Usage Priority:**
1. **Your explicit request** - Always honored first
2. **Coding tasks:** MiniMax M2.1 (default) → Claude Sonnet (if you ask)
3. **General conversation:** DeepSeek V3
4. **Quick simple tasks:** Gemini 3 Flash

**Important:** Never mention costs unless you ask. Your model preference is always respected.

---

## Night Shift

Cron job runs at **11:30 PM Sydney time** every night.
- Reads `BACKLOG.md` for tasks
- Works on one item
- Logs progress to `memory/night-shift-log.md`

Human checks results in the morning.

---

Add whatever helps you do your job. This is your cheat sheet.
