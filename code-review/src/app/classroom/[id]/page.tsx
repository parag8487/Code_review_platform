"use client";

import { useState, useEffect, useMemo, useTransition, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CodeEditor } from "@/components/classroom/code-editor";
import { UserRoster } from "@/components/classroom/user-roster";
import { OwnerIndicator } from "@/components/classroom/owner-indicator";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/classroom";
import { Home, Loader2, Users, Bot, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomChannel } from "@/lib/realtime";
import { toast as toastAction } from "@/hooks/use-toast";

export interface Classroom {
  id: string;
  name: string;
  owner: string;
  pass: string;
}

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

  const currentUser = useMemo(
    () => users.find((u) => u.name === userName),
    [users, userName]
  );
  const hasPermission = currentUser?.hasPermission || isOwner;

  const handleCodeUpdateFromRemote = useCallback((newCode: string) => {
    remoteUpdateRef.current = true;
    setCode(newCode);
  }, []);

  const handleLanguageUpdateFromRemote = useCallback((newLang: string) => {
    setLanguage(newLang);
  }, []);

  const handleCollabModeUpdateFromRemote = useCallback((newCollab: boolean) => {
    setCollab(newCollab);
  }, []);

  const handleUsersUpdateFromRemote = useCallback((updatedUsers: User[]) => {
    setUsers(updatedUsers);
  }, []);

  const handleClassroomDeleted = useCallback(() => {
    toast({
      title: "Classroom Deleted",
      description:
        "The owner has deleted this classroom. You will be redirected.",
      variant: "destructive",
    });
    setTimeout(() => router.push("/classroom"), 2000);
  }, [toast, router]);

  const handleKicked = useCallback(() => {
    toast({
      title: "You have been kicked",
      description: "The owner has removed you from the classroom.",
      variant: "destructive",
    });
    setTimeout(() => router.push("/classroom"), 2000);
  }, [toast, router]);

  const handlePermissionRequestToOwner = useCallback(
    ({ studentId, studentName }: { studentId: string; studentName: string }) => {
      toastAction({
        title: "Permission Request",
        description: `${studentName} is requesting permission to edit.`,
        duration: Infinity,
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handlePermissionResponseAction(studentId, true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="mr-2" /> Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handlePermissionResponseAction(studentId, false)}
            >
              <UserX className="mr-2" /> Deny
            </Button>
          </div>
        ),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePermissionResponseFromServer = useCallback(
    ({ permissionGranted }: { permissionGranted: boolean }) => {
      toast({
        title: permissionGranted ? "Permission Granted" : "Permission Denied",
        description: permissionGranted
          ? "You can now edit the code."
          : "The owner has denied your request to edit.",
        variant: permissionGranted ? "default" : "destructive",
      });
    },
    [toast]
  );

  const {
    isConnected,
    emitCodeChange,
    emitLanguageChange,
    emitCollabModeChange,
    emitPermissionRequest,
    emitPermissionResponse,
    emitRemoveUser,
    emitKickAndClear,
    emitDeleteClassroom,
    clientId,
  } = useClassroomChannel({
    classroomId,
    userName,
    isOwner,
    onCodeUpdate: handleCodeUpdateFromRemote,
    onLanguageUpdate: handleLanguageUpdateFromRemote,
    onCollabModeUpdate: handleCollabModeUpdateFromRemote,
    onUsersUpdate: handleUsersUpdateFromRemote,
    onClassroomDeleted: handleClassroomDeleted,
    onKicked: handleKicked,
    onPermissionRequestToOwner: handlePermissionRequestToOwner,
    onPermissionResponse: handlePermissionResponseFromServer,
  });

  // Fetch classroom data on mount
  useEffect(() => {
    if (!classroomId) return;

    fetch("/api/classroom/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classroomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.classroom) {
          setClassroom(data.classroom);
          setCode(`// Welcome to ${data.classroom.name}!`);
          if (data.users) setUsers(data.users);
        } else {
          toast({
            title: "Classroom Not Found",
            description:
              "This classroom does not exist. You will be redirected.",
            variant: "destructive",
          });
          setTimeout(() => router.push("/classroom"), 2000);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [classroomId, toast, router]);

  const handlePermissionResponseAction = (
    studentId: string,
    approved: boolean
  ) => {
    emitPermissionResponse(studentId, approved);
  };

  const handleCodeChange = (newCode: string = "") => {
    setCode(newCode);
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }
    emitCodeChange(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    emitLanguageChange(newLanguage);
  };

  const handleToggleCollab = () => {
    const newCollab = !isCollab;
    setCollab(newCollab);
    emitCollabModeChange(newCollab);
  };

  const handleLeave = () => {
    if (isOwner) {
      emitDeleteClassroom();
    }
    router.push("/classroom");
  };

  const handleRemoveUser = (userId: string) => {
    emitRemoveUser(userId);
  };

  const handleKickAndClearAction = (userId: string) => {
    if (classroom) {
      emitKickAndClear(userId, classroom.name);
    }
  };

  const handlePermissionRequestClick = () => {
    startTransition(() => {
      if (!clientId) return;
      emitPermissionRequest(clientId, userName);
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
          <Bot size={28} className="text-accent" />
          <h1 className="text-xl font-bold">{classroom.name}</h1>
          <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm md:flex">
            <Users className="h-4 w-4 text-muted-foreground" />
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

      <UserRoster
        users={users}
        isOwner={isOwner}
        onRemoveUser={handleRemoveUser}
        onKickAndClear={handleKickAndClearAction}
      />
    </div>
  );
}
