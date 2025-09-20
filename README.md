# 🧘 Serenity Space - Your Personal Wellness Companion

A comprehensive, privacy-first wellness web application designed to help you find focus, manage stress, and cultivate mindfulness through immersive experiences and evidence-based therapeutic tools.

![Serenity Space](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue)

## ✨ Features

### 🎯 Core Wellness Modules

- **🧘 Zen Mode** - Focused breathing exercises with guided meditation sessions
- **🎵 Relaxing Music** - 6 ambient soundscapes with real audio playback
- **🎨 Visual Effects** - 6 calming visual experiences for relaxation
- **💭 Cognitive Reframer** - AI-powered CBT tool for thought transformation
- **📚 Wellness Articles** - Curated content on mental health and digital wellbeing
- **📊 Personal Analytics** - Track your wellness journey and progress

### 🎨 Design & Experience

- **Glassmorphism UI** - Modern, elegant design with backdrop blur effects
- **Mood-Based Theming** - Personalized color schemes based on your emotional state
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Responsive Design** - Optimized for desktop and mobile experiences
- **Privacy-First** - All data stored locally with optional cloud sync

### 🤖 AI-Powered Features

- **Dynamic CBT Questions** - Personalized therapeutic questions using Google Gemini Pro
- **Intelligent Fallbacks** - Graceful degradation when AI services are unavailable
- **Contextual Guidance** - Thought patterns analyzed for targeted interventions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/serenity-space.git
   cd serenity-space
   ```

2. **Backend Setup**
   ```bash
   cd backend
   For Windows PowerShell users only, run this first:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   python -m venv venv
   
   source venv/bin/activate  # On Windows:.\venv\Scripts\Activate
      
   pip install -r requirements.txt

   RUN:
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   OR
   uvicorn server:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   #or
   npm install --force
   RUN:
   npm start
   
   ```

4. **Environment Configuration**
   
   Create `backend/.env`:
   ```env
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=serenity_space
   CORS_ORIGINS=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
   Create `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2 - Frontend
   cd frontend
   yarn start
   # or
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/docs

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with async/await support
- **Database**: MongoDB with Motor async driver
- **AI Integration**: Google Gemini Pro via emergentintegrations
- **Authentication**: JWT-based (optional)
- **CORS**: Configured for cross-origin requests

### Frontend (React)
- **Framework**: React 19 with functional components and hooks
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context for global state
- **Routing**: React Router for navigation

### Key Components

```
frontend/src/
├── components/
│   ├── Dashboard.js          # Main dashboard with statistics
│   ├── ZenMode.js           # Breathing exercises and meditation
│   ├── RelaxingMusic.js     # Ambient soundscapes player
│   ├── VisualEffects.js     # Calming visual experiences
│   ├── CognitiveReframer.js # AI-powered CBT tool
│   ├── JournalArticles.js   # Wellness articles and favorites
│   ├── Settings.js          # Theme customization and analytics
│   ├── Profile.js           # User stats and achievements
│   └── OnboardingFlow.js    # Personalized setup experience
├── context/
│   ├── ThemeContext.js      # Theme and color management
│   └── UserContext.js       # User preferences and state
└── ui/                      # Reusable UI components
```

## 🎯 Usage Guide

### First Time Setup
1. **Landing Experience** - Beautiful animated introduction
2. **Onboarding Flow** - Set your identity, current mood, and preferences
3. **Personalized Theming** - Colors adapt to your emotional state

### Daily Wellness Routine
1. **Start with Zen Mode** - Begin with breathing exercises
2. **Choose Your Ambience** - Select music or visual effects
3. **Reflect and Reframe** - Use CBT tools for negative thoughts
4. **Read and Learn** - Explore wellness articles
5. **Track Progress** - Monitor your wellness journey

### Key Features Explained

#### 🧘 Zen Mode
- **Box Breathing** - 4-4-4-4 pattern for anxiety relief
- **4-7-8 Technique** - Calming breathwork for sleep
- **Equal Breathing** - Balanced inhale/exhale for focus
- **Progress Tracking** - Session duration and completion stats

#### 💭 Cognitive Reframer
- **AI-Powered Questions** - Personalized based on your specific thoughts
- **Thought Pattern Analysis** - Identifies cognitive distortions
- **Session History** - Private journal of your reframing journey
- **Confidence Tracking** - Monitor your progress over time

#### 🎵 Relaxing Music
- **6 Ambient Soundscapes**:
  - Gentle Rain
  - Forest Ambience
  - Ocean Waves
  - Meditation Bells
  - Space Ambience
  - Nature Sounds
- **Real Audio Playback** - HTML5 audio with controls
- **Volume Control** - Adjustable audio levels
- **Progress Tracking** - Visual progress bars

#### 🎨 Visual Effects
- **6 Calming Experiences**:
  - Floating Lotus - Gentle floating petals
  - Stardust Cascade - Peaceful falling particles
  - Meditation Pulse - Synchronized breathing visualization
  - Zen Garden Waves - Flowing water ripples
  - Aurora Dreams - Soft northern lights
  - Sacred Mandala - Rotating spiritual geometry
- **Customizable Controls** - Adjust intensity and speed
- **Therapeutic Design** - Scientifically designed for relaxation

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/` - Health check
- `POST /api/preferences` - Create user preferences
- `GET /api/preferences` - Retrieve user preferences

