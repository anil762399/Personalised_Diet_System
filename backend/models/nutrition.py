"""
Enhanced Nutrition Calculator with Complete Vitamins, Minerals, and Advanced Analysis
"""
import json
import math

class NutritionCalculator:
    def __init__(self):
        """Initialize the enhanced nutrition calculator"""
        self.load_nutrition_data()
    
    def load_nutrition_data(self):
        """Load enhanced nutrition data with vitamins and minerals"""
        try:
            with open('data/nutrition_data.json', 'r') as f:
                self.nutrition_data = json.load(f)
        except FileNotFoundError:
            # Fallback enhanced nutrition data
            self.nutrition_data = self.get_default_enhanced_nutrition_data()
    
    def get_default_enhanced_nutrition_data(self):
        """Default enhanced nutrition data with vitamins/minerals"""
        return {
            "rice": {
                "dietary_type": "vegetarian",
                "macros": {"protein": 2.7, "carbs": 28, "fats": 0.3},
                "vitamins": {"B1": 0.07, "B3": 1.6, "folate": 8},
                "minerals": {"iron": 0.8, "magnesium": 25, "phosphorus": 115},
                "food_style": "traditional",
                "seasonal_availability": ["spring", "summer", "fall", "winter"],
                "preparation_methods": ["boiled", "steamed", "fried"],
                "storage": "Store in airtight container in cool, dry place",
                "serving_size": "150g cooked"
            },
            "dal": {
                "dietary_type": "vegetarian",
                "macros": {"protein": 9, "carbs": 20, "fats": 0.5},
                "vitamins": {"B1": 0.37, "B6": 0.21, "folate": 181},
                "minerals": {"iron": 3.3, "magnesium": 47, "potassium": 367},
                "food_style": "traditional",
                "seasonal_availability": ["spring", "summer", "fall", "winter"],
                "preparation_methods": ["pressure_cooked", "boiled", "tempering"],
                "storage": "Store dry lentils in sealed container, cooked dal refrigerate 3 days",
                "serving_size": "100g cooked"
            }
        }
    
    def calculate_bmr(self, weight, height, age, gender):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if gender.lower() == 'male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
        return round(bmr)
    
    def calculate_bmi(self, weight, height):
        """Calculate Body Mass Index"""
        height_m = height / 100  # Convert cm to meters
        bmi = weight / (height_m ** 2)
        return round(bmi, 1)
    
    def get_bmi_category(self, bmi):
        """Get BMI category"""
        if bmi < 18.5:
            return "Underweight"
        elif bmi < 25:
            return "Normal weight"
        elif bmi < 30:
            return "Overweight"
        else:
            return "Obese"
    
    def calculate_daily_calories(self, bmr, goal, timeline, activity_level='moderate'):
        """Calculate daily calorie needs based on goal and timeline"""
        # Activity multipliers
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        
        # Base calories with activity
        base_calories = bmr * activity_multipliers.get(activity_level, 1.55)
        
        # Goal adjustments
        if goal == 'weight_loss':
            if timeline == 'short_term':
                calories = base_calories - 500  # 1lb/week loss
            elif timeline == 'mid_term':
                calories = base_calories - 350  # 0.7lb/week loss
            else:
                calories = base_calories - 250  # 0.5lb/week loss
        elif goal == 'weight_gain':
            if timeline == 'short_term':
                calories = base_calories + 500  # 1lb/week gain
            elif timeline == 'mid_term':
                calories = base_calories + 350  # 0.7lb/week gain
            else:
                calories = base_calories + 250  # 0.5lb/week gain
        else:
            calories = base_calories  # Maintain weight
        
        return round(calories)
    
    def calculate_macronutrients(self, daily_calories, goal):
        """Calculate macronutrient distribution"""
        if goal == 'weight_loss':
            # Higher protein for muscle preservation
            protein_percent = 0.30
            fat_percent = 0.25
            carb_percent = 0.45
        elif goal == 'weight_gain':
            # Balanced for muscle gain
            protein_percent = 0.25
            fat_percent = 0.30
            carb_percent = 0.45
        else:
            # Maintenance
            protein_percent = 0.25
            fat_percent = 0.25
            carb_percent = 0.50
        
        # Calculate grams (4 cal/g for protein & carbs, 9 cal/g for fat)
        protein_grams = round((daily_calories * protein_percent) / 4)
        fat_grams = round((daily_calories * fat_percent) / 9)
        carb_grams = round((daily_calories * carb_percent) / 4)
        
        return {
            'protein': protein_grams,
            'carbs': carb_grams,
            'fat': fat_grams
        }
    
    def calculate_daily_vitamins(self, age, gender, goal):
        """Calculate daily vitamin requirements"""
        # Base vitamin requirements (RDA values)
        vitamins = {
            'A': 900 if gender == 'male' else 700,  # mcg RAE
            'B1': 1.2 if gender == 'male' else 1.1,  # mg thiamine
            'B2': 1.3 if gender == 'male' else 1.1,  # mg riboflavin
            'B3': 16 if gender == 'male' else 14,   # mg niacin
            'B6': 1.3 if age < 50 else (1.7 if gender == 'male' else 1.5),  # mg
            'B12': 2.4,  # mcg
            'C': 90 if gender == 'male' else 75,    # mg ascorbic acid
            'D': 15 if age < 70 else 20,            # mcg
            'E': 15,     # mg alpha-tocopherol
            'K': 120 if gender == 'male' else 90,   # mcg
            'folate': 400,  # mcg DFE
            'biotin': 30,   # mcg
            'pantothenic_acid': 5  # mg
        }
        
        # Adjust for goals
        if goal == 'weight_gain':
            # Slightly increase B vitamins for energy metabolism
            for vitamin in ['B1', 'B2', 'B3', 'B6']:
                vitamins[vitamin] *= 1.15
            vitamins['C'] *= 1.2  # For recovery
        elif goal == 'weight_loss':
            # Increase antioxidants
            vitamins['C'] *= 1.1
            vitamins['E'] *= 1.1
        
        return vitamins
    
    def calculate_daily_minerals(self, age, gender, goal):
        """Calculate daily mineral requirements"""
        # Base mineral requirements
        minerals = {
            'calcium': 1000 if age < 50 else 1200,  # mg
            'iron': self._get_iron_requirement(age, gender),  # mg
            'magnesium': 400 if gender == 'male' else 310,   # mg
            'zinc': 11 if gender == 'male' else 8,           # mg
            'potassium': 3500,    # mg
            'phosphorus': 700,    # mg
            'sodium': 1500,       # mg (AI - adequate intake)
            'selenium': 55,       # mcg
            'copper': 0.9,        # mg
            'manganese': 2.3 if gender == 'male' else 1.8,  # mg
            'chromium': 35 if gender == 'male' else 25,     # mcg
            'molybdenum': 45,     # mcg
            'iodine': 150         # mcg
        }
        
        # Adjust for goals
        if goal == 'weight_gain':
            # Increase minerals for muscle building
            minerals['magnesium'] *= 1.1
            minerals['zinc'] *= 1.15
            minerals['phosphorus'] *= 1.1
        elif goal == 'weight_loss':
            # Maintain higher calcium and magnesium
            minerals['calcium'] *= 1.05
            minerals['magnesium'] *= 1.05
        
        return minerals
    
    def _get_iron_requirement(self, age, gender):
        """Calculate iron requirement based on age and gender"""
        if gender == 'male':
            return 8  # mg
        else:
            if age < 50:
                return 18  # mg (premenopausal women)
            else:
                return 8   # mg (postmenopausal women)
    
    def calculate_fiber_requirement(self, age, gender, daily_calories):
        """Calculate daily fiber requirement"""
        if gender == 'male':
            if age < 50:
                return 38  # g
            else:
                return 30  # g
        else:
            if age < 50:
                return 25  # g
            else:
                return 21  # g
    
    def calculate_water_requirement(self, weight, activity_level='moderate'):
        """Calculate daily water requirement"""
        # Base: 35ml per kg body weight
        base_water = weight * 35  # ml
        
        # Activity adjustments
        activity_multipliers = {
            'sedentary': 1.0,
            'light': 1.1,
            'moderate': 1.2,
            'active': 1.3,
            'very_active': 1.4
        }
        
        total_water = base_water * activity_multipliers.get(activity_level, 1.2)
        return round(total_water / 1000, 1)  # Convert to liters
    
    def get_nutrition_summary(self, weight, height, age, gender, goal, timeline):
        """Get basic nutrition summary (for backward compatibility)"""
        bmr = self.calculate_bmr(weight, height, age, gender)
        bmi = self.calculate_bmi(weight, height)
        daily_calories = self.calculate_daily_calories(bmr, goal, timeline)
        macronutrients = self.calculate_macronutrients(daily_calories, goal)
        
        return {
            'bmi': bmi,
            'bmi_category': self.get_bmi_category(bmi),
            'bmr': bmr,
            'daily_calories': daily_calories,
            'macronutrients': macronutrients
        }
    
    def get_enhanced_nutrition_summary(self, weight, height, age, gender, goal, timeline):
        """Get comprehensive nutrition summary with vitamins and minerals"""
        # Get basic summary
        basic_summary = self.get_nutrition_summary(weight, height, age, gender, goal, timeline)
        
        # Add enhanced data
        vitamins = self.calculate_daily_vitamins(age, gender, goal)
        minerals = self.calculate_daily_minerals(age, gender, goal)
        fiber = self.calculate_fiber_requirement(age, gender, basic_summary['daily_calories'])
        water = self.calculate_water_requirement(weight)
        
        # Create enhanced summary
        enhanced_summary = basic_summary.copy()
        enhanced_summary.update({
            'vitamins': vitamins,
            'minerals': minerals,
            'fiber_requirement': fiber,
            'water_requirement': water,
            'nutrition_density_targets': self.get_nutrition_density_targets(),
            'health_metrics': self.calculate_health_metrics(weight, height, age, gender),
            'metabolic_info': {
                'bmr_per_kg': round(basic_summary['bmr'] / weight, 1),
                'calories_per_kg': round(basic_summary['daily_calories'] / weight, 1),
                'protein_per_kg': round(basic_summary['macronutrients']['protein'] / weight, 2)
            }
        })
        
        return enhanced_summary
    
    def get_nutrition_density_targets(self):
        """Get nutrition density targets per 1000 calories"""
        return {
            'protein_per_1000_cal': 50,      # g
            'fiber_per_1000_cal': 14,        # g
            'vitamin_c_per_1000_cal': 45,    # mg
            'calcium_per_1000_cal': 500,     # mg
            'iron_per_1000_cal': 9,          # mg
            'folate_per_1000_cal': 200,      # mcg
            'magnesium_per_1000_cal': 200,   # mg
            'potassium_per_1000_cal': 1750   # mg
        }
    
    def calculate_health_metrics(self, weight, height, age, gender):
        """Calculate additional health metrics"""
        height_m = height / 100
        
        # Ideal weight range (BMI 18.5-24.9)
        ideal_weight_min = round(18.5 * (height_m ** 2), 1)
        ideal_weight_max = round(24.9 * (height_m ** 2), 1)
        
        # Body fat percentage estimates (rough)
        if gender == 'male':
            body_fat_estimate = (1.20 * self.calculate_bmi(weight, height)) + (0.23 * age) - 16.2
        else:
            body_fat_estimate = (1.20 * self.calculate_bmi(weight, height)) + (0.23 * age) - 5.4
        
        return {
            'ideal_weight_range': f"{ideal_weight_min}-{ideal_weight_max} kg",
            'weight_status': self.get_weight_status(weight, ideal_weight_min, ideal_weight_max),
            'body_fat_estimate': f"{max(5, min(50, round(body_fat_estimate, 1)))}%",
            'muscle_mass_importance': self.get_muscle_mass_guidance(age, gender)
        }
    
    def get_weight_status(self, current_weight, ideal_min, ideal_max):
        """Determine weight status relative to ideal range"""
        if current_weight < ideal_min:
            return f"Below ideal range by {round(ideal_min - current_weight, 1)} kg"
        elif current_weight > ideal_max:
            return f"Above ideal range by {round(current_weight - ideal_max, 1)} kg"
        else:
            return "Within ideal range"
    
    def get_muscle_mass_guidance(self, age, gender):
        """Provide muscle mass guidance based on age and gender"""
        if age < 30:
            return "Focus on building and maintaining muscle mass through resistance training"
        elif age < 50:
            return "Maintain muscle mass to prevent age-related decline"
        else:
            return "Prioritize muscle preservation through protein intake and strength training"
    
    def analyze_meal_nutrition(self, meal_items):
        """Analyze nutrition content of a meal"""
        total_nutrition = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fats': 0,
            'vitamins': {},
            'minerals': {},
            'fiber': 0
        }
        
        for item_name, quantity in meal_items.items():
            if item_name in self.nutrition_data:
                item_data = self.nutrition_data[item_name]
                
                # Scale nutrition by quantity (assuming base is per 100g)
                scale_factor = quantity / 100
                
                # Macros
                total_nutrition['calories'] += item_data['macros'].get('protein', 0) * 4 * scale_factor
                total_nutrition['calories'] += item_data['macros'].get('carbs', 0) * 4 * scale_factor
                total_nutrition['calories'] += item_data['macros'].get('fats', 0) * 9 * scale_factor
                
                total_nutrition['protein'] += item_data['macros'].get('protein', 0) * scale_factor
                total_nutrition['carbs'] += item_data['macros'].get('carbs', 0) * scale_factor
                total_nutrition['fats'] += item_data['macros'].get('fats', 0) * scale_factor
                
                # Vitamins
                for vitamin, amount in item_data.get('vitamins', {}).items():
                    if vitamin not in total_nutrition['vitamins']:
                        total_nutrition['vitamins'][vitamin] = 0
                    total_nutrition['vitamins'][vitamin] += amount * scale_factor
                
                # Minerals
                for mineral, amount in item_data.get('minerals', {}).items():
                    if mineral not in total_nutrition['minerals']:
                        total_nutrition['minerals'][mineral] = 0
                    total_nutrition['minerals'][mineral] += amount * scale_factor
        
        return total_nutrition
    
    def get_nutritional_adequacy_score(self, actual_nutrition, target_nutrition):
        """Calculate how well actual nutrition meets targets"""
        scores = {}
        
        # Macro adequacy
        for macro in ['protein', 'carbs', 'fat']:
            if macro in target_nutrition['macronutrients'] and macro in actual_nutrition:
                target = target_nutrition['macronutrients'][macro]
                actual = actual_nutrition[macro]
                scores[f'{macro}_adequacy'] = min(100, (actual / target) * 100) if target > 0 else 0
        
        # Vitamin adequacy
        for vitamin, target_amount in target_nutrition.get('vitamins', {}).items():
            actual_amount = actual_nutrition.get('vitamins', {}).get(vitamin, 0)
            scores[f'vitamin_{vitamin}_adequacy'] = min(100, (actual_amount / target_amount) * 100) if target_amount > 0 else 0
        
        # Mineral adequacy
        for mineral, target_amount in target_nutrition.get('minerals', {}).items():
            actual_amount = actual_nutrition.get('minerals', {}).get(mineral, 0)
            scores[f'mineral_{mineral}_adequacy'] = min(100, (actual_amount / target_amount) * 100) if target_amount > 0 else 0
        
        # Overall score
        all_scores = list(scores.values())
        scores['overall_adequacy'] = sum(all_scores) / len(all_scores) if all_scores else 0
        
        return scores