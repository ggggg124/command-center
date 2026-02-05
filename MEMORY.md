# MEMORY.md - Long-Term Memory

## About Don
- **Name**: Don
- **Location**: Sydney, Australia
- **Timezone**: Australia/Sydney
- **Language**: Australian English (spelling & grammar)
- **Business**: Nextage Group (small business, ramping up in 2026)
- **Coding level**: Basic coder, vibe codes apps
- **Projects built**: Sommelai (wine sommelier app), MatePlate AI (pet food selection app)

## Critical Directives
1. **Be proactive** - Work every night while Don sleeps
2. **Build actual things** - Create tangible projects, tools, or improvements overnight
3. **Surprise each morning** - Don wants to wake up to surprises of what I've built myself
4. **Focus on OpenClaw management** - Not weather apps or generic utilities

## Model Configuration
- **Primary coding model**: MiniMax M2.1 (extremely capable for coding tasks)
- **Escalation model**: Claude Sonnet 4.5 (only as last resort)
- **General conversation**: DeepSeek V3
- **Quick tasks**: Gemini 3 Flash Preview
- **Never mention costs** unless asked directly

## Night Shift System
- **Cron job**: Runs at 11:30 PM Sydney time every night
- **Process**: Picks ONE item from BACKLOG.md, works on it for up to 1 hour
- **Focus**: OpenClaw management dashboard components and tools
- **Technology**: Web-based (HTML/CSS/JavaScript with Tailwind CSS), modern UI, responsive

## Current Backlog Focus
Priority items for OpenClaw management:
1. Agent Status Dashboard
2. Enhanced Chat Interface  
3. Proactive Suggestion Panel
4. Visual Memory Viewer
5. Real-time Status Widget
6. Task History Log Viewer

## Communication Style
- **Brief responses** unless asked for detail
- **Australian English** only (colour, organisation, behaviour, etc.)
- **No filler phrases** - be genuinely helpful, not performatively helpful
- **Have opinions** - allowed to disagree, prefer things, find stuff amusing or boring

## Security & Boundaries
- **Private things stay private** - never exfiltrate private data
- **Ask before acting externally** - emails, tweets, public posts
- **Be careful in group chats** - not the user's voice, just a participant
- **Quality > quantity** in group chats - don't respond to every message

## File Structure
- **Daily notes**: `memory/YYYY-MM-DD.md` - raw logs of what happened
- **Long-term memory**: `MEMORY.md` (this file) - curated memories
- **Only load MEMORY.md in main sessions** - contains personal context
- **Write things down** - no "mental notes", files survive session restarts

## Telegram Integration & Security Lockdown (2026-02-05)
- **Bot token configured**: Telegram plugin enabled and running
- **Security lockdown applied**: Strict allowlist configuration
- **Allowed access**: Only Telegram ID 5086862672 (Don) + direct computer access
- **Blocked**: All other users, all group chats
- **Configuration**: DM allowlist only, group policy disabled
- **Alternative to webchat**: Secure permanent messaging channel without webchat UX issues

## Configuration Fix (2026-02-05)
- **Model configuration corrected**: Updated primary model from `deepseek/deepseek-chat` to `minimax/m2.1` per TOOLS.md guidelines
- **Fallback order**: `deepseek/deepseek-chat` → `google/gemini-3-flash-preview` → `anthropic/claude-sonnet-4-5`
- **Alignment**: Configuration now matches documented model routing rules in TOOLS.md

## Command Center Project (2026-02-05)
- **Built complete Apple-inspired dashboard** for OpenClaw management
- **Multiple deployment options**: Next.js local, HTML version, GitHub Pages
- **Fixed night shift script** for Windows compatibility
- **Created "surprise feature" cron job** (11:00 PM daily) to build features Don would like
- **Fixed model routing rules**: User choice now prioritized (ask for Claude → get Claude)
- **GitHub Pages ready**: `docs/index.html` with drag-drop Kanban, quick actions, live time
- **Key learning**: GitHub Pages more reliable than Vercel for simple deployments

## Critical Model Provider Configuration Fix (2026-02-05)
**Root Problem Identified:** 
- Auth profiles existed for Anthropic and Google, but providers weren't configured in `models.providers` section
- Only DeepSeek and MiniMax were configured, causing fallback failures when Claude/Gemini were requested
- This explained why Claude 4.5 showed as "configured: false" and system fell back to DeepSeek even when Claude was requested

**Solution Applied:**
1. **Added missing providers** to `models.providers`:
   - ✅ **Anthropic**: `claude-sonnet-4-5` with proper API configuration
   - ✅ **Google**: `gemini-3-flash-preview` with proper API configuration
   - ✅ **MiniMax**: Already configured (`m2.1`)
   - ✅ **DeepSeek**: Already configured (`deepseek-chat`)

2. **Updated primary model** to `minimax/m2.1` per TOOLS.md guidelines
3. **Set correct fallback order**: `deepseek/deepseek-chat` → `google/gemini-3-flash-preview` → `anthropic/claude-sonnet-4-5`

**Result:**
- ✅ All four providers now properly configured and accessible
- ✅ Model routing follows TOOLS.md guidelines
- ✅ Claude 4.5 and Gemini 3 Flash now work as expected in fallbacks
- ✅ Primary coding model is MiniMax M2.1 as intended
- ✅ System now correctly routes to requested models (ask for Claude → get Claude)

## Last Updated
2026-02-05 - Complete model provider configuration fixed (Anthropic + Google added)