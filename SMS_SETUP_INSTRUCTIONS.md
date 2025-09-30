# SMS Setup Instructions for Real OTP Functionality

## Current Status
- ✅ **Development Mode**: OTPs are logged to console (works without any setup)
- 🔧 **Production Mode**: Real SMS can be enabled with free API key

## How to Enable Real SMS (FREE)

### Option 1: Fast2SMS (Recommended - 50 free SMS/day)

1. **Sign up for Fast2SMS**
   - Go to: https://www.fast2sms.com/
   - Click "Sign Up" and create a free account
   - Verify your mobile number

2. **Get API Key**
   - Login to your Fast2SMS dashboard
   - Go to "Dev API" section
   - Copy your API key

3. **Configure Backend**
   - Open `backend/.env` file
   - Replace `YOUR_FAST2SMS_API_KEY` with your actual API key:
   ```
   FAST2SMS_API_KEY=your_actual_api_key_here
   ```

4. **Restart Backend Server**
   ```bash
   cd backend
   node server.js
   ```

### Option 2: Alternative Free SMS Services

#### TextLocal (Free tier available)
- Website: https://www.textlocal.in/
- Free credits: 25 SMS
- API documentation available

#### MSG91 (Free tier)
- Website: https://msg91.com/
- Free credits: 100 SMS
- Good for testing

## How It Works

### Development Mode (Default)
- No API key needed
- OTP is printed in backend console
- Perfect for testing and development

### Production Mode (With API Key)
- Real SMS sent to mobile numbers
- OTP delivered within seconds
- Fallback to console if SMS fails

## Testing the System

1. **Start Backend**: `node server.js`
2. **Start Frontend**: `npm run dev`
3. **Test Login**:
   - Click "Account" in navbar
   - Enter valid 10-digit mobile number (6-9 starting)
   - Check console for OTP (development mode)
   - Or receive SMS (production mode)

## Security Features

✅ **Phone Validation**: Only Indian mobile numbers (10 digits, starts with 6-9)
✅ **OTP Expiry**: 5 minutes automatic expiry
✅ **Rate Limiting**: Prevents spam requests
✅ **Secure Storage**: OTPs stored temporarily in MongoDB
✅ **Auto Cleanup**: Used/expired OTPs automatically deleted

## Troubleshooting

### "Network error" in frontend
- Make sure backend is running on port 3000
- Check CORS configuration includes your frontend port

### SMS not received
- Verify API key is correct
- Check Fast2SMS dashboard for credits
- OTP will be logged to console as fallback

### Invalid phone number
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- No country code needed (+91 is added automatically)

## Cost Information

- **Fast2SMS**: 50 free SMS/day, then ₹0.20 per SMS
- **TextLocal**: 25 free SMS, then paid plans
- **MSG91**: 100 free SMS, then paid plans

## Production Deployment

For production deployment:
1. Use environment variables for API keys
2. Enable HTTPS for secure cookie handling
3. Set up proper rate limiting
4. Monitor SMS usage and costs
