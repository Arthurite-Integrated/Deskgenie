import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import env from "@/app/config/env";

const openai = new OpenAI({
  apiKey: env.NEXT_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function GET(request: NextRequest) {
  try {
    const session = await openai.beta.realtime.sessions.create({
      model: "gpt-4o-realtime-preview",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Session token generated successfully!",
        data: session.client_secret.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating session token:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate session token",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
