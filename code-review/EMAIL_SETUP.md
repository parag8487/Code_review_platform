# Email Setup Instructions

To enable the contact form to send emails to paragmohare049@gmail.com, you need to configure Gmail SMTP credentials.

## Steps to Set Up Gmail SMTP

1. **Create a Gmail App Password:**
   - Sign in to your Gmail account that will send the emails (this should be paragmohare049@gmail.com or another Gmail account you control)
   - Go to Google Account settings (https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Save this password securely

2. **Set Environment Variables:**
   Create a `.env.local` file in the root of your project with the following variables:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

   Replace `your-email@gmail.com` with the Gmail address that will send the emails, and `your-app-password` with the app password you generated.

3. **Security Notes:**
   - Never commit the `.env.local` file to version control
   - The app password is sensitive and should be kept secure
   - App passwords are specific to the services that use them

## How It Works

The contact form now sends data to `/api/contact` which:
1. Validates the form data
2. Uses Nodemailer to send an email via Gmail SMTP
3. Sends the email to paragmohare049@gmail.com
4. Returns a success or error message to the frontend

## Testing

After setting up the environment variables, you can test the contact form by filling it out and submitting it. You should receive an email at paragmohare049@gmail.com with the form details.