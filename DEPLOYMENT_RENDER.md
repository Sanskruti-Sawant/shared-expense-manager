# Deployment Guide - Render.com

## 🚀 Deploy to Render (Free Tier)

### Prerequisites
- GitHub account (to push your code)
- Render account (https://render.com - free signup)
- Git installed locally

---

## PART 1: Prepare Your Code for Deployment

### Step 1.1: Initialize Git Repository (if not already done)
```bash
cd C:\Users\Sanskruti\Desktop\coding\C++
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### Step 1.2: Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `shared-expense-manager`
3. Do NOT initialize with README (already have it)
4. Click "Create repository"
5. Follow GitHub's instructions:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shared-expense-manager.git
git branch -M main
git push -u origin main
```

---

## PART 2: Deploy Backend to Render

### Step 2.1: Create Backend Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → Select "Web Service"
3. Click "Connect a repository" → Select your `shared-expense-manager` repo
4. Fill in details:
   - **Name:** `shared-expense-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Advanced" and add Environment Variables:
   ```
   PORT = 5000
   NODE_ENV = production
   JWT_SECRET = your-secret-key-change-this-to-random-string
   ```
6. Click "Create Web Service"

### Step 2.2: Get Backend URL
- Wait for deployment to complete (~2-3 minutes)
- Copy the URL from the dashboard (e.g., `https://shared-expense-backend.onrender.com`)
- Save this URL! You'll need it for the frontend.

---

## PART 3: Deploy Frontend to Render

### Step 3.1: Update Frontend API Base URL
Edit `frontend/src/utils/api.js` and change:
```javascript
// OLD:
const API_BASE_URL = 'http://localhost:5000/api';

// NEW (use your backend URL from Step 2.2):
const API_BASE_URL = 'https://shared-expense-backend.onrender.com/api';
```

### Step 3.2: Create Frontend Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → Select "Static Site"
3. Click "Connect a repository" → Select your `shared-expense-manager` repo
4. Fill in details:
   - **Name:** `shared-expense-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
5. Click "Create Static Site"

### Step 3.3: Wait for Deployment
- Render will build and deploy automatically
- Once complete, you'll get a URL like: `https://shared-expense-frontend.onrender.com`

---

## PART 4: Test Your Deployment

1. **Visit your frontend:** https://shared-expense-frontend.onrender.com
2. **Test login/signup** - Should work now!
3. **Add some expenses** - Your data is saved in the SQLite database
4. **Check backend health:** `https://shared-expense-backend.onrender.com/api/health`

---

## 🔧 Important Notes

### Cold Starts
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep will take 30+ seconds (cold start)
- This is normal and free! Upgrade if you want always-on

### Database
- Using SQLite (local file storage)
- Data persists on Render's servers
- **WARNING:** Render may clear file storage on redeploys. For production, consider PostgreSQL

### Future Improvements
- Add PostgreSQL database for persistent data
- Set up automatic deploys on GitHub push
- Add custom domain

---

## 📋 Quick Checklist

- [ ] GitHub repository created and code pushed
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Render
- [ ] Login/signup tested
- [ ] Data persistence verified

---

## ⚠️ Environment Variables to Change

**IMPORTANT:** Before pushing to production, change these in Render dashboard:

1. **JWT_SECRET** - Use a strong random string:
   ```
   openssl rand -base64 32
   ```
   (Or any random 32+ character string)

2. **NODE_ENV** - Keep as `production`

---

## 🆘 Troubleshooting

**Frontend shows 404 errors?**
- Check that backend URL in `frontend/src/utils/api.js` is correct
- Rebuild and redeploy frontend

**Backend not responding?**
- Check Render dashboard for errors
- Verify environment variables are set
- Check that `npm start` works locally first

**Database issues?**
- Try first deployment with fresh database
- Check backend logs in Render dashboard

---

**Your App is Now Live! 🎉**
