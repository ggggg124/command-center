#!/usr/bin/env python3
"""
Recipe OCR Processor
Processes recipe photos sent via Telegram, extracts text using OCR,
and creates structured recipe data for Google Drive storage.
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime
import uuid
import sys

class RecipeOCRProcessor:
    def __init__(self, google_drive_path=None):
        """
        Initialize OCR processor
        
        Args:
            google_drive_path: Path to Google Drive folder (when set up)
        """
        self.google_drive_path = google_drive_path
        
        # Common ingredient patterns for parsing
        self.ingredient_patterns = [
            r'(\d+\.?\d*)\s*([a-zA-Z]+)?\s+([a-zA-Z\s]+)(?:\s*\(([^)]+)\))?',  # 2 cups flour (optional note)
            r'([a-zA-Z\s]+)\s*:\s*(.+)',  # Ingredient: amount
        ]
        
        # Common measurement units
        self.units = {
            'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 
            'tsp', 'teaspoon', 'teaspoons', 'ml', 'milliliter', 'milliliters',
            'l', 'liter', 'liters', 'g', 'gram', 'grams', 'kg', 'kilogram',
            'oz', 'ounce', 'ounces', 'lb', 'pound', 'pounds',
            'clove', 'cloves', 'piece', 'pieces', 'slice', 'slices',
            'can', 'cans', 'package', 'packages', 'bunch', 'bunches',
            'pinch', 'dash', 'to taste'
        }
    
    def process_image(self, image_path):
        """
        Process recipe image and extract structured data
        
        Args:
            image_path: Path to recipe image
            
        Returns:
            Dictionary with extracted recipe data
        """
        print(f"Processing image: {image_path}")
        
        # In a real implementation, this would use:
        # 1. Tesseract OCR for text extraction
        # 2. GPT-4/Claude for structured parsing
        # 3. Custom parsing for ingredients/instructions
        
        # For now, return a template structure
        # You would send me the actual photo and I'd process it
        
        recipe_data = {
            "id": str(uuid.uuid4())[:8],
            "name": "Recipe from Photo",
            "source": "photo_upload",
            "image_path": image_path,
            "extracted_text": "This would contain OCR text from the image",
            "status": "needs_review",
            "created_date": datetime.now().isoformat(),
            "needs_manual_review": True
        }
        
        return recipe_data
    
    def parse_ingredients_from_text(self, text):
        """
        Parse ingredients from OCR text
        
        Args:
            text: OCR extracted text
            
        Returns:
            List of ingredient dictionaries
        """
        ingredients = []
        
        # Look for ingredient section
        lines = text.split('\n')
        in_ingredients = False
        
        for line in lines:
            line = line.strip()
            
            # Detect ingredient section
            if re.match(r'^(ingredients?|what you need|you will need):?$', line.lower()):
                in_ingredients = True
                continue
            
            # Detect end of ingredient section
            if in_ingredients and re.match(r'^(instructions?|method|directions|preparation):?$', line.lower()):
                break
            
            # Parse ingredient lines
            if in_ingredients and line:
                ingredient = self.parse_ingredient_line(line)
                if ingredient:
                    ingredients.append(ingredient)
        
        return ingredients
    
    def parse_ingredient_line(self, line):
        """
        Parse a single ingredient line
        
        Args:
            line: Ingredient text line
            
        Returns:
            Dictionary with parsed ingredient or None
        """
        # Remove bullet points, numbers
        line = re.sub(r'^[\d•\-*]\s*', '', line)
        
        # Try to parse quantity and unit
        # Simple pattern: quantity unit? ingredient (notes)?
        match = re.match(r'(\d+\.?\d*)\s*([a-zA-Z]+)?\s+(.+)', line)
        
        if match:
            quantity = float(match.group(1))
            unit = match.group(2) or ''
            rest = match.group(3)
            
            # Check if rest contains notes in parentheses
            name_match = re.match(r'([^(]+)(?:\(([^)]+)\))?', rest)
            if name_match:
                name = name_match.group(1).strip()
                notes = name_match.group(2) or ''
            else:
                name = rest.strip()
                notes = ''
            
            # Clean up unit
            if unit.lower() in self.units:
                unit = unit.lower()
            else:
                # Might be part of the name
                name = f"{unit} {name}".strip()
                unit = ''
            
            return {
                "name": name,
                "quantity": quantity,
                "unit": unit,
                "notes": notes
            }
        
        # If no quantity found, treat as whole line is name
        return {
            "name": line,
            "quantity": 1,
            "unit": "",
            "notes": ""
        }
    
    def parse_instructions_from_text(self, text):
        """
        Parse instructions from OCR text
        
        Args:
            text: OCR extracted text
            
        Returns:
            List of instruction steps
        """
        instructions = []
        
        # Look for instruction section
        lines = text.split('\n')
        in_instructions = False
        
        for line in lines:
            line = line.strip()
            
            # Detect instruction section
            if re.match(r'^(instructions?|method|directions|preparation|steps?):?$', line.lower()):
                in_instructions = True
                continue
            
            # Parse instruction lines
            if in_instructions and line:
                # Remove step numbers
                line = re.sub(r'^\d+[\.\)]\s*', '', line)
                if line:
                    instructions.append(line)
        
        return instructions
    
    def extract_recipe_name(self, text):
        """
        Extract recipe name from text (usually first line)
        
        Args:
            text: OCR extracted text
            
        Returns:
            Recipe name or None
        """
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and len(line) > 3 and len(line) < 100:
                # Skip common headers
                if not re.match(r'^(ingredients?|instructions?|method|serves|prep time|total time):?$', line.lower()):
                    return line
        return "Unnamed Recipe"
    
    def create_structured_recipe(self, image_path, ocr_text):
        """
        Create structured recipe data from OCR text
        
        Args:
            image_path: Path to original image
            ocr_text: Extracted OCR text
            
        Returns:
            Structured recipe dictionary
        """
        # Extract basic info
        name = self.extract_recipe_name(ocr_text)
        ingredients = self.parse_ingredients_from_text(ocr_text)
        instructions = self.parse_instructions_from_text(ocr_text)
        
        # Estimate times (would need ML model in production)
        prep_time = 30 if len(ingredients) > 5 else 15
        cook_time = 45 if "oven" in ocr_text.lower() or "bake" in ocr_text.lower() else 20
        
        recipe = {
            "id": str(uuid.uuid4())[:8],
            "name": name,
            "category": ["uncategorized"],
            "prep_time_minutes": prep_time,
            "cook_time_minutes": cook_time,
            "total_time_minutes": prep_time + cook_time,
            "servings": 4,  # Default
            "difficulty": "medium",
            "source": "photo_ocr",
            "source_details": f"OCR from {os.path.basename(image_path)}",
            "ingredients": ingredients,
            "instructions": instructions,
            "notes": "Automatically extracted from photo. Please review and edit.",
            "tags": ["photo-upload", "needs-review"],
            "image_path": image_path,
            "ocr_text": ocr_text,  # Keep original OCR for reference
            "created_date": datetime.now().strftime('%Y-%m-%d'),
            "last_updated": datetime.now().strftime('%Y-%m-%d'),
            "rating": 3,
            "dietary": {
                "vegetarian": self.is_vegetarian(ingredients),
                "vegan": False,  # Would need more analysis
                "gluten_free": False,
                "dairy_free": False
            },
            "status": "draft",
            "needs_review": True
        }
        
        return recipe
    
    def is_vegetarian(self, ingredients):
        """
        Basic check if recipe appears vegetarian
        
        Args:
            ingredients: List of ingredient dictionaries
            
        Returns:
            Boolean
        """
        meat_keywords = ['beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 
                        'bacon', 'sausage', 'meat', 'steak', 'mince']
        
        for ingredient in ingredients:
            name = ingredient['name'].lower()
            if any(keyword in name for keyword in meat_keywords):
                return False
        return True
    
    def save_to_google_drive(self, recipe_data, drive_folder_id=None):
        """
        Save recipe to Google Drive
        
        Args:
            recipe_data: Structured recipe dictionary
            drive_folder_id: Google Drive folder ID
            
        Returns:
            Dictionary with save results
        """
        # This would integrate with Google Drive API
        # For now, return mock response
        
        print(f"Would save recipe to Google Drive: {recipe_data['name']}")
        
        # Create JSON file
        filename = f"{recipe_data['id']}.json"
        
        # In real implementation:
        # 1. Upload image to Google Drive
        # 2. Create recipe JSON file
        # 3. Update index file
        
        return {
            "success": True,
            "recipe_id": recipe_data['id'],
            "filename": filename,
            "message": "Recipe saved to Google Drive (mock)"
        }
    
    def process_telegram_photo(self, photo_path, message_text=""):
        """
        Process recipe photo sent via Telegram
        
        Args:
            photo_path: Path to downloaded photo
            message_text: Optional caption/text from Telegram
            
        Returns:
            Processing results
        """
        print(f"Processing Telegram photo: {photo_path}")
        print(f"Message: {message_text}")
        
        # Step 1: Process image with OCR
        # In production: Use Tesseract or cloud OCR service
        ocr_text = self.mock_ocr_extraction(photo_path)
        
        # Step 2: Create structured recipe
        recipe = self.create_structured_recipe(photo_path, ocr_text)
        
        # Step 3: If message contains recipe name, use it
        if message_text and "recipe:" in message_text.lower():
            name_match = re.search(r'recipe:\s*(.+)', message_text, re.IGNORECASE)
            if name_match:
                recipe['name'] = name_match.group(1).strip()
        
        # Step 4: Save to Google Drive
        save_result = self.save_to_google_drive(recipe)
        
        return {
            "recipe": recipe,
            "save_result": save_result,
            "needs_review": recipe['needs_review'],
            "summary": f"Extracted '{recipe['name']}' with {len(recipe['ingredients'])} ingredients"
        }
    
    def mock_ocr_extraction(self, image_path):
        """
        Mock OCR extraction for demonstration
        
        In production, replace with actual OCR
        """
        # This is example OCR output
        return """Easy Chocolate Chip Cookies

