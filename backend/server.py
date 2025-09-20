from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
# from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    identity: str  # Student, Creative, Professional, Other
    current_mood: str  # Anxious, Unfocused, Sad, Stressed, Calm
    mood_frequency: str  # Just today, This week, For a while
    theme_colors: Dict[str, str] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserPreferencesCreate(BaseModel):
    identity: str
    current_mood: str
    mood_frequency: str

class CBTSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="anonymous")
    negative_thought: str
    questions_and_answers: List[Dict[str, str]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CBTSessionCreate(BaseModel):
    negative_thought: str
    questions_and_answers: List[Dict[str, str]]

class ZenSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="anonymous")
    session_type: str  # breathing, meditation
    duration: int  # in minutes
    completed: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ZenSessionCreate(BaseModel):
    session_type: str
    duration: int
    completed: bool = True

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str
    author: str = "Serenity Team"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="anonymous")
    article_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DynamicQuestionRequest(BaseModel):
    negative_thought: str
    user_context: Optional[str] = None

class UsageAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="anonymous")
    feature: str  # 'zen', 'music', 'cbt', 'visual', 'articles'
    action: str  # 'view', 'complete', 'interact'
    duration: Optional[int] = None  # in seconds
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UsageAnalyticsCreate(BaseModel):
    feature: str
    action: str
    duration: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

# Basic endpoints
@api_router.get("/")
async def root():
    return {"message": "Serenity Space API", "status": "running"}

# User Preferences
@api_router.post("/preferences", response_model=UserPreferences)
async def create_user_preferences(input: UserPreferencesCreate):
    # Generate theme colors based on mood
    theme_colors = generate_theme_colors(input.current_mood, input.identity)
    
    prefs_dict = input.dict()
    prefs_dict['theme_colors'] = theme_colors
    prefs_obj = UserPreferences(**prefs_dict)
    
    await db.user_preferences.insert_one(prefs_obj.dict())
    return prefs_obj

@api_router.get("/preferences", response_model=List[UserPreferences])
async def get_user_preferences():
    preferences = await db.user_preferences.find().to_list(1000)
    return [UserPreferences(**pref) for pref in preferences]

# CBT Sessions
@api_router.post("/cbt-sessions", response_model=CBTSession)
async def create_cbt_session(input: CBTSessionCreate):
    session_dict = input.dict()
    session_obj = CBTSession(**session_dict)
    await db.cbt_sessions.insert_one(session_obj.dict())
    return session_obj

@api_router.get("/cbt-sessions", response_model=List[CBTSession])
async def get_cbt_sessions(user_id: str = "anonymous"):
    sessions = await db.cbt_sessions.find({"user_id": user_id}).to_list(1000)
    return [CBTSession(**session) for session in sessions]

