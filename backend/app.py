from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import traceback
from datetime import datetime
import os
import speech_recognition as sr
import io
import base64

# Import our models
from models.nutrition import NutritionCalculator
from models.diet_engine import DietEngine

app = Flask(__name__)
# CORS configuration
CORS(app, supports_credentials=True, origins=[
    "http://127.0.0.1:5501", 
    "http://localhost:5501",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000"
])

# Initialize our engines
nutrition_calc = NutritionCalculator()
diet_engine = DietEngine()

# Initialize speech recognition
recognizer = sr.Recognizer()

# In-memory session storage (simple dict)
sessions = {}

def get_or_create_session(session_id):
    """Get or create a session"""
    if session_id not in sessions:
        sessions[session_id] = {
            'step': 'greeting',
            'data': {}
        }
    return sessions[session_id]

@app.route('/')
def home():
    return jsonify({"message": "Diet Chatbot API is running!", "status": "success"})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default_session')
        message = data.get('message', '')
        message_type = data.get('message_type', 'text')  # text, voice
        
        # Get or create session
        session_data = get_or_create_session(session_id)
        
        # Handle both string and number inputs
        if isinstance(message, (int, float)):
            message = str(message)
        else:
            message = str(message).strip().lower()
        
        # Process conversation
        response = process_enhanced_conversation(session_data, message)
        
        # Update session
        sessions[session_id] = session_data
        
        # Add session_id to response
        response['session_id'] = session_id
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "error": "Something went wrong. Please try again.",
            "status": "error"
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset_session():
    """Reset chat session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default_session')
        
        # Reset session
        sessions[session_id] = {
            'step': 'greeting',
            'data': {}
        }
        
        return jsonify({
            "message": "Session reset successfully!",
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

# Voice Input Processing Endpoint
@app.route('/api/process-voice', methods=['POST'])
def process_voice():
    """Process voice input from user"""
    try:
        data = request.get_json()
        audio_data = data.get('audio_data')  # Base64 encoded audio
        
        if not audio_data:
            return jsonify({'error': 'No audio data provided', 'success': False}), 400
        
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_data)
        
        # Use speech recognition to convert to text
        with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
            audio = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio)
                return jsonify({
                    'success': True,
                    'transcribed_text': text,
                    'message': 'Voice processed successfully'
                })
            except sr.UnknownValueError:
                return jsonify({
                    'success': False,
                    'error': 'Could not understand audio'
                }), 400
            except sr.RequestError as e:
                return jsonify({
                    'success': False,
                    'error': f'Speech recognition service error: {str(e)}'
                }), 500
                
    except Exception as e:
        print(f"Voice processing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Voice processing failed'
        }), 500

# Get Current Season based on date and location
@app.route('/api/current-season', methods=['GET'])
def get_current_season():
    """Get current season based on date and location"""
    try:
        # Get current month
        current_month = datetime.now().month
        
        # Indian seasons based on months
        if current_month in [12, 1, 2]:  # Dec, Jan, Feb
            season = "winter"
        elif current_month in [3, 4, 5]:  # Mar, Apr, May
            season = "spring"
        elif current_month in [6, 7, 8, 9]:  # Jun-Sep (Monsoon + Post-monsoon)
            season = "monsoon"
        else:  # Oct, Nov
            season = "autumn"
        
        return jsonify({
            'success': True,
            'current_season': season,
            'month': current_month,
            'season_info': get_season_info(season)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_season_info(season):
    """Get seasonal information and food recommendations"""
    season_data = {
        "winter": {
            "description": "Cool and dry season",
            "beneficial_foods": ["warm spices", "dry fruits", "jaggery", "sesame seeds"],
            "avoid_foods": ["cold drinks", "ice cream", "raw vegetables"]
        },
        "spring": {
            "description": "Pleasant weather, body detox season",
            "beneficial_foods": ["fresh fruits", "green leafy vegetables", "bitter gourds"],
            "avoid_foods": ["heavy foods", "excess sweet foods"]
        },
        "monsoon": {
            "description": "High humidity and rainfall",
            "beneficial_foods": ["ginger", "turmeric", "warm soups", "steamed foods"],
            "avoid_foods": ["street food", "raw salads", "excess water"]
        },
        "autumn": {
            "description": "Post-monsoon, preparing for winter",
            "beneficial_foods": ["warming foods", "cooked vegetables", "herbal teas"],
            "avoid_foods": ["cold foods", "excessive raw foods"]
        }
    }
    return season_data.get(season, {})

# Enhanced Food Categories Endpoint
@app.route('/api/food-categories', methods=['GET'])
def get_food_categories():
    """Get available food categories with detailed options"""
    try:
        categories = {
            "dietary_preference": [
                {"id": "vegetarian", "name": "Vegetarian", "description": "Plant-based foods only"},
                {"id": "non_vegetarian", "name": "Non-Vegetarian", "description": "Includes meat, fish, eggs"},
                {"id": "both", "name": "Both", "description": "Mixed diet with flexibility"}
            ],
            "food_style": [
                {"id": "traditional", "name": "Traditional", "description": "Classical Indian regional foods"},
                {"id": "modern", "name": "Modern", "description": "Contemporary and fusion foods"},
                {"id": "both", "name": "Both", "description": "Mix of traditional and modern"}
            ],
            "seasons": [
                {"id": "winter", "name": "Winter", "months": "Dec-Feb"},
                {"id": "spring", "name": "Spring", "months": "Mar-May"},
                {"id": "monsoon", "name": "Monsoon", "months": "Jun-Sep"},
                {"id": "autumn", "name": "Autumn", "months": "Oct-Nov"}
            ]
        }
        
        return jsonify({
            'success': True,
            'categories': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Enhanced nutrition calculation endpoint
@app.route('/api/nutrition', methods=['POST'])
def calculate_nutrition():
    """Enhanced nutrition calculation endpoint"""
    try:
        data = request.get_json()
        
        nutrition_summary = nutrition_calc.get_enhanced_nutrition_summary(
            data['weight'],
            data['height'],
            data['age'],
            data['gender'],
            data['goal'],
            data.get('timeline', 'short_term')
        )
        
        return jsonify({
            "nutrition_summary": nutrition_summary,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/meal-plan', methods=['POST'])
def generate_meal_plan():
    """Enhanced meal plan generation endpoint"""
    try:
        data = request.get_json()
        
        # Calculate enhanced nutrition first
        nutrition_summary = nutrition_calc.get_enhanced_nutrition_summary(
            data['weight'],
            data['height'],
            data['age'],
            data['gender'],
            data['goal'],
            data.get('timeline', 'short_term')
        )
        
        # Generate enhanced meal plan
        weekly_plan = diet_engine.generate_enhanced_weekly_plan(
            data, 
            nutrition_summary,
            health_conditions=data.get('health_conditions', []),
            cost_preference=data.get('cost_preference', 'medium'),
            food_style=data.get('food_style', 'both'),
            current_season=data.get('current_season', 'spring')
        )
        
        recommendations = diet_engine.get_enhanced_health_recommendations(
            data, 
            nutrition_summary,
            health_conditions=data.get('health_conditions', [])
        )
        
        grocery_list = diet_engine.generate_grocery_list(weekly_plan)
        
        return jsonify({
            "nutrition_summary": nutrition_summary,
            "weekly_plan": weekly_plan,
            "recommendations": recommendations,
            "grocery_list": grocery_list,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/health-conditions', methods=['GET'])
def get_health_conditions():
    """Get list of available health conditions"""
    try:
        conditions = [
            {"id": 1, "name": "Diabetes", "code": "diabetes"},
            {"id": 2, "name": "Hypertension (High BP)", "code": "hypertension"},
            {"id": 3, "name": "Kidney Stones", "code": "kidney_stones"},
            {"id": 4, "name": "Heart Disease", "code": "heart_disease"},
            {"id": 5, "name": "Lactose Intolerance", "code": "lactose_intolerance"},
            {"id": 6, "name": "Gluten Intolerance", "code": "gluten_intolerance"},
            {"id": 7, "name": "Nut Allergy", "code": "nut_allergy"},
            {"id": 8, "name": "Egg Allergy", "code": "egg_allergy"},
            {"id": 9, "name": "Fish Allergy", "code": "fish_allergy"},
            {"id": 10, "name": "Shellfish Allergy", "code": "shellfish_allergy"}
        ]
        
        return jsonify({
            "health_conditions": conditions,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

# All conversation processing functions remain the same
def process_enhanced_conversation(session, message):
    """Enhanced conversation flow with all new features"""
    step = session['step']
    user_data = session['data']
    
    if step == 'greeting':
        session['step'] = 'age'
        return {
            "message": "Hello! I'm your Enhanced Personal Diet Assistant!\n\nI'll create a comprehensive meal plan including:\n✅ Complete vitamins & minerals analysis\n✅ Traditional & modern food options\n✅ Seasonal food recommendations\n✅ Detailed preparation methods\n✅ Storage guidelines & grocery lists\n\nLet's start! What's your age?",
            "step": "age",
            "status": "success"
        }
    
    elif step == 'age':
        try:
            age = int(message)
            if 10 <= age <= 100:
                user_data['age'] = age
                session['step'] = 'weight'
                return {
                    "message": f"Perfect! Age {age} noted.\n\nWhat's your current weight in kg?",
                    "step": "weight",
                    "status": "success"
                }
            else:
                return {
                    "message": "Please enter a valid age between 10 and 100 years.",
                    "step": "age",
                    "status": "error"
                }
        except ValueError:
            return {
                "message": "Please enter your age as a number (e.g., 25).",
                "step": "age",
                "status": "error"
            }
    
    elif step == 'weight':
        try:
            weight = float(message)
            if 30 <= weight <= 200:
                user_data['weight'] = weight
                session['step'] = 'height'
                return {
                    "message": f"Great! Weight {weight} kg recorded.\n\nWhat's your height in cm?",
                    "step": "height",
                    "status": "success"
                }
            else:
                return {
                    "message": "Please enter a valid weight between 30 and 200 kg.",
                    "step": "weight",
                    "status": "error"
                }
        except ValueError:
            return {
                "message": "Please enter your weight as a number (e.g., 65.5).",
                "step": "weight",
                "status": "error"
            }
    
    elif step == 'height':
        try:
            height = float(message)
            if 100 <= height <= 250:
                user_data['height'] = height
                session['step'] = 'gender'
                return {
                    "message": f"Excellent! Height {height} cm noted.\n\nWhat's your gender?\n- Male\n- Female",
                    "step": "gender",
                    "status": "success"
                }
            else:
                return {
                    "message": "Please enter a valid height between 100 and 250 cm.",
                    "step": "height",
                    "status": "error"
                }
        except ValueError:
            return {
                "message": "Please enter your height as a number (e.g., 175).",
                "step": "height",
                "status": "error"
            }
    
    elif step == 'gender':
        if message in ['male', 'm', 'man']:
            user_data['gender'] = 'male'
        elif message in ['female', 'f', 'woman']:
            user_data['gender'] = 'female'
        else:
            return {
                "message": "Please specify your gender as 'Male' or 'Female'.",
                "step": "gender",
                "status": "error"
            }
        
        session['step'] = 'food_preference'
        return {
            "message": f"Gender recorded as {user_data['gender'].title()}.\n\nWhat's your dietary preference?\n- Vegetarian (Plant-based only)\n- Non-Vegetarian (Includes meat/fish)\n- Both (Flexible diet)",
            "step": "food_preference",
            "status": "success"
        }
    
    elif step == 'food_preference':
        if any(word in message for word in ['veg', 'vegetarian', 'vegan', 'plant']):
            user_data['food_preference'] = 'vegetarian'
        elif any(word in message for word in ['non-veg', 'non-vegetarian', 'meat', 'chicken', 'fish']):
            user_data['food_preference'] = 'non_vegetarian'
        elif 'both' in message or 'flexible' in message:
            user_data['food_preference'] = 'both'
        else:
            return {
                "message": "Please choose your dietary preference:\n- Vegetarian\n- Non-Vegetarian\n- Both (Flexible)",
                "step": "food_preference",
                "status": "error"
            }
        
        session['step'] = 'food_style'
        return {
            "message": f"Dietary preference: {user_data['food_preference'].replace('_', '-').title()}\n\nWhat's your food style preference?\n- Traditional (Classic Indian regional foods)\n- Modern (Contemporary & fusion cuisine)\n- Both (Mix of traditional and modern)",
            "step": "food_style",
            "status": "success"
        }
    
    elif step == 'food_style':
        if 'traditional' in message or 'classic' in message:
            user_data['food_style'] = 'traditional'
        elif 'modern' in message or 'contemporary' in message:
            user_data['food_style'] = 'modern'
        elif 'both' in message or 'mix' in message:
            user_data['food_style'] = 'both'
        else:
            return {
                "message": "Please choose your food style:\n- Traditional (Classic Indian foods)\n- Modern (Contemporary cuisine)\n- Both (Mix of both)",
                "step": "food_style",
                "status": "error"
            }
        
        session['step'] = 'current_season'
        # Auto-detect current season
        current_month = datetime.now().month
        if current_month in [12, 1, 2]:
            season = "winter"
        elif current_month in [3, 4, 5]:
            season = "spring"
        elif current_month in [6, 7, 8, 9]:
            season = "monsoon"
        else:
            season = "autumn"
            
        user_data['current_season'] = season
        
        return {
            "message": f"Food style: {user_data['food_style'].title()}\n\nI've detected current season as {season.title()}.\n\nIs this correct, or would you prefer meals for a different season?\n- Winter (Dec-Feb) - Warming foods\n- Spring (Mar-May) - Detox foods  \n- Monsoon (Jun-Sep) - Immunity boosting\n- Autumn (Oct-Nov) - Balancing foods\n- Current ({season.title()}) - Keep detected season",
            "step": "current_season",
            "status": "success"
        }
    
    elif step == 'current_season':
        if 'winter' in message:
            user_data['current_season'] = 'winter'
        elif 'spring' in message:
            user_data['current_season'] = 'spring'
        elif 'monsoon' in message or 'rainy' in message:
            user_data['current_season'] = 'monsoon'
        elif 'autumn' in message or 'fall' in message:
            user_data['current_season'] = 'autumn'
        elif 'current' in message or 'keep' in message or 'yes' in message:
            # Keep the auto-detected season
            pass
        else:
            return {
                "message": "Please choose the season for meal recommendations:\n- Winter - Warming foods\n- Spring - Detox foods\n- Monsoon - Immunity boosting\n- Autumn - Balancing foods\n- Current - Keep auto-detected season",
                "step": "current_season",
                "status": "error"
            }
        
        session['step'] = 'region'
        return {
            "message": f"Season preference: {user_data['current_season'].title()}\n\nWhich regional cuisine do you prefer?\n- South Indian (Rice, Sambar, Rasam)\n- North Indian (Roti, Dal, Sabzi)",
            "step": "region",
            "status": "success"
        }
    
    elif step == 'region':
        if 'south' in message:
            user_data['region'] = 'south_indian'
        elif 'north' in message:
            user_data['region'] = 'north_indian'
        else:
            return {
                "message": "Please choose your regional preference:\n- South Indian\n- North Indian",
                "step": "region",
                "status": "error"
            }
        
        session['step'] = 'goal'
        return {
            "message": f"Regional cuisine: {user_data['region'].replace('_', ' ').title()}\n\nWhat's your primary health goal?\n- Weight Loss (Caloric deficit)\n- Weight Gain (Muscle building)\n- Maintain Weight (Balanced nutrition)",
            "step": "goal",
            "status": "success"
        }
    
    elif step == 'goal':
        if any(word in message for word in ['loss', 'lose', 'reduce']):
            user_data['goal'] = 'weight_loss'
        elif any(word in message for word in ['gain', 'increase', 'build']):
            user_data['goal'] = 'weight_gain'
        elif any(word in message for word in ['maintain', 'same', 'stable']):
            user_data['goal'] = 'maintain'
        else:
            return {
                "message": "Please choose your goal:\n- Weight Loss\n- Weight Gain\n- Maintain Weight",
                "step": "goal",
                "status": "error"
            }
        
        session['step'] = 'health_conditions'
        return {
            "message": f"Goal: {user_data['goal'].replace('_', ' ').title()}\n\nDo you have any health conditions? (Type numbers separated by commas, or 'none')\n\n1. Diabetes\n2. Hypertension (High BP)\n3. Kidney Stones\n4. Heart Disease\n5. Lactose Intolerance\n6. Gluten Intolerance\n7. Nut Allergy\n8. Egg Allergy\n9. Fish Allergy\n10. Shellfish Allergy\n11. None\n\nExample: '1,3,7' or 'none'",
            "step": "health_conditions",
            "status": "success"
        }
    
    elif step == 'health_conditions':
        health_conditions = parse_health_conditions(message)
        if health_conditions is None:
            return {
                "message": "Please enter valid numbers (1-11) separated by commas, or 'none'.\nExample: '1,3' for Diabetes and Kidney Stones, or 'none'.",
                "step": "health_conditions",
                "status": "error"
            }
        
        user_data['health_conditions'] = health_conditions
        session['step'] = 'cost_preference'
        
        conditions_text = ", ".join(health_conditions) if health_conditions else "None"
        return {
            "message": f"Health conditions: {conditions_text}\n\nWhat's your budget preference?\n- Low Cost (Local, seasonal foods)\n- Medium Cost (Moderate variety)\n- High Cost (Premium, exotic ingredients)",
            "step": "cost_preference",
            "status": "success"
        }
    
    elif step == 'cost_preference':
        if any(word in message for word in ['low', 'budget', 'cheap', 'affordable']):
            user_data['cost_preference'] = 'low'
        elif any(word in message for word in ['medium', 'moderate', 'mid']):
            user_data['cost_preference'] = 'medium'
        elif any(word in message for word in ['high', 'premium', 'expensive']):
            user_data['cost_preference'] = 'high'
        else:
            return {
                "message": "Please choose your budget preference:\n- Low Cost\n- Medium Cost\n- High Cost",
                "step": "cost_preference",
                "status": "error"
            }
        
        session['step'] = 'timeline'
        return {
            "message": f"Budget: {user_data['cost_preference'].title()} Cost\n\nWhat's your goal timeline?\n- Short-term (1-3 months)\n- Mid-term (3-6 months)\n- Long-term (6+ months)",
            "step": "timeline",
            "status": "success"
        }
    
    elif step == 'timeline':
        if 'short' in message:
            user_data['timeline'] = 'short_term'
        elif 'mid' in message:
            user_data['timeline'] = 'mid_term'
        elif 'long' in message:
            user_data['timeline'] = 'long_term'
        else:
            return {
                "message": "Please choose your timeline:\n- Short-term (1-3 months)\n- Mid-term (3-6 months)\n- Long-term (6+ months)",
                "step": "timeline",
                "status": "error"
            }
        
        # Generate the enhanced diet plan
        return generate_enhanced_diet_plan(session)
    
    else:
        # Reset session if unknown step
        session['step'] = 'greeting'
        return {
            "message": "Let's start over! I'm here to create your comprehensive diet plan.",
            "step": "greeting",
            "status": "success"
        }

def parse_health_conditions(message):
    """Parse health condition input from user"""
    if message.lower() in ['none', 'no', 'nothing', '11']:
        return []
    
    condition_mapping = {
        '1': 'diabetes',
        '2': 'hypertension', 
        '3': 'kidney_stones',
        '4': 'heart_disease',
        '5': 'lactose_intolerance',
        '6': 'gluten_intolerance',
        '7': 'nut_allergy',
        '8': 'egg_allergy',
        '9': 'fish_allergy',
        '10': 'shellfish_allergy'
    }
    
    try:
        # Split by comma and clean up
        numbers = [num.strip() for num in message.split(',')]
        conditions = []
        
        for num in numbers:
            if num in condition_mapping:
                conditions.append(condition_mapping[num])
            else:
                return None  # Invalid input
        
        return conditions
    except:
        return None

def generate_enhanced_diet_plan(session):
    """Generate the comprehensive diet plan with all enhancements"""
    try:
        user_data = session['data']
        
        # Calculate comprehensive nutrition metrics
        nutrition_summary = nutrition_calc.get_enhanced_nutrition_summary(
            user_data['weight'],
            user_data['height'],
            user_data['age'],
            user_data['gender'],
            user_data['goal'],
            user_data['timeline']
        )
        
        # Generate enhanced weekly meal plan
        weekly_plan = diet_engine.generate_enhanced_weekly_plan(
            user_data, 
            nutrition_summary,
            health_conditions=user_data.get('health_conditions', []),
            cost_preference=user_data.get('cost_preference', 'medium'),
            food_style=user_data.get('food_style', 'both'),
            current_season=user_data.get('current_season', 'spring')
        )
        
        # Get enhanced health recommendations
        recommendations = diet_engine.get_enhanced_health_recommendations(
            user_data, 
            nutrition_summary,
            health_conditions=user_data.get('health_conditions', [])
        )
        
        # Generate grocery list
        grocery_list = diet_engine.generate_grocery_list(weekly_plan)
        
        # Format comprehensive response
        response_message = format_enhanced_diet_plan_response(
            user_data, nutrition_summary, weekly_plan, recommendations, grocery_list
        )
        
        # Reset session
        session['step'] = 'completed'
        session['plan'] = {
            'nutrition_summary': nutrition_summary,
            'weekly_plan': weekly_plan,
            'recommendations': recommendations,
            'grocery_list': grocery_list
        }
        
        return {
            "message": response_message,
            "step": "completed",
            "status": "success",
            "data": {
                "nutrition_summary": nutrition_summary,
                "weekly_plan": weekly_plan,
                "recommendations": recommendations,
                "grocery_list": grocery_list,
                "user_profile": user_data
            }
        }
        
    except Exception as e:
        print(f"Error generating enhanced diet plan: {str(e)}")
        traceback.print_exc()
        return {
            "message": "I apologize, but there was an error generating your comprehensive diet plan. Please try again.",
            "step": "greeting",
            "status": "error"
        }

def format_enhanced_diet_plan_response(user_data, nutrition_summary, weekly_plan, recommendations, grocery_list):
    """Format the enhanced diet plan response message"""
    
    # User profile summary
    profile = f"Your Complete Profile\n"
    profile += f"• Age: {user_data['age']} years | Weight: {user_data['weight']} kg | Height: {user_data['height']} cm\n"
    profile += f"• Gender: {user_data['gender'].title()} | Diet: {user_data['food_preference'].replace('_', '-').title()}\n"
    profile += f"• Style: {user_data.get('food_style', 'both').title()} | Season: {user_data.get('current_season', 'spring').title()}\n"
    profile += f"• Region: {user_data['region'].replace('_', ' ').title()} | Goal: {user_data['goal'].replace('_', ' ').title()}\n"
    
    # Health conditions
    conditions_text = ", ".join([c.replace('_', ' ').title() for c in user_data.get('health_conditions', [])]) if user_data.get('health_conditions') else "None"
    profile += f"• Health: {conditions_text} | Budget: {user_data.get('cost_preference', 'medium').title()}\n\n"
    
    # Enhanced nutrition summary with vitamins/minerals
    nutrition = f"Complete Nutrition Analysis\n"
    nutrition += f"• BMI: {nutrition_summary['bmi']} ({nutrition_summary['bmi_category']})\n"
    nutrition += f"• Daily Calories: {nutrition_summary['daily_calories']} kcal | BMR: {nutrition_summary['bmr']}\n"
    nutrition += f"• Protein: {nutrition_summary['macronutrients']['protein']}g | Carbs: {nutrition_summary['macronutrients']['carbs']}g | Fat: {nutrition_summary['macronutrients']['fat']}g\n"
    
    # Add vitamins and minerals info
    if 'vitamins' in nutrition_summary:
        nutrition += f"• Key Vitamins: Vitamin C ({nutrition_summary['vitamins'].get('C', 90)}mg), Vitamin D ({nutrition_summary['vitamins'].get('D', 15)}mcg)\n"
    if 'minerals' in nutrition_summary:
        nutrition += f"• Essential Minerals: Iron ({nutrition_summary['minerals'].get('iron', 18)}mg), Calcium ({nutrition_summary['minerals'].get('calcium', 1000)}mg)\n\n"
    
    # Sample day with enhanced details
    monday_plan = weekly_plan.get('Monday', {})
    sample_day = f"Sample Day Menu (Monday)\n"
    
    for meal_type, meal_data in monday_plan.items():
        if meal_type != 'totals' and isinstance(meal_data, dict):
            sample_day += f"**{meal_type.title()}:** {meal_data.get('name', 'N/A')}\n"
            sample_day += f"  • Calories: {meal_data.get('calories', 0)} kcal\n"
            sample_day += f"  • Prep Time: {meal_data.get('prep_time', '15 mins')}\n"
            
            # Add storage info if available
            if 'storage' in meal_data:
                sample_day += f"  • Storage: {meal_data['storage']}\n"
    
    if 'totals' in monday_plan:
        sample_day += f"**Daily Total:** {monday_plan['totals']['calories']} kcal\n\n"
    
    # Enhanced health recommendations
    recs = f"Personalized Health Recommendations\n"
    for i, rec in enumerate(recommendations[:5], 1):  # Show top 5
        recs += f"{i}. {rec}\n"
    recs += "\n"
    
    # Grocery list preview
    grocery_preview = f"Weekly Grocery List (Preview)\n"
    if grocery_list:
        categories = ['vegetables', 'grains', 'proteins', 'spices']
        for category in categories:
            if category in grocery_list and grocery_list[category]:
                items = grocery_list[category][:3]  # Show first 3 items
                grocery_preview += f"• {category.title()}: {', '.join(items)}\n"
    grocery_preview += "\n"
    
    # Seasonal benefits
    seasonal_info = get_season_info(user_data.get('current_season', 'spring'))
    seasonal_text = f"Seasonal Benefits ({user_data.get('current_season', 'spring').title()})\n"
    seasonal_text += f"• Focus: {seasonal_info.get('description', 'Balanced nutrition')}\n"
    seasonal_text += f"• Includes: {', '.join(seasonal_info.get('beneficial_foods', [])[:4])}\n\n"

    final_message = f"""Your Enhanced 7-Day Diet Plan is Ready!

