# How to Fix Email Sending (Gmail)

You are currently seeing the OTP in your terminal because the app is in "Development Mode" with no email provider configured. To send real emails to your inbox:

1.  **Go to Google Account**: [https://myaccount.google.com/](https://myaccount.google.com/)
2.  **Security**: Select "Security" from the left panel.
3.  **2-Step Verification**: Ensure it is **ON**.
4.  **App Passwords**:
    *   Search for "App Passwords" in the search bar at the top / or look under 2-Step Verification.
    *   Create a new app name: `ResellerPro`.
    *   **Copy the 16-character code** generated.
5.  **Update `.env`**:
    *   Open your `.env` file.
    *   Find the `SMTP_...` section.
    *   Update it like this:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_GMAIL_ADDRESS@gmail.com
SMTP_PASS=PASTE_THE_16_CHAR_CODE_HERE
SMTP_FROM="ResellerPro <YOUR_GMAIL_ADDRESS@gmail.com>"
SMTP_SECURE=false
```

6.  **Restart Server**: Stop the server (`Ctrl+C`) and run `npm run dev` again.
