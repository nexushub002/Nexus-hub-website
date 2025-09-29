# Seller Authentication with Session Management

## Overview
This implementation adds cookie-based session management to the seller frontend, allowing sellers to stay logged in across browser sessions and automatically redirecting authenticated users to the dashboard.

## Key Features

### 🔐 Session Management
- **Cookie-based authentication**: Uses HTTP-only cookies for secure session storage
- **Automatic session checking**: Verifies authentication status on app load
- **Persistent login**: Sellers remain logged in across browser sessions
- **Automatic logout**: Sessions expire after 7 days

### 🚀 User Experience
- **Smart redirects**: Authenticated users are automatically redirected to dashboard
- **Protected routes**: Dashboard and add-product pages require authentication
- **Dynamic navbar**: Shows different buttons based on authentication status
- **Welcome message**: Displays seller name/email when logged in

## Implementation Details

### Frontend Changes

#### 1. SellerContext (`src/context/SellerContext.jsx`)
- Centralized authentication state management
- Automatic session verification on app load
- Login, logout, and registration functions
- Loading states for better UX

#### 2. App.jsx Updates
- Added `SellerProvider` wrapper
- Implemented `ProtectedRoute` component for authenticated pages
- Implemented `PublicRoute` component to redirect logged-in users
- Route protection for dashboard and add-product pages

#### 3. Navbar.jsx Updates
- Dynamic button display based on authentication status
- Shows "Login" and "Sign Up" for unauthenticated users
- Shows "Dashboard" and "Logout" for authenticated users
- Welcome message with seller name/email
- Smart "Start Selling" button behavior

#### 4. Authentication Pages
- **SellerSignin.jsx**: Uses context for login with automatic redirect
- **Sellersignup.jsx**: Uses context for registration with automatic redirect
- Both pages redirect to dashboard on successful authentication

### Backend Changes

#### 1. SellerAuth Middleware (`middleware/sellerAuth.js`)
- Updated to check both Authorization header and cookies
- Proper role validation for seller access
- Enhanced error handling

#### 2. SellerAuth Routes (`routes/sellerAuthRoutes.js`)
- Fixed JWT token structure to use `roles` array consistently
- Added cookie setting in both login and registration routes
- Enhanced response data with user information

## How It Works

### Login Flow
1. User enters credentials in signin form
2. Frontend sends request to backend with `credentials: 'include'`
3. Backend validates credentials and sets HTTP-only cookie
4. Frontend context updates authentication state
5. User is automatically redirected to dashboard

### Registration Flow
1. User fills registration form
2. Backend creates user account with seller role
3. Backend sets authentication cookie
4. User is automatically logged in and redirected to dashboard

### Session Persistence
1. On app load, frontend checks authentication status via `/me` endpoint
2. Backend middleware validates cookie and returns user data
3. Frontend context updates state based on response
4. Routes render appropriate components based on authentication status

### Logout Flow
1. User clicks logout button
2. Frontend calls logout endpoint
3. Backend clears authentication cookie
4. Frontend context clears user state
5. User is redirected to homepage

## Security Features

- **HTTP-only cookies**: Prevents XSS attacks
- **Secure cookies**: HTTPS-only in production
- **SameSite protection**: Prevents CSRF attacks
- **JWT expiration**: Tokens expire after 7 days
- **Role-based access**: Only sellers can access protected routes

## Usage

### For Developers
1. The `useSeller()` hook provides access to authentication state
2. Use `ProtectedRoute` wrapper for authenticated pages
3. Use `PublicRoute` wrapper for pages that should redirect logged-in users
4. Authentication state is automatically managed by the context

### For Users
1. **First time**: Register with email/password to create seller account
2. **Returning users**: Login with existing credentials
3. **Automatic login**: Stay logged in across browser sessions
4. **Easy access**: Dashboard button appears in navbar when logged in
5. **Secure logout**: Click logout to end session and clear cookies

## Technical Notes

- Cookies are set with 7-day expiration
- Session validation happens on every app load
- All API requests include credentials for cookie handling
- CORS is configured to allow credentials from frontend domains
- Backend uses MongoDB for session storage (optional)

This implementation provides a seamless, secure, and user-friendly authentication experience for sellers on the NexusHub platform.
