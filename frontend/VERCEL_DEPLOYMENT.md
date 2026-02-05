# Vercel Deployment Guide

## Quick Deploy Steps

1. **Push the latest changes to GitHub** (Already done ✅)

2. **In Vercel Dashboard:**
   - Go to your project settings
   - Under "Build & Development Settings":
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - **Root Directory:** `frontend` (Important!)

3. **Environment Variables:**
   - Add in Vercel project settings:
     - `VITE_API_URL` = `your-backend-url` (e.g., Railway/Render URL)
   
4. **Redeploy** from Vercel dashboard

## What Was Fixed

The `vercel.json` file now includes:
- SPA routing configuration (all routes redirect to index.html)
- This fixes the 404 errors you were seeing

## Backend Deployment

The Python backend needs to be deployed separately to:
- **Railway** (recommended): https://railway.app
- **Render**: https://render.com
- **Vercel Serverless Functions** (requires modifications)

Once deployed, update the `VITE_API_URL` in frontend to point to your backend URL.

## Testing Locally

```bash
# Frontend
npm run build
npm run preview

# Backend (in another terminal)
cd ../backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
