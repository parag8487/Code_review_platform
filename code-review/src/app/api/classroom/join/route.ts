import { NextRequest, NextResponse } from "next/server";
import {
  createClassroom,
  addUserToClassroom,
  getClassroom,
  getClassroomUsers,
  broadcastToClassroom,
  broadcastClassroomsList,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId, userName, isOwner, clientId, classroomData } =
    await req.json();

  if (!classroomId || !userName) {
    return NextResponse.json(
      { error: "classroomId and userName required" },
      { status: 400 }
    );
  }

  // If creating a new classroom (owner joining for first time)
  if (classroomData && isOwner) {
    const existing = getClassroom(classroomId);
    if (!existing) {
      createClassroom(classroomData);
      await broadcastClassroomsList();
    }
  }

  const user = {
    id: clientId || `user-${Date.now()}`,
    name: userName,
    isOwner: !!isOwner,
    hasPermission: !!isOwner,
  };

  const users = addUserToClassroom(classroomId, user);

  // Broadcast updated users to all in the classroom
  await broadcastToClassroom(classroomId, "users-update", { users });

  const classroom = getClassroom(classroomId);

  return NextResponse.json({ users, classroom });
}
