import { NextRequest, NextResponse } from "next/server";
import { getClassroom, getClassroomUsers } from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { classroomId } = await req.json();

  if (!classroomId) {
    return NextResponse.json({ error: "classroomId required" }, { status: 400 });
  }

  const classroom = getClassroom(classroomId);
  if (!classroom) {
    return NextResponse.json({ classroom: null, users: [] });
  }

  const users = getClassroomUsers(classroomId);
  return NextResponse.json({ classroom, users });
}
