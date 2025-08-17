// import { auth } from "./auth";
import { google } from 'googleapis'
import { CE_BAD_REQUEST } from "./Error";
import env from "../config/env";

class Google {
  private access_token: string;
  private refresh_token: string; 
  private expiry_date: Date;
  
  constructor(access_token: string, refresh_token: string, expiry_date: Date ) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.expiry_date = expiry_date;
  }

  async initializeOAuth() {
    if (!this.access_token || !this.refresh_token || !this.expiry_date) throw new Error('Missing or invalid user tokens.')
    
    const oAuth2Client = new google.auth.OAuth2({
      clientId: 'env.GOOGLE_CLIENT_ID',
      clientSecret: 'env.GOOGLE_CLIENT_SECRET'
    });

    oAuth2Client.setCredentials({
      access_token: this.access_token, 
      refresh_token: this.refresh_token, 
      expiry_date: this.expiry_date.getTime(),
    })

    return oAuth2Client;
  }

  async gCalender() {
    try {
      const t = await this.initializeOAuth()
      const gc = google.calendar({ version: 'v3', auth: t })
      return gc
    } catch(e: any) {
      console.error('[Google Calendar API] Error:', e);
      throw CE_BAD_REQUEST(e.message);
    }
  }

  async gCalenderGet(options?:  { calendarId: string, maxResults: number }) {
    try {
      const gc = await this.gCalender()
  
      const now = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      const result = await gc.events.list({
        calendarId: options?.calendarId || 'primary',
        timeMin: now.toISOString(),
        timeMax: sixMonthsFromNow.toISOString(),
        maxResults: options?.maxResults || 2500,
        singleEvents: true,
        orderBy: 'startTime'
      })
  
      return result.data.items || []
    } catch(e: any) {
      console.error('[Google Calendar API] Error:', e);
      throw CE_BAD_REQUEST(e.message);
    }
  }

  // async gCalenderGetByMonth(options?:  { calendarId?: string, maxResults?: number, month?: number }) {
  //   try {
  //     const gc = await this.gCalender()
  
  //     const now = new Date();
  //     const targetMonth = options?.month ?? now.getMonth();
  //     const currentYear = now.getFullYear();
      
  //     const startOfMonth = new Date(currentYear, targetMonth, 1);
  //     const endOfMonth = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59, 999);
      
  //     const result = await gc.events.list({
  //       calendarId: options?.calendarId || 'primary',
  //       timeMin: startOfMonth.toISOString(),
  //       timeMax: endOfMonth.toISOString(),
  //       maxResults: options?.maxResults || 31,
  //       singleEvents: true,
  //       orderBy: 'startTime'
  //     })
  
  //     return result.data.items || []
  //   } catch(e: any) {
  //     console.error('[Google Calendar API] Error:', e);
  //     throw CE_BAD_REQUEST(e.message);
  //   }
  // }

  async gCalenderGetByMonth(options?:  { calendarId?: string, maxResults?: number, month?: number, day?: number }) {
    try {
      const gc = await this.gCalender()
  
      const now = new Date();
      const targetMonth = options?.month ?? now.getMonth();
      const targetDay = options?.day ?? now.getDate();
      const currentYear = now.getFullYear();
      
      const startOfDay = new Date(currentYear, targetMonth, targetDay, 0, 0, 0, 0);
      const endOfDay = new Date(currentYear, targetMonth, targetDay, 23, 59, 59, 999);
      
      const result = await gc.events.list({
        calendarId: options?.calendarId || 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        maxResults: options?.maxResults || 50,
        singleEvents: true,
        orderBy: 'startTime'
      })
  
      return result.data.items || []
    } catch(e: any) {
      console.error('[Google Calendar API] Error:', e);
      throw CE_BAD_REQUEST(e.message);
    }
  }
}

export default Google;