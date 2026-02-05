# OpenClaw Community Feed

Simple automated feed of OpenClaw community updates from various sources.

## What It Does

Creates a clean, Apple-inspired HTML page with the latest OpenClaw community updates from:
- Twitter/X (@openclaw_ai, #openclaw)
- Reddit (r/openclaw, r/selfhosted)
- GitHub (releases, issues, discussions)
- Discord (announcements, community calls)
- OpenClaw blog and documentation

## Files Created

1. `community-feed-simple.ps1` - Main PowerShell script
2. `run-community-feed.bat` - Easy double-click launcher
3. `community-feed.html` - Generated HTML feed (output)
4. `COMMUNITY_FEED_README.md` - This documentation

## How to Use

### Quick Start
1. Double-click `run-community-feed.bat`
2. Open `community-feed.html` in your browser
3. View the latest community updates

### Manual Run
```powershell
powershell -ExecutionPolicy Bypass -File "community-feed-simple.ps1"
```

## Features

### Current Version (Simple)
- ✅ Clean Apple-inspired design
- ✅ Sample data with 5 example updates
- ✅ Responsive layout (mobile + desktop)
- ✅ Source-based color coding
- ✅ Date tracking
- ✅ Direct links to sources

### Planned Features (Advanced)
- **Real API integration** (Twitter, Reddit, GitHub, Discord)
- **Automated daily updates** via cron job
- **Search and filtering** by source/date
- **Bookmarking** favorite updates
- **Email/SMS notifications** for important updates
- **Integration with Command Center** dashboard

## Design Principles

- **Apple Aesthetics** - Clean, minimal, intuitive
- **Fast Loading** - Static HTML, no JavaScript required
- **Accessible** - Proper contrast, keyboard navigation
- **Responsive** - Works on all screen sizes
- **Maintainable** - Simple PowerShell script, easy to modify

## Integration with Command Center

This feed can be integrated into the Command Center dashboard in several ways:

### Option 1: Iframe Embed
```html
<iframe src="community-feed.html" style="width:100%; height:400px; border:none;"></iframe>
```

### Option 2: API Integration
1. Modify script to output JSON instead of HTML
2. Command Center fetches JSON via API
3. Display updates in React components

### Option 3: Shared Data Store
1. Script writes updates to shared JSON file
2. Both Command Center and feed HTML read from same file
3. Single source of truth for community updates

## Next Steps

### Phase 1: Real Data Integration
1. **Twitter API** - Fetch @openclaw_ai tweets
2. **Reddit API** - Monitor r/openclaw posts
3. **GitHub API** - Check releases and discussions
4. **RSS Feeds** - OpenClaw blog updates

### Phase 2: Automation
1. **Daily Cron Job** - Run automatically at 9:00 AM
2. **Email Digest** - Weekly summary email
3. **Telegram Bot** - Send important updates to Telegram
4. **Backup Archive** - Store historical updates

### Phase 3: Advanced Features
1. **Sentiment Analysis** - Identify positive/negative trends
2. **Topic Clustering** - Group similar updates
3. **Trend Detection** - Spot emerging topics
4. **Personalized Feed** - Learn user interests

## API Keys Required (For Advanced Version)

To fetch real data, you'll need:
- **Twitter API** - Developer account + API keys
- **Reddit API** - App credentials
- **GitHub API** - Personal Access Token
- **Discord API** - Bot token

## Security Considerations

- **API Keys** - Store in environment variables, not in script
- **Rate Limiting** - Respect API rate limits
- **Data Privacy** - Don't store personal information
- **Caching** - Cache responses to reduce API calls

## Performance

- **Current**: Instant (static HTML with sample data)
- **With APIs**: ~5-10 seconds (API calls + processing)
- **File Size**: ~5KB HTML file
- **Memory**: Minimal (PowerShell script)

## Customization

### Change Sources
Edit the `$updates` array in the PowerShell script to add/remove sources.

### Modify Design
Edit the CSS in the script to change colors, fonts, layout.

### Add Features
Extend the script with additional PowerShell functions for:
- API calls
- Data processing
- Error handling
- Logging

## Troubleshooting

### Common Issues

1. **Script won't run**
   - Enable PowerShell execution: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Run as administrator if needed

2. **HTML file not created**
   - Check file path permissions
   - Ensure PowerShell has write access

3. **Design looks wrong**
   - Check browser console for CSS errors
   - Ensure UTF-8 encoding is preserved

### Debugging
```powershell
# Run with debug output
powershell -ExecutionPolicy Bypass -File "community-feed-simple.ps1" -Verbose

# Check file permissions
Get-Acl "community-feed.html" | Format-List
```

## Contributing

1. Fork the repository
2. Add your feature or fix
3. Test thoroughly
4. Submit pull request

## License

MIT License - Free to use, modify, and distribute.

## Support

For issues or questions:
1. Check OpenClaw Discord: https://discord.com/invite/clawd
2. Open GitHub issue
3. Contact via Telegram bot

---

**Status**: Phase 1 complete - Simple static feed with sample data
**Next**: Add real API integration for live updates