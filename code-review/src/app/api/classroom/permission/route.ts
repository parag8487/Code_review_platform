import { NextRequest, NextResponse } from "next/server";
import {
  updateUserPermission,
  broadcastToClassroom,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId, studentId, approved } = await req.json();

  if (!classroomId || !studentId || approved === undefined) {
    return NextResponse.json(
      { error: "classroomId, studentId, and approved required" },
      { status: 400 }
    );
  }

  const users = updateUserPermission(classroomId, studentId, approved);
  await broadcastToClassroom(classroomId, "users-update", { users });
  await broadcastToClassroom(classroomId, "permission-response", {
    studentId,
    approved,
  });

  return NextResponse.json({ success: true, users });
}
