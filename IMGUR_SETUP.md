# Getting Your Own Imgur Client ID

To avoid rate limiting issues with image uploads, you can get your own free Imgur client ID:

## Steps:

1. **Go to Imgur API**: Visit https://api.imgur.com/oauth2/addclient
2. **Create Account**: Sign up for a free Imgur account if you don't have one
3. **Register Application**: 
   - Application Name: `CheckinEcuador`
   - Authorization Type: `Anonymous usage without user authorization`
   - Authorization callback URL: Leave blank
   - Application Website: Your website URL (can be GitHub Pages)
   - Email: Your email
   - Description: `Image upload for Hive onboarding app`

4. **Get Client ID**: After registration, you'll receive a Client ID

5. **Add to Config**: Open `js/config.js` and add your Client ID:

```javascript
imgur: {
    clientIds: [
        '4d83e353ac99be2',  // Default (shared)
        'YOUR_CLIENT_ID_HERE',  // Add your own here
    ],
    // ... rest of config
}
```

## Benefits:
- **Higher Rate Limits**: Your own client ID has its own rate limits
- **Better Reliability**: Not shared with other users
- **Free Forever**: Imgur's API is free for reasonable usage

## Usage Limits:
- **Free Tier**: 12,500 uploads per day
- **Rate Limit**: 1,250 uploads per hour
- **File Size**: Up to 10MB per image

This should be more than enough for any onboarding app usage!
