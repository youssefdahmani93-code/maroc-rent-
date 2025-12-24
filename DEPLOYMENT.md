# Deployment Guide - GoRent Application

## 📋 Overview

This guide will help you deploy the GoRent application using:
- **Frontend**: Vercel (Vite/React)
- **Backend**: Vercel Serverless Functions
- **Database**: Neon (PostgreSQL)

---

## 🚀 Step 1: Setup Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project named `gorent`

### 1.2 Get Database Connection String
1. In your Neon dashboard, go to **Connection Details**
2. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/gorent?sslmode=require
   ```
3. Save this for later - you'll need it for Vercel

### 1.3 Run Database Migrations
1. Update your local `.env` file with the Neon connection string:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/gorent?sslmode=require
   ```

2. Run migrations from the backend directory:
   ```bash
   cd backend
   npm install
   node src/migrations/20251124_add_missing_tables.sql
   ```

---

## 🐙 Step 2: Push to GitHub

### 2.1 Verify Git Status
```bash
git status
```

Make sure `.env` is NOT listed (it should be ignored by `.gitignore`)

### 2.2 Add and Commit Files
```bash
git add .
git commit -m "Prepare for deployment: Add .gitignore and Vercel config"
```

### 2.3 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name it `go-rent` or `maroc-rent`
4. **Do NOT** initialize with README (you already have one)
5. Click **Create Repository**

### 2.4 Push to GitHub
```bash
# If you haven't set the remote yet:
git remote add origin https://github.com/YOUR_USERNAME/go-rent.git

# Push your code
git push -u origin main
```

---

## ☁️ Step 3: Deploy Frontend to Vercel

### 3.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login (use GitHub account for easier integration)
3. Click **Add New Project**
4. Import your `go-rent` repository from GitHub

### 3.2 Configure Project Settings
When importing, configure these settings:

**Framework Preset**: `Vite`

**Root Directory**: `frontend`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

### 3.3 Add Environment Variables
In the Vercel project settings, add these environment variables:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-project.vercel.app/api` (you'll update this after backend deployment) |

### 3.4 Deploy
Click **Deploy** and wait for the build to complete.

---

## 🔧 Step 4: Deploy Backend to Vercel

### 4.1 Create API Routes for Vercel Serverless

Since Vercel doesn't support traditional Express servers, you have two options:

**Option A: Deploy Backend Separately** (Recommended)
- Use Railway, Render, or Fly.io for the Express backend
- These platforms support long-running Node.js servers
- Update `VITE_API_URL` in Vercel to point to your backend URL

**Option B: Convert to Vercel Serverless Functions**
- Requires refactoring your Express routes to Vercel's API format
- More complex but keeps everything on Vercel

### 4.2 Recommended: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up and create a new project
3. Click **Deploy from GitHub repo**
4. Select your `go-rent` repository
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

6. Add environment variables in Railway:
   ```env
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_jwt_secret_from_.env
   PORT=3000
   ```

7. Deploy and copy the Railway URL (e.g., `https://go-rent-backend.railway.app`)

8. Update Vercel environment variable:
   - Go back to Vercel dashboard
   - Update `VITE_API_URL` to your Railway URL
   - Redeploy the frontend

---

## 🔐 Step 5: Environment Variables Reference

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway/Render)
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/gorent?sslmode=require
JWT_SECRET=your_very_long_and_random_secret_string
PORT=3000
NODE_ENV=production
```

---

## ✅ Step 6: Verification

### 6.1 Test Frontend
1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check if the page loads correctly

### 6.2 Test Backend API
1. Test an API endpoint: `https://your-backend-url.railway.app/api/health`
2. Should return a success response

### 6.3 Test Database Connection
1. Try logging in or creating a user
2. Verify data is saved to Neon database

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Make sure `node_modules` is not committed

### API Connection Errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Ensure backend is running on Railway/Render

### Database Connection Fails
- Verify Neon connection string is correct
- Check if IP whitelist is enabled (Neon allows all by default)
- Ensure `sslmode=require` is in the connection string

### Environment Variables Not Working
- Redeploy after adding/changing environment variables
- For Vite, variables must start with `VITE_`
- Check variable names for typos

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🔄 Continuous Deployment

Once set up, any push to the `main` branch will automatically:
1. Trigger a new deployment on Vercel (frontend)
2. Trigger a new deployment on Railway (backend)
3. Your changes will be live in minutes!

---

## 📞 Support

If you encounter issues:
1. Check the build logs in Vercel/Railway dashboard
2. Review the troubleshooting section above
3. Verify all environment variables are set correctly
