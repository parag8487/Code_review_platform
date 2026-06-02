import { NextResponse } from "next/server";
import { getClassrooms } from "@/lib/classroom-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const classrooms = getClassrooms();
  return NextResponse.json({ classrooms });
}
