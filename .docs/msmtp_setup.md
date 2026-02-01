# msmtp Setup Guide

Simple SMTP client for sending emails from the command line - perfect for scripts and automation.

## What is msmtp?

msmtp is a lightweight SMTP client that relays emails to a mail server. Unlike gogcli (which offers full Google API access), msmtp is focused purely on sending emails via SMTP - making it ideal for simple use cases and scripts.

**Key Benefits:**
- Zero interactivity (100% CLI-driven)
- Configuration file-based
- Works with any SMTP server (Gmail, Outlook, custom, etc.)
- Single command to send emails
- Small footprint, fast execution

## Quick Setup

### 1. Create Configuration File

Create the msmtp configuration file at `~/.msmtprc`:

```bash
sudo -u <molt-name> tee ~<molt-name>/.msmtprc <<EOF
# Gmail account
account gmail
host smtp.gmail.com
port 587
from your.email@gmail.com
user your.email@gmail.com
password your-app-password
tls on
tls_starttls on
auth on

# Set default account
default gmail
EOF

# Set secure permissions (required!)
sudo chmod 600 ~<molt-name>/.msmtprc
```

**For Gmail:**
- You need an **App Password** (not your regular password)
- Enable 2-Step Verification first: https://myaccount.google.com/security
- Create App Password: https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)" → name it "msmtp"

### 2. Test the Configuration

```bash
sudo -u <molt-name> msmtp -d -v your.email@gmail.com <<EOF
Subject: Test Email
From: your.email@gmail.com
To: your.email@gmail.com

This is a test email from msmtp!
EOF
```

The `-d` (debug) and `-v` (verbose) flags help troubleshoot. Remove them for normal use.

## Usage Examples

### Send a Simple Email

```bash
# Method 1: Here document
echo "Subject: Hello
From: your.email@gmail.com
To: recipient@example.com

Hello World!" | sudo -u <molt-name> msmtp -t

# Method 2: File input
echo "Subject: Report
From: your.email@gmail.com
To: recipient@example.com

Attached report." | sudo -u <molt-name> msmtp -t

# Method 3: Pipe from command
log_contents=$(cat /var/log/some.log)
echo "Subject: Log Report
From: your.email@gmail.com
To: admin@example.com

$log_contents" | sudo -u <molt-name> msmtp -t
```

### Send with Specific Account

```bash
# If you have multiple accounts configured
echo "Subject: Hello
From: work@company.com
To: colleague@example.com

Work email." | sudo -u <molt-name> msmtp -a work -t
```

### Use in Scripts

```bash
#!/bin/bash
# send_notification.sh

MOLT_NAME="$(basename "$HOME")"
LOG_FILE="$HOME/.openclaw/gateway.log"
ALERT_EMAIL="admin@example.com"
SMTP_FROM="your.email@gmail.com"

# Check for errors in log
if grep -q "ERROR" "$LOG_FILE"; then
    ERROR_COUNT=$(grep -c "ERROR" "$LOG_FILE")
    
    # Send alert email
    msmtp "$ALERT_EMAIL" <<EMAIL
Subject: [$MOLT_NAME] Gateway Errors Detected
From: $SMTP_FROM
To: $ALERT_EMAIL

$ERROR_COUNT errors found in gateway log.

Recent errors:
$(grep "ERROR" "$LOG_FILE" | tail -5)

Check full log at: $LOG_FILE
EMAIL
fi
```

## Configuration Examples

### Gmail

```
account gmail
host smtp.gmail.com
port 587
from your.email@gmail.com
user your.email@gmail.com
password your-app-password
tls on
tls_starttls on
auth on

default gmail
```

### Outlook / Office 365

```
account outlook
host smtp.office365.com
port 587
from your.email@outlook.com
user your.email@outlook.com
password your-password
tls on
tls_starttls on
auth on

default outlook
```

### Custom SMTP Server

```
account custom
host mail.yourdomain.com
port 587
from bot@yourdomain.com
user bot@yourdomain.com
password your-password
tls on
tls_starttls on
auth on

default custom
```

### Multiple Accounts

```
# Gmail for personal
account personal
host smtp.gmail.com
port 587
from me@gmail.com
user me@gmail.com
password app-password-1
tls on
tls_starttls on
auth on

# Gmail for work  
account work
host smtp.gmail.com
port 587
from me@company.com
user me@company.com
password app-password-2
tls on
tls_starttls on
auth on

# Default account
default work
```

## Security Best Practices

1. **File Permissions**: Always set `chmod 600 ~/.msmtprc` - msmtp will refuse to run if permissions are too open

2. **App Passwords**: For Gmail, always use App Passwords (not your main password)
   - Your main password can be revoked/changed without affecting msmtp
   - App passwords are 16-character codes like `abcd efgh ijkl mnop`

3. **Environment Variables**: For shared scripts, consider storing passwords in environment:
   ```bash
   # In ~/.bashrc or ~/.profile
   export MSMTP_PASSWORD='your-app-password'
   
   # In ~/.msmtprc
   password $MSMTP_PASSWORD
   ```

4. **No Logging**: By default, msmtp doesn't log to system logs (good for privacy)

## Troubleshooting

### "Configuration file has insecure permissions"

Fix: `chmod 600 ~/.msmtprc`

### "Authentication failed"

- For Gmail: Ensure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled on your Google account
- Verify the App Password hasn't been revoked

### "Connection refused" or timeout

- Check firewall settings (port 587 for TLS/STARTTLS, 465 for SSL)
- Verify SMTP server address and port
- Try `tls_starttls off` with port 465 (SSL)

### "Recipient address rejected"

- Some SMTP servers require the From address to match the authenticated user
- Check your Gmail settings: "Send mail as" must be configured for aliases

### Debug Mode

Always use `-d -v` flags to see full SMTP conversation:
```bash
echo "Subject: Test" | msmtp -d -v recipient@example.com
```

## Comparison: msmtp vs gogcli

| Feature | msmtp | gogcli |
|---------|-------|--------|
| **Purpose** | Send emails only | Full Google API access |
| **Complexity** | Simple | Complex |
| **Setup** | 5 minutes | 30+ minutes (OAuth setup) |
| **Interactivity** | None | OAuth browser flow |
| **Receiving emails** | ❌ No | ✅ Yes (Gmail API) |
| **Calendar** | ❌ No | ✅ Yes |
| **Drive** | ❌ No | ✅ Yes |
| **Best for** | Simple sending | Full integration |

## Resources

- [msmtp Official Site](https://marlam.de/msmtp/)
- [msmtp Documentation](https://marlam.de/msmtp/documentation/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
