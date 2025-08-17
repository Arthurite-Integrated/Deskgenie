import { tool } from "@openai/agents/realtime";
import { z } from "zod";
import DeskGenieClient from "../utils/DeskGenie";

export const weatherTool = tool({
  name: "WeatherTool",
  description: "This tool is an expert in fetching weather data.",
  parameters: z.object({
    city: z.string().describe("The city the user is trying to get it's weather."),
  }),
  execute: async ({ city }) => {
    return `The wather at ${city} is sunny.`;
  },
});

export const accessGoogleCalender = tool({
  name: "AccessGoogleCalenderTool",
  description:
    "This tool is an expert in accessing feww google calender informations by month & date.",
  parameters: z.object({
    month: z.number(),
    date: z.number().optional().nullable().describe("Only specify the dat"),
  }),
  execute: async ({ month, date }) => {
    const r = new DeskGenieClient();
    const gc = await r.getFewCalenderDetails(month, date as number);
    if (!gc) return { status: false, data: { msg: "No data" } };
    return { status: true, data: { calendar: gc } };
  },
});

export const accessAllGoogleCalendarData = tool({
  name: "accessAllGoogleCalendarDataTool",
  description: "This tool is an expert in accessing full google calender informations.",
  parameters: z.object({}),
  execute: async () => {
    const r = new DeskGenieClient();
    const gc = await r.getAllCalenderDetails();
    if (!gc) return { status: false, data: { msg: "No data" } };
    return { status: true, data: { calendar: gc } };
  },
});
