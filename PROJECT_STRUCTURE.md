# HOMI - AI Journaling Companion

## Project Structure

```
HOMI-A-journal-friend/
├── .git/                 # Git version control
├── node_modules/         # Dependencies (ignored in git)
├── Public/               # Static files served as-is
│   └── index.html        # Main HTML entry point
├── src/                  # Frontend source code
│   ├── components/       # React components
│   │   ├── AIResponse.jsx  # AI response display
│   │   ├── AuthPage.jsx    # Authentication UI
│   │   ├── DashboardPage.jsx # User dashboard
│   │   ├── EntryCard.jsx    # Journal entry component
│   │   ├── FloatingLeaves.jsx # Decorative elements
│   │   ├── JournalPage.jsx   # Main journal interface
│   │   └── LandingPage.jsx   # Public landing page
│   ├── firebase.js       # Firebase configuration
│   ├── index.js          # React entry point
│   └── index.css         # Global styles
├── server/               # Backend server
│   ├── index.js          # Express server setup
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables (ignored in git)
├── api/                  # API routes
│   └── journal-entries/  # Journal entry endpoints
├── .gitignore           # Git ignore rules
├── package.json         # Frontend dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── vite.config.js       # Vite build configuration
```

## Configuration Files

### 1. Frontend (Vite + React)
- **vite.config.js**: Build configuration for Vite
- **tailwind.config.js**: Tailwind CSS theming and customization
- **postcss.config.js**: PostCSS plugins configuration

### 2. Backend (Node.js + Express)
- **server/package.json**: Backend dependencies and scripts
- **server/index.js**: Main server file with API routes

### 3. Environment Variables
Create a `.env` file in the root with:
```
VITE_API_BASE_URL=your_api_url
# Other environment variables
```

## Development Setup

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

2. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm start
   
   # Or start them separately
   # Frontend
   npm run dev
   # Backend (in a separate terminal)
   npm run server
   ```

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `npm start`
6. Add environment variables

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set framework preset to Vite
4. Add environment variables
5. Deploy

## Key Dependencies

### Frontend
- React 18
- React Router 6
- Tailwind CSS 3
- Firebase 10
- date-fns

### Backend
- Express.js
- Firebase Admin
- MongoDB
- CORS
- dotenv
