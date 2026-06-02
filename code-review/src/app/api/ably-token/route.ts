import { NextRequest, NextResponse } from "next/server";
import Ably from "ably";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ABLY_API_KEY not configured" },
      { status: 500 }
    );
  }

  const client = new Ably.Rest({ key: apiKey });
  const clientId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const tokenRequest = await client.auth.createTokenRequest({
    clientId,
    capability: { "*": ["publish", "subscribe", "presence"] },
  });

  return NextResponse.json(tokenRequest);
}
