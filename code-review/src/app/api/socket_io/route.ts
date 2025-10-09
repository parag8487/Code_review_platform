import { NextRequest } from "next/server";
import { Server as ServerIO } from "socket.io";
import type { Classroom } from "@/components/classroom/classroom-home";
import type { User } from "@/types/classroom";

export const dynamic = "force-dynamic";

let io: ServerIO | null = null;
let classrooms: Classroom[] = [];
const classroomUsers = new Map<string, User[]>();
const ownerSockets = new Map<string, string>(); // Map classroomId to owner's socket.id

export async function GET(req: NextRequest) {
  if (!io) {
    // Create a new HTTP server for Socket.IO
    const http = require("http");
    const server = http.createServer();
    
    io = new ServerIO(server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket: any) => {
      console.log("A user connected:", socket.id);

      socket.on("get-classrooms", () => {
        socket.emit("classrooms-update", classrooms);
      });

      socket.on("create-classroom", (classroom: Classroom) => {
        classrooms.push(classroom);
        classroomUsers.set(classroom.id, []);
        io!.emit("classrooms-update", classrooms);
      });
      
      socket.on("delete-classroom", (classroomId: string) => {
        classrooms = classrooms.filter(c => c.id !== classroomId);
        classroomUsers.delete(classroomId);
        ownerSockets.delete(classroomId);
        io!.emit("classrooms-update", classrooms);
        socket.to(classroomId).emit("classroom-deleted-notification");
      });

      socket.on("get-classroom", (classroomId: string) => {
        const classroom = classrooms.find(c => c.id === classroomId);
        socket.emit("classroom-data", classroom);
        if(classroom) {
            const users = classroomUsers.get(classroomId) || [];
            io!.to(classroomId).emit("users-update", users);
        }
      });

      socket.on("join-room", (roomId: string, userName: string, isOwner: boolean) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} (${userName}) joined room ${roomId}`);
        
        if (isOwner) {
          ownerSockets.set(roomId, socket.id);
        }

        const classroom = classrooms.find(c => c.id === roomId);
        if (classroom) {
            const users = classroomUsers.get(roomId) || [];
            const userExists = users.some(u => u.name === userName);

            if (!userExists) {
                const newUser: User = { id: socket.id, name: userName, isOwner, hasPermission: isOwner };
                users.push(newUser);
                classroomUsers.set(roomId, users);
            }
            io!.to(roomId).emit("users-update", users);
        }
      });
      
      socket.on('leave-room', (roomId: string, userName: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} (${userName}) left room ${roomId}`);

        if (ownerSockets.get(roomId) === socket.id) {
            ownerSockets.delete(roomId);
        }

        const users = classroomUsers.get(roomId) || [];
        const updatedUsers = users.filter(u => u.name !== userName);
        classroomUsers.set(roomId, updatedUsers);
        io!.to(roomId).emit('users-update', updatedUsers);
      });

      socket.on('remove-user', ({ roomId, userId }: { roomId: string, userId: string }) => {
        const users = classroomUsers.get(roomId) || [];
        const updatedUsers = users.filter(u => u.id !== userId);
        classroomUsers.set(roomId, updatedUsers);
        io!.to(roomId).emit('users-update', updatedUsers);
        io!.to(userId).emit('kicked-notification');
      });

      socket.on("kick-and-clear-user", ({ roomId, userId, classroomName }: { roomId: string, userId: string, classroomName: string }) => {
        const users = classroomUsers.get(roomId) || [];
        const updatedUsers = users.filter(u => u.id !== userId);
        classroomUsers.set(roomId, updatedUsers);
        io!.to(roomId).emit('users-update', updatedUsers);
        
        const resetCode = `// Welcome to ${classroomName}!`;
        io!.to(roomId).emit("code-reset", resetCode);
        
        io!.to(userId).emit('kicked-notification');
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
        const ownerSocketId = ownerSockets.get(roomId);
        if (ownerSocketId) {
          io!.to(ownerSocketId).emit('permission-request-to-owner', { studentId, studentName });
        }
      });
      
      socket.on('permission-response', ({ roomId, studentId, approved }: { roomId: string, studentId: string, approved: boolean }) => {
        const users = classroomUsers.get(roomId) || [];
        const updatedUsers = users.map(u => 
          u.id === studentId ? { ...u, hasPermission: approved } : u
        );
        classroomUsers.set(roomId, updatedUsers);
        io!.to(roomId).emit('users-update', updatedUsers);
        io!.to(studentId).emit('permission-response-from-owner', { permissionGranted: approved });
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        classroomUsers.forEach((users, roomId) => {
            const user = users.find(u => u.id === socket.id);
            if (user) {
                if (ownerSockets.get(roomId) === socket.id) {
                    classrooms = classrooms.filter(c => c.id !== roomId);
                    classroomUsers.delete(roomId);
                    ownerSockets.delete(roomId);
                    io!.emit("classrooms-update", classrooms);
                    io!.to(roomId).emit("classroom-deleted-notification");
                } else {
                  const updatedUsers = users.filter(u => u.id !== socket.id);
                  classroomUsers.set(roomId, updatedUsers);
                  io!.to(roomId).emit('users-update', updatedUsers);
                }
            }
        });
      });
    });
  }
  
  return new Response(null, { status: 200 });
}