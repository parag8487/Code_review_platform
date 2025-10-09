# AI Code Review Platform with Integrated Live Classroom

A modern web application for collaborative code reviews with AI-powered analysis and real-time collaborative coding classroom.

## Features

### Code Review Platform
- User authentication and profile management
- Code review creation and management
- AI-powered code analysis for performance metrics
- Comment system for collaborative feedback
- Code version history tracking
- Responsive design for all device sizes

### Live Classroom
- Real-time code sharing and synchronization
- Multi-user collaborative coding environment
- Classroom management system
- Support for multiple programming languages
- User roster for participant tracking

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Session-based with JWT tokens
- **AI Integration**: Google AI for code analysis
- **Real-time Communication**: Socket.IO
- **UI Components**: shadcn/ui, Radix UI
- **Code Editor**: Monaco Editor

## Database Schema

The application uses a PostgreSQL database with the following tables:

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

## Authentication

The application implements a secure session-based authentication system:

1. **User Registration**: Passwords are securely hashed using bcrypt
2. **User Login**: Credentials are verified against the database
3. **Session Management**: JWT tokens stored in secure HTTP-only cookies
4. **Route Protection**: Middleware ensures only authenticated users can access protected routes

## Key Features Implementation

### User Authentication Process
- Signup: New users are registered with securely hashed passwords
- Login: Credentials are verified and a session is created
- Profile Management: Users can update their profile information

### Dashboard
- Displays recent code reviews with author information
- Shows review statistics (total, in progress, completed)
- Efficient data retrieval using JOIN queries

### Code Review Creation
- Users can create new code reviews with title, description, and language
- Reviews are associated with the authenticated user

### Review Details
- Comprehensive view of a code review with all related data
- Comments section with author information
- Code history tracking

### AI-Powered Analysis
- Code is analyzed for time complexity, space complexity, and lines of code
- Smart save feature compares new code against baseline metrics
- Only improvements are allowed to be saved

### Comment System
- Users can add comments to reviews
- Comments are associated with both the review and the author

### Review Management
- Users can mark reviews as complete or in progress
- Users can delete their own reviews (with automatic cleanup of related data)

### Live Classroom Features
- Create and join coding sessions with unique classroom IDs
- Real-time code synchronization across all participants
- Language selection for different programming languages
- User management with owner and participant roles
- Permission-based editing controls

## Environment Variables

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
cd code-review
node generate-secret.js
```

##### Email Configuration

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

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/parag8487/Code_review_platform.git
   cd Code_review_platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file based on the example above

4. **Set up the database**
   Ensure PostgreSQL is running and create a database named `code_review_platform`

5. **Initialize the database**
   ```bash
   npm run init-db
   ```
   Or visit `/api/init` on your deployed application

6. **Run the application**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:9002`
   
   - Code Review Platform: http://localhost:9002
   - Live Classroom: http://localhost:9002/classroom

## Deployment

This application can be deployed to Vercel with an AlwaysData PostgreSQL database.

### Prerequisites

1. Vercel account
2. AlwaysData account with PostgreSQL database
3. Google AI API key
4. Git repository (GitHub, GitLab, etc.)

### Environment Variables for Deployment

Before deploying, you need to set the following environment variables in your Vercel project:

```env
GEMINI_API_KEY=your_google_ai_api_key
DB_USER=your_alwaysdata_username
DB_PASSWORD=your_alwaysdata_password
DB_HOST=postgresql-xxxxx.alwaysdata.net
DB_PORT=5432
DB_NAME=your_database_name
SESSION_SECRET=your_random_session_secret_key_at_least_32_characters
NODE_ENV=production
```

### Deployment Steps

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure the project settings:
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
4. Add the environment variables listed above in the Vercel project settings
5. Deploy the project

### Database Initialization

After deployment, you need to initialize the database:

1. Visit your deployed URL + `/api/init` (e.g., `https://your-app.vercel.app/api/init`)
2. This will create all necessary tables and the demo user

### Custom Domain (Optional)

You can add a custom domain in your Vercel project settings.

## Demo Account

A demo user is automatically created during database initialization:
- Email: demo@example.com
- Password: password123

## Security Features

- Passwords are securely hashed using bcrypt
- Session tokens are stored in HTTP-only cookies
- Route protection prevents unauthorized access
- Data integrity is maintained through foreign key constraints
- Audit logging tracks user actions

## Development

The application follows modern development practices:
- TypeScript for type safety
- Server Actions for backend logic
- Component-based architecture
- Responsive design principles
- Clean code organization

## API Endpoints

### Code Review Platform
- `POST /api/init` - Initialize database (run once after setup)
- `GET /api/health` - Health check endpoint
- `POST /api/test-ai` - Test AI integration
- `POST /api/contact` - Contact form submission

### Live Classroom
- `GET /api/socket_io` - Socket.IO endpoint for real-time communication

## Troubleshooting

### Health Check
Visit `/api/health` to check if the application is running correctly.

### AI Integration Test
Visit `/api/test-ai` to test if the Google AI integration is working.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.