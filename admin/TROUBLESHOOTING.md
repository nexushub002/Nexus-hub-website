# Admin Login Troubleshooting Guide

## Problem: "Invalid credentials" Error

If you're getting "Invalid credentials" even with correct email and password, follow these steps:

### Step 1: Create/Update Admin User

**Run this command in the backend folder:**

```bash
cd backend
npm run create-admin
```

This will:
- Create the admin user if it doesn't exist
- Update the password if the user exists
- Set the admin role
- Verify the user was created correctly

**Expected output:**
```
✅ Connected to MongoDB
✅ Admin user created successfully!
   Email: nexushub002@gmail.com
   Password: Nexushub@001
   Role: admin

✅ Admin user verified in database
   ID: [user-id]
   Email: nexushub002@gmail.com
   Roles: admin
   ✅ Password verification test: PASSED
```

### Step 2: Test Admin Login

**Test if the admin credentials work:**

```bash
cd backend
npm run test-admin
```

This will verify:
- Admin user exists in MongoDB
- Admin has the correct role
- Password verification works

**Expected output:**
```
✅ Admin user found
✅ Password verification: SUCCESS
✅ Admin login test PASSED!
```

### Step 3: Check Backend Server

**Make sure backend is running:**

```bash
cd backend
npm start
```

Backend should be running on `http://localhost:3000`

### Step 4: Check Backend Logs

When you try to login, check the backend terminal for messages:

**If user not found:**
```
❌ Admin login attempt failed: User not found or not admin - nexushub002@gmail.com
```

**If password wrong:**
```
❌ Admin login attempt failed: Invalid password for - nexushub002@gmail.com
```

**If successful:**
```
✅ Admin login successful: nexushub002@gmail.com
```

### Step 5: Verify MongoDB Connection

Make sure MongoDB is running and connected. Check your `.env` file:

```
MONGO_URL=your_mongodb_connection_string
```

### Step 6: Common Issues

#### Issue 1: Admin User Doesn't Exist
**Solution:** Run `npm run create-admin` in backend folder

#### Issue 2: Wrong Role
**Solution:** The user might exist but doesn't have "admin" role. Run `npm run create-admin` to fix.

#### Issue 3: Password Hash Mismatch
**Solution:** Run `npm run create-admin` to reset the password hash.

#### Issue 4: Email Case Sensitivity
**Solution:** The system now handles this automatically, but make sure you're using: `nexushub002@gmail.com`

#### Issue 5: Backend Not Running
**Solution:** Start backend server with `npm start` in backend folder

#### Issue 6: CORS Issues
**Solution:** Make sure backend `server.js` includes `http://localhost:5175` in CORS origins

### Step 7: Manual MongoDB Check

If you want to manually check the admin user in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.findOne({ email: "nexushub002@gmail.com" })

// Should show:
// {
//   _id: ObjectId("..."),
//   email: "nexushub002@gmail.com",
//   password: "$2a$10$...", // hashed password
//   roles: ["admin"],
//   name: "Nexus Hub Admin"
// }
```

### Quick Fix Command

**If nothing works, run this complete reset:**

```bash
cd backend
npm run create-admin
npm run test-admin
```

If test passes, try logging in again.

## Still Having Issues?

1. Check backend terminal for error messages
2. Verify MongoDB is connected
3. Make sure backend server is running
4. Check browser console for network errors
5. Verify you're using the correct credentials:
   - Email: `nexushub002@gmail.com`
   - Password: `Nexushub@001`