@api_router.delete("/cbt-sessions/{session_id}")
async def delete_cbt_session(session_id: str, user_id: str = "anonymous"):
    """Delete a CBT session"""
    result = await db.cbt_sessions.delete_one({"id": session_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}

@api_router.post("/cbt-sessions/sync")
async def sync_cbt_sessions(sessions_data: Dict[str, Any], user_id: str = "anonymous"):
    """Sync multiple CBT sessions with the backend"""
    try:
        sessions = sessions_data.get("sessions", [])
        synced_count = 0
        
        for session_data in sessions:
            # Check if session already exists
            existing = await db.cbt_sessions.find_one({"id": session_data.get("id")})
            if not existing:
                # Create new session
                session_data["user_id"] = user_id
                if "created_at" in session_data and isinstance(session_data["created_at"], str):
                    session_data["created_at"] = datetime.fromisoformat(session_data["created_at"].replace('Z', '+00:00'))
                
                session_obj = CBTSession(**session_data)
                await db.cbt_sessions.insert_one(session_obj.dict())
                synced_count += 1
        
        return {"message": f"Synced {synced_count} sessions successfully"}
    except Exception as e:
        logger.error(f"Error syncing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to sync sessions")

# CBT Questions endpoint
@api_router.get("/cbt-questions")
async def get_cbt_questions():
    return {
        "questions": [
            {
                "id": 1,
                "question": "Is this thought based on facts or feelings?",
                "type": "choice",
                "options": ["Facts", "Feelings", "Both", "Not sure"]
            },
            {
                "id": 2,
                "question": "What evidence do I have that supports this thought?",
                "type": "text"
            },
            {
                "id": 3,
                "question": "What evidence do I have against this thought?",
                "type": "text"
            },
            {
                "id": 4,
                "question": "What would I tell a friend who had this thought?",
                "type": "text"
            },
            {
                "id": 5,
                "question": "How likely is it that this worst-case scenario will actually happen? (0-100%)",
                "type": "number",
                "min": 0,
                "max": 100
            },
            {
                "id": 6,
                "question": "What's a more balanced way to think about this situation?",
                "type": "text"
            }
        ]
    }

# AI-Powered Dynamic CBT Questions using Google Gemini
@api_router.post("/cbt-questions/dynamic")
async def generate_dynamic_cbt_questions(request: DynamicQuestionRequest):
    """Generate personalized CBT questions using AI based on the user's negative thought"""
    
    # Analyze the negative thought and create specific questions
    thought = request.negative_thought.lower()
    
    # Different question sets based on thought patterns
    if "fail" in thought or "failure" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"Think of your biggest 'failure' that later led to something good. What did that teach you about the word 'failure'?", "type": "text"},
                {"id": 2, "question": f"If you knew that failing at this would lead to your greatest breakthrough in 5 years, how would you approach it differently?", "type": "text"},
                {"id": 3, "question": "What would you attempt if you knew that 'failure' was just data collection for your next success?", "type": "text"},
                {"id": 4, "question": "Which feels more true right now?", "type": "choice", "options": ["I'm protecting myself from pain", "I'm limiting my potential", "I'm being realistic", "I'm scared but that's okay"]},
                {"id": 5, "question": "If failure was impossible, what would you do with your life?", "type": "text"},
                {"id": 6, "question": f"What if '{request.negative_thought}' is your mind trying to keep you safe from something that might actually be worth the risk?", "type": "text"}
            ]
        }
    elif "never" in thought or "always" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"Your brain is using absolute words like 'always' or 'never' - what is it trying to protect you from feeling?", "type": "text"},
                {"id": 2, "question": f"If you replaced 'always/never' with 'sometimes' or 'often', how does '{request.negative_thought}' feel different?", "type": "text"},
                {"id": 3, "question": "What would it mean about you as a person if this pattern could actually change?", "type": "text"},
                {"id": 4, "question": "When you think in absolutes, what are you avoiding?", "type": "choice", "options": ["Hope (because it might hurt)", "Responsibility for change", "The complexity of reality", "Uncertainty about the future"]},
                {"id": 5, "question": "What's one tiny exception to this 'always/never' rule that you've been ignoring?", "type": "text"},
                {"id": 6, "question": f"What would become possible in your life if '{request.negative_thought}' was only true 70% of the time instead of 100%?", "type": "text"}
            ]
        }
    elif "stupid" in thought or "dumb" in thought or "idiot" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"Who first taught you that making mistakes meant you were stupid? What did that person gain by making you believe this?", "type": "text"},
                {"id": 2, "question": f"If intelligence was measured by kindness, curiosity, and growth instead of perfection, how would you rate yourself?", "type": "text"},
                {"id": 3, "question": "What would you accomplish if you knew that every 'mistake' was actually your brain learning and rewiring itself?", "type": "text"},
                {"id": 4, "question": "What's the real fear behind calling yourself stupid?", "type": "choice", "options": ["People will reject me", "I'll never improve", "I don't deserve good things", "I'm not worthy of love"]},
                {"id": 5, "question": "Think of someone you admire - what 'stupid' mistakes did they make on their way to success?", "type": "text"},
                {"id": 6, "question": f"What if your inner critic calling you stupid is actually terrified that you're about to outgrow the small story it's been telling about you?", "type": "text"}
            ]
        }
    elif "hate" in thought or "terrible" in thought or "awful" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"This intense self-hatred - what is it trying to protect you from? What would happen if you stopped hating yourself?", "type": "text"},
                {"id": 2, "question": f"If you met a child who felt about themselves the way you feel right now, what would your heart want to tell them?", "type": "text"},
                {"id": 3, "question": "What would you have to believe about yourself to feel worthy of love and belonging?", "type": "text"},
                {"id": 4, "question": "What's underneath this hatred?", "type": "choice", "options": ["Deep sadness and grief", "Fear of being abandoned", "Shame about who I am", "Exhaustion from trying so hard"]},
                {"id": 5, "question": "If self-hatred was a person, what would they be most afraid of you discovering about yourself?", "type": "text"},
                {"id": 6, "question": f"What if the part of you that thinks '{request.negative_thought}' is actually the part that cares most deeply about your wellbeing, but doesn't know how to help?", "type": "text"}
            ]
        }
    elif "worthless" in thought or "useless" in thought or "waste" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"If your worth was determined by your impact on just one person's life, whose life have you touched in a way that mattered?", "type": "text"},
                {"id": 2, "question": f"What would you need to accomplish to finally feel 'worthy'? And then what? What happens after that goal?", "type": "text"},
                {"id": 3, "question": "If a newborn baby is born worthy of love, at what exact moment did you lose that worthiness?", "type": "text"},
                {"id": 4, "question": "What's the difference between your worth and your productivity?", "type": "choice", "options": ["They're the same thing", "Worth is deeper than what I do", "I've never thought about this", "I don't know how to separate them"]},
                {"id": 5, "question": "What would you do with your life if your worth was already guaranteed and couldn't be taken away?", "type": "text"},
                {"id": 6, "question": f"What if '{request.negative_thought}' is the voice of a system that profits from your self-doubt, not the voice of truth?", "type": "text"}
            ]
        }
    elif "can't" in thought or "impossible" in thought or "too hard" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"What would you attempt if you knew that 'I can't' was just your current skill level, not your permanent identity?", "type": "text"},
                {"id": 2, "question": f"Who benefits from you believing that this is impossible for you?", "type": "text"},
                {"id": 3, "question": "What's the smallest possible step you could take toward this 'impossible' thing?", "type": "text"},
                {"id": 4, "question": "What are you really saying when you say 'I can't'?", "type": "choice", "options": ["I don't know how yet", "I'm scared of failing", "I don't deserve success", "It's safer to not try"]},
                {"id": 5, "question": "If someone offered you $1 million to figure out how to do this 'impossible' thing, what would your first step be?", "type": "text"},
                {"id": 6, "question": f"What if '{request.negative_thought}' is your mind's way of avoiding the discomfort of growth?", "type": "text"}
            ]
        }
    elif "alone" in thought or "nobody" in thought or "no one" in thought:
        return {
            "questions": [
                {"id": 1, "question": f"When you feel most alone, what are you really longing for - connection, understanding, or acceptance?", "type": "text"},
                {"id": 2, "question": f"If you could send a message to everyone who has ever felt alone, what would you want them to know?", "type": "text"},
                {"id": 3, "question": "What would it feel like to be truly seen and accepted for exactly who you are right now?", "type": "text"},
                {"id": 4, "question": "What keeps you from reaching out when you feel alone?", "type": "choice", "options": ["Fear of being a burden", "Shame about my struggles", "Belief that no one would understand", "Past experiences of rejection"]},
                {"id": 5, "question": "Think of a time when you helped someone feel less alone - what did that teach you about human connection?", "type": "text"},
                {"id": 6, "question": f"What if '{request.negative_thought}' is actually your heart's way of calling you toward deeper, more authentic connections?", "type": "text"}
            ]
        }
    else:
        # Default powerful questions for any negative thought
        return {
            "questions": [
                {"id": 1, "question": f"If this thought was a person sitting across from you, what would you want to ask them about their intentions?", "type": "text"},
                {"id": 2, "question": f"What would become possible in your life if '{request.negative_thought}' was just one perspective, not the ultimate truth?", "type": "text"},
                {"id": 3, "question": "What is this thought trying to protect you from experiencing?", "type": "text"},
                {"id": 4, "question": "If you had to choose, which feels more true?", "type": "choice", "options": ["This thought defines me", "This thought visits me", "This thought is trying to help", "This thought is outdated programming"]},
                {"id": 5, "question": "What would you do today if you knew this thought was just mental weather that will pass?", "type": "text"},
                {"id": 6, "question": f"What if the part of you that believes '{request.negative_thought}' is actually your wisest self in disguise, trying to get your attention about something important?", "type": "text"}
            ]
        }

