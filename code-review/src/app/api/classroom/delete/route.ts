import { NextRequest, NextResponse } from "next/server";
import {
  deleteClassroom,
  broadcastToClassroom,
  broadcastClassroomsList,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId } = await req.json();

  if (!classroomId) {
    return NextResponse.json(
      { error: "classroomId required" },
      { status: 400 }
    );
  }

  await broadcastToClassroom(classroomId, "classroom-deleted", {});
  deleteClassroom(classroomId);
  await broadcastClassroomsList();

  return NextResponse.json({ success: true });
}
