# Admin Dashboard Setup Commands

## Step 1: Navigate to Admin Folder
```bash
cd admin
```

## Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- React
- React Router DOM
- Tailwind CSS
- Vite
- ESLint

## Step 3: Start Development Server
```bash
npm run dev
```

The admin dashboard will start on: **http://localhost:5175**

## Step 4: Make sure Backend is Running
In a separate terminal, navigate to backend folder and start the server:
```bash
cd backend
npm start
```

Backend should run on: **http://localhost:3000**

## Other Available Commands

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Linter
```bash
npm run lint
```

## Quick Setup (All in One)

If you're in the root directory:
```bash
# Install admin dependencies
cd admin && npm install && cd ..

# Start backend (in one terminal)
cd backend && npm start

# Start admin dashboard (in another terminal)
cd admin && npm run dev
```

## Important Notes

1. **Create Admin User First**: Before logging in, make sure you have a user with admin role in MongoDB:
   ```javascript
   // Connect to MongoDB and run:
   db.users.updateOne(
     { email: "admin@nexushub.com" },
     { $set: { roles: ["admin"] } }
   )
   ```

2. **Environment Variables**: The admin dashboard uses `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:3000`)

3. **Port**: Admin dashboard runs on port **5175** by default (configured in `vite.config.js`)

## Troubleshooting

### Port Already in Use
If port 5175 is already in use, you can change it in `vite.config.js`:
```javascript
server: {
  port: 5176, // Change to any available port
}
```

### Dependencies Installation Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Connection Issues
Make sure:
- Backend server is running on port 3000
- CORS is configured to allow `http://localhost:5175`
- MongoDB is connected

