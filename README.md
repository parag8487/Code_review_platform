# Code Review Platform

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.3.3-blue.svg)](https://nextjs.org/)

A comprehensive web application featuring an AI-powered code review platform and a live classroom for collaborative coding, enabling developers to analyze code quality and collaborate in real-time.

## 🚀 Features

### Code Review Platform (`code-review/`)
An AI-powered code review application with the following features:
- **User Authentication**: Secure login and signup with session management
- **Code Review Management**: Create, edit, and manage code reviews with version history
- **AI-Powered Analysis**: Intelligent code analysis for performance, security, and best practices
- **Collaborative Feedback**: Comment system for team collaboration and code discussions
- **Code Versioning**: Track changes and maintain history of code iterations
- **PostgreSQL Integration**: Robust database backend for persistent data storage
- **Contact Form**: Email functionality for user inquiries

### Live Classroom (`live classroom/`)
A real-time collaborative coding classroom integrated into the code-review application with the following features:
- **Real-time Code Sharing**: Instant code synchronization across all participants
- **Multi-user Collaboration**: Socket.IO powered real-time editing capabilities
- **Classroom Management**: Create and manage coding sessions with user permissions
- **Language Support**: Multiple programming language syntax highlighting
- **User Roster**: Real-time participant tracking and management

## 📁 Project Structure

```
code-review-platform/
├── code-review/              # AI-powered code review application
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utility functions
│   │   └── ...
│   ├── package.json          # Dependencies and scripts
│   └── README.md             # Code review application documentation
├── live classroom/           # Real-time collaborative coding classroom
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   └── ...
│   ├── package.json          # Dependencies and scripts
│   └── README.md             # Live classroom application documentation
├── package.json              # Root package with workspaces
└── ...
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database (for Code Review Platform)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/parag8487/Code_review_platform.git
cd Code_review_platform
```

2. Install dependencies:
```bash
npm install
```

## 📦 Applications

### Code Review Platform

The AI-powered code review platform allows users to create and manage code reviews with AI analysis.

#### Setup

1. Navigate to the code review directory:
```bash
cd "Code review"
```

2. Create a `.env` file with the following variables:

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

3. Initialize the database:
```bash
node init-db.js
```

#### Running the Application

```bash
cd "Code review"
npm run dev
```

The application will be available at: http://localhost:9002

### Live Classroom

The real-time collaborative coding classroom enables multiple users to code together simultaneously.

#### Setup

1. Navigate to the live classroom directory:
```bash
cd "live classroom"
```

2. Create a `.env` file with the following variables:

```env
# Environment mode
NODE_ENV=development

# Site URL for Socket.IO connection
NEXT_PUBLIC_SITE_URL=http://localhost:5000
```

#### Running the Application

```bash
cd "live classroom"
npm run dev
```

The application will be available at: http://localhost:5000

## ⚡ Running Both Applications

To run both applications simultaneously, use the provided script:

```bash
# On Windows
start-both.bat

# On macOS/Linux
./start-both.sh
```

## 🧪 Development

### Code Review Platform
```bash
cd "Code review"
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript type checking
```

### Live Classroom
```bash
cd "live classroom"
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## 📡 API Endpoints

### Code Review Platform
- `POST /api/init` - Initialize database (run once after setup)
- `GET /api/health` - Health check endpoint
- `POST /api/test-ai` - Test AI integration
- `POST /api/contact` - Contact form submission

### Live Classroom
- `GET /api/socket_io` - Socket.IO endpoint for real-time communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email paragmohare049@gmail.com or open an issue in the repository.