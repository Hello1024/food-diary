# Google Sheets API Configuration

To use the Google Sheets export feature, you need to configure the Google Sheets API.

## Configuration Steps:

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Note your project ID

### 2. Enable APIs
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Google Sheets API**
   - **Google Drive API**

### 3. Create Credentials

#### API Key:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

#### OAuth 2.0 Client ID:
1. Still in "Credentials", click "Create Credentials" > "OAuth 2.0 Client ID"
2. Choose "Web application"
3. Add your domain in "Authorized JavaScript origins" (e.g., `http://localhost:8000` for local testing)
4. Copy the generated Client ID

### 4. Configure the Application

Open the `app.js` file and replace the following values in the constructor:

```javascript
this.API_KEY = 'YOUR_API_KEY_HERE';
this.CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
```

### 5. Testing
1. Open the application in your browser
2. Go to the "Export" tab
3. Click "Connect to Google"
4. Authorize the application to access your Google Sheets
5. Test the export

## Google Sheets Export Features:

- ✅ Automatic creation of a new Google Sheet
- ✅ Colored headers with professional formatting
- ✅ Borders and alternating rows for better readability
- ✅ Automatically resized columns
- ✅ Automatic opening of the created file
- ✅ Structured data with all journal information
- ✅ Uses new Google Identity Services (GIS) for secure authentication

## Important Notes:

- This implementation uses the **new Google Identity Services (GIS)** library instead of the deprecated `gapi.auth2`
- The authentication flow is more secure and follows Google's latest standards
- Users will see a modern OAuth consent screen

## Security:

⚠️ **Important**: Never share your API keys publicly. For production deployment, use environment variables or a secure configuration system.

## Migration from Legacy Auth:

If you're seeing the error "You have created a new client application that uses libraries for user authentication or authorization that are deprecated", this application has been **updated to use the new Google Identity Services (GIS)**.

The code now uses:
- `https://accounts.google.com/gsi/client` for authentication
- `google.accounts.oauth2.initTokenClient()` instead of `gapi.auth2`
- Token-based authentication instead of the deprecated auth2 flow

## Troubleshooting:

### "API key not valid. Please pass a valid API key" Error:

This error occurs when the Google API key is incorrect, restricted, or not properly configured. Here's how to fix it:

#### **Step 1: Check Your API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your API Key in the list
4. Click on the API key name to view details

#### **Step 2: Verify API Key Restrictions**
In the API key details page:
1. **Application restrictions**: 
   - Set to "HTTP referrers (web sites)"
   - Add your domain(s): `http://localhost:8000/*` (for testing) and your production domain
2. **API restrictions**:
   - Select "Restrict key"
   - Enable these APIs:
     - ✅ **Google Sheets API**
     - ✅ **Google Drive API**
   - Make sure both APIs are checked

#### **Step 3: Regenerate API Key (if needed)**
If the key still doesn't work:
1. In the API key details, click "Regenerate key"
2. Copy the new key
3. Update `app.js` with the new key

#### **Step 4: Update app.js**
The current code has a concatenated API key. Replace this section in `app.js`:

```javascript
// Find this line (around line 25):
this.foo='ENulgmI0CjjCOJWWDBvr-ZEYiQ';
this.API_KEY = 'GOCSPX-A0'+this.foo;

// Replace with:
this.API_KEY = 'YOUR_COMPLETE_API_KEY_HERE';
```

#### **Step 5: Test the API Key**
You can test if your API key works by opening this URL in your browser:
```
https://sheets.googleapis.com/v4/spreadsheets/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/values/Class%20Data!A2:E?key=YOUR_API_KEY_HERE
```
Replace `YOUR_API_KEY_HERE` with your actual API key. If it works, you'll see JSON data.

### Other Common Issues:

- **Authentication error**: Check that your domain is authorized in the OAuth credentials
- **API not initialized**: Verify that the APIs are enabled in Google Cloud Console
- **Invalid key**: Check that you have correctly copied the API key and Client ID
- **Deprecated library error**: This has been fixed - the app now uses Google Identity Services

### **Still Having Issues?**

1. **Double-check API is enabled**: Go to "APIs & Services" > "Library" and search for "Google Sheets API" - make sure it shows as "ENABLED"
2. **Check quota**: In "APIs & Services" > "Quotas", make sure you haven't exceeded limits
3. **Try a fresh API key**: Create a completely new API key and use that instead
