// services/ai/geminiService.js
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    // Initialize the Gemini API client
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // Use Gemini Flash 2.0 model
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
  }

  /**
   * Load a prompt template by name
   * @param {string} templateName - Name of the template to load
   * @returns {object} Prompt template object
   */
  loadPromptTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, 'prompts', `${templateName}.json`);
      const templateData = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(templateData);
    } catch (error) {
      throw new Error(`Failed to load prompt template: ${error.message}`);
    }
  }

  /**
   * Generate RIASEC assessment questions using Gemini AI
   * @returns {object} RIASEC assessment questions
   */
  async generateRIASECQuestions() {
    try {
      // If no API key is configured, return mock data
      if (!this.apiKey) {
        console.log('No GEMINI_API_KEY found, returning mock data');
        return this.getMockRIASECQuestions();
      }

      // Load the RIASEC assessment prompt template
      const template = this.loadPromptTemplate('riasec_assessment');
      
      // Format the prompt
      const prompt = template.prompt;
      
      console.log('Calling Gemini Flash 2.0 API for RIASEC assessment questions');
      
      // Call the Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and validate the response
      let questions;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonText = this.extractJsonFromResponse(text);
        questions = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', text);
        // If parsing fails, return mock data
        return this.getMockRIASECQuestions();
      }
      
      return {
        questions: questions.questions || [],
        metadata: {
          model: "gemini-2.0-flash",
          generated_at: new Date().toISOString(),
          prompt_version: template.version
        }
      };
    } catch (error) {
      console.error('Error generating RIASEC questions:', error.message);
      // If API call fails, return mock data
      return this.getMockRIASECQuestions();
    }
  }

  /**
   * Generate career recommendations using Gemini AI
   * @param {object} userData - User profile, test results, preferences, and context
   * @returns {object} Career recommendations in structured JSON format
   */
  async generateCareerRecommendations(userData) {
    try {
      // If no API key is configured, return mock data
      if (!this.apiKey) {
        console.log('No GEMINI_API_KEY found, returning mock data');
        return this.getMockCareerRecommendations();
      }

      // Load the career recommendation prompt template
      const template = this.loadPromptTemplate('career_recommendation');
      
      // Format the prompt with user data
      const prompt = this.formatCareerRecommendationPrompt(template, userData);
      
      console.log('Calling Gemini Flash 2.0 API for career recommendations');
      
      // Call the Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and validate the response
      let recommendations;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonText = this.extractJsonFromResponse(text);
        recommendations = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', text);
        // If parsing fails, return mock data
        return this.getMockCareerRecommendations();
      }
      
      return {
        matches: recommendations.matches || [],
        metadata: {
          model: "gemini-2.0-flash",
          generated_at: new Date().toISOString(),
          prompt_version: template.version
        }
      };
    } catch (error) {
      console.error('Error generating career recommendations:', error.message);
      // If API call fails, return mock data
      return this.getMockCareerRecommendations();
    }
  }

  /**
   * Generate daily learning tasks using Gemini AI
   * @param {object} taskData - Career choice, skill levels, and time availability
   * @returns {object} Daily tasks in structured JSON format
   */
  async generateDailyTasks(taskData) {
    try {
      // If no API key is configured, return mock data
      if (!this.apiKey) {
        console.log('No GEMINI_API_KEY found, returning mock data');
        return this.getMockDailyTasks(taskData);
      }

      // Load the daily tasks prompt template
      const template = this.loadPromptTemplate('daily_tasks');
      
      // Format the prompt with task data
      const prompt = this.formatDailyTasksPrompt(template, taskData);
      
      console.log('Calling Gemini Flash 2.0 API for daily tasks');
      
      // Call the Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and validate the response
      let tasks;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonText = this.extractJsonFromResponse(text);
        tasks = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', text);
        // If parsing fails, return mock data
        return this.getMockDailyTasks(taskData);
      }
      
      return {
        tasks: tasks.tasks || [],
        metadata: {
          model: "gemini-2.0-flash",
          generated_at: new Date().toISOString(),
          prompt_version: template.version
        }
      };
    } catch (error) {
      console.error('Error generating daily tasks:', error.message);
      // If API call fails, return mock data
      return this.getMockDailyTasks(taskData);
    }
  }

  /**
   * Generate personalized goals using Gemini AI
   * @param {object} goalData - Career choice and user information
   * @returns {object} Personalized goals in structured JSON format
   */
  async generatePersonalizedGoals(goalData) {
    try {
      // If no API key is configured, return mock data
      if (!this.apiKey) {
        console.log('No GEMINI_API_KEY found, returning mock data');
        return this.getMockPersonalizedGoals();
      }
      
      // Format the prompt with goal data
      const prompt = this.formatGoalsPrompt(goalData);
      
      console.log('Calling Gemini Flash 2.0 API for personalized goals');
      
      // Call the Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and validate the response
      let goals;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonText = this.extractJsonFromResponse(text);
        goals = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', text);
        // If parsing fails, return mock data
        return this.getMockPersonalizedGoals();
      }
      
      return {
        monthly: goals.monthly || [],
        yearly: goals.yearly || [],
        metadata: {
          model: "gemini-2.0-flash",
          generated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating personalized goals:', error.message);
      // If API call fails, return mock data
      return this.getMockPersonalizedGoals();
    }
  }

  /**
   * Analyze a resume using Gemini AI
   * @param {Buffer} resumeBuffer - The resume file buffer
   * @param {string} userCareer - The user's selected career
   * @returns {object} Resume analysis results
   */
  async analyzeResume(resumeBuffer, userCareer) {
    try {
      console.log('=== RESUME ANALYSIS STARTED ===');
      console.log('Career:', userCareer);
      console.log('Resume buffer size:', resumeBuffer?.length, 'bytes');
      console.log('Resume buffer type:', typeof resumeBuffer);
      console.log('Is Buffer:', Buffer.isBuffer(resumeBuffer));
      console.log('Is Uint8Array:', resumeBuffer instanceof Uint8Array);
      
      // Validate inputs
      if (!userCareer || userCareer.trim() === '') {
        console.error('No career provided for resume analysis');
        return this.getMockResumeAnalysis();
      }
      
      // If no API key is configured, return mock data
      if (!this.apiKey) {
        console.log('No GEMINI_API_KEY found, returning mock data');
        return this.getMockResumeAnalysis();
      }
      
      // Validate that we have a proper buffer
      if (!resumeBuffer || resumeBuffer.length === 0) {
        console.error('Empty resume buffer received');
        return this.getMockResumeAnalysis();
      }
      
      // Convert Uint8Array to Buffer if needed (Prisma returns Bytes as Uint8Array)
      let pdfBuffer = resumeBuffer;
      if (!Buffer.isBuffer(resumeBuffer)) {
        console.log('Converting Uint8Array to Buffer...');
        pdfBuffer = Buffer.from(resumeBuffer);
      }
      
      // Check if buffer looks like a PDF (should start with %PDF)
      const headerBytes = pdfBuffer.slice(0, 4);
      const headerStr = headerBytes.toString('ascii');
      console.log('PDF Header (first 4 bytes):', Array.from(headerBytes).join(', '));
      console.log('PDF Header (as string):', headerStr);
      
      if (headerStr !== '%PDF') {
        console.error('Invalid PDF file - does not start with %PDF header');
        console.error('Actual first 10 bytes:', Array.from(pdfBuffer.slice(0, 10)).join(', '));
        return this.getMockResumeAnalysis();
      }
      
      console.log('✅ Valid PDF detected');
      
      // Convert buffer to base64 for Gemini API
      const base64Data = pdfBuffer.toString('base64');
      console.log('Base64 encoded size:', base64Data.length, 'characters');
      
      // Create a proper prompt for resume analysis
      const prompt = `You are an expert career advisor and resume analyst with deep knowledge of the ${userCareer} field. Analyze the provided resume specifically for a ${userCareer} position.

CRITICAL INSTRUCTIONS:
1. You MUST analyze the ACTUAL content of the resume provided
2. Your analysis MUST be SPECIFIC to the ${userCareer} career path
3. DO NOT provide generic feedback - tailor everything to ${userCareer}
4. Consider the specific skills, experience, and education shown in the resume
5. Be detailed and specific in your feedback

Please provide your analysis in the following exact JSON format without any markdown code blocks:
{
  "improvements": [
    "Specific improvement suggestion 1 for ${userCareer}",
    "Specific improvement suggestion 2 for ${userCareer}",
    "Specific improvement suggestion 3 for ${userCareer}"
  ],
  "relevance_score": 75,
  "recommendations": [
    "Specific recommendation 1 for ${userCareer} career path",
    "Specific recommendation 2 for ${userCareer} career path",
    "Specific recommendation 3 for ${userCareer} career path"
  ]
}

Guidelines for your analysis:
1. The relevance_score should be between 0-100, where 100 is a perfect match for the ${userCareer} position
2. improvements should be specific, actionable suggestions to make the resume more relevant for ${userCareer} based on the ACTUAL resume content
3. recommendations should be career-specific advice for ${userCareer} based on what you see in the resume
4. Be specific and detailed - mention actual skills, experiences, or gaps you observe in the resume
5. Consider what ${userCareer} professionals typically need and compare against this resume
6. DO NOT give generic advice that could apply to any career

Analyze the resume thoroughly and provide personalized feedback based on its actual content for the ${userCareer} career path.`;

      // Create content parts for Gemini API with proper structure
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            }
          ]
        }
      ];
      
      console.log('Calling Gemini Flash 2.0 API for resume analysis');
      console.log('Prompt length:', prompt.length, 'characters');
      
      // Call the Gemini API
      const result = await this.model.generateContent({
        contents: contents
      });
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini API, length:', text.length, 'characters');
      
      // Parse and validate the response
      let analysis;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonText = this.extractJsonFromResponse(text);
        analysis = JSON.parse(jsonText);
        
        // Validate the response structure
        if (!analysis.improvements || !Array.isArray(analysis.improvements)) {
          console.error('Invalid response structure - missing improvements array');
          return this.getMockResumeAnalysis();
        }
        
        if (typeof analysis.relevance_score !== 'number') {
          console.error('Invalid response structure - relevance_score is not a number');
          return this.getMockResumeAnalysis();
        }
        
        if (!analysis.recommendations || !Array.isArray(analysis.recommendations)) {
          console.error('Invalid response structure - missing recommendations array');
          return this.getMockResumeAnalysis();
        }
        
        console.log('Successfully parsed analysis:', {
          improvements_count: analysis.improvements.length,
          relevance_score: analysis.relevance_score,
          recommendations_count: analysis.recommendations.length
        });
        
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', parseError.message);
        console.error('Raw response text:', text.substring(0, 500));
        // If parsing fails, return mock data
        return this.getMockResumeAnalysis();
      }
      
      // Add metadata to indicate this is real AI data
      const result_data = {
        improvements: analysis.improvements || [],
        relevance_score: analysis.relevance_score || 0,
        recommendations: analysis.recommendations || [],
        metadata: {
          model: "gemini-2.0-flash",
          generated_at: new Date().toISOString(),
          source: "AI",
          career: userCareer
        }
      };
      
      console.log('=== RESUME ANALYSIS COMPLETED ===');
      return result_data;
      
    } catch (error) {
      console.error('Error analyzing resume:', error.message);
      console.error('Stack trace:', error.stack);
      // If API call fails, return mock data
      return this.getMockResumeAnalysis();
    }
  }

  /**
   * Extract JSON from response text, removing markdown code blocks if present
   */
  extractJsonFromResponse(text) {
    // Remove markdown code block markers if present
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    return jsonText.trim();
  }

  /**
   * Format the career recommendation prompt
   */
  formatCareerRecommendationPrompt(template, userData) {
    // Extract RIASEC scores from user data
    const riasecScores = userData.test_results.riasec || {};
    const userProfile = userData.user_profile || {};
    const behavioralData = userData.behavioral_data || {};
    const goalData = userData.goal_data || {};

    // Determine top RIASEC types
    const sortedRIASEC = Object.entries(riasecScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, score]) => `${type} (${score}%)`);

    const topRIASEC = sortedRIASEC.join(', ');

    // Build comprehensive prompt with all user data
    const prompt = `You are an expert career counselor and industry analyst with deep knowledge of career matching based on RIASEC personality types, skills, behavioral patterns, and goals.

USER PROFILE:
- Name: ${userProfile.name || 'Not provided'}
- Headline: ${userProfile.headline || 'Not provided'}
- Education: ${JSON.stringify(userProfile.education || [])}
- Experience: ${JSON.stringify(userProfile.experience || [])}
- Skills: ${userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.join(', ') : 'No skills listed'}

RIASEC ASSESSMENT RESULTS:
${Object.entries(riasecScores).map(([type, score]) => `- ${type}: ${score}%`).join('\n')}
Top RIASEC Types: ${topRIASEC}

BEHAVIORAL DATA:
- Completed Tasks: ${behavioralData.completed_tasks || 0}
- Current XP: ${behavioralData.xp || 0}
- Current Level: ${behavioralData.level || 1}
- Task History: ${behavioralData.task_history && behavioralData.task_history.length > 0 ? JSON.stringify(behavioralData.task_history.slice(0, 5)) : 'No task history yet'}

GOALS:
${goalData.goals && goalData.goals.length > 0 ? JSON.stringify(goalData.goals) : 'No goals set yet'}

YOUR TASK:
Based on this comprehensive user profile, recommend 4-5 diverse career paths ranked by suitability. Use a weighted scoring system:
- 40% RIASEC personality match
- 30% Skills and experience alignment
- 20% Behavioral patterns and engagement
- 10% Goal alignment

IMPORTANT REQUIREMENTS:
1. Provide DIVERSE career options that match different aspects of the user's profile
2. Do NOT default to Software Engineer unless it truly matches the RIASEC scores
3. Consider the user's top RIASEC types when suggesting careers
4. Each career should have a UNIQUE focus area
5. Match scores should reflect actual alignment (not all 90+)

For each career, provide detailed information including why it fits THIS specific user based on their RIASEC scores, skills, and behavioral data.

Return your recommendations in the following JSON format without any markdown code blocks:
{
  "matches": [
    {
      "career_id": "unique_identifier_snake_case",
      "career_name": "Career Name",
      "match_score": 85,
      "description": "Brief 2-3 sentence description of the career",
      "why_this_fit": [
        "Specific reason tied to user's RIASEC scores",
        "Specific reason tied to user's skills or background",
        "Specific reason tied to behavioral patterns"
      ],
      "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "learning_path": [
        {
          "step": 1,
          "title": "Learning step title",
          "resources": ["https://example.com/resource"],
          "estimated_hours": 40
        }
      ],
      "salary_estimate": {
        "United States": "$60,000 - $100,000",
        "India": "₹4,00,000 - ₹10,00,000"
      },
      "companies_hiring": [
        {
          "name": "Company Name",
          "note": "Representative example"
        }
      ],
      "career_type_weights": {
        "riasec": 40,
        "skills": 30,
        "behavior": 20,
        "goals": 10
      }
    }
  ]
}`;

    return prompt;
  }

  /**
   * Format the daily tasks prompt
   */
  formatDailyTasksPrompt(template, taskData) {
    // Extract career information
    const career = taskData.career || {};
    const user = taskData.user || {};
    const careerName = career.career_name || 'your chosen career';
    const requiredSkills = career.required_skills || [];
    const careerDescription = career.description || '';

    // Create a summary of the user's task history
    let taskHistorySummary = "No previous tasks completed.";
    if (taskData.taskHistory && taskData.taskHistory.length > 0) {
      const recentTasks = taskData.taskHistory.slice(0, 5); // Last 5 tasks
      taskHistorySummary = recentTasks.map(task => 
        `- ${task.title} (${task.xp_reward} XP)`
      ).join('\n');
    }

    // Create a summary of current tasks
    let currentTasksSummary = "No current pending tasks.";
    if (taskData.currentTasks && taskData.currentTasks.length > 0) {
      currentTasksSummary = taskData.currentTasks.map(task => 
        `- ${task.title} (${task.xp_reward} XP)`
      ).join('\n');
    }

    // Determine user level and difficulty
    const userLevel = user.level || 1;
    const difficultyLevel = userLevel <= 3 ? 'beginner' : userLevel <= 7 ? 'intermediate' : 'advanced';

    // Use the template prompt and replace placeholders
    let prompt = template.prompt;
    
    // Replace placeholders in the prompt
    prompt = prompt.replace('{career}', JSON.stringify({
      career_name: career.career_name,
      required_skills: career.required_skills || []
    }));
    
    prompt = prompt.replace('{user}', JSON.stringify({
      id: taskData.user.id,
      name: taskData.user.name,
      level: taskData.user.level,
      xp: taskData.user.xp
    }));
    
    prompt = prompt.replace('{taskHistory}', JSON.stringify(taskData.taskHistory || []));
    prompt = prompt.replace('{currentTasks}', JSON.stringify(taskData.currentTasks || []));
    
    // Add comprehensive career-specific instructions
    prompt += `\n\nCAREER CONTEXT:
Career Path: ${careerName}
${careerDescription ? `Description: ${careerDescription}` : ''}
Required Skills: ${requiredSkills.length > 0 ? requiredSkills.join(', ') : 'To be determined'}

USER CONTEXT:
Current Level: ${userLevel} (${difficultyLevel})
Current XP: ${user.xp || 0}

YOUR TASK:
Generate 3-5 daily learning tasks that are HIGHLY SPECIFIC to the ${careerName} career path. These tasks should directly help the user develop the skills needed for this specific career.

CRITICAL REQUIREMENTS:
1. Tasks MUST be specific to ${careerName} - NOT generic tasks that could apply to any career
2. Include specific technologies, tools, frameworks, or skills from the required skills list: ${requiredSkills.length > 0 ? requiredSkills.join(', ') : 'relevant to this career'}
3. Tasks should be appropriate for ${difficultyLevel} level (Level ${userLevel})
4. Each task should have a clear learning objective related to ${careerName}
5. Include actual learning resources (URLs) from reputable platforms when possible
6. XP rewards should match the user's level: ${Math.min(100, Math.max(15, userLevel * 10 + 5))} XP base

TASK SPECIFICITY EXAMPLES:
❌ BAD (Generic): "Complete a module on core skills"
✅ GOOD (Software Engineer): "Build a REST API with Node.js and Express - complete tutorial on https://expressjs.com"
✅ GOOD (Data Analyst): "Create a dashboard in Tableau using sample sales dataset - practice on https://public.tableau.com"
✅ GOOD (UX Designer): "Design a mobile app wireframe in Figma for a food delivery app - learn at https://www.figma.com/resources/learn-design"
✅ GOOD (Digital Marketing): "Set up Google Ads campaign with keyword research - guide at https://skillshop.exceedlms.com"

RECENTLY COMPLETED TASKS (avoid repeating these):
${taskHistorySummary}

CURRENT PENDING TASKS (build upon these, don't repeat):
${currentTasksSummary}

Generate tasks that progressively build expertise in ${careerName} and directly contribute to career readiness.

Please respond in the following JSON format without any markdown code blocks:
{
  "tasks": [
    {
      "task_id": "career_task_${careerName.toLowerCase().replace(/\\s+/g, '_')}_1",
      "description": "Very specific task description mentioning ${careerName} skills, tools, or technologies",
      "estimated_time_minutes": 30,
      "learning_resource_link": "https://actual-learning-resource.com",
      "xp_reward": ${Math.min(100, Math.max(15, userLevel * 10 + 5))}
    }
  ]
}`;
    
    return prompt;
  }

  /**
   * Format the goals prompt
   */
  formatGoalsPrompt(goalData) {
    const career = goalData.career || {};
    const user = goalData.user || {};
    const riasecScores = goalData.riasecScores || {};

    // Determine top RIASEC types for context
    let topRIASEC = '';
    if (riasecScores && Object.keys(riasecScores).length > 0) {
      const sortedRIASEC = Object.entries(riasecScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type, score]) => `${type} (${score}%)`);
      topRIASEC = `\n\nUser's Top RIASEC Types: ${sortedRIASEC.join(', ')}`;
    }

    // Determine user level for goal difficulty
    const userLevel = user.level || 1;
    const difficultyLevel = userLevel <= 3 ? 'beginner' : userLevel <= 7 ? 'intermediate' : 'advanced';

    return `You are an expert career advisor and goal-setting specialist with deep knowledge of ${career.career_name} career progression.

CAREER CONTEXT:
- Career Path: ${career.career_name}
- Required Skills: ${career.required_skills && career.required_skills.length > 0 ? career.required_skills.join(', ') : 'To be determined based on career'}
- Career Description: ${career.description || 'Professional career path'}${topRIASEC}

USER CONTEXT:
- Current Level: ${userLevel} (${difficultyLevel})
- Current XP: ${user.xp || 0}
- Completed Tasks: ${user.completedTasks || 0}

YOUR TASK:
Generate SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals that are HIGHLY SPECIFIC to the ${career.career_name} career path. These goals should reflect real milestones and achievements that professionals in this field actually pursue.

CRITICAL REQUIREMENTS:
1. Goals MUST be specific to ${career.career_name} - not generic goals that could apply to any career
2. Include specific technologies, certifications, skills, or achievements relevant to this field
3. Monthly goals (3-4): Focus on immediate skill development, learning milestones, and short-term achievements
4. Yearly goals (2-3): Focus on major certifications, portfolio projects, job readiness, or career advancement
5. Goals should scale with user's level (${difficultyLevel} level)
6. Each goal must have a clear, measurable target (numbers, hours, projects, etc.)
7. Make goals actionable and realistic for someone pursuing ${career.career_name}

EXAMPLES OF GOOD GOALS FOR DIFFERENT CAREERS:
- Software Engineer: "Complete React certification and build 3 full-stack projects" (NOT "Learn programming")
- Data Analyst: "Master SQL and Python for data analysis, complete 5 real-world datasets" (NOT "Study data")
- UX Designer: "Create portfolio with 5 case studies and learn Figma advanced features" (NOT "Design things")

Format your response in the following JSON structure without any markdown code blocks:
{
  "monthly": [
    {
      "title": "Specific monthly goal title for ${career.career_name}",
      "description": "Detailed description with specific skills, tools, or achievements relevant to this career",
      "target": 10,
      "completed": 0
    }
  ],
  "yearly": [
    {
      "title": "Specific yearly goal title for ${career.career_name}",
      "description": "Detailed description with major milestones, certifications, or projects for this career",
      "target": 50,
      "completed": 0
    }
  ]
}`;

  }

  /**
   * Mock data for RIASEC questions with 36 questions (6 per category)
   */
  getMockRIASECQuestions() {
    return {
      questions: [
        // Realistic (R) - 6 questions
        {
          "id": "q1",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Working with tools, machines, or vehicles"
            },
            {
              "value": 2,
              "label": "Solving complex math or science problems"
            }
          ]
        },
        {
          "id": "q2",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Building or repairing things"
            },
            {
              "value": 2,
              "label": "Designing graphics or layouts"
            }
          ]
        },
        {
          "id": "q3",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Working outdoors with plants or animals"
            },
            {
              "value": 2,
              "label": "Teaching or training others"
            }
          ]
        },
        {
          "id": "q4",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Operating machinery or equipment"
            },
            {
              "value": 2,
              "label": "Writing stories or poems"
            }
          ]
        },
        {
          "id": "q5",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Fixing electrical or mechanical problems"
            },
            {
              "value": 2,
              "label": "Organizing files, data, or records"
            }
          ]
        },
        {
          "id": "q6",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Working with your hands on physical projects"
            },
            {
              "value": 2,
              "label": "Conducting experiments or research"
            }
          ]
        },
        // Investigative (I) - 6 questions
        {
          "id": "q7",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Solving complex math or science problems"
            },
            {
              "value": 2,
              "label": "Helping people solve their problems"
            }
          ]
        },
        {
          "id": "q8",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Conducting experiments or research"
            },
            {
              "value": 2,
              "label": "Negotiating business deals"
            }
          ]
        },
        {
          "id": "q9",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Designing or developing software"
            },
            {
              "value": 2,
              "label": "Performing in front of an audience"
            }
          ]
        },
        {
          "id": "q10",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Researching and analyzing information"
            },
            {
              "value": 2,
              "label": "Coaching or mentoring others"
            }
          ]
        },
        {
          "id": "q11",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Writing technical documentation"
            },
            {
              "value": 2,
              "label": "Starting your own business"
            }
          ]
        },
        {
          "id": "q12",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Studying how things work"
            },
            {
              "value": 2,
              "label": "Following detailed procedures"
            }
          ]
        },
        // Artistic (A) - 6 questions
        {
          "id": "q13",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Designing graphics or layouts"
            },
            {
              "value": 2,
              "label": "Managing a business or project"
            }
          ]
        },
        {
          "id": "q14",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Writing stories or poems"
            },
            {
              "value": 2,
              "label": "Processing paperwork or forms"
            }
          ]
        },
        {
          "id": "q15",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Photography or video production"
            },
            {
              "value": 2,
              "label": "Training or educating others"
            }
          ]
        },
        {
          "id": "q16",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Creating art, music, or creative writing"
            },
            {
              "value": 2,
              "label": "Keeping financial records"
            }
          ]
        },
        {
          "id": "q17",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Designing creative solutions to problems"
            },
            {
              "value": 2,
              "label": "Selling products or services"
            }
          ]
        },
        {
          "id": "q18",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Expressing ideas through visual media"
            },
            {
              "value": 2,
              "label": "Maintaining databases or spreadsheets"
            }
          ]
        },
        // Social (S) - 6 questions
        {
          "id": "q19",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Helping people solve their problems"
            },
            {
              "value": 2,
              "label": "Working with tools, machines, or vehicles"
            }
          ]
        },
        {
          "id": "q20",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Teaching or training others"
            },
            {
              "value": 2,
              "label": "Building or repairing things"
            }
          ]
        },
        {
          "id": "q21",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Coaching or mentoring others"
            },
            {
              "value": 2,
              "label": "Operating machinery or equipment"
            }
          ]
        },
        {
          "id": "q22",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Counseling or advising people"
            },
            {
              "value": 2,
              "label": "Fixing electrical or mechanical problems"
            }
          ]
        },
        {
          "id": "q23",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Training or educating others"
            },
            {
              "value": 2,
              "label": "Writing technical documentation"
            }
          ]
        },
        {
          "id": "q24",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Working in teams to help others"
            },
            {
              "value": 2,
              "label": "Studying how things work"
            }
          ]
        },
        // Enterprising (E) - 6 questions
        {
          "id": "q25",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Managing a business or project"
            },
            {
              "value": 2,
              "label": "Designing graphics or layouts"
            }
          ]
        },
        {
          "id": "q26",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Negotiating business deals"
            },
            {
              "value": 2,
              "label": "Writing stories or poems"
            }
          ]
        },
        {
          "id": "q27",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Performing in front of an audience"
            },
            {
              "value": 2,
              "label": "Photography or video production"
            }
          ]
        },
        {
          "id": "q28",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Selling products or services"
            },
            {
              "value": 2,
              "label": "Creating art, music, or creative writing"
            }
          ]
        },
        {
          "id": "q29",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Starting your own business"
            },
            {
              "value": 2,
              "label": "Designing creative solutions to problems"
            }
          ]
        },
        {
          "id": "q30",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Leading a team or selling products"
            },
            {
              "value": 2,
              "label": "Expressing ideas through visual media"
            }
          ]
        },
        // Conventional (C) - 6 questions
        {
          "id": "q31",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Organizing files, data, or records"
            },
            {
              "value": 2,
              "label": "Helping people solve their problems"
            }
          ]
        },
        {
          "id": "q32",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Following detailed procedures"
            },
            {
              "value": 2,
              "label": "Teaching or training others"
            }
          ]
        },
        {
          "id": "q33",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Keeping financial records"
            },
            {
              "value": 2,
              "label": "Coaching or mentoring others"
            }
          ]
        },
        {
          "id": "q34",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Processing paperwork or forms"
            },
            {
              "value": 2,
              "label": "Counseling or advising people"
            }
          ]
        },
        {
          "id": "q35",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Maintaining databases or spreadsheets"
            },
            {
              "value": 2,
              "label": "Training or educating others"
            }
          ]
        },
        {
          "id": "q36",
          "text": "Which activity would you prefer?",
          "options": [
            {
              "value": 1,
              "label": "Working with numbers and data"
            },
            {
              "value": 2,
              "label": "Working in teams to help others"
            }
          ]
        }
      ],
      metadata: {
        model: "gemini-pro",
        generated_at: new Date().toISOString(),
        prompt_version: "1.1.0"
      }
    };
  }

  /**
   * Mock data for career recommendations
   */
  getMockCareerRecommendations() {
    return {
      matches: [
        {
          career_id: "software_engineer",
          career_name: "Software Engineer",
          match_score: 88,
          description: "Design, develop, and maintain software systems and applications. Build scalable solutions and collaborate with cross-functional teams.",
          why_this_fit: [
            "Strong investigative and analytical thinking skills",
            "Interest in problem-solving and logical reasoning",
            "Growing demand for technical professionals",
            "Excellent career growth and salary potential"
          ],
          required_skills: ["JavaScript", "Python", "React", "Node.js", "Database Design", "Git"],
          learning_path: [
            {
              step: 1,
              title: "Master programming fundamentals",
              resources: ["https://www.freecodecamp.org", "https://developer.mozilla.org"],
              estimated_hours: 60
            },
            {
              step: 2,
              title: "Build full-stack projects",
              resources: ["https://www.theodinproject.com", "https://fullstackopen.com"],
              estimated_hours: 80
            }
          ],
          salary_estimate: {
            "United States": "$75,000 - $130,000",
            "India": "₹5,00,000 - ₹15,00,000"
          },
          companies_hiring: [
            { name: "Google", note: "Representative" },
            { name: "Microsoft", note: "Representative" },
            { name: "Amazon", note: "Representative" }
          ],
          career_type_weights: {
            riasec: 40,
            skills: 30,
            behavior: 20,
            goals: 10
          }
        },
        {
          career_id: "data_analyst",
          career_name: "Data Analyst",
          match_score: 82,
          description: "Analyze complex datasets to extract insights and support business decision-making. Create visualizations and reports for stakeholders.",
          why_this_fit: [
            "Strong analytical and numerical abilities",
            "Detail-oriented with conventional strengths",
            "High demand across all industries",
            "Combines technical skills with business acumen"
          ],
          required_skills: ["SQL", "Python", "Excel", "Tableau", "Statistics", "Power BI"],
          learning_path: [
            {
              step: 1,
              title: "Learn SQL and database fundamentals",
              resources: ["https://www.kaggle.com/learn", "https://mode.com/sql-tutorial"],
              estimated_hours: 40
            },
            {
              step: 2,
              title: "Master data visualization tools",
              resources: ["https://www.tableau.com/learn", "https://learn.microsoft.com/power-bi"],
              estimated_hours: 50
            }
          ],
          salary_estimate: {
            "United States": "$65,000 - $110,000",
            "India": "₹4,00,000 - ₹12,00,000"
          },
          companies_hiring: [
            { name: "Deloitte", note: "Representative" },
            { name: "Accenture", note: "Representative" },
            { name: "TCS", note: "Representative" }
          ],
          career_type_weights: {
            riasec: 40,
            skills: 30,
            behavior: 20,
            goals: 10
          }
        },
        {
          career_id: "ux_ui_designer",
          career_name: "UX/UI Designer",
          match_score: 78,
          description: "Create user-centered designs for digital products. Conduct user research, create wireframes, and design intuitive interfaces.",
          why_this_fit: [
            "Strong artistic and creative tendencies",
            "Interest in human behavior and psychology",
            "Combines creativity with technical implementation",
            "Growing importance of user experience"
          ],
          required_skills: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Design Systems"],
          learning_path: [
            {
              step: 1,
              title: "Learn design fundamentals and tools",
              resources: ["https://www.interaction-design.org", "https://www.figma.com/resources/learn-design"],
              estimated_hours: 50
            },
            {
              step: 2,
              title: "Build design portfolio with case studies",
              resources: ["https://www.behance.net", "https://dribbble.com"],
              estimated_hours: 70
            }
          ],
          salary_estimate: {
            "United States": "$70,000 - $115,000",
            "India": "₹4,50,000 - ₹11,00,000"
          },
          companies_hiring: [
            { name: "Apple", note: "Representative" },
            { name: "Airbnb", note: "Representative" },
            { name: "Flipkart", note: "Representative" }
          ],
          career_type_weights: {
            riasec: 40,
            skills: 30,
            behavior: 20,
            goals: 10
          }
        },
        {
          career_id: "digital_marketing_specialist",
          career_name: "Digital Marketing Specialist",
          match_score: 75,
          description: "Develop and execute online marketing strategies including SEO, social media, content marketing, and analytics to drive business growth.",
          why_this_fit: [
            "Strong enterprising and social characteristics",
            "Creative thinking with data-driven approach",
            "Fast-growing field with diverse opportunities",
            "Combines creativity with analytical skills"
          ],
          required_skills: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "Email Marketing", "PPC"],
          learning_path: [
            {
              step: 1,
              title: "Master Google Analytics and SEO fundamentals",
              resources: ["https://analytics.google.com/analytics/academy", "https://moz.com/beginners-guide-to-seo"],
              estimated_hours: 45
            },
            {
              step: 2,
              title: "Get certified in digital marketing",
              resources: ["https://learndigital.withgoogle.com/digitalgarage", "https://www.hubspot.com/academy"],
              estimated_hours: 60
            }
          ],
          salary_estimate: {
            "United States": "$55,000 - $95,000",
            "India": "₹3,50,000 - ₹9,00,000"
          },
          companies_hiring: [
            { name: "WPP", note: "Representative" },
            { name: "Ogilvy", note: "Representative" },
            { name: "Webchutney", note: "Representative" }
          ],
          career_type_weights: {
            riasec: 40,
            skills: 30,
            behavior: 20,
            goals: 10
          }
        }
      ],
      metadata: {
        model: "gemini-pro",
        generated_at: new Date().toISOString(),
        prompt_version: "1.1.0"
      }
    };
  }

  /**
   * Mock data for daily tasks - Now career-specific
   */
  getMockDailyTasks(taskData) {
    const career = taskData?.career || {};
    const user = taskData?.user || {};
    const careerName = career.career_name || 'Software Engineer';
    const userLevel = user.level || 1;
    const baseXP = Math.min(100, Math.max(15, userLevel * 10 + 5));

    // Career-specific task templates
    const careerTasks = {
      'software_engineer': [
        {
          task_id: `software_engineer_task_1`,
          description: `Build a RESTful API with Node.js and Express - create endpoints for user authentication and data management`,
          estimated_time_minutes: 45,
          learning_resource_link: "https://expressjs.com/en/starter/installing.html",
          xp_reward: baseXP
        },
        {
          task_id: `software_engineer_task_2`,
          description: `Complete React hooks tutorial - implement useState, useEffect, and useContext in a sample project`,
          estimated_time_minutes: 40,
          learning_resource_link: "https://react.dev/reference/react",
          xp_reward: baseXP + 5
        },
        {
          task_id: `software_engineer_task_3`,
          description: `Design and implement a PostgreSQL database schema for an e-commerce application with proper relationships`,
          estimated_time_minutes: 35,
          learning_resource_link: "https://www.postgresql.org/docs/current/tutorial.html",
          xp_reward: baseXP - 5
        }
      ],
      'data_analyst': [
        {
          task_id: `data_analyst_task_1`,
          description: `Create an interactive Tableau dashboard visualizing sales data with filters, calculated fields, and drill-downs`,
          estimated_time_minutes: 45,
          learning_resource_link: "https://public.tableau.com/app/learn",
          xp_reward: baseXP
        },
        {
          task_id: `data_analyst_task_2`,
          description: `Write advanced SQL queries using JOINs, window functions, and CTEs to analyze customer behavior patterns`,
          estimated_time_minutes: 40,
          learning_resource_link: "https://www.kaggle.com/learn/advanced-sql",
          xp_reward: baseXP + 5
        },
        {
          task_id: `data_analyst_task_3`,
          description: `Perform exploratory data analysis in Python using pandas and matplotlib on a real-world dataset from Kaggle`,
          estimated_time_minutes: 50,
          learning_resource_link: "https://www.kaggle.com/datasets",
          xp_reward: baseXP
        }
      ],
      'ux/ui_designer': [
        {
          task_id: `ux_ui_designer_task_1`,
          description: `Design a mobile app wireframe in Figma for a food delivery application - include user flow for ordering process`,
          estimated_time_minutes: 45,
          learning_resource_link: "https://www.figma.com/resources/learn-design/",
          xp_reward: baseXP
        },
        {
          task_id: `ux_ui_designer_task_2`,
          description: `Conduct usability testing with 3 users on your prototype - document findings and create iteration plan`,
          estimated_time_minutes: 40,
          learning_resource_link: "https://www.nngroup.com/articles/usability-testing-101/",
          xp_reward: baseXP + 5
        },
        {
          task_id: `ux_ui_designer_task_3`,
          description: `Create a comprehensive design system in Figma with color palette, typography, components, and style guide`,
          estimated_time_minutes: 50,
          learning_resource_link: "https://www.figma.com/design-systems/",
          xp_reward: baseXP
        }
      ],
      'digital_marketing_specialist': [
        {
          task_id: `digital_marketing_specialist_task_1`,
          description: `Set up a Google Ads search campaign with keyword research, ad copy writing, and bid strategy for a sample product`,
          estimated_time_minutes: 45,
          learning_resource_link: "https://skillshop.exceedlms.com/student/path/293433",
          xp_reward: baseXP
        },
        {
          task_id: `digital_marketing_specialist_task_2`,
          description: `Create a content calendar for social media marketing - plan 30 days of posts across Instagram, LinkedIn, and Twitter`,
          estimated_time_minutes: 40,
          learning_resource_link: "https://blog.hubspot.com/marketing/how-to-make-a-social-media-calendar",
          xp_reward: baseXP + 5
        },
        {
          task_id: `digital_marketing_specialist_task_3`,
          description: `Perform SEO audit of a website using Google Analytics and Search Console - identify optimization opportunities`,
          estimated_time_minutes: 35,
          learning_resource_link: "https://analytics.google.com/analytics/academy/",
          xp_reward: baseXP - 5
        }
      ]
    };

    // Get tasks for the specific career, default to software engineer if not found
    const careerKey = careerName.toLowerCase().replace(/\s+/g, '_');
    console.log(`getMockDailyTasks - Career: ${careerName}, Key: ${careerKey}`);
    const tasks = careerTasks[careerKey] || careerTasks['software_engineer'];
    
    if (!careerTasks[careerKey]) {
      console.log(`Warning: No mock tasks for career key "${careerKey}", using software_engineer tasks. Available keys: ${Object.keys(careerTasks).join(', ')}`);
    }

    return {
      tasks: tasks,
      metadata: {
        model: "gemini-pro",
        generated_at: new Date().toISOString(),
        prompt_version: "2.0.0",
        career_specific: true,
        career_name: careerName
      }
    };
  }

  /**
   * Mock data for personalized goals
   */
  getMockPersonalizedGoals() {
    return {
      monthly: [
        {
          id: 1,
          title: "Master core technical skills for your career",
          description: "Complete online courses and hands-on projects focused on the essential skills required for your chosen career path",
          target: 40,
          completed: 0,
          progress: 0
        },
        {
          id: 2,
          title: "Build professional network in your field",
          description: "Connect with at least 5 professionals in your target industry and engage with their content",
          target: 5,
          completed: 0,
          progress: 0
        },
        {
          id: 3,
          title: "Complete practical projects or case studies",
          description: "Work on real-world projects or case studies that demonstrate your skills and build your portfolio",
          target: 3,
          completed: 0,
          progress: 0
        }
      ],
      yearly: [
        {
          id: 1,
          title: "Achieve professional certification or advanced proficiency",
          description: "Complete industry-recognized certification or demonstrate advanced-level competency in your career field",
          target: 1,
          completed: 0,
          progress: 0
        },
        {
          id: 2,
          title: "Build comprehensive portfolio with major projects",
          description: "Create and showcase 3-5 significant projects that demonstrate mastery of key skills in your career",
          target: 5,
          completed: 0,
          progress: 0
        }
      ],
      metadata: {
        model: "gemini-pro",
        generated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Mock data for resume analysis
   */
  getMockResumeAnalysis() {
    return {
      improvements: [
        "Add more quantifiable achievements with specific metrics",
        "Include relevant keywords for software engineering positions",
        "Add a summary section highlighting your key skills and experience"
      ],
      relevance_score: 78,
      recommendations: [
        "Consider adding a projects section to showcase your work",
        "Include certifications relevant to the software engineering field",
        "Add a LinkedIn profile link for better professional visibility"
      ],
      metadata: {
        model: "gemini-pro",
        generated_at: new Date().toISOString(),
        source: "MOCK"
      }
    };
  }

}

module.exports = new GeminiService();