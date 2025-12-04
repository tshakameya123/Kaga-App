# Render Deployment Guide for Kaga Health App

## 🚀 Quick Deployment Steps

### Option 1: Blueprint Deployment (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Click **"New"** → **"Blueprint"**

3. **Connect your repository**
   - Select your GitHub repo: `kh-app`
   - Render will detect the `render.yaml` file automatically

4. **Configure Environment Variables**
   After the services are created, add these environment variables for each service:

---

## 📋 Environment Variables

### Backend Service (`kh-backend`)

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Auto-generated | Secret for JWT tokens |
| `CLOUDINARY_NAME` | `dhpxotbzg` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `348656462326934` | Cloudinary API key |
| `CLOUDINARY_SECRET_KEY` | `l6Wl...` | Cloudinary secret key |
| `ADMIN_EMAIL` | `kagahealth@gmail.com` | Admin login email |
| `ADMIN_PASSWORD` | Your admin password | Admin login password |
| `EMAIL_USER` | `mactimothy07@gmail.com` | Gmail for sending emails |
| `EMAIL_APP_PASSWORD` | Your app password | Gmail app password |
| `FRONTEND_URL` | `https://kagahealth.onrender.com` | Frontend URL for password reset links |
| `CURRENCY` | `UGX` | Currency symbol |

### Frontend Service (`kagahealth`)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://kh-backend.onrender.com` | Backend API URL |

### Admin Service (`kh-admin`)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://kh-backend.onrender.com` | Backend API URL |

---

## 📝 Option 2: Manual Deployment

### Step 1: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `kh-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (see table above)
6. Click **"Create Web Service"**

### Step 2: Deploy Frontend

1. Click **"New"** → **"Web Service"**
2. Connect the same repo
3. Configure:
   - **Name**: `kagahealth`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add `VITE_BACKEND_URL` with your backend URL
5. Click **"Create Web Service"**

### Step 3: Deploy Admin Dashboard

1. Click **"New"** → **"Web Service"**
2. Connect the same repo
3. Configure:
   - **Name**: `kh-admin`
   - **Root Directory**: `admin-doc`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add `VITE_BACKEND_URL` with your backend URL
5. Click **"Create Web Service"**

---

## 🔗 Your Deployed URLs

After deployment, your services will be available at:

| Service | URL |
|---------|-----|
| Backend API | `https://kh-backend.onrender.com` |
| Patient Portal | `https://kagahealth.onrender.com` |
| Admin Dashboard | `https://kh-admin.onrender.com` |

---

## ⚠️ Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to "Starter" plan ($7/month) for always-on services

### CORS Configuration
The backend is already configured to accept requests from any origin. If you need to restrict this, update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://kagahealth.onrender.com',
    'https://kh-admin.onrender.com'
  ],
  credentials: true
}));
```

### MongoDB Atlas Network Access
Make sure your MongoDB Atlas cluster allows connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)

---

## 🔄 Updating Your Deployment

Render automatically redeploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from anywhere

### Frontend shows "Network Error"
- Verify `VITE_BACKEND_URL` is set correctly
- Check if backend service is running
- Wait for backend to spin up (free tier)

### Password reset emails not sending
- Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set
- Ensure Gmail app password is correct
- Check backend logs for email errors

### Images not uploading
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for errors

---

## 📊 Monitoring

- View logs: Render Dashboard → Select Service → Logs
- View metrics: Render Dashboard → Select Service → Metrics
- Set up alerts: Render Dashboard → Account Settings → Notifications
