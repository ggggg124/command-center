#!/usr/bin/env python3
"""
Test the recipe system
"""

import json
import os
from pathlib import Path

# Check what we have
base_path = Path("C:/Users/Home/.openclaw/workspace/recipes")
data_path = base_path / "data"

print("=== Testing Recipe System ===")
print(f"Data path: {data_path}")

# List recipe files
recipe_files = list(data_path.glob("*.json"))
print(f"\nFound {len(recipe_files)} recipe files:")

for rf in recipe_files:
    print(f"  - {rf.name}")
    try:
        with open(rf, 'r', encoding='utf-8') as f:
            recipe = json.load(f)
        print(f"    Name: {recipe.get('name', 'Unknown')}")
        print(f"    ID: {recipe.get('id', 'No ID')}")
    except Exception as e:
        print(f"    Error reading: {e}")

# Check directory structure
print("\n=== Directory Structure ===")
for root, dirs, files in os.walk(base_path):
    level = root.replace(str(base_path), '').count(os.sep)
    indent = ' ' * 2 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = ' ' * 2 * (level + 1)
    for file in files[:5]:  # Show first 5 files
        print(f"{subindent}{file}")
    if len(files) > 5:
        print(f"{subindent}... and {len(files) - 5} more")

print("\n=== System Ready! ===")
print("You can now:")
print("1. Send me recipe photos via Telegram")
print("2. I'll extract text and create recipe entries")
print("3. Generate meal plans automatically")
print("4. Create grocery lists from meal plans")