# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account/Cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in to your account
3. Create a new cluster (or use an existing one)
   - Choose a free tier (M0) if you don't have one
   - Select a cloud provider and region
   - Click "Create Cluster"

## Step 2: Create Database User

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter:
   - **Username**: (choose a username, e.g., `kagahealth`)
   - **Password**: (create a strong password - save this!)
5. Set user privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 3: Whitelist Your IP Address

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Choose one of:
   - **"Add Current IP Address"** (for your current location)
   - **"Allow Access from Anywhere"** (use `0.0.0.0/0` - less secure but easier for development)
4. Click **"Confirm"**

## Step 4: Get Your Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as the driver
5. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Update Your .env File

Replace the connection string in your `backend/.env` file:

```env
MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kagaDB?retryWrites=true&w=majority"
```

**Important:**
- Replace `YOUR_USERNAME` with your database username
- Replace `YOUR_PASSWORD` with your database password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
- Replace `kagaDB` with your preferred database name (or keep `kagaDB`)

## Step 6: Test the Connection

After updating your `.env` file, restart your backend server:

```bash
cd backend
npm start
```

You should see:
```
✅ Database Connected to MongoDB
📊 Database: kagaDB
🚀 Server started on PORT: 4000
```

## Troubleshooting

- **Connection timeout**: Make sure your IP is whitelisted in Network Access
- **Authentication failed**: Double-check your username and password
- **Database not found**: MongoDB will create the database automatically when you first write data to it

