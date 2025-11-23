# Admin Dashboard - Nexus Hub

Admin dashboard for managing the Nexus Hub platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to localhost:3000):
```
VITE_API_BASE_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The admin dashboard will run on `http://localhost:5175`

## Features

- Admin authentication
- Dashboard with statistics
- Users management
- Products management
- Sellers management
- Orders management

## Backend Setup

Make sure you have a user with `admin` role in the database. You can create one by updating a user's roles array to include "admin".

Example MongoDB command:
```javascript
db.users.updateOne(
  { email: "admin@nexushub.com" },
  { $set: { roles: ["admin"] } }
)
```

## Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main dashboard
- `/admin/users` - Users management
- `/admin/products` - Products management
- `/admin/sellers` - Sellers management
- `/admin/orders` - Orders management

