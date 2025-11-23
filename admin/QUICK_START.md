# Quick Start - Admin Dashboard Setup

## Step 1: Create Admin User in MongoDB

**Navigate to backend folder and run:**

```bash
cd backend
npm run create-admin
```

This will create the admin user with:
- **Email:** `nexushub002@gmail.com`
- **Password:** `Nexushub@001`
- **Role:** `admin`

The password is securely hashed using bcrypt before storing in MongoDB.

## Step 2: Start Backend Server

**In backend folder:**

```bash
npm start
```

Backend runs on: `http://localhost:3000`

## Step 3: Start Admin Dashboard

**In a new terminal, navigate to admin folder:**

```bash
cd admin
npm install  # First time only
npm run dev
```

Admin dashboard runs on: `http://localhost:5175`

## Step 4: Login

1. Go to: `http://localhost:5175/admin/login`
2. Enter:
   - **Email:** `nexushub002@gmail.com`
   - **Password:** `Nexushub@001`
3. Click "Login"

## How Login Works

✅ **Every login checks MongoDB:**
1. Frontend sends email and password to `/api/admin/login`
2. Backend queries MongoDB for user with email and admin role
3. Backend compares password using bcrypt
4. If match, JWT token is created and stored in cookie
5. Admin dashboard access granted

## Security Features

- ✅ Password hashed with bcrypt (salt rounds: 10)
- ✅ MongoDB verification on every login
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Role-based access control

## Troubleshooting

**If login fails:**
1. Make sure you ran `npm run create-admin` in backend folder
2. Check MongoDB is running and connected
3. Verify backend server is running on port 3000
4. Check backend terminal for error messages

**To reset admin password:**
```bash
cd backend
npm run create-admin
```

