#!/usr/bin/env python3
"""
Simple CLI for Recipe Manager
"""

import json
import sys
import os
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Try to import RecipeManager
try:
    from recipe_manager import RecipeManager
except ImportError:
    # Fallback: define minimal RecipeManager
    import json
    import uuid
    from datetime import datetime
    from pathlib import Path
    
    class RecipeManager:
        def __init__(self, base_path):
            self.base_path = Path(base_path)
            self.data_path = self.base_path / "data"
            self.data_path.mkdir(exist_ok=True)
            self.recipes = {}
            
        def save_recipe(self, recipe_data):
            if 'id' not in recipe_data:
                recipe_data['id'] = str(uuid.uuid4())[:8]
            
            filename = f"{recipe_data['id']}.json"
            filepath = self.data_path / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(recipe_data, f, indent=2, ensure_ascii=False)
            
            self.recipes[recipe_data['id']] = recipe_data
            return recipe_data['id']

def print_help():
    print("""
Family Recipe Manager CLI

Commands:
  help                    Show this help
  list                    List all recipes
  stats                   Show database statistics
  categories              List all categories
  plan [days]             Generate meal plan (default: 7 days)
  grocery <plan_id>       Generate grocery list for meal plan
  add <json_file>         Add recipe from JSON file
  view <recipe_id>        View recipe details
  search <term>           Search recipes by name/tag
  export                  Export all recipes to single JSON
  """)

def main():
    manager = RecipeManager("C:/Users/Home/.openclaw/workspace/recipes")
    
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == "help":
        print_help()
    
    elif command == "list":
        recipes = manager.list_recipes()
        print(f"\nFound {len(recipes)} recipes:")
        for i, recipe in enumerate(recipes, 1):
            print(f"{i}. {recipe['name']} ({recipe.get('prep_time_minutes', '?')} min)")
            if 'category' in recipe:
                print(f"   Categories: {', '.join(recipe['category'])}")
            print()
    
    elif command == "stats":
        stats = manager.get_stats()
        print("\n=== Recipe Database Statistics ===")
        print(f"Total recipes: {stats['total_recipes']}")
        print(f"Categories: {', '.join(stats['categories'])}")
        print(f"Average prep time: {stats['avg_prep_time']:.1f} minutes")
        print(f"Meal plans: {stats['meal_plans_count']}")
        print(f"Grocery lists: {stats['grocery_lists_count']}")
    
    elif command == "categories":
        categories = manager.get_categories()
        print("\nRecipe Categories:")
        for cat in categories:
            count = len(manager.list_recipes(cat))
            print(f"  {cat}: {count} recipes")
    
    elif command == "plan":
        days = 7
        if len(sys.argv) > 2:
            try:
                days = int(sys.argv[2])
            except:
                print("Error: days must be a number")
                return
        
        print(f"\nGenerating {days}-day meal plan...")
        meal_plan = manager.generate_meal_plan(days=days)
        
        print(f"\nMeal Plan ID: {meal_plan['id']}")
        print(f"Dates: {meal_plan['start_date']} to {meal_plan['end_date']}")
        print("\nMeals:")
        for meal in meal_plan['meals']:
            print(f"  {meal['date']} ({meal['day']}): {meal['recipe_name']}")
    
    elif command == "grocery":
        if len(sys.argv) < 3:
            print("Error: Please provide meal plan ID")
            print("Usage: cli grocery <plan_id>")
            return
        
        plan_id = sys.argv[2]
        print(f"\nGenerating grocery list for meal plan {plan_id}...")
        grocery_list = manager.generate_grocery_list(plan_id)
        
        if not grocery_list:
            print("Error: Meal plan not found")
            return
        
        print(f"\nGrocery List ID: {grocery_list['id']}")
        print(f"Total items: {grocery_list['total_items']}")
        print("\nItems:")
        for item in grocery_list['items']:
            print(f"  {item['quantity']} {item.get('unit', '')} {item['name']}")
    
    elif command == "add":
        if len(sys.argv) < 3:
            print("Error: Please provide JSON file path")
            print("Usage: cli add <json_file>")
            return
        
        json_file = sys.argv[2]
        if not os.path.exists(json_file):
            print(f"Error: File not found: {json_file}")
            return
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                recipe_data = json.load(f)
            
            recipe_id = manager.save_recipe(recipe_data)
            print(f"Recipe added successfully! ID: {recipe_id}")
            print(f"Name: {recipe_data['name']}")
        
        except Exception as e:
            print(f"Error adding recipe: {e}")
    
    elif command == "view":
        if len(sys.argv) < 3:
            print("Error: Please provide recipe ID")
            print("Usage: cli view <recipe_id>")
            return
        
        recipe_id = sys.argv[2]
        recipe = manager.recipes.get(recipe_id)
        
        if not recipe:
            print(f"Error: Recipe not found: {recipe_id}")
            return
        
        print(f"\n=== {recipe['name']} ===")
        print(f"ID: {recipe['id']}")
        print(f"Categories: {', '.join(recipe.get('category', []))}")
        print(f"Prep time: {recipe.get('prep_time_minutes', '?')} minutes")
        print(f"Servings: {recipe.get('servings', '?')}")
        print(f"Difficulty: {recipe.get('difficulty', 'unknown')}")
        
        if 'ingredients' in recipe and recipe['ingredients']:
            print("\nIngredients:")
            for ing in recipe['ingredients']:
                print(f"  {ing['quantity']} {ing.get('unit', '')} {ing['name']}")
        
        if 'instructions' in recipe and recipe['instructions']:
            print("\nInstructions:")
            for i, step in enumerate(recipe['instructions'], 1):
                print(f"  {i}. {step}")
    
    elif command == "search":
        if len(sys.argv) < 3:
            print("Error: Please provide search term")
            print("Usage: cli search <term>")
            return
        
        term = sys.argv[2].lower()
        results = []
        
        for recipe in manager.recipes.values():
            if (term in recipe['name'].lower() or 
                any(term in tag.lower() for tag in recipe.get('tags', [])) or
                any(term in cat.lower() for cat in recipe.get('category', []))):
                results.append(recipe)
        
        print(f"\nFound {len(results)} recipes matching '{term}':")
        for recipe in results:
            print(f"  {recipe['name']} (ID: {recipe['id']})")
    
    elif command == "export":
        export_data = {
            "export_date": datetime.now().strftime('%Y-%m-%d'),
            "total_recipes": len(manager.recipes),
            "recipes": list(manager.recipes.values())
        }
        
        export_file = "C:/Users/Home/.openclaw/workspace/recipes/export-all.json"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(manager.recipes)} recipes to {export_file}")
    
    else:
        print(f"Unknown command: {command}")
        print_help()

if __name__ == "__main__":
    main()