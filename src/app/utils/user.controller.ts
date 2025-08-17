"use server"

import OpenAI from "openai";
import env from "../config/env";

export async function getSessionToken() {
  const openai = new OpenAI({
    apiKey: env.NEXT_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const session = await openai.beta.realtime.sessions.create({
    model: "gpt-4o-realtime-preview",
  });
  
  return session.client_secret.value
}
