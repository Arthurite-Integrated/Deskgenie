"use server"

import OpenAI from "openai";

export async function getSessionToken() {
  const apiKey = process.env.NEXT_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not found in environment variables");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const session = await openai.beta.realtime.sessions.create({
    model: "gpt-4o-realtime-preview",
  });

  console.log("Session token: ", session.client_secret.value)
  
  return session.client_secret.value
}
