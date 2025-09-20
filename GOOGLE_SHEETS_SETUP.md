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

- **Authentication error**: Check that your domain is authorized in the OAuth credentials
- **API not initialized**: Verify that the APIs are enabled in Google Cloud Console
- **Invalid key**: Check that you have correctly copied the API key and Client ID
- **Deprecated library error**: This has been fixed - the app now uses Google Identity Services
