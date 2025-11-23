# Admin Login Credentials

## Default Admin Account

**Email:** `nexushub002@gmail.com`  
**Password:** `Nexushub@001`

## Security Notes

- The password is securely hashed using bcrypt before storing in MongoDB
- The password is never stored in plain text
- All login attempts are verified against MongoDB database
- The admin user must have the "admin" role in the database

## Setup Instructions

### Step 1: Create Admin User in MongoDB

Run this command in the backend folder:

```bash
npm run create-admin
```

This script will:
- Connect to MongoDB
- Create or update the admin user with the specified credentials
- Hash the password securely using bcrypt
- Set the admin role
- Verify the user was created successfully

### Step 2: Verify Admin User

After running the script, you should see:
```
✅ Admin user created successfully!
   Email: nexushub002@gmail.com
   Password: Nexushub@001
   Role: admin
```

### Step 3: Login to Admin Dashboard

1. Navigate to: `http://localhost:5175/admin/login`
2. Enter the credentials:
   - Email: `nexushub002@gmail.com`
   - Password: `Nexushub@001`
3. Click "Login"

## How It Works

1. **Login Request**: When you enter credentials, the frontend sends them to `/api/admin/login`
2. **MongoDB Check**: The backend queries MongoDB to find a user with:
   - Email: `nexushub002@gmail.com`
   - Role: `admin`
3. **Password Verification**: The backend uses bcrypt to compare the entered password with the hashed password stored in MongoDB
4. **Authentication**: If credentials match, a JWT token is generated and stored in an HTTP-only cookie
5. **Access Granted**: The admin dashboard is accessible

## Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token authentication
- ✅ HTTP-only cookies (prevents XSS attacks)
- ✅ MongoDB verification on every login
- ✅ Role-based access control

## Troubleshooting

### Cannot Login

1. **Check if admin user exists:**
   ```bash
   npm run create-admin
   ```

2. **Verify MongoDB connection:**
   - Make sure MongoDB is running
   - Check `.env` file has correct `MONGO_URL`

3. **Check backend logs:**
   - Look for error messages in the terminal
   - Check for "Admin login attempt failed" messages

### Reset Admin Password

To reset the admin password, run:
```bash
npm run create-admin
```

This will update the existing admin user with the default password.

## Manual MongoDB Query

If you need to manually check or update the admin user in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.findOne({ email: "nexushub002@gmail.com" })

// To manually set admin role:
db.users.updateOne(
  { email: "nexushub002@gmail.com" },
  { $set: { roles: ["admin"] } }
)
```