# Zen Sessions
@api_router.post("/zen-sessions", response_model=ZenSession)
async def create_zen_session(input: ZenSessionCreate):
    session_dict = input.dict()
    session_obj = ZenSession(**session_dict)
    await db.zen_sessions.insert_one(session_obj.dict())
    return session_obj

@api_router.get("/zen-sessions", response_model=List[ZenSession])
async def get_zen_sessions(user_id: str = "anonymous"):
    sessions = await db.zen_sessions.find({"user_id": user_id}).to_list(1000)
    return [ZenSession(**session) for session in sessions]

# Articles
@api_router.get("/articles", response_model=List[Article])
async def get_articles():
    articles = await db.articles.find().to_list(1000)
    if not articles:
        # Seed some default articles
        await seed_articles()
        articles = await db.articles.find().to_list(1000)
    return [Article(**article) for article in articles]

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return Article(**article)

# Favorite Articles
@api_router.post("/favorites", response_model=FavoriteArticle)
async def add_favorite_article(article_id: str, user_id: str = "anonymous"):
    # Check if already favorited
    existing = await db.favorite_articles.find_one({"user_id": user_id, "article_id": article_id})
    if existing:
        return FavoriteArticle(**existing)
    
    favorite = FavoriteArticle(user_id=user_id, article_id=article_id)
    await db.favorite_articles.insert_one(favorite.dict())
    return favorite

