# Environment Configuration Template
# Copy the Razorpay section to your .env file

# ============================================
# RAZORPAY PAYMENT GATEWAY CONFIGURATION
# ============================================

# Your Razorpay Key ID (Public Key - Safe to expose)
# Get this from: https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx

# Your Razorpay Key Secret (KEEP THIS SECRET! Never commit to version control)
# Get this from: https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

# ============================================
# TEST MODE vs LIVE MODE
# ============================================

# TEST MODE (Development)
# Keys start with: rzp_test_
# Use test card: 4111 1111 1111 1111
# Money is NOT charged

# LIVE MODE (Production)
# Keys start with: rzp_live_
# Real payments are processed
# Switch only when ready for production!

# ============================================
# HOW TO GET YOUR KEYS
# ============================================

# 1. Go to https://razorpay.com
# 2. Sign up or Login
# 3. Go to Dashboard → Settings → API Keys
# 4. Click "Create New API Key"
# 5. Copy "Key ID" and "Key Secret"
# 6. Replace values above
# 7. Save this file
# 8. Never commit .env to git!

# ============================================
# EXAMPLE CONFIGURATION
# ============================================

# Development (Test Mode)
# RAZORPAY_KEY_ID=rzp_test_9s6RxqIpFxfDhb
# RAZORPAY_KEY_SECRET=tDQv9zMbH2xYy8kN3pQr5w

# Production (Live Mode)
# RAZORPAY_KEY_ID=rzp_live_9s6RxqIpFxfDhb
# RAZORPAY_KEY_SECRET=tDQv9zMbH2xYy8kN3pQr5w

# ============================================
# TEST CARD DETAILS (For Development Only)
# ============================================

# Successful Payment:
# Card Number: 4111 1111 1111 1111
# Expiry: Any future date (e.g., 12/25)
# CVV: Any 3 digits (e.g., 123)
# OTP: Any 6 digits (e.g., 111111)

# Failed Payment:
# Card Number: 5555 5555 5554 4447
# Same expiry and CVV
# Will decline automatically

# ============================================
# SECURITY NOTES
# ============================================

# 1. KEY_SECRET is sensitive - keep it private
# 2. Never share your keys with others
# 3. Create separate keys for production
# 4. Rotate keys periodically for security
# 5. Use different keys for dev/prod
# 6. Never commit .env to version control
# 7. Add .env to .gitignore
# 8. Use environment variables in deployment

# ============================================
# VERIFICATION CHECKLIST
# ============================================

# Before running the booking system:
# [ ] Added RAZORPAY_KEY_ID to .env
# [ ] Added RAZORPAY_KEY_SECRET to .env
# [ ] NODE_ENV=development (for testing)
# [ ] Restarted Node server after changes
# [ ] Test payment works with test card
# [ ] Booking saved in database

# Before going to production:
# [ ] Created new Razorpay API keys (live mode)
# [ ] Updated RAZORPAY_KEY_ID with live key
# [ ] Updated RAZORPAY_KEY_SECRET with live secret
# [ ] Set NODE_ENV=production
# [ ] Tested with real card (small amount)
# [ ] Verified HTTPS is enabled
# [ ] Added rate limiting to endpoints

# ============================================
# TROUBLESHOOTING
# ============================================

# Issue: "RazorpayError: Invalid key id"
# Solution: Check RAZORPAY_KEY_ID in .env

# Issue: "Payment verification failed"
# Solution: Check RAZORPAY_KEY_SECRET is correct

# Issue: "Checkout not opening"
# Solution: Verify KEY_ID is set and correct

# Issue: Environment variables not loading
# Solution: 
# 1. Create .env file in root directory
# 2. Run: npm install dotenv (if not installed)
# 3. Restart Node server
# 4. Check: require("dotenv").config()

# ============================================
# ADDITIONAL CONFIGURATION (OPTIONAL)
# ============================================

# Node Environment
NODE_ENV=development

# Database
ATLASDB_URL=your_mongodb_connection_string

# Session Secret
SECRET=your_session_secret_key

# Mapbox Token (for maps)
MAP_TOKEN=your_mapbox_token

# Other configuration...
