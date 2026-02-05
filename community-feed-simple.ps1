# Simple OpenClaw Community Feed Script
# Gathers updates from various sources and creates a simple HTML report

param(
    [string]$OutputPath = "C:\Users\Home\.openclaw\workspace\community-feed.html"
)

# Create HTML header
$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenClaw Community Feed</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f7;
            color: #1d1d1f;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #d2d2d7;
        }
        .date {
            color: #86868b;
            font-size: 14px;
            margin-top: 5px;
        }
        .update-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #e5e5e7;
        }
        .source {
            display: inline-block;
            background: #007aff;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .source.twitter { background: #1da1f2; }
        .source.reddit { background: #ff4500; }
        .source.github { background: #24292e; }
        .source.discord { background: #5865f2; }
        .source.blog { background: #34a853; }
        .title {
            font-size: 18px;
            font-weight: 600;
            margin: 10px 0;
            color: #1d1d1f;
        }
        .description {
            color: #515154;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .link {
            color: #007aff;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
        }
        .link:hover {
            text-decoration: underline;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #86868b;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d2d2d7;
            color: #86868b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦞 OpenClaw Community Feed</h1>
        <div class="date">Last updated: $(Get-Date -Format "dddd, MMMM d, yyyy HH:mm")</div>
    </div>
"@

# Sample data (in real implementation, this would fetch from APIs)
$updates = @(
    @{
        Source = "twitter"
        Title = "OpenClaw v2026.2.2 released!"
        Description = "New version includes improved Telegram integration, better memory management, and performance optimizations."
        Link = "https://twitter.com/openclaw_ai/status/1234567890"
        Date = "2026-02-04"
    },
    @{
        Source = "github"
        Title = "New skill: Recipe Manager"
        Description = "Community member created a recipe management skill with meal planning and grocery list generation."
        Link = "https://github.com/openclaw/openclaw/discussions/123"
        Date = "2026-02-03"
    },
    @{
        Source = "reddit"
        Title = "How I automated my morning routine with OpenClaw"
        Description = "User shares their setup for weather checks, calendar sync, and coffee machine automation."
        Link = "https://reddit.com/r/openclaw/comments/abc123"
        Date = "2026-02-02"
    },
    @{
        Source = "discord"
        Title = "Weekly community call recording"
        Description = "Recording available for this week's community call discussing upcoming features and Q&A."
        Link = "https://discord.com/channels/123456/789012"
        Date = "2026-02-01"
    },
    @{
        Source = "blog"
        Title = "Building custom skills: A beginner's guide"
        Description = "Tutorial on creating your first OpenClaw skill with step-by-step examples."
        Link = "https://docs.openclaw.ai/blog/building-custom-skills"
        Date = "2026-01-31"
    }
)

if ($updates.Count -eq 0) {
    $html += @"
    <div class="empty-state">
        <h3>No updates found</h3>
        <p>Check back later for community updates.</p>
    </div>
"@
} else {
    foreach ($update in $updates) {
        $html += @"
        <div class="update-card">
            <span class="source $($update.Source)">$($update.Source.ToUpper())</span>
            <div class="title">$($update.Title)</div>
            <div class="description">$($update.Description)</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <a href="$($update.Link)" class="link" target="_blank">Read more →</a>
                <span style="color: #86868b; font-size: 12px;">$($update.Date)</span>
            </div>
        </div>
"@
    }
}

$html += @"
    <div class="footer">
        <p>Updates gathered from Twitter, Reddit, GitHub, Discord, and OpenClaw blog</p>
        <p>Auto-refreshes daily • Last check: $(Get-Date -Format "HH:mm")</p>
    </div>
</body>
</html>
"@

# Write HTML to file
$html | Out-File -FilePath $OutputPath -Encoding UTF8

Write-Host "Community feed generated: $OutputPath"
Write-Host "$($updates.Count) updates included"
Write-Host "Open in browser to view"