# 🧪 Testing Cal.com Integration

## Quick Test Steps

### 1. **Add Cal.com API Key**
Add to your `.env` file:
```env
CALCOM_API_KEY=cal_live_your_api_key_here
CALCOM_API_URL=https://api.cal.com/v1
```

### 2. **Test Authentication**
```bash
# Start your server
npm run dev

# Test the auth endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/auth/validate
```

### 3. **Test Cal.com Provisioning**
1. Go to your coaching dashboard
2. Click "My Schedule" tab
3. Click "Set Up Cal.com Integration"
4. Should see success message

### 4. **Test Booking Flow**
1. Go to "Browse Mentors" tab
2. Click "Book Session" on any mentor
3. Select date, time, and session type
4. Fill in your details and book

## 🔍 Debugging Authentication

If you get "Invalid token format" errors:

### Check Token Storage
```javascript
// In browser console
console.log(localStorage.getItem('circl_auth'));
```

### Check Token Format
The token should be a JWT with 3 parts separated by dots:
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.signature
```

### Test API Directly
```bash
# Test with your actual token
curl -H "Authorization: Bearer YOUR_ACTUAL_JWT_TOKEN" \
     http://localhost:5000/api/calcom/provision-mentor
```

## 🚀 Expected Flow

1. **Login** → JWT token stored in `localStorage.circl_auth`
2. **Provision Mentor** → Creates Cal.com account
3. **Book Session** → Creates booking in Cal.com
4. **View Schedule** → Shows Cal.com bookings

## 🐛 Common Issues

### Issue: "Invalid token format"
**Solution**: Make sure you're logged in and token is valid

### Issue: "User not found"
**Solution**: Check if user exists in your database

### Issue: "Cal.com API error"
**Solution**: Verify your Cal.com API key is correct

### Issue: "Mentor not provisioned"
**Solution**: Click "Set Up Cal.com Integration" first

## ✅ Success Indicators

- ✅ No authentication errors in console
- ✅ Mentor provisioning succeeds
- ✅ Booking modal opens with availability
- ✅ Bookings appear in schedule
- ✅ No 401/403 errors

## 🔧 Quick Fixes

If authentication still fails, try:

1. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   // Then login again
   ```

2. **Check network tab** for actual request headers

3. **Verify JWT token** is being sent correctly

The integration should work once authentication is fixed! 🎉
