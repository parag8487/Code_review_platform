# Live Classroom Platform

A real-time collaborative coding classroom application that enables multiple users to code together simultaneously.

## Features

- Real-time code sharing and synchronization
- Multi-user collaborative coding environment
- Classroom management system
- Support for multiple programming languages
- User roster for participant tracking
- Responsive design for all device sizes

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Real-time Communication**: Socket.IO
- **UI Components**: shadcn/ui, Radix UI
- **Code Editor**: Monaco Editor

## Key Features Implementation

### Real-time Collaboration
- Socket.IO implementation for real-time code synchronization
- Instant updates across all connected clients
- Low-latency communication for smooth collaborative experience

### Classroom Management
- Create and join coding sessions
- Unique classroom IDs for access control
- User roles (owner, participant)

### Multi-language Support
- Syntax highlighting for various programming languages
- Language selector component
- Dynamic editor configuration

### User Experience
- Real-time user roster showing active participants
- Visual indicators for user actions
- Responsive layout for different screen sizes

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

3. **Run the application**
   ```bash
   npm run dev
   ```
   
   Or if running both applications:
   ```bash
   # In the root directory
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Deployment

This application can be deployed to Vercel with Socket.IO support.

### Prerequisites

1. Vercel account
2. Git repository (GitHub, GitLab, etc.)

### Deployment Steps

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure the project settings:
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
4. Deploy the project

## Development

The application follows modern development practices:
- TypeScript for type safety
- Component-based architecture
- Real-time communication patterns
- Responsive design principles

## API Endpoints

- `GET /api/socket_io` - Socket.IO endpoint for real-time communication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.