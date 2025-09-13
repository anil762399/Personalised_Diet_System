// Complete Error-Free Enhanced Frontend JavaScript for Diet Chatbot
class EnhancedDietChatbot {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.userId = this.generateUserId();
        this.currentStep = 'greeting';
        this.isWaitingForResponse = false;
        this.voiceRecognition = null;
        this.isListening = false;
        this.currentSeason = this.getCurrentSeason();
        this.userResponses = {}; // Store user responses
        this.lastPlanData = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeVoiceRecognition();
        this.initializeSeasonalFeatures();
        this.initializeGreeting();
    }
    
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 9) return 'monsoon';
        return 'winter';
    }
    
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages') || this.createFallbackElement('chatMessages');
        this.messageInput = document.getElementById('messageInput') || this.createFallbackElement('messageInput', 'input');
        this.sendBtn = document.getElementById('sendBtn') || this.createFallbackElement('sendBtn', 'button');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.resetBtn = document.getElementById('resetBtn') || this.createFallbackElement('resetBtn', 'button');
        this.loadingIndicator = document.getElementById('loadingIndicator') || this.createFallbackElement('loadingIndicator');
        this.loadingSubtitle = document.getElementById('loadingSubtitle') || this.createFallbackElement('loadingSubtitle');
        this.inputStatus = document.getElementById('inputStatus') || this.createFallbackElement('inputStatus');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.dietPlanModal = document.getElementById('dietPlanModal') || this.createFallbackElement('dietPlanModal');
        this.dietPlanContent = document.getElementById('dietPlanContent') || this.createFallbackElement('dietPlanContent');
        this.inputSuggestions = document.getElementById('inputSuggestions') || this.createFallbackElement('inputSuggestions');
    }
    
    createFallbackElement(id, type = 'div') {
        const element = document.createElement(type);
        element.id = id;
        return element;
    }
    
    initializeGreeting() {
        // Add initial greeting message
        setTimeout(() => {
            this.addMessage("🌟 Welcome to your Enhanced Smart Diet Assistant!", 'bot');
            this.addMessage("I'll create a personalized meal plan with complete nutrition analysis, seasonal recommendations, traditional + modern foods, detailed recipes, grocery lists, and storage guidelines.", 'bot');
            this.addStartPlanningButton();
            this.setInputState(false, 'Click "Start Planning" to begin your personalized diet journey');
        }, 500);
    }
    
    addStartPlanningButton() {
        const lastMessage = this.chatMessages.lastElementChild;
        if (!lastMessage) return;
        
        const contentDiv = lastMessage.querySelector('.message-content');
        if (!contentDiv) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions start-planning-actions';
        
        const startButton = document.createElement('button');
        startButton.className = 'quick-btn primary start-planning-btn';
        startButton.innerHTML = '<i class="fas fa-play"></i> Start Planning';
        startButton.onclick = () => this.startPlanningProcess();
        
        actionsDiv.appendChild(startButton);
        contentDiv.appendChild(actionsDiv);
    }
    
    startPlanningProcess() {
        // Remove start planning button
        const startBtn = document.querySelector('.start-planning-btn');
        if (startBtn) startBtn.remove();
        
        // Begin the planning process
        this.addMessage("Perfect! Let's create your personalized nutrition plan. I'll guide you through a few questions to understand your preferences and needs.", 'bot');
        
        // Set first step
        this.currentStep = 'food_style';
        this.askCurrentQuestion();
        
        // Enable input
        this.setInputState(true, 'Choose your preferred food style...');
        this.showNotification('Planning started! Answer the questions to create your perfect diet plan.', 'success');
    }
    
    askCurrentQuestion() {
        const questions = {
            food_style: {
                message: "**Step 1/12:** What's your preferred food style?\n\n• **Traditional** - Classic regional foods with time-tested recipes\n• **Modern** - Contemporary nutrition-focused foods\n• **Both** - Best of both traditional and modern worlds",
                placeholder: "Choose: traditional, modern, or both..."
            },
            food_preference: {
                message: "**Step 2/12:** What's your dietary preference?\n\n• **Vegetarian** - Plant-based foods only\n• **Non-Vegetarian** - Includes meat, fish, and eggs\n• **Combination** - Flexible approach with both options",
                placeholder: "Type: vegetarian, non-vegetarian, or combination..."
            },
            season_preference: {
                message: `**Step 3/12:** Which seasonal approach do you prefer?\n\n• **Current Season** - ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)} focused foods\n• **All Season** - Year-round food options\n• **Seasonal Special** - Maximum seasonal benefits`,
                placeholder: "Choose your seasonal preference..."
            },
            gender: {
                message: "**Step 4/12:** What's your gender?\n\nThis helps calculate accurate nutritional requirements.",
                placeholder: "Enter: male or female"
            },
            age: {
                message: "**Step 5/12:** What's your age?\n\nAge helps determine metabolic rate and nutritional needs.",
                placeholder: "Enter your age in years (e.g., 25)"
            },
            weight: {
                message: "**Step 6/12:** What's your current weight?\n\nWeight is essential for calorie calculation.",
                placeholder: "Enter weight in kg (e.g., 65)"
            },
            height: {
                message: "**Step 7/12:** What's your height?\n\nHeight helps calculate BMI and nutritional requirements.",
                placeholder: "Enter height in cm (e.g., 170)"
            },
            region: {
                message: "**Step 8/12:** Which regional cuisine do you prefer?\n\n• **South Indian** - Rice, millets, coconut-based\n• **North Indian** - Wheat, dairy, rich spices\n• **East Indian** - Fish, rice, sweets\n• **West Indian** - Varied coastal cuisine",
                placeholder: "Choose your preferred regional cuisine..."
            },
            goal: {
                message: "**Step 9/12:** What's your primary health goal?\n\n• **Weight Loss** - Calorie deficit with balanced nutrition\n• **Weight Gain** - Healthy weight increase\n• **Maintain Weight** - Balanced maintenance plan\n• **Muscle Gain** - Protein-rich foods for muscle building\n• **General Health** - Overall wellness and nutrition",
                placeholder: "Choose your health goal..."
            },
            health_conditions: {
                message: "**Step 10/12:** Do you have any health conditions?\n\nCommon conditions:\n1. Diabetes\n2. Hypertension\n3. Kidney issues\n4. Stomach problems\n5. Heart disease\n6. Thyroid issues\n7. Food allergies\n8. PCOD/PCOS\n\nEnter condition numbers separated by commas (e.g., 1,2) or type 'none'",
                placeholder: "Enter condition numbers or 'none'"
            },
            cost_preference: {
                message: "**Step 11/12:** What's your budget preference?\n\n• **Low Cost** - Budget-friendly, local ingredients\n• **Medium Cost** - Balanced pricing with good variety\n• **High Cost** - Premium ingredients and exotic foods",
                placeholder: "Choose: low cost, medium cost, or high cost"
            },
            timeline: {
                message: "**Step 12/12:** What's your preferred timeline?\n\n• **Short-term** - 1-2 months (quick results)\n• **Mid-term** - 3-6 months (sustainable changes)\n• **Long-term** - 6+ months (lifestyle transformation)",
                placeholder: "Choose your preferred timeline..."
            }
        };
        
        const currentQ = questions[this.currentStep];
        if (currentQ) {
            this.addMessage(currentQ.message, 'bot');
            this.addEnhancedQuickActions(this.currentStep);
            this.setInputState(true, currentQ.placeholder);
            this.showInputSuggestions(this.currentStep);
        }
    }
    
    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';

            this.voiceRecognition.onstart = () => {
                this.isListening = true;
                if (this.voiceBtn) {
                    this.voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                    this.voiceBtn.classList.add('listening');
                }
                if (this.voiceStatus) this.voiceStatus.style.display = 'flex';
                this.updateLoadingMessage('Listening for your voice...');
            };

            this.voiceRecognition.onend = () => {
                this.isListening = false;
                if (this.voiceBtn) {
                    this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    this.voiceBtn.classList.remove('listening');
                }
                if (this.voiceStatus) this.voiceStatus.style.display = 'none';
            };

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.showNotification(`Voice captured: "${transcript}"`, 'success');
                setTimeout(() => this.sendMessage(), 500);
            };

            this.voiceRecognition.onerror = (event) => {
                this.showNotification(`Voice error: ${event.error}`, 'error');
                this.isListening = false;
                if (this.voiceBtn) {
                    this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    this.voiceBtn.classList.remove('listening');
                }
                if (this.voiceStatus) this.voiceStatus.style.display = 'none';
            };
        } else if (this.voiceBtn) {
            this.voiceBtn.style.display = 'none';
        }
    }
    
    initializeSeasonalFeatures() {
        this.updateSeasonalHints();
        setTimeout(() => {
            this.showNotification(`Current season: ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)} - Perfect time for seasonal foods!`, 'info', 3000);
        }, 2000);
    }
    
    updateSeasonalHints() {
        const seasonalTexts = {
            spring: 'Perfect season for detox foods and fresh greens!',
            summer: 'Time for cooling foods and hydrating fruits!',
            monsoon: 'Boost immunity with warming spices and millets!',
            winter: 'Enjoy warming foods and seasonal dry fruits!'
        };
        
        const seasonalElements = document.querySelectorAll('.seasonal-hint');
        seasonalElements.forEach(el => {
            el.textContent = seasonalTexts[this.currentSeason] || 'Seasonal foods available!';
        });
    }
    
    attachEventListeners() {
        // Send button click
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter key press
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Input suggestions
            this.messageInput.addEventListener('focus', () => this.showInputSuggestions(this.currentStep));
            this.messageInput.addEventListener('input', () => this.hideInputSuggestions());
        }
        
        // Voice button click
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        // Reset button
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetChat());
        }
        
        // Modal close
        window.addEventListener('click', (e) => {
            if (e.target === this.dietPlanModal) {
                this.closeDietPlan();
            }
        });
        
        // Prevent form submission if in a form
        window.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target === this.messageInput) {
                e.preventDefault();
            }
        });
    }
    
    toggleVoiceInput() {
        if (!this.voiceRecognition) {
            this.showNotification('Voice recognition not supported in this browser', 'warning');
            return;
        }

        if (this.isListening) {
            this.voiceRecognition.stop();
        } else {
            this.voiceRecognition.start();
        }
    }
    
    showInputSuggestions(step) {
        if (!this.inputSuggestions) return;
        
        const suggestionMap = {
            'food_style': ['traditional', 'modern', 'both traditional and modern'],
            'food_preference': ['vegetarian', 'non-vegetarian', 'combination of both'],
            'season_preference': ['current season foods', 'all season foods', `${this.currentSeason} special foods`],
            'gender': ['male', 'female'],
            'region': ['south indian', 'north indian', 'east indian', 'west indian'],
            'goal': ['weight loss', 'weight gain', 'maintain weight', 'muscle gain', 'general health'],
            'health_conditions': ['1,2', '3,4', 'none', '5,6'],
            'cost_preference': ['low cost', 'medium cost', 'high cost'],
            'timeline': ['short-term', 'mid-term', 'long-term']
        };
        
        if (suggestionMap[step]) {
            this.inputSuggestions.innerHTML = suggestionMap[step].map(s => 
                `<span class="suggestion-chip" onclick="fillSuggestion('${s}')">${s}</span>`
            ).join('');
            this.inputSuggestions.style.display = 'flex';
        }
    }
    
    hideInputSuggestions() {
        if (this.inputSuggestions) {
            this.inputSuggestions.style.display = 'none';
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isWaitingForResponse) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Store user response
        this.userResponses[this.currentStep] = message;
        
        this.messageInput.value = '';
        this.hideInputSuggestions();
        this.setInputState(false, 'Processing your response...');

        try {
            // Move to next step or generate plan
            await this.processUserResponse(message);
            
        } catch (error) {
            console.error('Error processing response:', error);
            this.addMessage('Sorry, I encountered an error processing your response. Please try again.', 'bot', true);
            this.setInputState(true, 'Please try again...');
        } finally {
            this.isWaitingForResponse = false;
        }
    }
    
    async processUserResponse(message) {
        // Validate response
        if (!this.validateResponse(this.currentStep, message)) {
            this.addMessage('Please provide a valid response for this question.', 'bot', true);
            this.setInputState(true, this.getStepPlaceholder(this.currentStep));
            this.showInputSuggestions(this.currentStep);
            return;
        }
        
        // Move to next step
        const nextStep = this.getNextStep(this.currentStep);
        
        if (nextStep) {
            this.currentStep = nextStep;
            this.addMessage('Got it! Let\'s continue...', 'bot');
            setTimeout(() => this.askCurrentQuestion(), 1000);
        } else {
            // All questions answered, generate plan
            this.addMessage('Perfect! I have all the information I need. Let me create your personalized nutrition plan...', 'bot');
            this.showLoading(true);
            this.setInputState(false, 'Generating your complete nutrition plan...');
            
            try {
                const planData = await this.generateNutritionPlan();
                this.handlePlanGeneration(planData);
            } catch (error) {
                console.error('Error generating plan:', error);
                this.addMessage('Sorry, I encountered an error generating your plan. Let me create a basic plan based on your responses.', 'bot', true);
                this.generateFallbackPlan();
            } finally {
                this.showLoading(false);
            }
        }
    }
    
    validateResponse(step, response) {
        const validators = {
            food_style: (r) => ['traditional', 'modern', 'both', 'both traditional and modern'].some(v => r.toLowerCase().includes(v)),
            food_preference: (r) => ['vegetarian', 'non-vegetarian', 'combination', 'both'].some(v => r.toLowerCase().includes(v)),
            season_preference: (r) => ['current', 'all', 'special', 'season'].some(v => r.toLowerCase().includes(v)),
            gender: (r) => ['male', 'female'].some(v => r.toLowerCase().includes(v)),
            age: (r) => /^\d+$/.test(r) && parseInt(r) >= 1 && parseInt(r) <= 120,
            weight: (r) => /^\d+(\.\d+)?$/.test(r) && parseFloat(r) >= 20 && parseFloat(r) <= 300,
            height: (r) => /^\d+(\.\d+)?$/.test(r) && parseFloat(r) >= 100 && parseFloat(r) <= 250,
            region: (r) => ['south', 'north', 'east', 'west'].some(v => r.toLowerCase().includes(v)),
            goal: (r) => ['weight loss', 'weight gain', 'maintain', 'muscle', 'health'].some(v => r.toLowerCase().includes(v)),
            health_conditions: (r) => r.toLowerCase().includes('none') || /^\d+(,\d+)*$/.test(r.replace(/\s/g, '')),
            cost_preference: (r) => ['low', 'medium', 'high'].some(v => r.toLowerCase().includes(v)),
            timeline: (r) => ['short', 'mid', 'long'].some(v => r.toLowerCase().includes(v))
        };
        
        return validators[step] ? validators[step](response) : true;
    }
    
    getNextStep(currentStep) {
        const stepOrder = [
            'food_style', 'food_preference', 'season_preference', 'gender', 
            'age', 'weight', 'height', 'region', 'goal', 
            'health_conditions', 'cost_preference', 'timeline'
        ];
        
        const currentIndex = stepOrder.indexOf(currentStep);
        return currentIndex >= 0 && currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
    }
    
    async generateNutritionPlan() {
        // Try to call the backend first
        try {
            const response = await fetch(`${this.apiUrl}/generate_plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    responses: this.userResponses,
                    current_season: this.currentSeason,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    return data.data;
                }
            }
        } catch (error) {
            console.log('Backend not available, generating local plan');
        }
        
        // Generate local fallback plan
        return this.generateLocalPlan();
    }
    
    generateLocalPlan() {
        const age = parseInt(this.userResponses.age) || 25;
        const weight = parseFloat(this.userResponses.weight) || 65;
        const height = parseFloat(this.userResponses.height) || 170;
        const gender = this.userResponses.gender?.toLowerCase() || 'male';
        
        // Calculate BMR and BMI
        const bmr = gender === 'male' 
            ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        
        const bmi = weight / ((height / 100) ** 2);
        const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        
        // Calculate daily calories based on goal
        let dailyCalories = Math.round(bmr * 1.4); // Moderate activity
        const goal = this.userResponses.goal?.toLowerCase() || '';
        
        if (goal.includes('loss')) {
            dailyCalories = Math.round(dailyCalories * 0.8);
        } else if (goal.includes('gain')) {
            dailyCalories = Math.round(dailyCalories * 1.2);
        }
        
        // Calculate macronutrients
        const protein = Math.round(weight * (goal.includes('muscle') ? 2.2 : 1.2));
        const fat = Math.round(dailyCalories * 0.3 / 9);
        const carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4);
        
        return {
            user_profile: {
                ...this.userResponses,
                age,
                weight,
                height,
                gender
            },
            nutrition_summary: {
                bmi: bmi.toFixed(1),
                bmi_category: bmiCategory,
                bmr: Math.round(bmr),
                daily_calories: dailyCalories,
                macronutrients: {
                    protein,
                    carbs,
                    fat
                }
            },
            weekly_plan: this.generateWeeklyPlan(dailyCalories, protein, carbs, fat),
            recommendations: this.generateRecommendations(),
            complete_nutrition: this.generateCompleteNutrition()
        };
    }
    
    generateWeeklyPlan(dailyCalories, protein, carbs, fat) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeklyPlan = {};
        
        // Sample meal distribution
        const mealCalories = {
            breakfast: Math.round(dailyCalories * 0.25),
            lunch: Math.round(dailyCalories * 0.35),
            snacks: Math.round(dailyCalories * 0.15),
            dinner: Math.round(dailyCalories * 0.25)
        };
        
        const regionCuisine = this.userResponses.region?.toLowerCase() || 'south indian';
        const isVeg = this.userResponses.food_preference?.toLowerCase().includes('vegetarian');
        
        days.forEach(day => {
            weeklyPlan[day] = {
                breakfast: this.generateMeal('breakfast', mealCalories.breakfast, regionCuisine, isVeg),
                lunch: this.generateMeal('lunch', mealCalories.lunch, regionCuisine, isVeg),
                snacks: this.generateMeal('snacks', mealCalories.snacks, regionCuisine, isVeg),
                dinner: this.generateMeal('dinner', mealCalories.dinner, regionCuisine, isVeg),
                totals: {
                    calories: dailyCalories,
                    protein,
                    carbs,
                    fat
                },
                seasonal_highlight: this.getSeasonalHighlight()
            };
        });
        
        return weeklyPlan;
    }
    
    generateMeal(mealType, calories, region, isVeg) {
        const mealOptions = {
            breakfast: {
                'south indian': isVeg ? ['Idli with Sambar', 'Dosa with Chutney', 'Upma with Vegetables', 'Poha with Peanuts'] 
                                    : ['Idli with Sambar', 'Dosa with Chutney', 'Upma with Egg', 'Omelette with Bread'],
                'north indian': isVeg ? ['Paratha with Curd', 'Poha with Tea', 'Upma with Pickle', 'Bread with Jam']
                                     : ['Paratha with Curd', 'Bread with Omelette', 'Aloo Paratha', 'Poached Eggs'],
                'east indian': isVeg ? ['Rice with Dal', 'Luchi with Aloo Curry', 'Poha with Jaggery']
                                    : ['Fish Curry with Rice', 'Luchi with Fish', 'Egg Curry with Rice'],
                'west indian': isVeg ? ['Dhokla with Chutney', 'Poha with Coconut', 'Thepla with Yogurt']
                                    : ['Dhokla with Chutney', 'Eggs with Bread', 'Fish Koliwada']
            },
            lunch: {
                'south indian': isVeg ? ['Rice with Dal and Vegetables', 'Sambar Rice with Papad', 'Lemon Rice with Pickle']
                                     : ['Rice with Fish Curry', 'Chicken Curry with Rice', 'Mutton Curry with Rice'],
                'north indian': isVeg ? ['Dal Chawal with Sabzi', 'Rajma Rice', 'Chole with Rice']
                                     : ['Chicken Curry with Roti', 'Mutton Curry with Rice', 'Fish Curry with Bread'],
                'east indian': isVeg ? ['Dal Bhaat with Vegetables', 'Mixed Vegetables with Rice']
                                    : ['Fish Curry with Rice', 'Chicken Curry with Rice', 'Mutton Curry'],
                'west indian': isVeg ? ['Dal Rice with Vegetables', 'Khichdi with Ghee', 'Sabzi with Roti']
                                    : ['Fish Curry with Rice', 'Chicken with Roti', 'Mutton Curry']
            },
            snacks: {
                'south indian': ['Coconut Water', 'Banana', 'Buttermilk', 'Mixed Nuts'],
                'north indian': ['Lassi', 'Seasonal Fruits', 'Roasted Chana', 'Green Tea'],
                'east indian': ['Sweet Yogurt', 'Seasonal Fruits', 'Puffed Rice', 'Coconut Water'],
                'west indian': ['Buttermilk', 'Seasonal Fruits', 'Dhokla', 'Green Tea']
            },
            dinner: {
                'south indian': isVeg ? ['Rice with Rasam', 'Chapati with Dal', 'Vegetable Curry with Rice']
                                     : ['Rice with Sambar', 'Fish Curry with Rice', 'Chicken Curry'],
                'north indian': isVeg ? ['Roti with Dal', 'Rice with Vegetables', 'Khichdi with Ghee']
                                     : ['Roti with Chicken', 'Rice with Fish Curry', 'Mutton with Bread'],
                'east indian': isVeg ? ['Rice with Dal', 'Mixed Vegetables', 'Khichdi']
                                    : ['Fish with Rice', 'Chicken Curry', 'Rice with Fish Curry'],
                'west indian': isVeg ? ['Roti with Sabzi', 'Rice with Dal', 'Khichdi with Vegetables']
                                    : ['Fish Curry', 'Chicken with Roti', 'Mutton Curry']
            }
        };
        
        const options = mealOptions[mealType]?.[region] || mealOptions[mealType]['south indian'];
        const randomMeal = options[Math.floor(Math.random() * options.length)];
        
        return {
            name: randomMeal,
            calories,
            protein: Math.round(calories * 0.2 / 4),
            carbs: Math.round(calories * 0.5 / 4),
            fat: Math.round(calories * 0.3 / 9),
            portion_size: this.getPortionSize(mealType),
            preparation_time: this.getPreparationTime(mealType),
            food_style: this.userResponses.food_style || 'traditional',
            seasonal_benefit: this.getSeasonalBenefit(),
            health_benefits: this.getHealthBenefits(randomMeal),
            preparation_method: this.getPreparationMethod(randomMeal),
            cost: this.userResponses.cost_preference || 'medium'
        };
    }
    
    getPortionSize(mealType) {
        const portions = {
            breakfast: '1 serving (2-3 pieces)',
            lunch: '1 full plate',
            snacks: '1 glass/1 piece',
            dinner: '1 medium plate'
        };
        return portions[mealType] || '1 serving';
    }
    
    getPreparationTime(mealType) {
        const times = {
            breakfast: '15-20 minutes',
            lunch: '25-30 minutes', 
            snacks: '5-10 minutes',
            dinner: '20-25 minutes'
        };
        return times[mealType] || '15-20 minutes';
    }
    
    getSeasonalHighlight() {
        const highlights = {
            spring: 'Fresh leafy greens available',
            summer: 'Cooling foods recommended',
            monsoon: 'Immunity boosting spices',
            winter: 'Warming foods included'
        };
        return highlights[this.currentSeason];
    }
    
    getSeasonalBenefit() {
        const benefits = {
            spring: 'Rich in detox nutrients',
            summer: 'High water content for hydration',
            monsoon: 'Immunity boosting properties',
            winter: 'Warming and nourishing'
        };
        return benefits[this.currentSeason];
    }
    
    getHealthBenefits(mealName) {
        const benefits = {
            'Idli with Sambar': 'Fermented food aids digestion, provides complete proteins',
            'Dosa with Chutney': 'Probiotic benefits, balanced carbs and proteins',
            'Rice with Dal': 'Complete protein combination, easy digestion',
            'Chapati with Dal': 'High fiber, sustained energy release',
            'Fish Curry': 'Rich in omega-3 fatty acids, high quality protein',
            'Chicken Curry': 'Lean protein, iron and B vitamins'
        };
        
        // Find closest match
        for (const [meal, benefit] of Object.entries(benefits)) {
            if (mealName.toLowerCase().includes(meal.toLowerCase().split(' ')[0])) {
                return benefit;
            }
        }
        return 'Balanced nutrition with essential nutrients';
    }
    
    getPreparationMethod(mealName) {
        const methods = {
            'Idli': '1. Soak rice and dal separately\n2. Grind to smooth batter\n3. Ferment overnight\n4. Steam in idli maker for 15 minutes',
            'Dosa': '1. Prepare fermented batter\n2. Heat non-stick pan\n3. Pour batter and spread thin\n4. Cook until golden and crispy',
            'Rice with Dal': '1. Cook rice and dal separately\n2. Prepare tempering with spices\n3. Mix dal with tempering\n4. Serve hot with rice',
            'Chapati': '1. Make dough with wheat flour\n2. Rest for 20 minutes\n3. Roll into circles\n4. Cook on hot tawa until spotted'
        };
        
        // Find closest match
        for (const [meal, method] of Object.entries(methods)) {
            if (mealName.toLowerCase().includes(meal.toLowerCase())) {
                return method;
            }
        }
        return '1. Prepare ingredients\n2. Cook as per traditional method\n3. Serve fresh and hot';
    }
    
    generateRecommendations() {
        const recommendations = [
            'Drink 8-10 glasses of water daily for optimal hydration',
            'Include seasonal fruits and vegetables for maximum nutrition',
            'Practice portion control and eat mindfully',
            'Take a 10-minute walk after meals to aid digestion',
            'Include traditional fermented foods for gut health',
            'Avoid processed foods and cook fresh meals when possible',
            'Get adequate sleep (7-8 hours) for better metabolism',
            'Practice yoga or light exercise regularly'
        ];
        
        // Add personalized recommendations based on user responses
        if (this.userResponses.goal?.includes('weight loss')) {
            recommendations.push('Focus on protein-rich foods to maintain muscle mass');
            recommendations.push('Include more fiber-rich vegetables to stay full longer');
        }
        
        if (this.userResponses.goal?.includes('weight gain')) {
            recommendations.push('Include healthy fats like nuts and ghee');
            recommendations.push('Eat frequent small meals throughout the day');
        }
        
        if (this.userResponses.health_conditions?.includes('1')) {
            recommendations.push('Monitor portion sizes and avoid refined sugars');
            recommendations.push('Include complex carbs and high-fiber foods');
        }
        
        return recommendations.slice(0, 8); // Return top 8 recommendations
    }
    
    generateCompleteNutrition() {
        return {
            vitamin_a: '900µg',
            vitamin_b1: '1.2mg',
            vitamin_b2: '1.3mg',
            vitamin_b3: '16mg',
            vitamin_b6: '1.7mg',
            vitamin_b12: '2.4µg',
            vitamin_c: '90mg',
            vitamin_d: '20µg',
            vitamin_e: '15mg',
            vitamin_k: '120µg',
            folate: '400µg',
            iron: '18mg',
            calcium: '1000mg',
            magnesium: '400mg',
            zinc: '11mg',
            potassium: '4700mg',
            phosphorus: '700mg',
            selenium: '55µg',
            manganese: '2.3mg',
            copper: '900µg',
            iodine: '150µg',
            fiber: '25-30g'
        };
    }
    
    handlePlanGeneration(planData) {
        this.lastPlanData = planData;
        this.currentStep = 'completed';
        
        this.addMessage('🎉 **Your Complete Personalized Nutrition Plan is Ready!**', 'bot');
        this.addMessage(`Based on your preferences, I've created a comprehensive plan with:
        
✅ **Complete 7-day meal plan** with ${planData.nutrition_summary.daily_calories} daily calories
✅ **Detailed nutrition analysis** - Protein: ${planData.nutrition_summary.macronutrients.protein}g, Carbs: ${planData.nutrition_summary.macronutrients.carbs}g, Fat: ${planData.nutrition_summary.macronutrients.fat}g
✅ **Traditional + Modern food combinations** from ${this.userResponses.region} cuisine
✅ **Seasonal recommendations** for ${this.currentSeason}
✅ **Complete recipes** and preparation methods
✅ **Grocery shopping lists** with budget considerations
✅ **Food storage guidelines** for maximum nutrition
✅ **Personalized health recommendations** for your goals`, 'bot');
        
        this.addCompletePlanButton(planData);
        this.setInputState(true, 'Your plan is ready! Ask questions or create a new plan...');
        this.showNotification('Your complete nutrition plan is ready! 🎉', 'success', 5000);
    }
    
    generateFallbackPlan() {
        const fallbackData = this.generateLocalPlan();
        this.handlePlanGeneration(fallbackData);
    }
    
    getStepPlaceholder(step) {
        const placeholders = {
            'food_style': 'Choose: traditional, modern, or both...',
            'food_preference': 'Type: vegetarian, non-vegetarian, or combination...',
            'season_preference': 'Prefer current season foods or all season foods?...',
            'gender': 'Enter your gender (male/female)...',
            'age': 'Enter your age in years...',
            'weight': 'Enter your current weight in kg...',
            'height': 'Enter your height in cm...',
            'region': 'Choose your preferred cuisine region...',
            'goal': 'What\'s your health goal?...',
            'health_conditions': 'Enter condition numbers or "none"...',
            'cost_preference': 'Choose your budget preference...',
            'timeline': 'What\'s your preferred timeline?...'
        };
        return placeholders[step] || 'Type your response...';
    }
    
    addEnhancedQuickActions(step) {
        const lastMessage = this.chatMessages.lastElementChild;
        if (!lastMessage) return;
        
        const contentDiv = lastMessage.querySelector('.message-content');
        if (!contentDiv) return;
        
        // Remove existing quick actions
        const existingActions = contentDiv.querySelector('.quick-actions');
        if (existingActions) existingActions.remove();
        
        let quickActions = [];
        
        switch (step) {
            case 'food_style':
                quickActions = [
                    { text: '🏺 Traditional', value: 'traditional', desc: 'Classic regional foods' },
                    { text: '🔬 Modern', value: 'modern', desc: 'Contemporary nutrition' },
                    { text: '⚖️ Both', value: 'both traditional and modern', desc: 'Best of both worlds' }
                ];
                break;
            case 'food_preference':
                quickActions = [
                    { text: '🌱 Vegetarian', value: 'vegetarian', desc: 'Plant-based foods' },
                    { text: '🍖 Non-Vegetarian', value: 'non-vegetarian', desc: 'Includes meat & fish' },
                    { text: '🍽️ Combination', value: 'combination of both', desc: 'Flexible diet' }
                ];
                break;
            case 'season_preference':
                quickActions = [
                    { text: `🌺 Current Season (${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)})`, value: 'current season foods', desc: 'Seasonal recommendations' },
                    { text: '🌍 All Seasons', value: 'all season foods', desc: 'Year-round options' },
                    { text: `✨ ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)} Special`, value: `${this.currentSeason} special foods`, desc: 'Season-specific benefits' }
                ];
                break;
            case 'gender':
                quickActions = [
                    { text: '👨 Male', value: 'male' },
                    { text: '👩 Female', value: 'female' }
                ];
                break;
            case 'region':
                quickActions = [
                    { text: '🌶️ South Indian', value: 'south indian', desc: 'Rice, millets, coconut' },
                    { text: '🫓 North Indian', value: 'north indian', desc: 'Wheat, dairy, spices' },
                    { text: '🐟 East Indian', value: 'east indian', desc: 'Fish, rice, sweets' },
                    { text: '🥭 West Indian', value: 'west indian', desc: 'Varied coastal cuisine' }
                ];
                break;
            case 'goal':
                quickActions = [
                    { text: '📉 Weight Loss', value: 'weight loss', desc: 'Calorie deficit plan' },
                    { text: '📈 Weight Gain', value: 'weight gain', desc: 'Healthy weight increase' },
                    { text: '⚖️ Maintain Weight', value: 'maintain weight', desc: 'Balanced nutrition' },
                    { text: '💪 Muscle Gain', value: 'muscle gain', desc: 'Protein-rich foods' },
                    { text: '🌟 General Health', value: 'general health', desc: 'Overall wellness' }
                ];
                break;
            case 'health_conditions':
                quickActions = [
                    { text: '🩺 Diabetes + BP (1,2)', value: '1,2', desc: 'Common conditions' },
                    { text: '💊 Digestive (3,4)', value: '3,4', desc: 'Stomach, Kidney issues' },
                    { text: '🥜 Allergies (7,8)', value: '7,8', desc: 'Food allergies, PCOD' },
                    { text: '✅ None', value: 'none', desc: 'No health conditions' }
                ];
                break;
            case 'cost_preference':
                quickActions = [
                    { text: '💰 Low Cost', value: 'low cost', desc: 'Budget-friendly options' },
                    { text: '💳 Medium Cost', value: 'medium cost', desc: 'Balanced pricing' },
                    { text: '💎 High Cost', value: 'high cost', desc: 'Premium ingredients' }
                ];
                break;
            case 'timeline':
                quickActions = [
                    { text: '⚡ Short-term', value: 'short-term', desc: '1-2 months' },
                    { text: '🎯 Mid-term', value: 'mid-term', desc: '3-6 months' },
                    { text: '🏃 Long-term', value: 'long-term', desc: '6+ months' }
                ];
                break;
        }
        
        if (quickActions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quick-actions enhanced';
            
            quickActions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'quick-btn enhanced';
                btn.innerHTML = `
                    <div class="btn-content">
                        <span class="btn-text">${action.text}</span>
                        ${action.desc ? `<span class="btn-desc">${action.desc}</span>` : ''}
                    </div>
                `;
                btn.onclick = () => {
                    this.messageInput.value = action.value;
                    this.sendMessage();
                };
                actionsDiv.appendChild(btn);
            });
            
            contentDiv.appendChild(actionsDiv);
        }
    }
    
    addMessage(text, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message${isError ? ' error' : ''}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = `message-text ${isError ? 'error-message' : ''}`;
        textDiv.innerHTML = this.formatMessage(text);
        
        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addCompletePlanButton(data) {
        const lastMessage = this.chatMessages.lastElementChild;
        if (!lastMessage) return;
        
        const contentDiv = lastMessage.querySelector('.message-content');
        if (!contentDiv) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions plan-actions';
        
        const buttons = [
            {
                text: '<i class="fas fa-eye"></i> View Complete Plan',
                class: 'primary',
                action: () => this.showCompleteDietPlan(data)
            },
            {
                text: '<i class="fas fa-download"></i> Download PDF',
                class: 'secondary',
                action: () => this.downloadCompletePlan(data)
            },
            {
                text: '<i class="fas fa-share-alt"></i> Share Plan',
                class: 'secondary',
                action: () => this.sharePlan(data)
            },
            {
                text: '<i class="fas fa-refresh"></i> New Plan',
                class: 'secondary',
                action: () => this.resetChat()
            }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `quick-btn ${btn.class}`;
            button.innerHTML = btn.text;
            button.onclick = btn.action;
            actionsDiv.appendChild(button);
        });
        
        contentDiv.appendChild(actionsDiv);
        this.lastPlanData = data;
    }
    
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');
    }
    
    setInputState(enabled, placeholder) {
        this.messageInput.disabled = !enabled;
        this.sendBtn.disabled = !enabled;
        if (this.voiceBtn) this.voiceBtn.disabled = !enabled;
        if (this.inputStatus) this.inputStatus.textContent = placeholder;
        
        if (enabled) {
            this.messageInput.focus();
        }
    }
    
    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
        if (show) {
            this.startLoadingMessages();
        } else {
            this.stopLoadingMessages();
        }
    }
    
    startLoadingMessages() {
        const messages = [
            'Analyzing your complete nutrition needs...',
            'Finding perfect seasonal foods for you...',
            'Calculating all vitamins and minerals...',
            'Matching traditional and modern options...',
            'Preparing detailed recipes and methods...',
            'Creating comprehensive grocery lists...',
            'Generating storage guidelines...',
            'Finalizing your personalized plan...'
        ];
        
        let index = 0;
        this.loadingInterval = setInterval(() => {
            this.updateLoadingMessage(messages[index % messages.length]);
            index++;
        }, 2000);
    }
    
    stopLoadingMessages() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }
    
    updateLoadingMessage(message) {
        if (this.loadingSubtitle) {
            this.loadingSubtitle.textContent = message;
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    async resetChat() {
        try {
            // Clear chat messages except welcome message
            const messages = this.chatMessages.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
            
            // Reset state
            this.currentStep = 'greeting';
            this.userResponses = {};
            this.lastPlanData = null;
            this.closeDietPlan();
            this.hideInputSuggestions();
            
            // Reinitialize greeting
            this.initializeGreeting();
            
            this.showNotification('Chat reset successfully! Ready for a new plan.', 'success');
            
        } catch (error) {
            console.error('Error resetting chat:', error);
            this.showNotification('Error resetting chat. Please refresh the page.', 'error');
        }
    }
    
    showCompleteDietPlan(data) {
        if (!data) data = this.lastPlanData;
        if (!data) return;
        
        // Show the first tab (meal plan) by default
        this.showTab('meal-plan');
        
        // Populate all tab contents
        this.populateAllTabs(data);
        
        this.dietPlanModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    populateAllTabs(data) {
        // Meal Plan Tab
        const mealPlanTab = document.getElementById('meal-plan-tab');
        if (mealPlanTab) mealPlanTab.innerHTML = this.generateMealPlanHTML(data);
        
        // Nutrition Analysis Tab
        const nutritionTab = document.getElementById('nutrition-analysis-tab');
        if (nutritionTab) nutritionTab.innerHTML = this.generateCompleteNutritionHTML(data);
        
        // Recipes Tab
        const recipesTab = document.getElementById('recipes-tab');
        if (recipesTab) recipesTab.innerHTML = this.generateRecipesHTML(data);
        
        // Grocery List Tab
        const groceryTab = document.getElementById('grocery-list-tab');
        if (groceryTab) groceryTab.innerHTML = this.generateGroceryListHTML(data);
        
        // Storage Guide Tab
        const storageTab = document.getElementById('storage-guide-tab');
        if (storageTab) storageTab.innerHTML = this.generateStorageGuideHTML(data);
    }
    
    generateMealPlanHTML(data) {
        const { nutrition_summary, weekly_plan, user_profile } = data;
        
        let html = `
            <div class="plan-header">
                <h3><i class="fas fa-user-circle"></i> Your Profile & Goals</h3>
                <div class="profile-summary">
                    <div class="profile-grid">
        `;
        
        const profileFields = [
            { label: 'Age', value: `${user_profile.age} years` },
            { label: 'Weight', value: `${user_profile.weight} kg` },
            { label: 'Height', value: `${user_profile.height} cm` },
            { label: 'Gender', value: user_profile.gender.charAt(0).toUpperCase() + user_profile.gender.slice(1) },
            { label: 'Food Style', value: user_profile.food_style ? user_profile.food_style.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Mixed' },
            { label: 'Diet Type', value: user_profile.food_preference.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            { label: 'Cuisine', value: user_profile.region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            { label: 'Goal', value: user_profile.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            { label: 'Season Preference', value: user_profile.season_preference ? user_profile.season_preference.replace('_', ' ') : `Current (${this.currentSeason})` },
            { label: 'Budget', value: user_profile.cost_preference ? user_profile.cost_preference.charAt(0).toUpperCase() + user_profile.cost_preference.slice(1) + ' Cost' : 'Medium Cost' }
        ];
        
        if (user_profile.health_conditions && user_profile.health_conditions !== 'none') {
            profileFields.push({
                label: 'Health Considerations',
                value: 'Personalized for your health needs'
            });
        }
        
        profileFields.forEach(field => {
            html += `
                <div class="profile-item">
                    <span class="profile-label">${field.label}:</span>
                    <span class="profile-value">${field.value}</span>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
            
            <div class="nutrition-overview">
                <h3><i class="fas fa-chart-pie"></i> Daily Nutrition Overview</h3>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.bmi}</span>
                        <span class="nutrition-label">BMI (${nutrition_summary.bmi_category})</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.daily_calories}</span>
                        <span class="nutrition-label">Daily Calories</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.macronutrients.protein}g</span>
                        <span class="nutrition-label">Protein</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.macronutrients.carbs}g</span>
                        <span class="nutrition-label">Carbs</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.macronutrients.fat}g</span>
                        <span class="nutrition-label">Fat</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-value">${nutrition_summary.bmr}</span>
                        <span class="nutrition-label">BMR</span>
                    </div>
                </div>
            </div>
            
            <div class="weekly-plan">
                <h3><i class="fas fa-calendar-week"></i> 7-Day Complete Meal Plan</h3>
        `;
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            if (weekly_plan[day]) {
                const dayPlan = weekly_plan[day];
                html += `
                    <div class="day-plan enhanced">
                        <div class="day-header">
                            <h4>${day}</h4>
                            ${dayPlan.seasonal_highlight ? `<span class="seasonal-badge">🌱 ${dayPlan.seasonal_highlight}</span>` : ''}
                        </div>
                        <div class="meals-grid">
                `;
                
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(mealType => {
                    if (dayPlan[mealType]) {
                        const meal = dayPlan[mealType];
                        html += `
                            <div class="meal-card enhanced">
                                <div class="meal-header">
                                    <div class="meal-type">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</div>
                                    ${meal.food_style ? `<span class="food-style-badge">${meal.food_style}</span>` : ''}
                                </div>
                                <div class="meal-name">${meal.name}</div>
                                
                                <div class="meal-details">
                                    <div class="meal-nutrition">
                                        <span><i class="fas fa-fire"></i> ${meal.calories} kcal</span>
                                        <span><i class="fas fa-dumbbell"></i> P: ${meal.protein}g</span>
                                        <span><i class="fas fa-bread-slice"></i> C: ${meal.carbs}g</span>
                                        <span><i class="fas fa-oil-can"></i> F: ${meal.fat}g</span>
                                    </div>
                                    
                                    ${meal.portion_size ? `<div class="meal-portion"><i class="fas fa-balance-scale"></i> Portion: ${meal.portion_size}</div>` : ''}
                                    ${meal.preparation_time ? `<div class="meal-time"><i class="fas fa-clock"></i> Prep: ${meal.preparation_time}</div>` : ''}
                                    ${meal.cost ? `<div class="meal-cost">${meal.cost.charAt(0).toUpperCase() + meal.cost.slice(1)} cost</div>` : ''}
                                    ${meal.seasonal_benefit ? `<div class="seasonal-benefit"><i class="fas fa-leaf"></i> ${meal.seasonal_benefit}</div>` : ''}
                                </div>
                            </div>
                        `;
                    }
                });
                
                if (dayPlan.totals) {
                    html += `
                        </div>
                        <div class="day-totals enhanced">
                            <strong>Daily Total: ${dayPlan.totals.calories} kcal | 
                            Protein: ${dayPlan.totals.protein}g | 
                            Carbs: ${dayPlan.totals.carbs}g | 
                            Fat: ${dayPlan.totals.fat}g</strong>
                        </div>
                    </div>
                    `;
                } else {
                    html += '</div></div>';
                }
            }
        });
        
        html += '</div>';
        return html;
    }
    
    generateCompleteNutritionHTML(data) {
        const { nutrition_summary, complete_nutrition } = data;
        
        let html = `
            <div class="nutrition-analysis">
                <h3><i class="fas fa-atom"></i> Complete Nutritional Analysis</h3>
                
                <div class="nutrition-section">
                    <h4><i class="fas fa-dumbbell"></i> Macronutrients</h4>
                    <div class="nutrient-grid">
                        <div class="nutrient-card">
                            <div class="nutrient-value">${nutrition_summary.macronutrients.protein}g</div>
                            <div class="nutrient-label">Protein</div>
                            <div class="nutrient-percentage">${Math.round((nutrition_summary.macronutrients.protein * 4 / nutrition_summary.daily_calories) * 100)}% of calories</div>
                        </div>
                        <div class="nutrient-card">
                            <div class="nutrient-value">${nutrition_summary.macronutrients.carbs}g</div>
                            <div class="nutrient-label">Carbohydrates</div>
                            <div class="nutrient-percentage">${Math.round((nutrition_summary.macronutrients.carbs * 4 / nutrition_summary.daily_calories) * 100)}% of calories</div>
                        </div>
                        <div class="nutrient-card">
                            <div class="nutrient-value">${nutrition_summary.macronutrients.fat}g</div>
                            <div class="nutrient-label">Fat</div>
                            <div class="nutrient-percentage">${Math.round((nutrition_summary.macronutrients.fat * 9 / nutrition_summary.daily_calories) * 100)}% of calories</div>
                        </div>
                        <div class="nutrient-card">
                            <div class="nutrient-value">${complete_nutrition?.fiber || '25-30'}g</div>
                            <div class="nutrient-label">Dietary Fiber</div>
                            <div class="nutrient-percentage">Essential for digestion</div>
                        </div>
                    </div>
                </div>
                
                <div class="nutrition-section">
                    <h4><i class="fas fa-pills"></i> Essential Vitamins</h4>
                    <div class="vitamin-grid">
        `;
        
        const vitamins = [
            { name: 'Vitamin A', value: complete_nutrition?.vitamin_a || '900µg', benefit: 'Vision & immune health' },
            { name: 'Vitamin B1', value: complete_nutrition?.vitamin_b1 || '1.2mg', benefit: 'Energy metabolism' },
            { name: 'Vitamin B2', value: complete_nutrition?.vitamin_b2 || '1.3mg', benefit: 'Cell function' },
            { name: 'Vitamin B3', value: complete_nutrition?.vitamin_b3 || '16mg', benefit: 'Brain function' },
            { name: 'Vitamin B6', value: complete_nutrition?.vitamin_b6 || '1.7mg', benefit: 'Protein metabolism' },
            { name: 'Vitamin B12', value: complete_nutrition?.vitamin_b12 || '2.4µg', benefit: 'Nerve function' },
            { name: 'Vitamin C', value: complete_nutrition?.vitamin_c || '90mg', benefit: 'Immune system' },
            { name: 'Vitamin D', value: complete_nutrition?.vitamin_d || '20µg', benefit: 'Bone health' },
            { name: 'Vitamin E', value: complete_nutrition?.vitamin_e || '15mg', benefit: 'Antioxidant' },
            { name: 'Vitamin K', value: complete_nutrition?.vitamin_k || '120µg', benefit: 'Blood clotting' },
            { name: 'Folate', value: complete_nutrition?.folate || '400µg', benefit: 'Cell division' }
        ];
        
        vitamins.forEach(vitamin => {
            html += `
                <div class="vitamin-card">
                    <div class="vitamin-name">${vitamin.name}</div>
                    <div class="vitamin-value">${vitamin.value}</div>
                    <div class="vitamin-benefit">${vitamin.benefit}</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="nutrition-section">
                    <h4><i class="fas fa-gem"></i> Essential Minerals</h4>
                    <div class="mineral-grid">
        `;
        
        const minerals = [
            { name: 'Iron', value: complete_nutrition?.iron || '18mg', benefit: 'Oxygen transport' },
            { name: 'Calcium', value: complete_nutrition?.calcium || '1000mg', benefit: 'Bone strength' },
            { name: 'Magnesium', value: complete_nutrition?.magnesium || '400mg', benefit: 'Muscle function' },
            { name: 'Zinc', value: complete_nutrition?.zinc || '11mg', benefit: 'Immune support' },
            { name: 'Potassium', value: complete_nutrition?.potassium || '4700mg', benefit: 'Heart health' },
            { name: 'Phosphorus', value: complete_nutrition?.phosphorus || '700mg', benefit: 'Bone health' },
            { name: 'Selenium', value: complete_nutrition?.selenium || '55µg', benefit: 'Antioxidant' },
            { name: 'Manganese', value: complete_nutrition?.manganese || '2.3mg', benefit: 'Bone development' },
            { name: 'Copper', value: complete_nutrition?.copper || '900µg', benefit: 'Iron absorption' },
            { name: 'Iodine', value: complete_nutrition?.iodine || '150µg', benefit: 'Thyroid function' }
        ];
        
        minerals.forEach(mineral => {
            html += `
                <div class="mineral-card">
                    <div class="mineral-name">${mineral.name}</div>
                    <div class="mineral-value">${mineral.value}</div>
                    <div class="mineral-benefit">${mineral.benefit}</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="nutrition-section">
                    <h4><i class="fas fa-calendar-alt"></i> Seasonal Nutrition Benefits</h4>
                    <div class="seasonal-nutrition">
                        <div class="seasonal-benefit-card">
                            <h5>Current Season (${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)})</h5>
                            <p>${this.getSeasonalNutritionBenefits()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    getSeasonalNutritionBenefits() {
        const benefits = {
            spring: 'Rich in detoxifying chlorophyll from fresh greens, vitamin C from citrus fruits, and antioxidants for liver cleansing.',
            summer: 'High water content foods for hydration, electrolytes for temperature regulation, and cooling nutrients to beat the heat.',
            monsoon: 'Immunity-boosting vitamin C and antioxidants, warming spices for digestion, and anti-inflammatory compounds.',
            winter: 'Warming foods rich in healthy fats, vitamin D sources, and metabolism-boosting nutrients for cold weather.'
        };
        return benefits[this.currentSeason] || benefits.winter;
    }
    
    generateRecipesHTML(data) {
        let html = `
            <div class="recipes-section">
                <h3><i class="fas fa-book"></i> Preparation Methods & Recipes</h3>
        `;
        
        const { weekly_plan } = data;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            if (weekly_plan[day]) {
                const dayPlan = weekly_plan[day];
                html += `
                    <div class="day-recipes">
                        <h4><i class="fas fa-calendar-day"></i> ${day} Recipes</h4>
                `;
                
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(mealType => {
                    if (dayPlan[mealType]) {
                        const meal = dayPlan[mealType];
                        html += `
                            <div class="recipe-card">
                                <div class="recipe-header">
                                    <h5>${meal.name}</h5>
                                    <span class="meal-type-badge">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                                </div>
                                
                                ${meal.preparation_method || meal.recipe ? `
                                    <div class="recipe-section">
                                        <h6><i class="fas fa-utensils"></i> Preparation Method:</h6>
                                        <div class="preparation-steps">
                                            ${(meal.preparation_method || meal.recipe).split('\n').map((step, index) => 
                                                step.trim() ? `<div class="step"><span class="step-number">${index + 1}</span>${step.trim()}</div>` : ''
                                            ).join('')}
                                        </div>
                                    </div>
                                ` : `
                                    <div class="recipe-section">
                                        <h6><i class="fas fa-utensils"></i> Quick Preparation:</h6>
                                        <div class="preparation-steps">
                                            <div class="step"><span class="step-number">1</span>Prepare ingredients as per portion size</div>
                                            <div class="step"><span class="step-number">2</span>Cook using traditional ${data.user_profile.region.replace('_', ' ')} style</div>
                                            <div class="step"><span class="step-number">3</span>Serve fresh and enjoy the nutritional benefits</div>
                                        </div>
                                    </div>
                                `}
                                
                                <div class="recipe-info">
                                    ${meal.preparation_time ? `<span><i class="fas fa-clock"></i> ${meal.preparation_time}</span>` : ''}
                                    ${meal.portion_size ? `<span><i class="fas fa-users"></i> ${meal.portion_size}</span>` : ''}
                                    ${meal.cost ? `<span><i class="fas fa-tag"></i> ${meal.cost.charAt(0).toUpperCase() + meal.cost.slice(1)} cost</span>` : ''}
                                </div>
                                
                                ${meal.health_benefits ? `
                                    <div class="health-benefits">
                                        <h6><i class="fas fa-heart"></i> Health Benefits:</h6>
                                        <p>${meal.health_benefits}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }
                });
                
                html += '</div>';
            }
        });
        
        html += '</div>';
        return html;
    }
    
    generateGroceryListHTML(data) {
        let html = `
            <div class="grocery-section">
                <h3><i class="fas fa-shopping-cart"></i> Complete Grocery List</h3>
                
                <div class="grocery-summary">
                    <div class="summary-cards">
                        <div class="summary-card">
                            <div class="summary-value">7</div>
                            <div class="summary-label">Days Covered</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">${data.user_profile.cost_preference || 'Medium'}</div>
                            <div class="summary-label">Budget Level</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)}</div>
                            <div class="summary-label">Season Focus</div>
                        </div>
                    </div>
                </div>
        `;
        
        const groceryCategories = this.generateGroceryCategories(data);
        
        Object.entries(groceryCategories).forEach(([category, items]) => {
            html += `
                <div class="grocery-category">
                    <h4><i class="${this.getCategoryIcon(category)}"></i> ${category}</h4>
                    <div class="grocery-items">
            `;
            
            items.forEach(item => {
                html += `
                    <div class="grocery-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">${item.quantity}</span>
                        </div>
                        <div class="item-details">
                            ${item.cost ? `<span class="item-cost">${item.cost}</span>` : ''}
                            ${item.seasonal ? `<span class="seasonal-tag">Seasonal</span>` : ''}
                            ${item.traditional ? `<span class="traditional-tag">Traditional</span>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                <div class="grocery-tips">
                    <h4><i class="fas fa-lightbulb"></i> Shopping Tips</h4>
                    <ul class="tips-list">
                        <li><i class="fas fa-check"></i> Buy seasonal vegetables and fruits for better nutrition and cost</li>
                        <li><i class="fas fa-check"></i> Choose whole grains and millets for better fiber content</li>
                        <li><i class="fas fa-check"></i> Buy fresh ingredients twice a week for optimal nutrition</li>
                        <li><i class="fas fa-check"></i> Store perishables properly to maintain nutritional value</li>
                        <li><i class="fas fa-check"></i> Check for organic options within your budget preference</li>
                    </ul>
                </div>
            </div>
        `;
        
        return html;
    }
    
    generateGroceryCategories(data) {
        const { user_profile } = data;
        const categories = {
            'Grains & Cereals': [],
            'Vegetables': [],
            'Fruits': [],
            'Proteins': [],
            'Dairy & Alternatives': [],
            'Spices & Condiments': [],
            'Others': []
        };
        
        categories['Grains & Cereals'] = [
            { name: 'Rice (Basmati/Brown)', quantity: '2 kg', cost: user_profile.cost_preference, seasonal: false, traditional: true },
            { name: 'Wheat Flour', quantity: '1 kg', cost: user_profile.cost_preference, traditional: true },
            { name: 'Ragi Flour', quantity: '500g', traditional: true, seasonal: this.currentSeason === 'winter' },
            { name: 'Oats', quantity: '500g', cost: user_profile.cost_preference },
            { name: 'Quinoa', quantity: '250g', cost: 'high' }
        ];
        
        categories['Vegetables'] = [
            { name: 'Spinach', quantity: '1 bunch', seasonal: this.currentSeason === 'winter', traditional: true },
            { name: 'Tomatoes', quantity: '1 kg', cost: user_profile.cost_preference },
            { name: 'Onions', quantity: '1 kg', cost: user_profile.cost_preference, traditional: true },
            { name: 'Carrots', quantity: '500g', seasonal: this.currentSeason === 'winter' },
            { name: 'Bottle Gourd', quantity: '1 piece', seasonal: this.currentSeason === 'summer', traditional: true },
            { name: 'Okra', quantity: '250g', seasonal: this.currentSeason === 'monsoon', traditional: true }
        ];
        
        categories['Fruits'] = [
            { name: 'Bananas', quantity: '1 dozen', cost: user_profile.cost_preference },
            { name: 'Apples', quantity: '1 kg', seasonal: this.currentSeason === 'winter' },
            { name: 'Oranges', quantity: '1 kg', seasonal: this.currentSeason === 'winter' },
            { name: 'Watermelon', quantity: '1 piece', seasonal: this.currentSeason === 'summer' },
            { name: 'Mango', quantity: '1 kg', seasonal: this.currentSeason === 'summer' }
        ];
        
        if (user_profile.food_preference !== 'vegetarian') {
            categories['Proteins'].push(
                { name: 'Chicken', quantity: '1 kg', cost: user_profile.cost_preference },
                { name: 'Fish', quantity: '500g', cost: user_profile.cost_preference },
                { name: 'Eggs', quantity: '1 dozen', cost: user_profile.cost_preference }
            );
        }
        
        categories['Proteins'].push(
            { name: 'Lentils (Dal)', quantity: '1 kg', traditional: true },
            { name: 'Chickpeas', quantity: '500g', traditional: true },
            { name: 'Paneer', quantity: '200g', cost: user_profile.cost_preference }
        );
        
        categories['Dairy & Alternatives'] = [
            { name: 'Milk', quantity: '1 liter/day', cost: user_profile.cost_preference },
            { name: 'Yogurt', quantity: '500g', traditional: true },
            { name: 'Ghee', quantity: '200ml', traditional: true }
        ];
        
        categories['Spices & Condiments'] = [
            { name: 'Turmeric Powder', quantity: '100g', traditional: true },
            { name: 'Cumin Seeds', quantity: '50g', traditional: true },
            { name: 'Coriander Powder', quantity: '100g', traditional: true },
            { name: 'Ginger-Garlic Paste', quantity: '200g', traditional: true },
            { name: 'Coconut Oil', quantity: '500ml', traditional: user_profile.region === 'south_indian' }
        ];
        
        return categories;
    }
    
    getCategoryIcon(category) {
        const icons = {
            'Grains & Cereals': 'fas fa-seedling',
            'Vegetables': 'fas fa-carrot',
            'Fruits': 'fas fa-apple-alt',
            'Proteins': 'fas fa-drumstick-bite',
            'Dairy & Alternatives': 'fas fa-cheese',
            'Spices & Condiments': 'fas fa-pepper-hot',
            'Others': 'fas fa-shopping-basket'
        };
        return icons[category] || 'fas fa-shopping-basket';
    }
    
    generateStorageGuideHTML(data) {
        let html = `
            <div class="storage-section">
                <h3><i class="fas fa-archive"></i> Food Storage Guidelines</h3>
                
                <div class="storage-intro">
                    <p><i class="fas fa-info-circle"></i> Proper storage maintains nutritional value and prevents food waste. Follow these guidelines for optimal freshness.</p>
                </div>
                
                <div class="storage-categories">
        `;
        
        const storageCategories = [
            {
                title: 'Grains & Cereals',
                icon: 'fas fa-seedling',
                items: [
                    {
                        name: 'Rice & Wheat',
                        storage: 'Store in airtight containers in cool, dry place',
                        duration: '6-12 months',
                        tips: ['Keep bay leaves to prevent insects', 'Check for moisture regularly'],
                        temperature: 'Room temperature'
                    },
                    {
                        name: 'Millets (Ragi, Jowar)',
                        storage: 'Airtight containers away from sunlight',
                        duration: '8-10 months',
                        tips: ['Excellent for traditional storage', 'Natural pest resistance'],
                        temperature: 'Cool & dry'
                    }
                ]
            },
            {
                title: 'Fresh Vegetables',
                icon: 'fas fa-carrot',
                items: [
                    {
                        name: 'Leafy Greens (Spinach, Methi)',
                        storage: 'Refrigerate in perforated bags',
                        duration: '3-5 days',
                        tips: ['Wash just before use', 'Remove damaged leaves'],
                        temperature: '2-4°C'
                    },
                    {
                        name: 'Root Vegetables (Carrots, Radish)',
                        storage: 'Refrigerate in crisper drawer',
                        duration: '2-3 weeks',
                        tips: ['Remove green tops', 'Store in ventilated bags'],
                        temperature: '0-2°C'
                    }
                ]
            },
            {
                title: 'Proteins & Dairy',
                icon: 'fas fa-cheese',
                items: [
                    {
                        name: 'Lentils & Legumes',
                        storage: 'Airtight containers, cool dry place',
                        duration: '1-2 years',
                        tips: ['Traditional storage in cloth bags', 'Sun-dry occasionally'],
                        temperature: 'Room temperature'
                    },
                    {
                        name: 'Fresh Dairy',
                        storage: 'Refrigerate immediately',
                        duration: 'Milk: 3-5 days, Yogurt: 1 week, Paneer: 3-4 days',
                        tips: ['Traditional earthen pot cooling', 'Cover to prevent contamination'],
                        temperature: '2-4°C'
                    }
                ]
            }
        ];
        
        storageCategories.forEach(category => {
            html += `
                <div class="storage-category">
                    <h4><i class="${category.icon}"></i> ${category.title}</h4>
                    <div class="storage-items">
            `;
            
            category.items.forEach(item => {
                html += `
                    <div class="storage-item">
                        <div class="item-header">
                            <h5>${item.name}</h5>
                            <span class="duration-badge">${item.duration}</span>
                        </div>
                        
                        <div class="storage-details">
                            <div class="storage-method">
                                <strong><i class="fas fa-box"></i> Storage Method:</strong>
                                <p>${item.storage}</p>
                            </div>
                            
                            <div class="storage-temp">
                                <strong><i class="fas fa-thermometer-half"></i> Temperature:</strong>
                                <span>${item.temperature}</span>
                            </div>
                            
                            <div class="storage-tips">
                                <strong><i class="fas fa-lightbulb"></i> Tips:</strong>
                                <ul>
                                    ${item.tips.map(tip => `<li>${tip}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="seasonal-storage">
                    <h4><i class="fas fa-calendar-alt"></i> ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)} Season Storage Tips</h4>
                    <div class="seasonal-tips">
                        ${this.getSeasonalStorageTips()}
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    getSeasonalStorageTips() {
        const tips = {
            spring: `
                <ul>
                    <li><i class="fas fa-leaf"></i> Fresh greens are abundant - consume quickly for maximum nutrition</li>
                    <li><i class="fas fa-sun"></i> Increasing temperatures require careful vegetable storage</li>
                    <li><i class="fas fa-droplet"></i> Watch for increased humidity affecting grain storage</li>
                </ul>
            `,
            summer: `
                <ul>
                    <li><i class="fas fa-thermometer-hot"></i> Use earthen pots to keep water and dairy products cool</li>
                    <li><i class="fas fa-refrigerator"></i> Refrigerate fruits and vegetables more frequently</li>
                    <li><i class="fas fa-sun"></i> Excellent season for sun-drying vegetables and making pickles</li>
                </ul>
            `,
            monsoon: `
                <ul>
                    <li><i class="fas fa-cloud-rain"></i> High humidity - ensure grains are completely dry before storage</li>
                    <li><i class="fas fa-shield-alt"></i> Use extra protection against moisture and fungal growth</li>
                    <li><i class="fas fa-pepper-hot"></i> Store warming spices like ginger and turmeric in dry containers</li>
                </ul>
            `,
            winter: `
                <ul>
                    <li><i class="fas fa-snowflake"></i> Natural refrigeration - many vegetables can be stored at room temperature</li>
                    <li><i class="fas fa-fire"></i> Excellent time to prepare and store warming spice mixes</li>
                    <li><i class="fas fa-apple-alt"></i> Citrus fruits and winter vegetables have longer natural shelf life</li>
                </ul>
            `
        };
        return tips[this.currentSeason] || tips.winter;
    }
    
    showTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.style.display = 'none');
        
        // Remove active class from all tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName + '-tab');
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to clicked button
        const activeBtn = Array.from(tabBtns).find(btn => 
            btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))
        );
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    closeDietPlan() {
        this.dietPlanModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    downloadCompletePlan(data) {
        if (!data) data = this.lastPlanData;
        if (!data) {
            this.showNotification('No plan data available to download', 'error');
            return;
        }
        
        const planText = this.generateCompletePlanText(data);
        const blob = new Blob([planText], { type: 'text/plain; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complete_nutrition_plan_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Complete nutrition plan downloaded successfully!', 'success');
    }
    
    generateCompletePlanText(data) {
        const { nutrition_summary, weekly_plan, recommendations, user_profile } = data;
        
        let text = `COMPLETE PERSONALIZED NUTRITION PLAN\n`;
        text += `========================================\n`;
        text += `Generated on: ${new Date().toLocaleDateString()}\n`;
        text += `Season: ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)}\n\n`;
        
        text += `USER PROFILE:\n`;
        text += `-------------\n`;
        Object.entries(user_profile).forEach(([key, value]) => {
            if (value && key !== 'health_conditions') {
                text += `${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}\n`;
            }
        });
        text += `\n`;
        
        text += `NUTRITION SUMMARY:\n`;
        text += `------------------\n`;
        text += `BMI: ${nutrition_summary.bmi} (${nutrition_summary.bmi_category})\n`;
        text += `Daily Calories: ${nutrition_summary.daily_calories} kcal\n`;
        text += `Protein: ${nutrition_summary.macronutrients.protein}g\n`;
        text += `Carbs: ${nutrition_summary.macronutrients.carbs}g\n`;
        text += `Fat: ${nutrition_summary.macronutrients.fat}g\n\n`;
        
        text += `7-DAY MEAL PLAN:\n`;
        text += `================\n\n`;
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            if (weekly_plan[day]) {
                text += `${day.toUpperCase()}:\n`;
                const dayPlan = weekly_plan[day];
                
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(mealType => {
                    if (dayPlan[mealType]) {
                        const meal = dayPlan[mealType];
                        text += `${mealType.toUpperCase()}: ${meal.name} (${meal.calories} kcal)\n`;
                    }
                });
                text += `\n`;
            }
        });
        
        text += `RECOMMENDATIONS:\n`;
        text += `================\n`;
        recommendations.forEach((rec, index) => {
            text += `${index + 1}. ${rec}\n`;
        });
        
        return text;
    }
    
    sharePlan(data) {
        if (navigator.share) {
            navigator.share({
                title: 'My Complete Nutrition Plan',
                text: 'Check out my AI-generated diet plan with complete nutrition analysis!',
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyPlanToClipboard(data);
            });
        } else {
            this.copyPlanToClipboard(data);
        }
    }
    
    copyPlanToClipboard(data) {
        const planSummary = `My Complete Nutrition Plan:\n- ${data.nutrition_summary.daily_calories} daily calories\n- Protein: ${data.nutrition_summary.macronutrients.protein}g\n- Traditional + Modern foods\n- Seasonal recommendations for ${this.currentSeason}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(planSummary).then(() => {
                this.showNotification('Plan summary copied to clipboard!', 'success');
            });
        } else {
            this.showNotification('Sharing not supported. Plan is ready for download!', 'info');
        }
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        const colorMap = {
            success: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
            error: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
            info: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
            warning: { bg: '#fef3c7', text: '#d97706', border: '#fed7aa' }
        };
        
        const colors = colorMap[type] || colorMap.info;
        
        notification.innerHTML = `
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors.bg};
            color: ${colors.text};
            border: 1px solid ${colors.border};
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            word-wrap: break-word;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }
}

// Global functions for HTML onclick events
function startPlanning() {
    if (window.chatbot) {
        window.chatbot.startPlanningProcess();
    }
}

function closeDietPlan() {
    if (window.chatbot) {
        window.chatbot.closeDietPlan();
    }
}

function showTab(tabName) {
    if (window.chatbot) {
        window.chatbot.showTab(tabName);
    }
}

function fillSuggestion(value) {
    if (window.chatbot && window.chatbot.messageInput) {
        window.chatbot.messageInput.value = value;
        window.chatbot.hideInputSuggestions();
        window.chatbot.messageInput.focus();
    }
}

function downloadCompletePlan() {
    if (window.chatbot) {
        window.chatbot.downloadCompletePlan();
    }
}

function showNutritionInfo() {
    const modal = document.getElementById('nutritionInfoModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeNutritionInfo() {
    const modal = document.getElementById('nutritionInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showSeasonalInfo() {
    const modal = document.getElementById('seasonalInfoModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSeasonalInfo() {
    const modal = document.getElementById('seasonalInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showHealthInfo() {
    const modal = document.getElementById('healthInfoModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeHealthInfo() {
    const modal = document.getElementById('healthInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the enhanced chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create global chatbot instance
    window.chatbot = new EnhancedDietChatbot();
    
    // Add enhanced CSS styles
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        /* Enhanced Quick Actions */
        .quick-actions.enhanced {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 15px;
        }
        
        .quick-btn.enhanced {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px solid #cbd5e1;
            padding: 12px 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }
        
        .quick-btn.enhanced:hover {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .btn-text {
            font-weight: 600;
            font-size: 14px;
        }
        
        .btn-desc {
            font-size: 12px;
            opacity: 0.7;
        }
        
        /* Start Planning Actions */
        .start-planning-actions {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        
        .start-planning-btn {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            border-radius: 15px !important;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
        }
        
        .start-planning-btn:hover {
            background: linear-gradient(135deg, #059669, #047857) !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
        }
        
        /* Enhanced Plan Actions */
        .plan-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        }
        
        .quick-btn.primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .quick-btn.primary:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .quick-btn.secondary {
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .quick-btn.secondary:hover {
            background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(71, 85, 105, 0.2);
        }
        
        /* Enhanced Meal Cards */
        .meal-card.enhanced {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #ffffff, #f9fafb);
            transition: all 0.3s ease;
            margin-bottom: 15px;
        }
        
        .meal-card.enhanced:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
            transform: translateY(-2px);
        }
        
        .meal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .meal-type {
            font-weight: 600;
            font-size: 14px;
            color: #374151;
        }
        
        .meal-name {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .food-style-badge {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .seasonal-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .seasonal-benefit {
            background: #ecfdf5;
            color: #065f46;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 12px;
            margin-top: 8px;
        }
        
        .meal-details {
            margin-top: 10px;
        }
        
        .meal-nutrition {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 8px;
        }
        
        .meal-nutrition span {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .meal-portion, .meal-time, .meal-cost {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        /* Enhanced Day Plans */
        .day-plan.enhanced {
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
            background: linear-gradient(135deg, #ffffff, #f8fafc);
        }
        
        .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .day-header h4 {
            color: #1f2937;
            margin: 0;
            font-size: 18px;
        }
        
        .meals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .day-totals.enhanced {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            margin-top: 15px;
            font-weight: 600;
        }
        
        /* Profile Grid */
        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }
        
        .profile-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
        }
        
        .profile-label {
            font-weight: 600;
            color: #374151;
        }
        
        .profile-value {
            color: #1f2937;
        }
        
        /* Nutrition Overview */
        .nutrition-overview {
            margin: 20px 0;
        }
        
        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .nutrition-item {
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .nutrition-item:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
        }
        
        .nutrition-value {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            display: block;
        }
        
        .nutrition-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
            display: block;
        }
        
        /* Nutrition Analysis Styles */
        .nutrition-analysis h3 {
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .nutrition-section {
            margin: 25px 0;
        }
        
        .nutrient-grid, .vitamin-grid, .mineral-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .nutrient-card, .vitamin-card, .mineral-card {
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .nutrient-card:hover, .vitamin-card:hover, .mineral-card:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
        }
        
        .nutrient-value, .vitamin-value, .mineral-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .nutrient-label, .vitamin-name, .mineral-name {
            font-weight: 600;
            color: #374151;
            margin: 5px 0;
        }
        
        .nutrient-percentage, .vitamin-benefit, .mineral-benefit {
            font-size: 11px;
            color: #6b7280;
        }
        
        /* Recipe Styles */
        .recipe-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ffffff, #f8fafc);
        }
        
        .recipe-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .meal-type-badge {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .recipe-section {
            margin: 15px 0;
        }
        
        .preparation-steps {
            margin-top: 10px;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .step-number {
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .recipe-info {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        
        .recipe-info span {
            background: #f3f4f6;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .health-benefits {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
        }
        
        .health-benefits h6 {
            color: #166534;
            margin: 0 0 8px 0;
        }
        
        .health-benefits p {
            color: #15803d;
            margin: 0;
            font-size: 14px;
        }
        
        /* Grocery List Styles */
        .grocery-section h3 {
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .summary-cards {
            display: flex;
            gap: 15px;
            margin: 20px 0;
        }
        
        .summary-card {
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            flex: 1;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .summary-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
        }
        
        .grocery-category {
            margin: 25px 0;
        }
        
        .grocery-category h4 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        
        .grocery-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }
        
        .grocery-item {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
        }
        
        .item-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .item-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .item-quantity {
            color: #6b7280;
            font-size: 14px;
        }
        
        .item-details {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .seasonal-tag, .traditional-tag {
            background: #10b981;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .traditional-tag {
            background: #f59e0b;
        }
        
        .tips-list {
            list-style: none;
            padding: 0;
        }
        
        .tips-list li {
            background: #f8fafc;
            padding: 10px;
            margin: 8px 0;
            border-radius: 8px;
            border-left: 3px solid #10b981;
        }
        
        /* Storage Styles */
        .storage-intro {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .storage-category {
            margin: 25px 0;
        }
        
        .storage-items {
            display: grid;
            gap: 15px;
            margin-top: 15px;
        }
        
        .storage-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #ffffff, #f8fafc);
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .duration-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .storage-details {
            display: grid;
            gap: 10px;
        }
        
        .storage-method, .storage-temp, .storage-tips {
            font-size: 14px;
        }
        
        .storage-tips ul {
            list-style: none;
            padding: 0;
            margin-top: 5px;
        }
        
        .storage-tips li {
            background: #f3f4f6;
            padding: 4px 8px;
            margin: 4px 0;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .seasonal-storage {
            background: #fefce8;
            border: 1px solid #fde047;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .seasonal-tips ul {
            list-style: none;
            padding: 0;
        }
        
        .seasonal-tips li {
            background: #ffffff;
            padding: 10px;
            margin: 8px 0;
            border-radius: 8px;
            border-left: 3px solid #eab308;
        }
        
        /* Input Suggestions */
        .suggestion-chip {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            padding: 6px 12px;
            margin: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .suggestion-chip:hover {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .quick-actions.enhanced {
                grid-template-columns: 1fr;
            }
            
            .meals-grid {
                grid-template-columns: 1fr;
            }
            
            .nutrition-grid {
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            }
            
            .nutrient-grid, .vitamin-grid, .mineral-grid {
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            }
            
            .plan-actions {
                flex-direction: column;
            }
            
            .meal-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .profile-grid {
                grid-template-columns: 1fr;
            }
            
            .summary-cards {
                flex-direction: column;
            }
            
            .grocery-items {
                grid-template-columns: 1fr;
            }
            
            .recipe-info {
                flex-direction: column;
                gap: 8px;
            }
        }
        
        /* Animation for notifications */
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        /* Tab Styles */
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .tab-btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #374151;
            padding: 10px 15px;
            border-radius: 8px 8px 0 0;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .tab-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .tab-btn:hover {
            background: #e5e7eb;
        }
        
        .tab-btn.active:hover {
            background: #1d4ed8;
        }
    `;
    
    document.head.appendChild(enhancedStyles);
    
    // Add error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        if (window.chatbot) {
            window.chatbot.showNotification('An error occurred. Please refresh the page if issues persist.', 'error');
        }
    });
    
    // Add unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        if (window.chatbot) {
            window.chatbot.showNotification('A network error occurred. Please check your connection.', 'error');
        }
    });
});