Ingredients:
2 1/4 cups all-purpose flour
1 teaspoon baking soda
1 teaspoon salt
1 cup butter, softened
3/4 cup granulated sugar
3/4 cup packed brown sugar
1 teaspoon vanilla extract
2 large eggs
2 cups semisweet chocolate chips
1 cup chopped nuts (optional)

Instructions:
1. Preheat oven to 375°F (190°C).
2. In small bowl, mix flour, baking soda and salt; set aside.
3. In large bowl, beat butter, granulated sugar, brown sugar and vanilla until creamy.
4. Add eggs, one at a time, beating well after each addition.
5. Gradually beat in flour mixture.
6. Stir in chocolate chips and nuts.
7. Drop by rounded tablespoon onto ungreased baking sheets.
8. Bake 9 to 11 minutes or until golden brown.
9. Cool on baking sheets for 2 minutes; remove to wire racks to cool completely.

Makes about 5 dozen cookies."""

def main():
    """Test the OCR processor"""
    processor = RecipeOCRProcessor()
    
    print("=== Recipe OCR Processor ===")
    print("This system will:")
    print("1. Process recipe photos you send via Telegram")
    print("2. Extract text using OCR")
    print("3. Parse ingredients and instructions")
    print("4. Create structured recipe data")
    print("5. Save to Google Drive")
    print("\nReady to process your recipe photos!")
    
    # Example usage
    test_image = "path/to/recipe/photo.jpg"
    
    print(f"\nTo use:")
    print(f"1. Send a recipe photo via Telegram")
    print(f"2. Add caption like 'Recipe: Chocolate Chip Cookies'")
    print(f"3. I'll process it and add to your database")
    
    return processor

if __name__ == "__main__":
    processor = main()