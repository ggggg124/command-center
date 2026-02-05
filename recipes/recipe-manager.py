#!/usr/bin/env python3
"""
Family Recipe Manager
Local recipe database with meal planning and grocery list generation
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import uuid

class RecipeManager:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.data_path = self.base_path / "data"
        self.images_path = self.base_path / "images"
        self.meal_plans_path = self.base_path / "meal-plans"
        self.grocery_lists_path = self.base_path / "grocery-lists"
        
        # Ensure directories exist
        self.data_path.mkdir(exist_ok=True)
        self.images_path.mkdir(exist_ok=True)
        self.meal_plans_path.mkdir(exist_ok=True)
        self.grocery_lists_path.mkdir(exist_ok=True)
        
        # Load recipes
        self.recipes = self.load_recipes()
    
    def load_recipes(self):
        """Load all recipes from JSON files"""
        recipes = {}
        for json_file in self.data_path.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    recipe = json.load(f)
                    recipes[recipe['id']] = recipe
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
        return recipes
    
    def save_recipe(self, recipe_data):
        """Save a recipe to JSON file"""
        if 'id' not in recipe_data:
            recipe_data['id'] = str(uuid.uuid4())[:8]
        
        recipe_data['created_date'] = datetime.now().strftime('%Y-%m-%d')
        
        filename = f"{recipe_data['id']}.json"
        filepath = self.data_path / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(recipe_data, f, indent=2, ensure_ascii=False)
        
        self.recipes[recipe_data['id']] = recipe_data
        return recipe_data['id']
    
    def create_from_photo(self, image_path, extracted_text):
        """
        Create recipe from extracted text
        This would integrate with image analysis
        """
        # Placeholder - in reality would parse extracted_text
        recipe = {
            "name": "Extracted from photo",
            "category": ["uncategorized"],
            "prep_time_minutes": 30,
            "cook_time_minutes": 30,
            "total_time_minutes": 60,
            "servings": 4,
            "difficulty": "medium",
            "source": "photo",
            "source_details": image_path,
            "ingredients": [],
            "instructions": ["Instructions extracted from photo"],
            "notes": "Automatically extracted from image",
            "tags": ["photo-upload"],
            "image_path": str(image_path),
            "rating": 3,
            "dietary": {
                "vegetarian": False,
                "vegan": False,
                "gluten_free": False,
                "dairy_free": False
            }
        }
        
        return self.save_recipe(recipe)
    
    def generate_meal_plan(self, days=7, preferences=None):
        """Generate a weekly meal plan"""
        if preferences is None:
            preferences = {
                "max_cooking_time": 60,
                "vegetarian_days": 2,
                "leftover_nights": 1
            }
        
        # Simple algorithm: random selection for now
        # In reality would consider: variety, prep time, dietary restrictions
        recipe_ids = list(self.recipes.keys())
        
        if len(recipe_ids) < days:
            print(f"Warning: Only {len(recipe_ids)} recipes available for {days} days")
            recipe_ids = recipe_ids * (days // len(recipe_ids) + 1)
        
        import random
        selected = random.sample(recipe_ids, min(days, len(recipe_ids)))
        
        meal_plan = {
            "id": str(uuid.uuid4())[:8],
            "start_date": datetime.now().strftime('%Y-%m-%d'),
            "end_date": (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d'),
            "days": days,
            "meals": []
        }
        
        for i, recipe_id in enumerate(selected):
            day_date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
            meal_plan["meals"].append({
                "date": day_date,
                "day": (datetime.now() + timedelta(days=i)).strftime('%A'),
                "recipe_id": recipe_id,
                "recipe_name": self.recipes[recipe_id]["name"],
                "meal_type": "dinner"  # Could expand to breakfast/lunch
            })
        
        # Save meal plan
        filename = f"meal-plan-{meal_plan['id']}.json"
        filepath = self.meal_plans_path / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(meal_plan, f, indent=2, ensure_ascii=False)
        
        return meal_plan
    
    def generate_grocery_list(self, meal_plan_id):
        """Generate grocery list from meal plan"""
        # Load meal plan
        meal_plan_file = self.meal_plans_path / f"meal-plan-{meal_plan_id}.json"
        
        if not meal_plan_file.exists():
            return None
        
        with open(meal_plan_file, 'r', encoding='utf-8') as f:
            meal_plan = json.load(f)
        
        # Aggregate ingredients
        grocery_items = {}
        
        for meal in meal_plan["meals"]:
            recipe = self.recipes.get(meal["recipe_id"])
            if not recipe:
                continue
            
            for ingredient in recipe.get("ingredients", []):
                key = f"{ingredient['name']}|{ingredient.get('unit', '')}"
                if key in grocery_items:
                    grocery_items[key]["quantity"] += ingredient["quantity"]
                else:
                    grocery_items[key] = ingredient.copy()
        
        # Organize by category (simplified)
        grocery_list = {
            "id": str(uuid.uuid4())[:8],
            "meal_plan_id": meal_plan_id,
            "generated_date": datetime.now().strftime('%Y-%m-%d'),
            "items": list(grocery_items.values()),
            "total_items": len(grocery_items)
        }
        
        # Save grocery list
        filename = f"grocery-list-{grocery_list['id']}.json"
        filepath = self.grocery_lists_path / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(grocery_list, f, indent=2, ensure_ascii=False)
        
        return grocery_list
    
    def list_recipes(self, category=None):
        """List all recipes, optionally filtered by category"""
        if category:
            return [r for r in self.recipes.values() if category in r.get('category', [])]
        return list(self.recipes.values())
    
    def get_stats(self):
        """Get database statistics"""
        return {
            "total_recipes": len(self.recipes),
            "categories": self.get_categories(),
            "avg_prep_time": self.get_avg_prep_time(),
            "meal_plans_count": len(list(self.meal_plans_path.glob("*.json"))),
            "grocery_lists_count": len(list(self.grocery_lists_path.glob("*.json")))
        }
    
    def get_categories(self):
        """Get all unique categories"""
        categories = set()
        for recipe in self.recipes.values():
            categories.update(recipe.get('category', []))
        return list(categories)
    
    def get_avg_prep_time(self):
        """Calculate average prep time"""
        times = [r.get('prep_time_minutes', 0) for r in self.recipes.values()]
        return sum(times) / len(times) if times else 0

def main():
    # Example usage
    manager = RecipeManager("C:/Users/Home/.openclaw/workspace/recipes")
    
    print("=== Family Recipe Manager ===")
    print(f"Loaded {len(manager.recipes)} recipes")
    
    if manager.recipes:
        stats = manager.get_stats()
        print(f"Categories: {', '.join(stats['categories'])}")
        print(f"Average prep time: {stats['avg_prep_time']:.1f} minutes")
        
        # Example: Generate a meal plan
        print("\nGenerating sample meal plan...")
        meal_plan = manager.generate_meal_plan(days=5)
        print(f"Created meal plan for {meal_plan['days']} days")
        
        # Example: Generate grocery list
        grocery_list = manager.generate_grocery_list(meal_plan['id'])
        print(f"Generated grocery list with {grocery_list['total_items']} items")
    else:
        print("No recipes yet. Add your first recipe!")

if __name__ == "__main__":
    main()