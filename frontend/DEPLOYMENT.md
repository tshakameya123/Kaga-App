# Frontend Deployment Guide

## Environment Variables Required

Set these environment variables in your Render dashboard:

- `VITE_BACKEND_URL`: Your backend API URL (e.g., https://your-backend.onrender.com)

## Render Deployment Settings

### For Static Site (Recommended):
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 or higher

### For Web Service:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher

## Local Development

1. Create a `.env` file in the frontend directory
2. Add: `VITE_BACKEND_URL=http://localhost:4000`
3. Run: `npm run dev`
