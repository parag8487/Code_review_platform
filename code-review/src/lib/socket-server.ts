import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Classroom } from "@/components/classroom/classroom-home";
import type { User } from "@/types/classroom";

// Global variables to maintain state across requests
declare global {
  var io: SocketIOServer | undefined;
  var classrooms: Classroom[] | undefined;
  var classroomUsers: Map<string, User[]> | undefined;
  var ownerSockets: Map<string, string> | undefined;
}

// Initialize global variables if they don't exist
global.io = global.io || undefined;
global.classrooms = global.classrooms || [];
global.classroomUsers = global.classroomUsers || new Map<string, User[]>();
global.ownerSockets = global.ownerSockets || new Map<string, string>();

export function initializeSocketServer(httpServer: HttpServer) {
  // If io is already initialized, just return
  if (global.io) {
    console.log("Socket.io already initialized");
    return global.io;
  }

  // Create Socket.IO server with proper CORS configuration
  global.io = new SocketIOServer(httpServer, {
    path: "/api/socket_io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  global.io.on("connection", (socket: any) => {
    console.log("A user connected:", socket.id);

    socket.on("get-classrooms", () => {
      socket.emit("classrooms-update", global.classrooms);
    });

    socket.on("create-classroom", (classroom: Classroom) => {
      global.classrooms!.push(classroom);
      global.classroomUsers!.set(classroom.id, []);
      global.io!.emit("classrooms-update", global.classrooms);
    });
    
    socket.on("delete-classroom", (classroomId: string) => {
      global.classrooms = global.classrooms!.filter(c => c.id !== classroomId);
      global.classroomUsers!.delete(classroomId);
      global.ownerSockets!.delete(classroomId);
      global.io!.emit("classrooms-update", global.classrooms);
      socket.to(classroomId).emit("classroom-deleted-notification");
    });

    socket.on("get-classroom", (classroomId: string) => {
      const classroom = global.classrooms!.find(c => c.id === classroomId);
      socket.emit("classroom-data", classroom);
      if(classroom) {
          const users = global.classroomUsers!.get(classroomId) || [];
          global.io!.to(classroomId).emit("users-update", users);
      }
    });

    socket.on("join-room", (roomId: string, userName: string, isOwner: boolean) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} (${userName}) joined room ${roomId}`);
      
      if (isOwner) {
        global.ownerSockets!.set(roomId, socket.id);
      }

      const classroom = global.classrooms!.find(c => c.id === roomId);
      if (classroom) {
          const users = global.classroomUsers!.get(roomId) || [];
          const userExists = users.some(u => u.name === userName);

          if (!userExists) {
              const newUser: User = { id: socket.id, name: userName, isOwner, hasPermission: isOwner };
              users.push(newUser);
              global.classroomUsers!.set(roomId, users);
          }
          global.io!.to(roomId).emit("users-update", users);
      }
    });
    
    socket.on('leave-room', (roomId: string, userName: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} (${userName}) left room ${roomId}`);

      if (global.ownerSockets!.get(roomId) === socket.id) {
          global.ownerSockets!.delete(roomId);
      }

      const users = global.classroomUsers!.get(roomId) || [];
      const updatedUsers = users.filter(u => u.name !== userName);
      global.classroomUsers!.set(roomId, updatedUsers);
      global.io!.to(roomId).emit('users-update', updatedUsers);
    });

    socket.on('remove-user', ({ roomId, userId }: { roomId: string, userId: string }) => {
      const users = global.classroomUsers!.get(roomId) || [];
      const updatedUsers = users.filter(u => u.id !== userId);
      global.classroomUsers!.set(roomId, updatedUsers);
      global.io!.to(roomId).emit('users-update', updatedUsers);
      global.io!.to(userId).emit('kicked-notification');
    });

    socket.on("kick-and-clear-user", ({ roomId, userId, classroomName }: { roomId: string, userId: string, classroomName: string }) => {
      const users = global.classroomUsers!.get(roomId) || [];
      const updatedUsers = users.filter(u => u.id !== userId);
      global.classroomUsers!.set(roomId, updatedUsers);
      global.io!.to(roomId).emit('users-update', updatedUsers);
      
      const resetCode = `// Welcome to ${classroomName}!`;
      global.io!.to(roomId).emit("code-reset", resetCode);
      
      global.io!.to(userId).emit('kicked-notification');
    });

    socket.on("code-change", (data: any) => {
      const { roomId, code } = data;
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("language-change", (data: any) => {
      const { roomId, language } = data;
      socket.to(roomId).emit("language-update", language);
    });
    
    socket.on("collab-mode-change", (data: any) => {
      const { roomId, collabMode } = data;
      socket.to(roomId).emit("collab-mode-update", collabMode);
    });
    
    socket.on('permission-request', ({ roomId, studentId, studentName }: { roomId: string, studentId: string, studentName: string }) => {
      const ownerSocketId = global.ownerSockets!.get(roomId);
      if (ownerSocketId) {
        global.io!.to(ownerSocketId).emit('permission-request-to-owner', { studentId, studentName });
      }
    });
    
    socket.on('permission-response', ({ roomId, studentId, approved }: { roomId: string, studentId: string, approved: boolean }) => {
      const users = global.classroomUsers!.get(roomId) || [];
      const updatedUsers = users.map(u => 
        u.id === studentId ? { ...u, hasPermission: approved } : u
      );
      global.classroomUsers!.set(roomId, updatedUsers);
      global.io!.to(roomId).emit('users-update', updatedUsers);
      global.io!.to(studentId).emit('permission-response-from-owner', { permissionGranted: approved });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      global.classroomUsers!.forEach((users, roomId) => {
          const user = users.find(u => u.id === socket.id);
          if (user) {
              if (global.ownerSockets!.get(roomId) === socket.id) {
                  global.classrooms = global.classrooms!.filter(c => c.id !== roomId);
                  global.classroomUsers!.delete(roomId);
                  global.ownerSockets!.delete(roomId);
                  global.io!.emit("classrooms-update", global.classrooms);
                  global.io!.to(roomId).emit("classroom-deleted-notification");
              } else {
                const updatedUsers = users.filter(u => u.id !== socket.id);
                global.classroomUsers!.set(roomId, updatedUsers);
                global.io!.to(roomId).emit('users-update', updatedUsers);
              }
          }
      });
    });
  });

  return global.io;
}

export function getSocketServer() {
  return global.io;
}