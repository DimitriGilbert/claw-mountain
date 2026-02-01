# Google Cloud Console OAuth Setup for gogcli

This guide walks you through setting up OAuth2 credentials for [gogcli](https://github.com/steipete/gogcli) - a CLI tool for Gmail, Calendar, Drive, and other Google Workspace services.

## Overview

gogcli uses OAuth2 to securely access Google APIs. You'll need to:
1. Create a Google Cloud project
2. Enable the APIs you want to use
3. Configure OAuth consent screen
4. Create Desktop app OAuth credentials
5. Authorize your account

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top, then "New Project"
3. Give your project a name (e.g., "My Molt Gmail Access")
4. Click "Create"

### 2. Enable Required APIs

Enable the Google APIs you want to use:

**For Gmail:**
- Go to [Gmail API](https://console.cloud.google.com/apis/api/gmail.googleapis.com) → Click "Enable"

**For Calendar:**
- Go to [Google Calendar API](https://console.cloud.google.com/apis/api/calendar-json.googleapis.com) → Click "Enable"

**For Drive:**
- Go to [Google Drive API](https://console.cloud.google.com/apis/api/drive.googleapis.com) → Click "Enable"

**For Contacts:**
- Go to [People API](https://console.cloud.google.com/apis/api/people.googleapis.com) → Click "Enable"

**For Tasks:**
- Go to [Google Tasks API](https://console.cloud.google.com/apis/api/tasks.googleapis.com) → Click "Enable"

**For Sheets:**
- Go to [Google Sheets API](https://console.cloud.google.com/apis/api/sheets.googleapis.com) → Click "Enable"

> **Tip**: You can enable all APIs at once by searching for them in the API Library.

### 3. Configure OAuth Consent Screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/auth/branding)
2. Select "External" (for personal use) or "Internal" (for Workspace)
3. Click "Create"
4. Fill in required fields:
   - **App name**: "My CLI Tools" (or any name)
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Search for and add scopes you need:
   - `gmail.modify` (read/send emails)
   - `calendar` (calendar access)
   - `drive` (Drive access)
   - `contacts` (Contacts access)
   - `tasks` (Tasks access)
   - `spreadsheets` (Sheets access)
8. Click "Update", then "Save and Continue"
9. On the "Test users" page, add your Gmail address
10. Click "Save and Continue", then "Back to Dashboard"

### 4. Create OAuth Desktop App Credentials

1. Go to [Credentials](https://console.cloud.google.com/auth/clients)
2. Click "Create Client"
3. Select "Desktop app" as the application type
4. Give it a name (e.g., "gogcli-desktop")
5. Click "Create"
6. **Important**: Click "Download JSON" to save the credentials file
   - File name looks like: `client_secret_xxx.apps.googleusercontent.com.json`
   - Save this file securely - you'll need it for each molt

### 5. Authorize Your Account

After creating a molt with gogcli installed, run these commands as the molt user:

```bash
# 1. Store the OAuth credentials in gogcli
sudo -u <molt-name> gog auth credentials /path/to/client_secret_xxx.json

# 2. Add your Gmail account (opens browser for OAuth flow)
sudo -u <molt-name> gog auth add your.email@gmail.com

# 3. Test the connection
sudo -u <molt-name> gog gmail labels list
```

The browser will open for OAuth authorization. After granting permission, gogcli stores a refresh token in the system keyring for future use.

## Using gogcli

### Environment Variables

Set these in your molt's shell or scripts:

```bash
export GOG_ACCOUNT=your.email@gmail.com  # Default account
export GOG_JSON=1                        # Default to JSON output
export GOG_PLAIN=1                       # Default to plain (TSV) output
```

### Common Commands

**Gmail:**
```bash
# Search emails
gog gmail search 'newer_than:7d' --max 10

# Send email
gog gmail send --to recipient@example.com --subject "Hello" --body "Message"

# List labels
gog gmail labels list
```

**Calendar:**
```bash
# Today's events
gog calendar events primary --today

# This week's events
gog calendar events primary --week

# Create event
gog calendar create primary --summary "Meeting" --from 2025-02-01T10:00:00Z --to 2025-02-01T11:00:00Z
```

**Drive:**
```bash
# List files
gog drive ls --max 20

# Upload file
gog drive upload ./file.pdf

# Download file
gog drive download <file-id> --out ./downloaded.pdf
```

## Multiple Accounts

You can manage multiple Google accounts:

```bash
# Add multiple accounts
sudo -u <molt-name> gog auth add work@company.com
sudo -u <molt-name> gog auth add personal@gmail.com

# Use specific account with flag
gog gmail search 'newer_than:1d' --account work@company.com

# Or set via environment
export GOG_ACCOUNT=work@company.com
gog calendar events primary --today
```

## Troubleshooting

### "Insufficient permissions" error

Re-authenticate with required scopes:
```bash
sudo -u <molt-name> gog auth add your.email@gmail.com --services gmail,calendar,drive --force-consent
```

### "Token revoked" error

Remove and re-add the account:
```bash
sudo -u <molt-name> gog auth remove your.email@gmail.com
sudo -u <molt-name> gog auth add your.email@gmail.com
```

### Keyring issues on Linux/WSL

If you get keyring prompts, switch to file backend:
```bash
sudo -u <molt-name> gog auth keyring file
```

For non-interactive use, set:
```bash
export GOG_KEYRING_PASSWORD='your-password'
export GOG_KEYRING_BACKEND=file
```

## Security Best Practices

1. **Never commit OAuth credentials** to version control
2. **Store client credentials outside project directories**
3. **Use different OAuth clients** for development and production
4. **Re-authorize with `--force-consent`** if you suspect token compromise
5. **Remove unused accounts** with `gog auth remove <email>`

## Resources

- [gogcli GitHub Repository](https://github.com/steipete/gogcli)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
