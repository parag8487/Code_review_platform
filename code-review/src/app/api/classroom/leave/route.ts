import { NextRequest, NextResponse } from "next/server";
import {
  removeUserByName,
  deleteClassroom,
  broadcastToClassroom,
  broadcastClassroomsList,
  getClassroom,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId, userName, isOwner } = await req.json();

  if (!classroomId || !userName) {
    return NextResponse.json(
      { error: "classroomId and userName required" },
      { status: 400 }
    );
  }

  if (isOwner) {
    // Owner leaving = delete classroom
    await broadcastToClassroom(classroomId, "classroom-deleted", {});
    deleteClassroom(classroomId);
    await broadcastClassroomsList();
  } else {
    const users = removeUserByName(classroomId, userName);
    await broadcastToClassroom(classroomId, "users-update", { users });
  }

  return NextResponse.json({ success: true });
}
