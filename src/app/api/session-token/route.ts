import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/app/utils/user.controller";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionToken()

    return NextResponse.json(
      {
        success: true,
        message: "Session token generated successfully!",
        data: session,
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
