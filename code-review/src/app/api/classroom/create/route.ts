import { NextRequest, NextResponse } from "next/server";
import {
  createClassroom,
  broadcastClassroomsList,
} from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { id, name, owner, pass } = await req.json();

  if (!id || !name || !owner) {
    return NextResponse.json(
      { error: "id, name, and owner required" },
      { status: 400 }
    );
  }

  createClassroom({ id, name, owner, pass: pass || "" });
  await broadcastClassroomsList();

  return NextResponse.json({ success: true, id });
}