{profile}{nutrition}{sample_day}{recs}{grocery_preview}{seasonal_text}

Complete Features Included:
- Full vitamin & mineral analysis
- Traditional + modern food combinations  
- Season-specific recommendations
- Detailed preparation methods
- Storage guidelines for each food
- Complete weekly grocery list
- Precise quantity measurements

Special Highlights:
• {user_data.get('current_season', 'Spring').title()} seasonal foods for optimal health
• {user_data.get('food_style', 'Traditional').title()} cuisine style as preferred
• Health condition considerations included
• {user_data.get('cost_preference', 'Medium').title()} budget-friendly options

Type 'new plan' for another plan or ask specific questions!"""
    
    return final_message

if __name__ == '__main__':
    print("Starting Simplified Diet Chatbot API...")
    print("Features:")
    print("✅ Complete vitamins & minerals tracking")
    print("✅ Traditional/Modern food preferences") 
    print("✅ Seasonal food recommendations")
    print("✅ Voice input processing")
    print("✅ Detailed preparation methods")
    print("✅ Storage guidelines")
    print("✅ Grocery list generation")
    print("✅ Enhanced nutrition analysis")
    print("✅ In-memory session storage (no database)")
    print("✅ No authentication required")
    print("-" * 50)
    print("API Endpoints:")
    print("POST /api/chat - Main chat endpoint")
    print("POST /api/reset - Reset session")
    print("POST /api/process-voice - Voice input processing")
    print("GET /api/current-season - Get current season")
    print("GET /api/food-categories - Get food categories")
    print("POST /api/nutrition - Complete nutrition analysis")
    print("POST /api/meal-plan - Enhanced meal planning")
    print("GET /api/health-conditions - Get health conditions list")
    print("-" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)