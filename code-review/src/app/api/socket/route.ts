import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // This endpoint is used to initialize the socket.io server
  // The actual socket.io server is initialized in the socket_io/route.ts file
  return new Response(null, { status: 200 });
}