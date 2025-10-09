# Live Classroom - Real-time Collaborative Coding Platform

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.3.3-blue.svg)](https://nextjs.org)
[![Socket.IO](https://img.shields.io/badge/socket.io-4.7.5-blue.svg)](https://socket.io)

A real-time collaborative coding classroom integrated into the code-review application, enabling multiple users to code together simultaneously with real-time synchronization.

## 🌟 Features

### Real-time Collaboration
- **Instant Code Synchronization**: Real-time code updates across all participants using Socket.IO
- **Multi-user Support**: Multiple students can join the same classroom session
- **Shared Code Editor**: Collaborative Monaco editor for simultaneous coding
- **Language Support**: Syntax highlighting for multiple programming languages

### Classroom Management
- **Create Classrooms**: Instructors can create private classrooms with custom names
- **Join Classrooms**: Students can join existing classrooms with a username
- **Classroom Discovery**: Search and browse available classrooms
- **User Roster**: Real-time participant tracking and management

### Permission System
- **Owner Controls**: Classroom owners have full control over the session
- **Student Permissions**: Students can request permission to edit code
- **User Management**: Owners can remove or kick participants
- **Collaborative Mode**: Toggle between collaborative and single-editor modes

### UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI Components**: Built with shadcn/ui and Radix UI
- **Real-time Updates**: Instant feedback on user actions
- **Intuitive Interface**: Easy-to-use classroom interface

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Real-time Communication**: Socket.IO for WebSocket connections
- **UI Components**: shadcn/ui, Radix UI
- **Code Editor**: Monaco Editor
- **State Management**: React Hooks

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/parag8487/Code_review_platform.git
cd Code_review_platform
```

2. Install dependencies:
```bash
cd "live classroom"
npm install
```

### Environment Setup

Create a `.env` file in the `live classroom` directory with the following variables:

```env
# Environment mode
NODE_ENV=development

# Site URL for Socket.IO connection
NEXT_PUBLIC_SITE_URL=http://localhost:5000
```

### Running the Application

```bash
cd "live classroom"
npm run dev
```

The application will be available at: http://localhost:5000

## 🧪 Development

```bash
cd "live classroom"
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## 📡 API Endpoints

- `GET /api/socket_io` - Socket.IO endpoint for real-time communication

## 🔧 Socket.IO Events

### Client to Server Events
- `get-classrooms` - Request list of available classrooms
- `create-classroom` - Create a new classroom
- `delete-classroom` - Delete a classroom (owner only)
- `get-classroom` - Request specific classroom data
- `join-room` - Join a classroom session
- `leave-room` - Leave a classroom session
- `remove-user` - Remove a user from classroom (owner only)
- `kick-and-clear-user` - Kick user and reset code (owner only)
- `code-change` - Send code updates to other participants
- `language-change` - Change programming language
- `collab-mode-change` - Toggle collaborative mode
- `permission-request` - Student requests editing permission
- `permission-response` - Owner responds to permission request

### Server to Client Events
- `classrooms-update` - Update list of available classrooms
- `classroom-data` - Send specific classroom data
- `users-update` - Update user roster
- `classroom-deleted-notification` - Notify users when classroom is deleted
- `kicked-notification` - Notify user when kicked from classroom
- `code-update` - Send code updates to participants
- `code-reset` - Reset code for all participants
- `language-update` - Update programming language
- `collab-mode-update` - Update collaborative mode status
- `permission-request-to-owner` - Notify owner of permission request
- `permission-response-from-owner` - Notify student of permission response

## 🏗️ Architecture

### Components
1. **Classroom Home**: Main dashboard for creating/joining classrooms
2. **Classroom Page**: Real-time collaborative coding environment
3. **Code Editor**: Dual-pane editor with permission controls
4. **User Roster**: Participant management interface
5. **Dialog Components**: Create/Join classroom dialogs

### Real-time Communication Flow
1. Users connect to Socket.IO server via `/api/socket_io`
2. Classroom data is synchronized through socket events
3. Code changes are broadcast to all participants in real-time
4. User actions (join/leave) update the participant roster
5. Permission requests flow from students to classroom owners

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