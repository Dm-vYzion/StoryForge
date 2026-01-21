# StoryForge - Vercel Deployment Guide

## Overview

StoryForge is an AI-powered interactive fiction platform with a React frontend and FastAPI backend deployed as serverless functions on Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas** - Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Push to GitHub

Ensure your repository is pushed to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/storyforge.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `cd frontend && yarn build`
   - **Output Directory**: `frontend/build`

### 3. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/storyforge` | Production, Preview, Development |
| `DB_NAME` | `storyforge` | Production, Preview, Development |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Production, Preview, Development |
| `REACT_APP_BACKEND_URL` | `` (empty string) | Production, Preview, Development |

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Project Structure

```
/
├── api/                    # Vercel Serverless Functions
│   ├── index.py           # FastAPI application
│   └── requirements.txt   # Python dependencies
├── backend/               # Backend source (referenced by api/)
│   ├── models.py
│   ├── seed_data.py
│   └── services/
├── frontend/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json           # Vercel configuration
└── .vercelignore         # Files to ignore during deployment
```

## API Routes

All API routes are available at `/api/*`:

- `GET /api` - Health check
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/{id}` - Get campaign details
- `POST /api/campaigns/{id}/start` - Start a game session
- `POST /api/sessions/{id}/action` - Submit player action
- `GET /api/sessions/{id}/journal` - Get journal entries
- `POST /api/sessions/{id}/journal` - Add journal entry

## Troubleshooting

### MongoDB Connection Issues

- Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (Network Access)
- Verify the connection string format: `mongodb+srv://user:password@cluster.mongodb.net/database`

### API Timeout

Vercel serverless functions have a 10-second timeout on the Hobby plan. If AI responses are timing out:
- Upgrade to Pro plan (60-second timeout)
- Or implement response streaming

### Build Failures

- Check Node.js version compatibility (Vercel uses 18.x by default)
- Ensure all dependencies are listed in `package.json`
- Check for case-sensitivity issues in imports

## Local Development

```bash
# Install dependencies
cd frontend && yarn install

# Run frontend
yarn start

# Run backend (in another terminal)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

## Environment Variables for Local Development

Create `/frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Create `/backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=storyforge
GEMINI_API_KEY=your-key-here
```
