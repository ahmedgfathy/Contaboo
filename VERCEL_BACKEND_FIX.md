# 🔧 Vercel Backend Connection Fix Guide

## Problem
Your Vercel frontend at `contaboo.com` only shows data when you run the local backend (`npm run dev` in backend folder). This means the frontend is trying to connect to your local machine instead of the deployed serverless functions.

## Solution Steps

### 1. 🔍 Check Current Vercel Environment Variables

Visit your Vercel dashboard and check if these environment variables are set:

**Required Environment Variables in Vercel:**
```
DATABASE_URL = your_neon_database_connection_string
VITE_OPENAI_API_KEY = your_openai_api_key  
VITE_API_URL = /api
```

### 2. 🔧 Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `contaboo` project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

```bash
# Database connection (most important!)
DATABASE_URL = postgresql://username:password@host/database?sslmode=require

# Frontend API URL (should point to serverless functions)
VITE_API_URL = /api

# OpenAI API Key (if using AI features)
VITE_OPENAI_API_KEY = sk-proj-...your-key...

# Other optional variables
VITE_AI_MODEL = gpt-4o-mini
VITE_ENABLE_AI_FEATURES = true
```

### 3. 🧪 Test Your Serverless Functions

After setting environment variables, test these URLs:

- **Health Check**: https://contaboo.com/api/health
- **Properties**: https://contaboo.com/api/properties
- **Stats**: https://contaboo.com/api/stats

If these return errors, your `DATABASE_URL` is not set correctly.

### 4. 🚀 Redeploy if Needed

If environment variables were missing, redeploy:

```bash
# Use the deployment script
./deploy-vercel.sh

# Or manually
npm run build
vercel --prod
```

### 5. 🔍 Debug Steps

If still not working:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard > Your Project > Functions tab
   - Check logs for any errors

2. **Test Database Connection:**
   - Verify your Neon database is accessible
   - Check if `DATABASE_URL` is correct

3. **Check Network Tab:**
   - Open browser DevTools > Network tab
   - See if API calls are going to `/api/*` endpoints
   - Check for any 404 or 500 errors

### 6. 📝 Common Issues & Fixes

**Issue: API calls go to localhost**
- **Fix**: Make sure `VITE_API_URL=/api` is set in Vercel environment variables

**Issue: Database connection errors**
- **Fix**: Verify `DATABASE_URL` is correct and includes `?sslmode=require`

**Issue: 500 errors on API endpoints**
- **Fix**: Check Vercel function logs for specific error messages

**Issue: CORS errors**
- **Fix**: Serverless functions should already include CORS headers

### 7. ✅ Success Indicators

Your deployment is working correctly when:

- ✅ https://contaboo.com loads without local backend running
- ✅ https://contaboo.com/api/health returns `{"status": "ok"}`
- ✅ Property data loads on the homepage
- ✅ Search functionality works
- ✅ No console errors about failed API calls

### 8. 🛠️ Quick Fix Commands

```bash
# Test health endpoint
curl https://contaboo.com/api/health

# Redeploy quickly
vercel --prod

# Check if production build works locally
npm run build
npm run preview
```

## Expected Result

After following these steps, your `contaboo.com` website should work independently without needing your local backend server running. All data will be served through Vercel serverless functions connected to your Neon database.
