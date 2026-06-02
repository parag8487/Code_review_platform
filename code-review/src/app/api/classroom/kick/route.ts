import { NextRequest, NextResponse } from "next/server";
import {
  removeUserFromClassroom,
  broadcastToClassroom,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId, userId } = await req.json();

  if (!classroomId || !userId) {
    return NextResponse.json(
      { error: "classroomId and userId required" },
      { status: 400 }
    );
  }

  const users = removeUserFromClassroom(classroomId, userId);
  await broadcastToClassroom(classroomId, "users-update", { users });
  await broadcastToClassroom(classroomId, "kicked", { targetId: userId });

  return NextResponse.json({ success: true, users });
}
