"use server"

import OpenAI from "openai";
import env from "../config/env";

export async function getSessionToken() {
  const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true,
  });

  const session = await openai.beta.realtime.sessions.create({
    model: "gpt-4o-realtime-preview",
  });

  console.log("Session token: ", session.client_secret.value)
  
  return session.client_secret.value
}
