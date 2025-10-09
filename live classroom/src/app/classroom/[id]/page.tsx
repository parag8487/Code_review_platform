"use client";

import { useState, useEffect, useMemo, useTransition, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CodeEditor } from "@/components/code-editor";
import { UserRoster } from "@/components/user-roster";
import { OwnerIndicator } from "@/components/owner-indicator";
import { useToast } from "@/hooks/use-toast";
import type { Classroom } from "@/components/classroom-home";
import { Home, Loader2, Users, Bot, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import io, { Socket } from "socket.io-client";
import { toast as toastAction } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  isOwner: boolean;
  hasPermission?: boolean;
}

let socket: Socket;

export default function ClassroomPage() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [code, setCode] = useState(`// Welcome to the classroom!`);
  const [language, setLanguage] = useState("javascript");
  const [isCollab, setCollab] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const remoteUpdateRef = useRef(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const isOwner = searchParams?.get("owner") === "true";
  const userName = searchParams?.get("userName") || "Student";
  const classroomId = (params?.id as string) || "";
  
  const currentUser = useMemo(() => users.find(u => u.name === userName), [users, userName]);
  const hasPermission = currentUser?.hasPermission || isOwner;

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window === 'undefined') {
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    socket = io(siteUrl, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      socket.emit("join-room", classroomId, userName, isOwner);
      socket.emit("get-classroom", classroomId);
    });

    socket.on('users-update', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    socket.on("classroom-data", (data: Classroom) => {
      if (data) {
        setClassroom(data);
        if(code === `// Welcome to the classroom!`) {
          setCode(`// Welcome to ${data.name}!`);
        }
      } else {
        toast({
          title: "Classroom Not Found",
          description: "This classroom does not exist. You will be redirected.",
          variant: "destructive",
        });
        setTimeout(() => router.push('/'), 2000);
      }
      setIsLoading(false);
    });
    
    socket.on("code-update", (newCode: string) => {
      remoteUpdateRef.current = true;
      setCode(newCode);
    });
    
    socket.on("code-reset", (resetCode: string) => {
      remoteUpdateRef.current = true;
      setCode(resetCode);
    });

    socket.on("language-update", (newLanguage: string) => {
      setLanguage(newLanguage);
    });

    socket.on("collab-mode-update", (newCollabMode: boolean) => {
      setCollab(newCollabMode);
    });

    socket.on("classroom-deleted-notification", () => {
      toast({
        title: "Classroom Deleted",
        description: "The owner has deleted this classroom. You will be redirected.",
        variant: "destructive",
      });
      setTimeout(() => router.push('/'), 2000);
    });
    
    socket.on("kicked-notification", () => {
      toast({
        title: "You have been kicked",
        description: "The owner has removed you from the classroom.",
        variant: "destructive",
      });
      setTimeout(() => router.push('/'), 2000);
    });

    socket.on('permission-request-to-owner', ({ studentId, studentName }) => {
      toastAction({
        title: 'Permission Request',
        description: `${studentName} is requesting permission to edit.`,
        duration: Infinity,
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handlePermissionResponse(studentId, true)} className="bg-green-600 hover:bg-green-700">
              <UserCheck className="mr-2" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handlePermissionResponse(studentId, false)}>
              <UserX className="mr-2" /> Deny
            </Button>
          </div>
        ),
      });
    });

    socket.on('permission-response-from-owner', ({ permissionGranted }) => {
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === socket.id ? { ...u, hasPermission: permissionGranted } : u
      ));
      toast({
        title: permissionGranted ? 'Permission Granted' : 'Permission Denied',
        description: permissionGranted
          ? 'You can now edit the code.'
          : 'The owner has denied your request to edit.',
        variant: permissionGranted ? 'default' : 'destructive',
      });
    });

    return () => {
      if (socket) {
        socket.emit("leave-room", classroomId, userName);
        socket.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, router, isOwner, userName]);


  const handleCodeChange = (newCode: string = '') => {
    setCode(newCode);
    if (remoteUpdateRef.current) {
        remoteUpdateRef.current = false;
        return;
    }
    if (socket) {
        socket.emit("code-change", { roomId: classroomId, code: newCode });
    }
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (socket) socket.emit("language-change", { roomId: classroomId, language: newLanguage });
  };
  
  const handleToggleCollab = () => {
    const newCollab = !isCollab;
    setCollab(newCollab);
    if(socket) socket.emit("collab-mode-change", { roomId: classroomId, collabMode: newCollab });
  };

  const handleLeave = () => {
    if (isOwner) {
        if(socket) socket.emit("delete-classroom", classroomId);
    }
    router.push('/');
  }

  const handleRemoveUser = (userId: string) => {
    if(socket) socket.emit("remove-user", { roomId: classroomId, userId });
  }
  
  const handleKickAndClear = (userId: string) => {
    if(socket && classroom) {
      socket.emit("kick-and-clear-user", { roomId: classroomId, userId, classroomName: classroom.name });
    }
  }
  
  const handlePermissionResponse = (studentId: string, approved: boolean) => {
    if(socket) socket.emit("permission-response", { roomId: classroomId, studentId, approved });
  }

  const handlePermissionRequestClick = () => {
    startTransition(() => {
      if (!currentUser) return;
      socket.emit("permission-request", { roomId: classroomId, studentId: currentUser.id, studentName: currentUser.name });
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the owner.",
      });
    });
  };

  if (isLoading || !classroom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background font-body">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Bot size={28} className="text-accent"/>
          <h1 className="text-xl font-bold">{classroom.name}</h1>
          <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm md:flex">
             <Users className="h-4 w-4 text-muted-foreground"/>
             <span>{users.length} Participants</span>
          </div>
        </div>
        <Button variant="outline" onClick={handleLeave}>
          <Home className="mr-2 h-4 w-4" />
          Leave
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto">
          {!isOwner && <OwnerIndicator ownerName={classroom.owner} />}
          <CodeEditor
            isOwner={isOwner}
            isCollab={isCollab}
            toggleCollab={handleToggleCollab}
            code={code}
            onCodeChange={handleCodeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
            hasPermission={hasPermission}
            onPermissionRequest={handlePermissionRequestClick}
            isRequestPending={isPending}
          />
        </main>
      </div>
      
      <UserRoster users={users} isOwner={isOwner} onRemoveUser={handleRemoveUser} onKickAndClear={handleKickAndClear} />
    </div>
  );
}