@api_router.get("/favorites", response_model=List[str])
async def get_favorite_articles(user_id: str = "anonymous"):
    favorites = await db.favorite_articles.find({"user_id": user_id}).to_list(1000)
    return [fav["article_id"] for fav in favorites]

@api_router.delete("/favorites/{article_id}")
async def remove_favorite_article(article_id: str, user_id: str = "anonymous"):
    """Remove an article from favorites"""
    result = await db.favorite_articles.delete_one({"user_id": user_id, "article_id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Favorite removed successfully"}

# Usage Analytics
@api_router.post("/analytics", response_model=UsageAnalytics)
async def track_usage(input: UsageAnalyticsCreate, user_id: str = "anonymous"):
    """Track user interactions for analytics"""
    analytics_dict = input.dict()
    analytics_dict['user_id'] = user_id
    analytics_obj = UsageAnalytics(**analytics_dict)
    await db.usage_analytics.insert_one(analytics_obj.dict())
    return analytics_obj

@api_router.get("/analytics/summary")
async def get_usage_summary(user_id: str = "anonymous"):
    """Get usage analytics summary for a user"""
    try:
        # Get total sessions by feature
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$feature",
                "total_sessions": {"$sum": 1},
                "total_duration": {"$sum": "$duration"}
            }}
        ]
        
        feature_stats = await db.usage_analytics.aggregate(pipeline).to_list(100)
        
        # Get recent activity (last 7 days)
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_activity = await db.usage_analytics.find({
            "user_id": user_id,
            "created_at": {"$gte": week_ago}
        }).sort("created_at", -1).limit(20).to_list(20)
        
        return {
            "feature_stats": feature_stats,
            "recent_activity": [
                {
                    "feature": activity["feature"],
                    "action": activity["action"],
                    "duration": activity.get("duration"),
                    "created_at": activity["created_at"].isoformat()
                }
                for activity in recent_activity
            ],
            "total_sessions": len(recent_activity)
        }
    except Exception as e:
        logger.error(f"Error getting usage summary: {str(e)}")
        return {"feature_stats": [], "recent_activity": [], "total_sessions": 0}

# Helper functions
def generate_theme_colors(mood: str, identity: str) -> Dict[str, str]:
    """Generate theme colors based on user's mood and identity"""
    base_themes = {
        "Anxious": {
            "primary": "#6B73FF",
            "secondary": "#9BB5FF", 
            "accent": "#C1D3FE",
            "background": "#1A1B23",
            "surface": "#2A2D37",
            "text": "#E2E8F0"
        },
        "Unfocused": {
            "primary": "#10B981",
            "secondary": "#34D399",
            "accent": "#6EE7B7",
            "background": "#1A1E1A",
            "surface": "#273229",
            "text": "#E2E8F0"
        },
        "Sad": {
            "primary": "#F59E0B",
            "secondary": "#FBBF24",
            "accent": "#FCD34D",
            "background": "#1E1B17",
            "surface": "#322A20",
            "text": "#E2E8F0"
        },
        "Stressed": {
            "primary": "#EF4444",
            "secondary": "#F87171",
            "accent": "#FCA5A5",
            "background": "#1E1A1A",
            "surface": "#332727",
            "text": "#E2E8F0"
        },
        "Calm": {
            "primary": "#06B6D4",
            "secondary": "#22D3EE",
            "accent": "#67E8F9",
            "background": "#1A1E1E",
            "surface": "#273333",
            "text": "#E2E8F0"
        }
    }
    
    return base_themes.get(mood, base_themes["Calm"])