### CBT & Wellness
- `GET /api/cbt-questions` - Static CBT questions
- `POST /api/cbt-questions/dynamic` - AI-generated personalized questions
- `POST /api/cbt-sessions` - Save CBT session
- `GET /api/cbt-sessions` - Retrieve user sessions
- `DELETE /api/cbt-sessions/{id}` - Delete session

### Zen & Meditation
- `POST /api/zen-sessions` - Track meditation session
- `GET /api/zen-sessions` - Retrieve meditation history

### Content & Analytics
- `GET /api/articles` - Wellness articles
- `POST /api/favorites` - Add article to favorites
- `GET /api/favorites` - Get favorite articles
- `POST /api/analytics` - Track usage
- `GET /api/analytics/summary` - Usage statistics

## 🎨 Theming System

### Mood-Based Colors
The app automatically generates color schemes based on your mood:

- **Anxious** - Calming blues and purples
- **Unfocused** - Energizing greens
- **Sad** - Warm oranges and yellows
- **Stressed** - Soothing reds and pinks
- **Calm** - Peaceful cyans and teals

### Glassmorphism Design
- Backdrop blur effects
- Semi-transparent backgrounds
- Elegant border styling
- Smooth transitions
- Modern aesthetic

## 🔒 Privacy & Security

- **Local Storage First** - All data stored in browser by default
- **Optional Cloud Sync** - MongoDB backup when enabled
- **No Personal Data Collection** - Anonymous usage analytics
- **Encrypted Sessions** - Secure JWT tokens
- **GDPR Compliant** - Full data export and deletion

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest backend_test.py -v
```

### Frontend Testing
```bash
cd frontend
yarn test
# or
npm test
```

### Manual Testing Checklist
- [ ] Onboarding flow completion
- [ ] All 6 wellness modules functional
- [ ] Audio playback working
- [ ] Visual effects rendering
- [ ] AI-powered CBT questions
- [ ] Theme customization
- [ ] Data persistence
- [ ] Responsive design

## 🚀 Deployment

### Backend (Railway/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend (Vercel/Netlify)
1. Connect repository
2. Set build command: `yarn build`
3. Set output directory: `build`
4. Deploy

### Environment Variables
```env
# Backend
MONGO_URL=your_mongodb_connection_string
DB_NAME=serenity_space
CORS_ORIGINS=https://yourdomain.com
GEMINI_API_KEY=your_gemini_api_key

# Frontend
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components
- Write tests for new features
- Update documentation
- Follow the glassmorphism design system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini Pro** - AI-powered therapeutic question generation
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first styling framework
- **Radix UI** - Accessible component primitives
- **MongoDB** - Flexible document database
- **FastAPI** - Modern Python web framework

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/serenity-space/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/serenity-space/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/serenity-space/discussions)
- **Email**: support@serenityspace.app

## 🌟 Roadmap

### Version 2.0
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Community features
- [ ] Therapist integration
- [ ] Voice-guided meditations

### Version 3.0
- [ ] AR/VR meditation experiences
- [ ] Biometric integration
- [ ] Advanced AI coaching
- [ ] Multi-language support
- [ ] Enterprise features

---

**Made with ❤️ for your mental wellness journey**
BY MOULIK GUPTA,VASU SHARMA,DAKSH JAIN

*Serenity Space - Where technology meets tranquility*
