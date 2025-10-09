import { NextRequest } from "next/server";
import { Server as ServerIO } from "socket.io";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // For serverless environments like Vercel, we just return a successful response
  // The actual socket.io connection will be handled by the client connecting directly
  console.log("Socket.io endpoint called");
  return new Response(JSON.stringify({ 
    status: "ok", 
    message: "Socket.io endpoint is ready" 
  }), { 
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}