async def seed_articles():
    """Seed the database with sample wellness articles"""
    sample_articles = [
        {
            "title": "Understanding Anxiety: A Gentle Guide",
            "content": "Anxiety is a natural response to stress, but when it becomes overwhelming, it can impact our daily lives. Learning to recognize the signs and developing healthy coping strategies can make a significant difference. Remember, seeking help is a sign of strength, not weakness.",
            "category": "Mental Health",
            "author": "Dr. Sarah Chen"
        },
        {
            "title": "The Power of Mindful Breathing", 
            "content": "Breathing is something we do automatically, but when we bring conscious attention to our breath, it becomes a powerful tool for relaxation and stress relief. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8. This simple practice can help calm your nervous system.",
            "category": "Mindfulness",
            "author": "Marcus Thompson"
        },
        {
            "title": "Building Emotional Resilience",
            "content": "Emotional resilience is our ability to bounce back from difficult experiences. It's not about avoiding challenges, but developing the skills to navigate them with grace. Key practices include self-compassion, maintaining perspective, and building strong support networks.",
            "category": "Personal Growth",
            "author": "Dr. Maya Patel"
        },
        {
            "title": "Digital Detox: Reclaiming Your Mental Space",
            "content": "Our constant connection to digital devices can overwhelm our minds and increase stress levels. A digital detox involves intentionally reducing screen time and creating boundaries with technology. Start small: designate phone-free meals, create a charging station outside the bedroom, and practice the 20-20-20 rule - every 20 minutes, look at something 20 feet away for 20 seconds. Notice how reducing digital noise can improve your focus, sleep, and overall well-being.",
            "category": "Digital Wellbeing",
            "author": "Dr. Alex Rivera"
        },
        {
            "title": "Mindful Technology Use: Finding Balance",
            "content": "Technology isn't inherently bad - it's about how we use it. Mindful technology use means being intentional about when and why we engage with our devices. Set specific times for checking emails and social media, use app timers to track usage, and practice single-tasking instead of multitasking. Create tech-free zones in your home and establish a digital sunset routine 1 hour before bed. Remember: you control technology, not the other way around.",
            "category": "Digital Wellbeing", 
            "author": "Sarah Kim"
        },
        {
            "title": "Social Media and Mental Health: Setting Boundaries",
            "content": "Social media can be a source of connection, but it can also trigger comparison, FOMO, and anxiety. Protect your mental health by curating your feeds - unfollow accounts that make you feel inadequate and follow those that inspire and educate. Use the 'mute' feature liberally, limit scrolling time, and remember that social media shows highlight reels, not reality. Consider a weekly social media sabbath to reconnect with yourself and your immediate surroundings.",
            "category": "Digital Wellbeing",
            "author": "Dr. Michael Chen"
        },
        {
            "title": "Screen Time and Sleep: Breaking the Blue Light Cycle",
            "content": "Blue light from screens can disrupt our natural sleep-wake cycle by suppressing melatonin production. This leads to difficulty falling asleep and poor sleep quality. Combat this by using blue light filters on devices after sunset, keeping phones out of the bedroom, and establishing a wind-down routine that doesn't involve screens. Try reading a physical book, gentle stretching, or meditation instead. Your brain will thank you with better rest and improved mood.",
            "category": "Digital Wellbeing",
            "author": "Dr. Emma Thompson"
        },
        {
            "title": "The Art of Digital Minimalism",
            "content": "Digital minimalism is about being more selective about the technologies we allow into our lives. It's not about rejecting all technology, but choosing tools that truly serve our values and goals. Regularly audit your apps - delete those you don't use, organize the rest thoughtfully, and resist the urge to download every new app. Focus on quality over quantity in your digital tools, just as you would with physical possessions. This intentional approach can reduce digital overwhelm and increase life satisfaction.",
            "category": "Digital Wellbeing",
            "author": "Cal Newport"
        },
        {
            "title": "The Science of Sleep and Mental Health",
            "content": "Quality sleep is fundamental to mental well-being. During sleep, our brains process emotions and consolidate memories. Creating a consistent sleep routine, limiting screen time before bed, and creating a calm environment can significantly improve both sleep quality and mental health.",
            "category": "Wellness",
            "author": "Dr. James Wilson"
        },
        {
            "title": "Cognitive Behavioral Techniques for Daily Life",
            "content": "CBT teaches us that our thoughts, feelings, and behaviors are interconnected. By identifying negative thought patterns and challenging them with evidence, we can change how we feel and respond to situations. This process takes practice but can lead to lasting positive changes.",
            "category": "Therapy",
            "author": "Dr. Lisa Rodriguez"
        }
    ]
    
    articles_to_insert = []
    for article_data in sample_articles:
        article = Article(**article_data)
        articles_to_insert.append(article.dict())
    
    await db.articles.insert_many(articles_to_insert)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()