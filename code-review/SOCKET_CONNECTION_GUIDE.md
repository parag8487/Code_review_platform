# Socket Connection Guide

This guide explains how to properly implement and maintain Socket.IO connections to prevent errors like the ones we've encountered.

## Common Socket Connection Issues

### 1. "server error" on connection
**Problem**: Client receives a "server error" when trying to connect to Socket.IO server.

**Causes**:
- Incorrect path configuration
- CORS issues
- Server not properly initialized
- Network connectivity problems
- Transport protocol mismatches

**Solutions**:
1. Ensure the client connects with the correct path:
   ```javascript
   const socket = io(SITE_URL, {
     path: "/api/socket_io"
   });
   ```

2. Verify server CORS configuration:
   ```javascript
   const io = new Server(server, {
     cors: {
       origin: "*",
       methods: ["GET", "POST"]
     }
   });
   ```

3. Check that the server endpoint exists and responds correctly

### 2. Connection timeouts
**Problem**: Socket connections time out without establishing.

**Solutions**:
1. Increase timeout values:
   ```javascript
   const socket = io(SITE_URL, {
     timeout: 10000, // 10 seconds
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000
   });
   ```

2. Specify transport protocols:
   ```javascript
   const socket = io(SITE_URL, {
     transports: ['websocket', 'polling']
   });
   ```

## Best Practices

### 1. Proper Error Handling
Always implement comprehensive error handling:

```typescript
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
  // Update UI to show connection error
  setConnectionError(true);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  // Handle disconnection gracefully
});
```

### 2. Connection State Management
Track connection state and provide user feedback:

```typescript
const [connectionStatus, setConnectionStatus] = useState("connecting");

useEffect(() => {
  socket.on("connect", () => {
    setConnectionStatus("connected");
  });
  
  socket.on("disconnect", () => {
    setConnectionStatus("disconnected");
  });
  
  socket.on("connect_error", () => {
    setConnectionStatus("error");
  });
}, []);
```

### 3. Cleanup Connections
Always clean up socket connections to prevent memory leaks:

```typescript
useEffect(() => {
  // ... connection setup
  
  return () => {
    if (socket) {
      socket.disconnect();
    }
  };
}, []);
```

## Vercel Deployment Considerations

### 1. Serverless Functions
Vercel runs serverless functions, which means:
- Each function execution is stateless
- Functions have a limited execution time
- You cannot maintain long-running connections in serverless functions

### 2. Socket.IO with Vercel
For Socket.IO to work with Vercel:
- Use client-side socket connections only
- Don't try to create HTTP servers within serverless functions
- Ensure proper CORS configuration

### 3. Environment Variables
Set the following environment variables in Vercel:
- `NEXT_PUBLIC_SITE_URL`: Your deployed application URL

## Testing Socket Connections

### Local Testing
Run the socket validation script:
```bash
npm run test-socket
```

### CI/CD Validation
The GitHub Actions workflow automatically validates socket connections on every push.

## Troubleshooting Checklist

When encountering socket connection errors:

1. [ ] Check browser console for specific error messages
2. [ ] Verify the Socket.IO server endpoint is accessible
3. [ ] Confirm path configuration matches between client and server
4. [ ] Check CORS settings
5. [ ] Test with different transport protocols
6. [ ] Verify environment variables are set correctly
7. [ ] Check network connectivity
8. [ ] Review server logs for errors

## Monitoring

### Connection Health
Implement connection health monitoring:
```typescript
// Monitor connection status
socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
```

### Error Tracking
Log all connection errors for debugging:
```typescript
socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
  console.error("Error code:", error.code);
});
```

## Prevention Strategies

### 1. Automated Testing
- Run socket validation scripts in CI/CD
- Test connection establishment in automated tests
- Validate configuration files

### 2. Code Reviews
- Review socket implementation changes
- Ensure proper error handling is included
- Check for memory leaks and cleanup

### 3. Documentation
- Keep this guide updated
- Document any custom socket implementations
- Maintain a list of known issues and solutions

By following these guidelines, you can prevent most socket connection errors and ensure a reliable real-time experience for users.