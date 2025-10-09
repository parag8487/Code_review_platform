# AI Code Review Platform

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.3.3-blue.svg)](https://nextjs.org)

A modern web application for collaborative code reviews with AI-powered analysis.

## 🌟 Features

### User Authentication & Management
- Secure user registration and login with session management
- Profile management with avatar, bio, and contact information
- Password hashing with bcrypt for security
- Demo account for quick testing

### Code Review System
- Create, edit, and manage code reviews with version history
- Multi-language support for code analysis
- Comment system for collaborative feedback
- Status tracking (In Progress, Completed)
- Code versioning and history tracking

### AI-Powered Analysis
- Intelligent code analysis using Google AI (Gemini)
- Performance metrics including time complexity, space complexity, and lines of code
- Smart save feature that only allows improvements over baseline metrics
- Automated issue detection for code quality

### Database & Security
- PostgreSQL database with connection pooling
- Robust data integrity with foreign key constraints
- Audit logging for user actions
- Session-based authentication with JWT tokens stored in secure HTTP-only cookies

### UI/UX Features
- Responsive design for all device sizes
- Modern UI components with shadcn/ui and Radix UI
- Monaco Editor for code editing
- Dark mode support

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Session-based with JWT tokens
- **AI Integration**: Google AI (Gemini) for code analysis
- **UI Components**: shadcn/ui, Radix UI
- **Code Editor**: Monaco Editor

## 🗄️ Database Schema

### Users
- `id` (UUID, Primary Key)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR, NOT NULL)
- `full_name` (VARCHAR)
- `phone` (VARCHAR)
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Reviews
- `id` (UUID, Primary Key)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT, NOT NULL)
- `language` (VARCHAR, NOT NULL)
- `status` (VARCHAR, DEFAULT 'In Progress')
- `author_id` (UUID, Foreign Key to users.id, CASCADE DELETE)
- `issues` (INTEGER, DEFAULT 0)
- `current_code` (TEXT)
- `baseline_time_complexity` (VARCHAR)
- `baseline_space_complexity` (VARCHAR)
- `baseline_loc` (INTEGER)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Comments
- `id` (UUID, Primary Key)
- `review_id` (UUID, Foreign Key to reviews.id, CASCADE DELETE)
- `author_id` (UUID, Foreign Key to users.id)
- `text` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Review History
- `id` (UUID, Primary Key)
- `review_id` (UUID, Foreign Key to reviews.id, CASCADE DELETE)
- `code` (TEXT, NOT NULL)
- `author_id` (UUID, Foreign Key to users.id)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Audit Log
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users.id)
- `action` (VARCHAR, NOT NULL)
- `details` (TEXT)
- `timestamp` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/parag8487/Code_review_platform.git
cd Code_review_platform
```

2. Install dependencies:
```bash
cd "Code review"
npm install
```

### Environment Setup

Create a `.env` file in the `code-review` directory with the following variables:

```env
# AI API Key for code analysis (get from Google Cloud Console)
GEMINI_API_KEY=your_google_ai_api_key

# Database configuration
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name

# Session secret (generate using: node generate-secret.js)
SESSION_SECRET=your_random_session_secret_key_at_least_32_characters

# Email configuration for contact form (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Environment mode
NODE_ENV=development
```

To generate a session secret, run:
```bash
cd "Code review"
node generate-secret.js
```

#### Email Configuration

For the contact form to work, you need to set up Gmail SMTP:

1. Create a Gmail App Password:
   - Sign in to your Gmail account
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as your `GMAIL_APP_PASSWORD`

2. Set the environment variables in your `.env` file:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

### Database Initialization

Initialize the database after setting up the environment variables:
```bash
cd "Code review"
node init-db.js
```

### Running the Application

```bash
cd "Code review"
npm run dev
```

The application will be available at: http://localhost:9002

## 🧪 Development

```bash
cd "Code review"
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## 📡 API Endpoints

- `POST /api/init` - Initialize database (run once after setup)
- `GET /api/health` - Health check endpoint
- `POST /api/test-ai` - Test AI integration
- `POST /api/contact` - Contact form submission

## 🔐 Security Features

- Passwords are securely hashed using bcrypt
- Session tokens are stored in HTTP-only cookies
- Route protection prevents unauthorized access
- Data integrity is maintained through foreign key constraints
- Audit logging tracks user actions

## 📧 Demo Account

A demo user is automatically created during database initialization:
- Email: demo@example.com
- Password: password123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email paragmohare049@gmail.com or open an issue in the repository.