"use client";

import Ably from "ably";
import { useEffect, useRef, useState, useCallback } from "react";

let ablyClient: Ably.Realtime | null = null;

function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: "/api/ably-token",
      authMethod: "GET",
    });
  }
  return ablyClient;
}

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    const client = getAblyClient();
    clientRef.current = client;

    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    const onFailed = () => setIsConnected(false);

    client.connection.on("connected", onConnected);
    client.connection.on("disconnected", onDisconnected);
    client.connection.on("failed", onFailed);

    if (client.connection.state === "connected") {
      setIsConnected(true);
    }

    return () => {
      client.connection.off("connected", onConnected);
      client.connection.off("disconnected", onDisconnected);
      client.connection.off("failed", onFailed);
    };
  }, []);

  return { client: clientRef.current, isConnected };
}

export interface UseClassroomChannelOptions {
  classroomId: string;
  userName: string;
  isOwner: boolean;
  onCodeUpdate: (code: string) => void;
  onLanguageUpdate: (language: string) => void;
  onCollabModeUpdate: (collabMode: boolean) => void;
  onUsersUpdate: (users: any[]) => void;
  onClassroomDeleted: () => void;
  onKicked: () => void;
  onPermissionRequestToOwner: (data: { studentId: string; studentName: string }) => void;
  onPermissionResponse: (data: { permissionGranted: boolean }) => void;
}

export function useClassroomChannel(options: UseClassroomChannelOptions) {
  const {
    classroomId,
    userName,
    isOwner,
    onCodeUpdate,
    onLanguageUpdate,
    onCollabModeUpdate,
    onUsersUpdate,
    onClassroomDeleted,
    onKicked,
    onPermissionRequestToOwner,
    onPermissionResponse,
  } = options;

  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const clientRef = useRef<Ably.Realtime | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!classroomId) return;

    const client = getAblyClient();
    clientRef.current = client;
    const channel = client.channels.get(`classroom:${classroomId}`);
    channelRef.current = channel;

    const setupChannel = async () => {
      // Subscribe to all classroom events
      channel.subscribe("code-update", (msg) => {
        if (msg.clientId !== client.auth.clientId) {
          onCodeUpdate(msg.data.code);
        }
      });

      channel.subscribe("code-reset", (msg) => {
        onCodeUpdate(msg.data.code);
      });

      channel.subscribe("language-update", (msg) => {
        onLanguageUpdate(msg.data.language);
      });

      channel.subscribe("collab-mode-update", (msg) => {
        onCollabModeUpdate(msg.data.collabMode);
      });

      channel.subscribe("users-update", (msg) => {
        onUsersUpdate(msg.data.users);
      });

      channel.subscribe("classroom-deleted", () => {
        onClassroomDeleted();
      });

      channel.subscribe("kicked", (msg) => {
        if (msg.data.targetId === client.auth.clientId) {
          onKicked();
        }
      });

      channel.subscribe("permission-request-to-owner", (msg) => {
        if (isOwner) {
          onPermissionRequestToOwner(msg.data);
        }
      });

      channel.subscribe("permission-response", (msg) => {
        if (msg.data.studentId === client.auth.clientId) {
          onPermissionResponse({ permissionGranted: msg.data.approved });
        }
      });

      // Join the room via API
      try {
        const res = await fetch("/api/classroom/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classroomId,
            userName,
            isOwner,
            clientId: client.auth.clientId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          onUsersUpdate(data.users);
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Failed to join classroom:", err);
      }
    };

    client.connection.once("connected", () => {
      setupChannel();
    });

    if (client.connection.state === "connected") {
      setupChannel();
    }

    return () => {
      // Leave room via API
      fetch("/api/classroom/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId,
          userName,
          isOwner,
          clientId: client.auth.clientId,
        }),
      }).catch(() => {});

      channel.unsubscribe();
      channel.detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, userName, isOwner]);

  const emitCodeChange = useCallback(
    (code: string) => {
      channelRef.current?.publish("code-update", { code });
    },
    []
  );

  const emitLanguageChange = useCallback(
    (language: string) => {
      channelRef.current?.publish("language-update", { language });
    },
    []
  );

  const emitCollabModeChange = useCallback(
    (collabMode: boolean) => {
      channelRef.current?.publish("collab-mode-update", { collabMode });
    },
    []
  );

  const emitPermissionRequest = useCallback(
    (studentId: string, studentName: string) => {
      channelRef.current?.publish("permission-request-to-owner", {
        studentId,
        studentName,
      });
    },
    []
  );

  const emitPermissionResponse = useCallback(
    (studentId: string, approved: boolean) => {
      // Update server state
      fetch("/api/classroom/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, studentId, approved }),
      }).catch(() => {});

      channelRef.current?.publish("permission-response", {
        studentId,
        approved,
      });
    },
    [classroomId]
  );

  const emitRemoveUser = useCallback(
    (userId: string) => {
      fetch("/api/classroom/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, userId }),
      }).catch(() => {});

      channelRef.current?.publish("kicked", { targetId: userId });
    },
    [classroomId]
  );

  const emitKickAndClear = useCallback(
    (userId: string, classroomName: string) => {
      fetch("/api/classroom/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId, userId }),
      }).catch(() => {});

      channelRef.current?.publish("kicked", { targetId: userId });
      channelRef.current?.publish("code-reset", {
        code: `// Welcome to ${classroomName}!`,
      });
    },
    [classroomId]
  );

  const emitDeleteClassroom = useCallback(() => {
    fetch("/api/classroom/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classroomId }),
    }).catch(() => {});

    channelRef.current?.publish("classroom-deleted", {});
  }, [classroomId]);

  return {
    isConnected,
    emitCodeChange,
    emitLanguageChange,
    emitCollabModeChange,
    emitPermissionRequest,
    emitPermissionResponse,
    emitRemoveUser,
    emitKickAndClear,
    emitDeleteClassroom,
    clientId: clientRef.current?.auth.clientId || null,
  };
}
