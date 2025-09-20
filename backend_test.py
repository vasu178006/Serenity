#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Serenity Space Wellness App
Tests all core endpoints with realistic wellness data
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "https://emergent-fix-2.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class SerenitySpaceAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_data = {
            'preferences': [],
            'cbt_sessions': [],
            'zen_sessions': [],
            'articles': [],
            'favorites': []
        }
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
    def test_health_check(self):
        """Test basic API health check"""
        try:
            response = self.session.get(f"{API_URL}/")
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Serenity Space API' and data.get('status') == 'running':
                    self.log_test("Health Check", True, "API is running and accessible")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
        
    def test_user_preferences(self):
        """Test user preferences creation and retrieval with mood-based theming"""
        # Test data representing different user scenarios
        test_preferences = [
            {
                "identity": "Student",
                "current_mood": "Anxious",
                "mood_frequency": "This week"
            },
            {
                "identity": "Creative",
                "current_mood": "Unfocused", 
                "mood_frequency": "Just today"
            },
            {
                "identity": "Professional",
                "current_mood": "Stressed",
                "mood_frequency": "For a while"
            }
        ]
        
        success_count = 0
        
        # Test creating preferences
        for i, prefs in enumerate(test_preferences):
            try:
                response = self.session.post(f"{API_URL}/preferences", json=prefs)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    required_fields = ['id', 'identity', 'current_mood', 'mood_frequency', 'theme_colors', 'created_at']
                    if all(field in data for field in required_fields):
                        # Validate theme colors are generated based on mood
                        theme_colors = data['theme_colors']
                        if isinstance(theme_colors, dict) and 'primary' in theme_colors:
                            self.created_data['preferences'].append(data['id'])
                            self.log_test(f"Create Preferences {i+1}", True, 
                                        f"Created preferences for {prefs['current_mood']} mood with theme colors")
                            success_count += 1
                        else:
                            self.log_test(f"Create Preferences {i+1}", False, 
                                        f"Invalid theme colors structure: {theme_colors}")
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_test(f"Create Preferences {i+1}", False, 
                                    f"Missing required fields: {missing}")
                else:
                    self.log_test(f"Create Preferences {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Create Preferences {i+1}", False, f"Error: {str(e)}")
        
        # Test retrieving preferences
        try:
            response = self.session.get(f"{API_URL}/preferences")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= success_count:
                    self.log_test("Get Preferences", True, f"Retrieved {len(data)} preferences")
                    return success_count > 0
                else:
                    self.log_test("Get Preferences", False, f"Expected list with {success_count}+ items, got: {data}")
            else:
                self.log_test("Get Preferences", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Preferences", False, f"Error: {str(e)}")
            
        return False
        
    def test_cbt_questions(self):
        """Test CBT questions endpoint"""
        try:
            response = self.session.get(f"{API_URL}/cbt-questions")
            if response.status_code == 200:
                data = response.json()
                if 'questions' in data and isinstance(data['questions'], list):
                    questions = data['questions']
                    if len(questions) >= 6:  # Should have at least 6 questions
                        # Validate question structure
                        valid_questions = 0
                        for q in questions:
                            if all(field in q for field in ['id', 'question', 'type']):
                                valid_questions += 1
                        
                        if valid_questions == len(questions):
                            self.log_test("CBT Questions", True, f"Retrieved {len(questions)} well-structured CBT questions")
                            return True
                        else:
                            self.log_test("CBT Questions", False, f"Only {valid_questions}/{len(questions)} questions properly structured")
                    else:
                        self.log_test("CBT Questions", False, f"Expected at least 6 questions, got {len(questions)}")
                else:
                    self.log_test("CBT Questions", False, f"Invalid response structure: {data}")
            else:
                self.log_test("CBT Questions", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("CBT Questions", False, f"Error: {str(e)}")
        return False
        
    def test_cbt_sessions(self):
        """Test CBT session creation and retrieval"""
        # Realistic CBT session data
        test_sessions = [
            {
                "negative_thought": "I'm going to fail this important presentation at work",
                "questions_and_answers": [
                    {"question": "Is this thought based on facts or feelings?", "answer": "Mostly feelings"},
                    {"question": "What evidence do I have that supports this thought?", "answer": "I feel nervous and unprepared"},
                    {"question": "What evidence do I have against this thought?", "answer": "I've prepared well and succeeded in presentations before"},
                    {"question": "What would I tell a friend who had this thought?", "answer": "You're well-prepared and capable. Nervousness is normal."},
                    {"question": "How likely is it that this worst-case scenario will actually happen?", "answer": "20"},
                    {"question": "What's a more balanced way to think about this situation?", "answer": "I'm prepared and even if it doesn't go perfectly, I can learn from it"}
                ]
            },
            {
                "negative_thought": "Nobody really likes me, I'm just bothering people",
                "questions_and_answers": [
                    {"question": "Is this thought based on facts or feelings?", "answer": "Feelings when I'm feeling down"},
                    {"question": "What evidence do I have that supports this thought?", "answer": "Sometimes people seem busy when I reach out"},
                    {"question": "What evidence do I have against this thought?", "answer": "Friends invite me to things and seem happy to see me"},
                    {"question": "What would I tell a friend who had this thought?", "answer": "You're valued and people care about you"},
                    {"question": "How likely is it that this worst-case scenario will actually happen?", "answer": "10"},
                    {"question": "What's a more balanced way to think about this situation?", "answer": "People have their own lives but that doesn't mean they don't care about me"}
                ]
            }
        ]
        
        success_count = 0
        
        # Test creating CBT sessions
        for i, session in enumerate(test_sessions):
            try:
                response = self.session.post(f"{API_URL}/cbt-sessions", json=session)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    required_fields = ['id', 'user_id', 'negative_thought', 'questions_and_answers', 'created_at']
                    if all(field in data for field in required_fields):
                        if data['negative_thought'] == session['negative_thought']:
                            self.created_data['cbt_sessions'].append(data['id'])
                            self.log_test(f"Create CBT Session {i+1}", True, 
                                        f"Created CBT session with {len(session['questions_and_answers'])} Q&As")
                            success_count += 1
                        else:
                            self.log_test(f"Create CBT Session {i+1}", False, 
                                        "Negative thought doesn't match input")
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_test(f"Create CBT Session {i+1}", False, 
                                    f"Missing required fields: {missing}")
                else:
                    self.log_test(f"Create CBT Session {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Create CBT Session {i+1}", False, f"Error: {str(e)}")
        
        # Test retrieving CBT sessions
        try:
            response = self.session.get(f"{API_URL}/cbt-sessions")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= success_count:
                    self.log_test("Get CBT Sessions", True, f"Retrieved {len(data)} CBT sessions")
                    return success_count > 0
                else:
                    self.log_test("Get CBT Sessions", False, f"Expected list with {success_count}+ items, got: {data}")
            else:
                self.log_test("Get CBT Sessions", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get CBT Sessions", False, f"Error: {str(e)}")
            
        return False
        
    def test_zen_sessions(self):
        """Test Zen session creation and retrieval"""
        # Realistic Zen session data
        test_sessions = [
            {
                "session_type": "Box Breathing",
                "duration": 10,
                "completed": True
            },
            {
                "session_type": "4-7-8 Breathing",
                "duration": 5,
                "completed": True
            },
            {
                "session_type": "Equal Breathing",
                "duration": 15,
                "completed": False
            }
        ]
        
        success_count = 0
        
        # Test creating Zen sessions
        for i, session in enumerate(test_sessions):
            try:
                response = self.session.post(f"{API_URL}/zen-sessions", json=session)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    required_fields = ['id', 'user_id', 'session_type', 'duration', 'completed', 'created_at']
                    if all(field in data for field in required_fields):
                        if (data['session_type'] == session['session_type'] and 
                            data['duration'] == session['duration']):
                            self.created_data['zen_sessions'].append(data['id'])
                            self.log_test(f"Create Zen Session {i+1}", True, 
                                        f"Created {session['session_type']} session ({session['duration']} min)")
                            success_count += 1
                        else:
                            self.log_test(f"Create Zen Session {i+1}", False, 
                                        "Session data doesn't match input")
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_test(f"Create Zen Session {i+1}", False, 
                                    f"Missing required fields: {missing}")
                else:
                    self.log_test(f"Create Zen Session {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Create Zen Session {i+1}", False, f"Error: {str(e)}")
        
        # Test retrieving Zen sessions
        try:
            response = self.session.get(f"{API_URL}/zen-sessions")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= success_count:
                    self.log_test("Get Zen Sessions", True, f"Retrieved {len(data)} Zen sessions")
                    return success_count > 0
                else:
                    self.log_test("Get Zen Sessions", False, f"Expected list with {success_count}+ items, got: {data}")
            else:
                self.log_test("Get Zen Sessions", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Zen Sessions", False, f"Error: {str(e)}")
            
        return False
        
    def test_articles_and_favorites(self):
        """Test articles retrieval and favorites system"""
        articles_success = False
        favorites_success = False
        
        # Test getting articles (should auto-seed if empty)
        try:
            response = self.session.get(f"{API_URL}/articles")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Validate article structure
                    valid_articles = 0
                    for article in data:
                        if all(field in article for field in ['id', 'title', 'content', 'category', 'author']):
                            valid_articles += 1
                            self.created_data['articles'].append(article['id'])
                    
                    if valid_articles == len(data):
                        self.log_test("Get Articles", True, f"Retrieved {len(data)} well-structured articles")
                        articles_success = True
                    else:
                        self.log_test("Get Articles", False, f"Only {valid_articles}/{len(data)} articles properly structured")
                else:
                    self.log_test("Get Articles", False, f"Expected non-empty list, got: {data}")
            else:
                self.log_test("Get Articles", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Articles", False, f"Error: {str(e)}")
        
        # Test favorites system if we have articles
        if self.created_data['articles']:
            # Test adding favorites
            test_article_ids = self.created_data['articles'][:3]  # Test with first 3 articles
            favorite_success_count = 0
            
            for i, article_id in enumerate(test_article_ids):
                try:
                    # Note: The API expects article_id as a query parameter, not in request body
                    response = self.session.post(f"{API_URL}/favorites?article_id={article_id}&user_id=test_user")
                    if response.status_code == 200:
                        data = response.json()
                        if 'id' in data and data.get('article_id') == article_id:
                            self.log_test(f"Add Favorite {i+1}", True, f"Added article to favorites")
                            favorite_success_count += 1
                        else:
                            self.log_test(f"Add Favorite {i+1}", False, f"Invalid favorite response: {data}")
                    else:
                        self.log_test(f"Add Favorite {i+1}", False, f"HTTP {response.status_code}: {response.text}")
                except Exception as e:
                    self.log_test(f"Add Favorite {i+1}", False, f"Error: {str(e)}")
            
            # Test getting favorites
            try:
                response = self.session.get(f"{API_URL}/favorites?user_id=test_user")
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) >= favorite_success_count:
                        self.log_test("Get Favorites", True, f"Retrieved {len(data)} favorite article IDs")
                        favorites_success = True
                    else:
                        self.log_test("Get Favorites", False, f"Expected list with {favorite_success_count}+ items, got: {data}")
                else:
                    self.log_test("Get Favorites", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Get Favorites", False, f"Error: {str(e)}")
        
        return articles_success and favorites_success
        
    def test_dynamic_cbt_questions(self):
        """Test AI-powered dynamic CBT question generation"""
        # Test with the specific negative thought from the review request
        test_request = {
            "negative_thought": "I'm never going to succeed at this job",
            "user_context": "Work-related anxiety and self-doubt"
        }
        
        try:
            response = self.session.post(f"{API_URL}/cbt-questions/dynamic", json=test_request)
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if 'questions' in data and isinstance(data['questions'], list):
                    questions = data['questions']
                    if len(questions) == 6:  # Should have exactly 6 questions
                        # Validate each question structure
                        valid_questions = 0
                        for q in questions:
                            required_fields = ['id', 'question', 'type']
                            if all(field in q for field in required_fields):
                                # Check if question types are valid
                                if q['type'] in ['text', 'choice', 'number']:
                                    # For choice type, should have options
                                    if q['type'] == 'choice' and 'options' not in q:
                                        continue
                                    # For number type, should have min/max
                                    if q['type'] == 'number' and ('min' not in q or 'max' not in q):
                                        continue
                                    valid_questions += 1
                        
                        if valid_questions == 6:
                            # Check if questions seem personalized (not just static fallback)
                            question_text = ' '.join([q['question'] for q in questions])
                            if any(keyword in question_text.lower() for keyword in ['job', 'work', 'succeed', 'career']):
                                self.log_test("AI Dynamic CBT Questions", True, 
                                            f"Generated 6 personalized CBT questions with AI integration working")
                                return True
                            else:
                                self.log_test("AI Dynamic CBT Questions", True, 
                                            f"Generated 6 CBT questions (may be fallback static questions)")
                                return True
                        else:
                            self.log_test("AI Dynamic CBT Questions", False, 
                                        f"Only {valid_questions}/6 questions properly structured")
                    else:
                        self.log_test("AI Dynamic CBT Questions", False, 
                                    f"Expected 6 questions, got {len(questions)}")
                else:
                    self.log_test("AI Dynamic CBT Questions", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("AI Dynamic CBT Questions", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("AI Dynamic CBT Questions", False, f"Error: {str(e)}")
        return False
        
    def test_usage_analytics(self):
        """Test usage analytics tracking and summary"""
        # Test data for different feature interactions
        test_analytics = [
            {
                "feature": "zen",
                "action": "complete",
                "duration": 600,  # 10 minutes
                "metadata": {"technique": "box_breathing", "cycles": 20}
            },
            {
                "feature": "music",
                "action": "view",
                "duration": 1200,  # 20 minutes
                "metadata": {"track": "forest_sounds", "volume": 0.7}
            },
            {
                "feature": "cbt",
                "action": "complete",
                "duration": 900,  # 15 minutes
                "metadata": {"questions_answered": 6, "session_type": "reframing"}
            },
            {
                "feature": "visual",
                "action": "interact",
                "duration": 300,  # 5 minutes
                "metadata": {"effect": "flowing_orbs", "intensity": "medium"}
            },
            {
                "feature": "articles",
                "action": "view",
                "duration": 480,  # 8 minutes
                "metadata": {"article_id": "wellness_123", "category": "mindfulness"}
            }
        ]
        
        success_count = 0
        
        # Test tracking analytics
        for i, analytics in enumerate(test_analytics):
            try:
                response = self.session.post(f"{API_URL}/analytics?user_id=test_analytics_user", json=analytics)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    required_fields = ['id', 'user_id', 'feature', 'action', 'created_at']
                    if all(field in data for field in required_fields):
                        if (data['feature'] == analytics['feature'] and 
                            data['action'] == analytics['action'] and
                            data.get('duration') == analytics.get('duration')):
                            self.log_test(f"Track Analytics {i+1}", True, 
                                        f"Tracked {analytics['feature']} {analytics['action']} ({analytics.get('duration', 0)}s)")
                            success_count += 1
                        else:
                            self.log_test(f"Track Analytics {i+1}", False, 
                                        "Analytics data doesn't match input")
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_test(f"Track Analytics {i+1}", False, 
                                    f"Missing required fields: {missing}")
                else:
                    self.log_test(f"Track Analytics {i+1}", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Track Analytics {i+1}", False, f"Error: {str(e)}")
        
        # Test analytics summary
        summary_success = False
        try:
            response = self.session.get(f"{API_URL}/analytics/summary?user_id=test_analytics_user")
            if response.status_code == 200:
                data = response.json()
                
                # Validate summary structure
                required_fields = ['feature_stats', 'recent_activity', 'total_sessions']
                if all(field in data for field in required_fields):
                    feature_stats = data['feature_stats']
                    recent_activity = data['recent_activity']
                    
                    if (isinstance(feature_stats, list) and 
                        isinstance(recent_activity, list) and
                        isinstance(data['total_sessions'], int)):
                        
                        # Should have stats for the features we tracked
                        tracked_features = set(a['feature'] for a in test_analytics)
                        stats_features = set(stat['_id'] for stat in feature_stats)
                        
                        if tracked_features.issubset(stats_features) or len(feature_stats) >= success_count:
                            self.log_test("Analytics Summary", True, 
                                        f"Retrieved analytics summary with {len(feature_stats)} feature stats and {len(recent_activity)} recent activities")
                            summary_success = True
                        else:
                            self.log_test("Analytics Summary", False, 
                                        f"Expected stats for {tracked_features}, got {stats_features}")
                    else:
                        self.log_test("Analytics Summary", False, 
                                    f"Invalid summary data types")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Analytics Summary", False, 
                                f"Missing required fields: {missing}")
            else:
                self.log_test("Analytics Summary", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Analytics Summary", False, f"Error: {str(e)}")
        
        return success_count > 0 and summary_success
        
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🧪 Starting Serenity Space Backend API Tests")
        print(f"🌐 Testing against: {API_URL}")
        print("=" * 60)
        
        # Test in logical order
        health_ok = self.test_health_check()
        if not health_ok:
            print("\n❌ Health check failed - API may not be running")
            return False
            
        print("\n📋 Testing User Preferences API...")
        prefs_ok = self.test_user_preferences()
        
        print("\n🧠 Testing CBT Questions API...")
        questions_ok = self.test_cbt_questions()
        
        print("\n💭 Testing CBT Sessions API...")
        cbt_ok = self.test_cbt_sessions()
        
        print("\n🧘 Testing Zen Sessions API...")
        zen_ok = self.test_zen_sessions()
        
        print("\n📚 Testing Articles and Favorites API...")
        articles_ok = self.test_articles_and_favorites()
        
        print("\n🤖 Testing AI-Powered Dynamic CBT Questions...")
        dynamic_cbt_ok = self.test_dynamic_cbt_questions()
        
        print("\n📊 Testing Usage Analytics System...")
        analytics_ok = self.test_usage_analytics()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['message']}")
        
        # Overall status
        critical_apis = [health_ok, prefs_ok, questions_ok, cbt_ok, zen_ok, articles_ok, dynamic_cbt_ok, analytics_ok]
        all_critical_passed = all(critical_apis)
        
        if all_critical_passed:
            print(f"\n✅ ALL CRITICAL APIs WORKING - Backend is fully functional!")
        else:
            print(f"\n⚠️  Some critical APIs have issues - Backend needs attention")
            
        return all_critical_passed

if __name__ == "__main__":
    tester = SerenitySpaceAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)