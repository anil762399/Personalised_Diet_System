import json
import random
from datetime import datetime

class DietEngine:
    def __init__(self):
        """Initialize the enhanced diet engine"""
        self.load_nutrition_data()
        self.load_meal_templates()
    
    def load_nutrition_data(self):
        """Load enhanced nutrition data"""
        try:
            with open('data/nutrition_data.json', 'r') as f:
                self.nutrition_data = json.load(f)
        except FileNotFoundError:
            self.nutrition_data = self.get_default_enhanced_nutrition_data()
    
    def load_meal_templates(self):
        """Load meal templates"""
        try:
            with open('data/meals.json', 'r') as f:
                self.meal_templates = json.load(f)
        except FileNotFoundError:
            self.meal_templates = self.get_default_meal_templates()
    
    def get_default_enhanced_nutrition_data(self):
        """Default enhanced nutrition data with seasonal and style info"""
        return {
            "rice": {
                "dietary_type": "vegetarian",
                "macros": {"protein": 2.7, "carbs": 28, "fats": 0.3},
                "vitamins": {"B1": 0.07, "B3": 1.6, "folate": 8},
                "minerals": {"iron": 0.8, "magnesium": 25, "phosphorus": 115},
                "food_style": "traditional",
                "seasonal_availability": ["spring", "summer", "monsoon", "autumn"],
                "preparation_methods": ["boiled", "steamed", "fried rice"],
                "storage": "Store in airtight container, consume within 2 days if cooked",
                "serving_size": "150g cooked"
            },
            "quinoa": {
                "dietary_type": "vegetarian",
                "macros": {"protein": 4.4, "carbs": 22, "fats": 1.9},
                "vitamins": {"B6": 0.2, "folate": 42, "E": 0.6},
                "minerals": {"iron": 1.5, "magnesium": 64, "zinc": 1.1},
                "food_style": "modern",
                "seasonal_availability": ["spring", "summer", "monsoon", "autumn"],
                "preparation_methods": ["boiled", "quinoa salad", "quinoa bowl"],
                "storage": "Store dry quinoa in sealed container, cooked quinoa 3-4 days refrigerated",
                "serving_size": "100g cooked"
            },
            "dal": {
                "dietary_type": "vegetarian",
                "macros": {"protein": 9, "carbs": 20, "fats": 0.5},
                "vitamins": {"B1": 0.37, "B6": 0.21, "folate": 181},
                "minerals": {"iron": 3.3, "magnesium": 47, "potassium": 367},
                "food_style": "traditional",
                "seasonal_availability": ["spring", "summer", "monsoon", "autumn"],
                "preparation_methods": ["pressure cooked", "boiled with tempering"],
                "storage": "Refrigerate cooked dal for up to 3 days, reheat before serving",
                "serving_size": "100g"
            }
        }
    
    def get_default_meal_templates(self):
        """Default meal templates for different styles and regions"""
        return {
            "south_indian_traditional": {
                "breakfast": ["idli_sambar", "dosa_chutney", "upma", "pongal"],
                "lunch": ["rice_sambar_vegetables", "curd_rice", "lemon_rice"],
                "dinner": ["rice_rasam_vegetables", "chapati_sambar"],
                "snacks": ["murukku", "banana", "coconut_water"]
            },
            "north_indian_traditional": {
                "breakfast": ["paratha_curd", "poha", "aloo_puri"],
                "lunch": ["roti_dal_sabzi", "rice_dal", "rajma_chawal"],
                "dinner": ["chapati_dal_vegetables", "khichdi"],
                "snacks": ["chai_biscuit", "fruit", "roasted_chana"]
            },
            "modern_fusion": {
                "breakfast": ["smoothie_bowl", "avocado_toast", "oats_fruits"],
                "lunch": ["quinoa_bowl", "wrap_vegetables", "salad_protein"],
                "dinner": ["grilled_vegetables", "soup_bread", "pasta_vegetables"],
                "snacks": ["nuts", "yogurt_berries", "protein_bar"]
            }
        }
    
    def generate_weekly_plan(self, user_data, nutrition_summary, health_conditions=[], cost_preference='medium'):
        """Generate basic weekly plan (for backward compatibility)"""
        return self.generate_enhanced_weekly_plan(
            user_data, nutrition_summary, health_conditions, 
            cost_preference, 'both', 'spring'
        )
    
    def generate_enhanced_weekly_plan(self, user_data, nutrition_summary, health_conditions=[], 
                                    cost_preference='medium', food_style='both', current_season='spring'):
        """Generate comprehensive weekly meal plan with all enhancements"""
        
        weekly_plan = {}
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
 
        daily_calories = nutrition_summary['daily_calories']
        meal_calorie_distribution = {
            'breakfast': daily_calories * 0.25,
            'lunch': daily_calories * 0.35,
            'snacks': daily_calories * 0.15,
            'dinner': daily_calories * 0.25
        }
        
        for day in days:
            daily_plan = {}
            for meal_type, target_calories in meal_calorie_distribution.items():
                daily_plan[meal_type] = self.generate_enhanced_meal(
                    meal_type, user_data, target_calories, 
                    food_style, current_season, health_conditions, cost_preference
                )
            daily_plan['totals'] = self.calculate_daily_totals(daily_plan)
            
            weekly_plan[day] = daily_plan
        
        return weekly_plan
    
    def generate_enhanced_meal(self, meal_type, user_data, target_calories, 
                              food_style, current_season, health_conditions, cost_preference):
        """Generate enhanced meal with all new features"""
        
       
        suitable_meals = self.get_suitable_meals(
            meal_type, user_data, food_style, current_season, health_conditions
        )
        
        if not suitable_meals:
            
            return self.create_fallback_meal(meal_type, target_calories, user_data)
        
        
        selected_meal = self.select_optimal_meal(suitable_meals, cost_preference, target_calories)
        
    
        enhanced_meal = {
            'name': selected_meal['name'],
            'calories': selected_meal['calories'],
            'macros': selected_meal['macros'],
            'vitamins': selected_meal.get('vitamins', {}),
            'minerals': selected_meal.get('minerals', {}),
            'food_style': selected_meal.get('food_style', food_style),
            'dietary_type': selected_meal.get('dietary_type', user_data['food_preference']),
            'seasonal_suitability': self.check_seasonal_suitability(selected_meal['name'], current_season),
            'preparation_method': self.get_preparation_method(selected_meal['name'], user_data['region']),
            'storage_guidelines': self.get_storage_guidelines(selected_meal['name']),
            'serving_size': self.get_serving_size(selected_meal['name'], user_data),
            'prep_time': self.get_prep_time(selected_meal['name']),
            'difficulty_level': self.get_difficulty_level(selected_meal['name']),
            'cost_category': self.get_cost_category(selected_meal['name'], cost_preference),
            'health_benefits': self.get_health_benefits(selected_meal['name'], health_conditions),
            'ingredients': self.get_meal_ingredients(selected_meal['name']),
            'nutritional_highlights': self.get_nutritional_highlights(selected_meal)
        }
        
        return enhanced_meal
    
    def get_suitable_meals(self, meal_type, user_data, food_style, current_season, health_conditions):
        """Get meals suitable for all criteria"""
        suitable_meals = []
        
    
        template_key = self.get_template_key(user_data['region'], food_style)
        meal_options = self.meal_templates.get(template_key, {}).get(meal_type, [])
        
        for meal_name in meal_options:
            meal_data = self.get_meal_data(meal_name)
            
            if self.is_meal_suitable(meal_data, user_data, current_season, health_conditions):
                suitable_meals.append(meal_data)
        
        return suitable_meals
    
    def get_template_key(self, region, food_style):
        """Get appropriate meal template key"""
        if food_style == 'traditional':
            return f"{region}_traditional"
        elif food_style == 'modern':
            return "modern_fusion"
        else:  
            return random.choice([f"{region}_traditional", "modern_fusion"])
    
    def get_meal_data(self, meal_name):
        """Get comprehensive meal data"""
       
        meal_database = {
            "idli_sambar": {
                "name": "Idli with Sambar",
                "calories": 250,
                "macros": {"protein": 8, "carbs": 45, "fats": 3},
                "vitamins": {"B1": 0.1, "C": 5, "folate": 25},
                "minerals": {"iron": 2.1, "calcium": 150},
                "food_style": "traditional",
                "dietary_type": "vegetarian",
                "seasonal_availability": ["winter", "spring", "monsoon"]
            },
            "smoothie_bowl": {
                "name": "Fruit Smoothie Bowl",
                "calories": 280,
                "macros": {"protein": 12, "carbs": 35, "fats": 8},
                "vitamins": {"C": 45, "A": 150, "K": 25},
                "minerals": {"potassium": 400, "magnesium": 60},
                "food_style": "modern",
                "dietary_type": "vegetarian",
                "seasonal_availability": ["summer", "spring"]
            }
        }
        
        return meal_database.get(meal_name, {
            "name": meal_name.replace('_', ' ').title(),
            "calories": 200,
            "macros": {"protein": 6, "carbs": 30, "fats": 5},
            "vitamins": {},
            "minerals": {},
            "food_style": "traditional",
            "dietary_type": "vegetarian"
        })
    
    def is_meal_suitable(self, meal_data, user_data, current_season, health_conditions):
        """Check if meal is suitable for user preferences and restrictions"""
        
       
        meal_dietary = meal_data.get('dietary_type', 'vegetarian')
        user_dietary = user_data['food_preference']
        
        if user_dietary == 'vegetarian' and meal_dietary == 'non_vegetarian':
            return False
        elif user_dietary == 'non_vegetarian' and meal_dietary == 'vegetarian':
            return True 
        elif user_dietary == 'both':
            return True  
        
        meal_seasons = meal_data.get('seasonal_availability', [])
        if meal_seasons and current_season not in meal_seasons:
       
            if len(meal_seasons) < 4:
                return False
        
       
        if health_conditions:
            meal_restrictions = self.get_meal_health_restrictions(meal_data['name'])
            for condition in health_conditions:
                if condition in meal_restrictions:
                    return False
        
        return True
    
    def get_meal_health_restrictions(self, meal_name):
        """Get health conditions that should avoid this meal"""
        restrictions = {
            'diabetes': ['sweet', 'sugar', 'jaggery', 'honey', 'fruit_juice'],
            'hypertension': ['salt', 'pickle', 'papad', 'processed'],
            'kidney_stones': ['spinach', 'tomato', 'chocolate', 'nuts'],
            'lactose_intolerance': ['milk', 'curd', 'cheese', 'paneer'],
            'gluten_intolerance': ['wheat', 'bread', 'pasta', 'roti']
        }
        
        meal_lower = meal_name.lower()
        restricted_conditions = []
        
        for condition, restricted_foods in restrictions.items():
            if any(food in meal_lower for food in restricted_foods):
                restricted_conditions.append(condition)
        
        return restricted_conditions
    
    def select_optimal_meal(self, suitable_meals, cost_preference, target_calories):
        """Select the best meal based on cost and nutritional fit"""
        if not suitable_meals:
            return None
        
        scored_meals = []
        
        for meal in suitable_meals:
            score = 0
            
           
            calorie_diff = abs(meal['calories'] - target_calories)
            calorie_score = max(0, 100 - (calorie_diff / target_calories) * 100)
            score += calorie_score * 0.4
            
            meal_cost = self.estimate_meal_cost(meal['name'])
            cost_score = self.get_cost_preference_score(meal_cost, cost_preference)
            score += cost_score * 0.3
            
            
            nutrition_score = self.calculate_nutritional_density_score(meal)
            score += nutrition_score * 0.3
            
            scored_meals.append((meal, score))
        
        
        best_meal = max(scored_meals, key=lambda x: x[1])
        return best_meal[0]
    
    def estimate_meal_cost(self, meal_name):
        """Estimate meal cost category"""
        expensive_ingredients = ['paneer', 'cashew', 'almond', 'quinoa', 'avocado', 'salmon', 'chicken']
        moderate_ingredients = ['dal', 'vegetables', 'rice', 'eggs', 'yogurt']
        cheap_ingredients = ['roti', 'bread', 'potato', 'onion', 'tomato']
        
        meal_lower = meal_name.lower()
        
        if any(ingredient in meal_lower for ingredient in expensive_ingredients):
            return 'high'
        elif any(ingredient in meal_lower for ingredient in moderate_ingredients):
            return 'medium'
        else:
            return 'low'
    
    def get_cost_preference_score(self, meal_cost, cost_preference):
        """Score meal based on cost preference match"""
        if cost_preference == meal_cost:
            return 100
        elif cost_preference == 'low' and meal_cost == 'medium':
            return 70
        elif cost_preference == 'medium' and meal_cost in ['low', 'high']:
            return 80
        elif cost_preference == 'high' and meal_cost == 'medium':
            return 90
        else:
            return 50
    
    def calculate_nutritional_density_score(self, meal):
        """Calculate nutritional density score for meal"""
        calories = meal['calories']
        if calories == 0:
            return 0
        
        
        protein_density = (meal['macros'].get('protein', 0) / calories) * 100
        
        
        vitamin_count = len(meal.get('vitamins', {}))
        mineral_count = len(meal.get('minerals', {}))
        micronutrient_score = (vitamin_count + mineral_count) * 5
        
        total_score = min(100, protein_density * 10 + micronutrient_score)
        return total_score
    
    def create_fallback_meal(self, meal_type, target_calories, user_data):
        """Create fallback meal when no suitable meals found"""
        fallback_meals = {
            'breakfast': {
                'name': 'Simple Breakfast',
                'calories': target_calories,
                'macros': {'protein': target_calories * 0.15 / 4, 'carbs': target_calories * 0.55 / 4, 'fats': target_calories * 0.30 / 9}
            },
            'lunch': {
                'name': 'Balanced Lunch',
                'calories': target_calories,
                'macros': {'protein': target_calories * 0.20 / 4, 'carbs': target_calories * 0.50 / 4, 'fats': target_calories * 0.30 / 9}
            },
            'dinner': {
                'name': 'Light Dinner',
                'calories': target_calories,
                'macros': {'protein': target_calories * 0.25 / 4, 'carbs': target_calories * 0.45 / 4, 'fats': target_calories * 0.30 / 9}
            },
            'snacks': {
                'name': 'Healthy Snack',
                'calories': target_calories,
                'macros': {'protein': target_calories * 0.20 / 4, 'carbs': target_calories * 0.50 / 4, 'fats': target_calories * 0.30 / 9}
            }
        }
        
        base_meal = fallback_meals.get(meal_type, fallback_meals['breakfast']).copy()
        base_meal.update({
            'vitamins': {},
            'minerals': {},
            'food_style': 'traditional',
            'preparation_method': 'Simple preparation method',
            'storage_guidelines': 'Store properly and consume fresh',
            'serving_size': '1 portion'
        })
        
        return base_meal
    
    def check_seasonal_suitability(self, meal_name, current_season):
        """Check seasonal suitability of meal"""
        seasonal_preferences = {
            'winter': ['warm', 'hot', 'soup', 'tea', 'ginger', 'jaggery'],
            'spring': ['fresh', 'light', 'detox', 'green', 'bitter'],
            'monsoon': ['immunity', 'ginger', 'turmeric', 'warm', 'steamed'],
            'autumn': ['balanced', 'cooked', 'moderate', 'warming']
        }
        
        meal_lower = meal_name.lower()
        season_foods = seasonal_preferences.get(current_season, [])
        
        matches = sum(1 for food in season_foods if food in meal_lower)
        
        if matches >= 2:
            return 'high'
        elif matches >= 1:
            return 'medium'
        else:
            return 'suitable'
    
    def get_preparation_method(self, meal_name, region):
        """Get detailed preparation method"""
        preparation_database = {
            'idli_sambar': 'Soak urad dal and rice separately for 4-6 hours. Grind into smooth batter, ferment overnight. Steam in idli plates for 12-15 minutes. For sambar: cook dal with vegetables, add tamarind water, temper with spices.',
            'dosa_chutney': 'Use fermented dosa batter. Heat non-stick pan, spread batter thinly, cook until golden. For chutney: grind coconut with green chilies, ginger, and salt.',
            'roti_dal_sabzi': 'Knead wheat flour with water and salt. Roll into circles, cook on hot tawa until puffed. For dal: pressure cook lentils, temper with cumin and spices. Prepare vegetables with minimal oil.',
            'smoothie_bowl': 'Blend frozen fruits with yogurt or milk. Pour into bowl, top with nuts, seeds, and fresh fruits. Serve immediately.',
            'quinoa_bowl': 'Rinse quinoa, cook with water (1:2 ratio) for 15 minutes. Add cooked vegetables, protein, and dressing. Garnish with herbs.'
        }
        
        method = preparation_database.get(meal_name.lower().replace(' ', '_'), 
                                        'Cook ingredients properly with minimal oil and appropriate spices.')
        
       
        if 'south' in region and 'coconut' not in method:
            method += ' Add coconut for authentic South Indian flavor.'
        elif 'north' in region and 'ghee' not in method:
            method += ' Finish with a touch of ghee for North Indian taste.'
        
        return method
    
    def get_storage_guidelines(self, meal_name):
        """Get storage guidelines for meal"""
        storage_database = {
            'cooked_rice': 'Store in refrigerator for up to 3 days. Reheat thoroughly before serving.',
            'dal': 'Refrigerate for up to 3 days. Add water if too thick when reheating.',
            'vegetables': 'Best consumed fresh. Refrigerate for maximum 2 days.',
            'bread_items': 'Store at room temperature for 1 day, refrigerate for up to 3 days.',
            'smoothie': 'Consume immediately. Do not store.',
            'salad': 'Prepare fresh. Dress just before serving.',
            'soup': 'Cool completely before refrigerating. Store for up to 4 days.'
        }
        
        meal_lower = meal_name.lower()
        
        
        if any(word in meal_lower for word in ['rice', 'biryani', 'pulao']):
            return storage_database['cooked_rice']
        elif any(word in meal_lower for word in ['dal', 'lentil', 'sambar', 'rasam']):
            return storage_database['dal']
        elif any(word in meal_lower for word in ['smoothie', 'juice']):
            return storage_database['smoothie']
        elif any(word in meal_lower for word in ['salad', 'raw']):
            return storage_database['salad']
        elif any(word in meal_lower for word in ['soup', 'broth']):
            return storage_database['soup']
        elif any(word in meal_lower for word in ['roti', 'bread', 'chapati']):
            return storage_database['bread_items']
        else:
            return 'Store in refrigerator and consume within 2-3 days. Reheat properly before serving.'
    
    def get_serving_size(self, meal_name, user_data):
        """Get appropriate serving size based on meal and user goals"""
        base_serving_sizes = {
            'rice': '150g cooked',
            'roti': '2 medium pieces',
            'dal': '100g',
            'vegetables': '150g',
            'salad': '200g',
            'smoothie': '250ml',
            'soup': '200ml'
        }
        
        meal_lower = meal_name.lower()
        
     
        serving_size = '1 portion'
        for food, size in base_serving_sizes.items():
            if food in meal_lower:
                serving_size = size
                break
        
       
        goal = user_data.get('goal', 'maintain')
        if goal == 'weight_gain':
            serving_size = f"Large portion ({serving_size})"
        elif goal == 'weight_loss':
            serving_size = f"Moderate portion ({serving_size})"
        
        return serving_size
    
    def get_prep_time(self, meal_name):
        """Get preparation time for meal"""
        prep_times = {
            'instant': ['tea', 'coffee', 'milk', 'juice', 'fruit'],
            '5-10 mins': ['smoothie', 'salad', 'sandwich', 'toast'],
            '15-20 mins': ['eggs', 'pasta', 'noodles', 'upma', 'poha'],
            '20-30 mins': ['rice', 'dal', 'vegetables', 'soup'],
            '30-45 mins': ['biryani', 'curry', 'sambar', 'rasam'],
            '45+ mins': ['idli', 'dosa', 'fermented items']
        }
        
        meal_lower = meal_name.lower()
        
        for time_range, foods in prep_times.items():
            if any(food in meal_lower for food in foods):
                return time_range
        
        return '20-25 mins'
    
    def get_difficulty_level(self, meal_name):
        """Get cooking difficulty level"""
        difficulty_levels = {
            'easy': ['tea', 'coffee', 'smoothie', 'salad', 'sandwich', 'toast', 'boiled'],
            'medium': ['rice', 'dal', 'vegetables', 'pasta', 'eggs', 'soup'],
            'hard': ['biryani', 'idli', 'dosa', 'complex curry', 'fermented']
        }
        
        meal_lower = meal_name.lower()
        
        for level, foods in difficulty_levels.items():
            if any(food in meal_lower for food in foods):
                return level
        
        return 'medium'
    
    def get_cost_category(self, meal_name, cost_preference):
        """Get cost category for meal"""
        return self.estimate_meal_cost(meal_name)
    
    def get_health_benefits(self, meal_name, health_conditions):
        """Get health benefits specific to user's conditions"""
        benefits_database = {
            'dal': ['High protein', 'Rich in folate', 'Good for heart health'],
            'vegetables': ['High fiber', 'Antioxidants', 'Vitamins and minerals'],
            'fruits': ['Vitamin C', 'Natural sugars', 'Digestive health'],
            'whole_grains': ['Complex carbs', 'B vitamins', 'Sustained energy'],
            'yogurt': ['Probiotics', 'Calcium', 'Digestive health']
        }
        
        meal_lower = meal_name.lower()
        benefits = []
        
        for food_category, benefit_list in benefits_database.items():
            if food_category in meal_lower:
                benefits.extend(benefit_list)
        
        
        if 'diabetes' in health_conditions:
            if any(word in meal_lower for word in ['fiber', 'whole', 'complex']):
                benefits.append('Helps regulate blood sugar')
        
        if 'hypertension' in health_conditions:
            if any(word in meal_lower for word in ['potassium', 'vegetable', 'fruit']):
                benefits.append('May help lower blood pressure')
        
        return benefits[:3]  
    
    def get_meal_ingredients(self, meal_name):
        """Get ingredients list for meal"""
        ingredient_database = {
            'idli_sambar': ['Idli rice', 'Urad dal', 'Tur dal', 'Mixed vegetables', 'Tamarind', 'Sambar powder', 'Curry leaves'],
            'dosa_chutney': ['Dosa batter', 'Coconut', 'Green chilies', 'Ginger', 'Curry leaves', 'Oil'],
            'roti_dal_sabzi': ['Whole wheat flour', 'Tur dal', 'Seasonal vegetables', 'Onions', 'Tomatoes', 'Spices'],
            'smoothie_bowl': ['Mixed berries', 'Banana', 'Yogurt', 'Honey', 'Nuts', 'Seeds'],
            'quinoa_bowl': ['Quinoa', 'Mixed vegetables', 'Olive oil', 'Lemon', 'Herbs', 'Protein of choice']
        }
        
        key = meal_name.lower().replace(' ', '_')
        return ingredient_database.get(key, ['Basic ingredients as per recipe'])
    
    def get_nutritional_highlights(self, meal_data):
        """Get key nutritional highlights"""
        highlights = []
        
        
        macros = meal_data.get('macros', {})
        if macros.get('protein', 0) > 15:
            highlights.append(f"High protein ({macros['protein']}g)")
        if macros.get('fats', 0) < 5:
            highlights.append("Low fat")
        
        
        vitamins = meal_data.get('vitamins', {})
        for vitamin, amount in vitamins.items():
            if amount > 0:  
                highlights.append(f"Contains Vitamin {vitamin}")
        
        
        minerals = meal_data.get('minerals', {})
        high_minerals = ['iron', 'calcium', 'magnesium']
        for mineral in high_minerals:
            if mineral in minerals and minerals[mineral] > 0:
                highlights.append(f"Good source of {mineral}")
        
        return highlights[:3]  
    def calculate_daily_totals(self, daily_plan):
        """Calculate daily nutrition totals"""
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fats': 0,
            'vitamins': {},
            'minerals': {},
            'fiber': 0
        }
        
        meal_types = ['breakfast', 'lunch', 'snacks', 'dinner']
        
        for meal_type in meal_types:
            if meal_type in daily_plan:
                meal = daily_plan[meal_type]
                
                
                totals['calories'] += meal.get('calories', 0)
                macros = meal.get('macros', {})
                totals['protein'] += macros.get('protein', 0)
                totals['carbs'] += macros.get('carbs', 0)
                totals['fats'] += macros.get('fats', 0)
                
            
                for vitamin, amount in meal.get('vitamins', {}).items():
                    if vitamin not in totals['vitamins']:
                        totals['vitamins'][vitamin] = 0
                    totals['vitamins'][vitamin] += amount
                
                
                for mineral, amount in meal.get('minerals', {}).items():
                    if mineral not in totals['minerals']:
                        totals['minerals'][mineral] = 0
                    totals['minerals'][mineral] += amount
        
        return totals
    
    def get_health_recommendations(self, user_data, nutrition_summary, health_conditions=[]):
        """Get basic health recommendations (for backward compatibility)"""
        return self.get_enhanced_health_recommendations(user_data, nutrition_summary, health_conditions)
    
    def get_enhanced_health_recommendations(self, user_data, nutrition_summary, health_conditions=[]):
        """Generate comprehensive health recommendations"""
        recommendations = []
        
        
        goal = user_data.get('goal', 'maintain')
        if goal == 'weight_loss':
            recommendations.extend([
                'Focus on high-protein meals to preserve muscle mass during weight loss',
                'Include fiber-rich foods to increase satiety and reduce overall calorie intake',
                'Stay hydrated with at least 8-10 glasses of water daily',
                'Consider eating smaller, frequent meals to boost metabolism'
            ])
        elif goal == 'weight_gain':
            recommendations.extend([
                'Increase calorie-dense, nutritious foods like nuts, seeds, and healthy fats',
                'Add protein-rich snacks between meals to support muscle growth',
                'Include complex carbohydrates for sustained energy',
                'Consider strength training along with proper nutrition'
            ])
        else:  
            recommendations.extend([
                'Maintain a balanced diet with variety from all food groups',
                'Focus on whole foods and minimize processed items',
                'Keep portion sizes appropriate for your activity level'
            ])
        
        
        for condition in health_conditions:
            if condition == 'diabetes':
                recommendations.extend([
                    'Choose complex carbohydrates over simple sugars',
                    'Include chromium-rich foods like broccoli and whole grains',
                    'Monitor portion sizes and eat at regular intervals'
                ])
            elif condition == 'hypertension':
                recommendations.extend([
                    'Reduce sodium intake and increase potassium-rich foods',
                    'Include magnesium-rich foods like leafy greens and nuts',
                    'Limit processed foods and add herbs instead of salt'
                ])
            elif condition == 'kidney_stones':
                recommendations.extend([
                    'Increase water intake to at least 10-12 glasses daily',
                    'Limit high-oxalate foods like spinach and chocolate',
                    'Include citrus fruits for natural citrate'
                ])
        

        season = user_data.get('current_season', 'spring')
        seasonal_recs = {
            'winter': 'Include warming foods like ginger, garlic, and hot soups to boost immunity',
            'spring': 'Focus on detoxifying foods like bitter gourds and fresh greens',
            'monsoon': 'Boost immunity with turmeric, ginger, and vitamin C rich foods',
            'autumn': 'Include warming spices and cooked foods to prepare for winter'
        }
        if season in seasonal_recs:
            recommendations.append(seasonal_recs[season])
        

        age = user_data.get('age', 25)
        if age > 50:
            recommendations.extend([
                'Increase calcium and vitamin D intake for bone health',
                'Include B12-rich foods or consider supplementation',
                'Focus on easily digestible foods and smaller portions'
            ])
        elif age < 25:
            recommendations.append('Ensure adequate protein and calcium for growth and development')
        
        
        food_style = user_data.get('food_style', 'traditional')
        if food_style == 'traditional':
            recommendations.append('Traditional Indian foods provide excellent nutrition - include variety of dals, vegetables, and whole grains')
        elif food_style == 'modern':
            recommendations.append('Balance modern foods with traditional nutritional wisdom - include fermented foods and whole grains')
        
        return recommendations[:8]  
    
    def generate_grocery_list(self, weekly_plan):
        """Generate comprehensive grocery list from weekly meal plan"""
        grocery_list = {
            'grains_cereals': set(),
            'vegetables': set(),
            'fruits': set(),
            'dairy': set(),
            'proteins': set(),
            'spices_condiments': set(),
            'others': set()
        }
        
        
        for day, day_plan in weekly_plan.items():
            for meal_type, meal_data in day_plan.items():
                if meal_type != 'totals' and isinstance(meal_data, dict):
                    ingredients = meal_data.get('ingredients', [])
                    
                    for ingredient in ingredients:
                        category = self.categorize_ingredient(ingredient)
                        grocery_list[category].add(ingredient)
        
        
        for category in grocery_list:
            grocery_list[category] = sorted(list(grocery_list[category]))
        
        return grocery_list
    
    def categorize_ingredient(self, ingredient):
        """Categorize ingredient into grocery categories"""
        ingredient_lower = ingredient.lower()
        
        grains = ['rice', 'wheat', 'flour', 'quinoa', 'oats', 'millet', 'bread']
        vegetables = ['onion', 'tomato', 'potato', 'carrot', 'beans', 'spinach', 'cabbage', 'broccoli', 'pepper', 'vegetable']
        fruits = ['apple', 'banana', 'orange', 'mango', 'berries', 'lemon', 'lime', 'fruit']
        dairy = ['milk', 'yogurt', 'cheese', 'paneer', 'butter', 'ghee']
        proteins = ['dal', 'lentil', 'chicken', 'fish', 'eggs', 'nuts', 'seeds', 'tofu']
        spices = ['salt', 'pepper', 'turmeric', 'cumin', 'coriander', 'ginger', 'garlic', 'chili', 'spice', 'oil', 'powder']
        
        if any(grain in ingredient_lower for grain in grains):
            return 'grains_cereals'
        elif any(veg in ingredient_lower for veg in vegetables):
            return 'vegetables'
        elif any(fruit in ingredient_lower for fruit in fruits):
            return 'fruits'
        elif any(dairy_item in ingredient_lower for dairy_item in dairy):
            return 'dairy'
        elif any(protein in ingredient_lower for protein in proteins):
            return 'proteins'
        elif any(spice in ingredient_lower for spice in spices):
            return 'spices_condiments'
        else:
            return 'others'