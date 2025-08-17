import axios from "axios";
import env from "../config/env";

class DeskGenieClient {

  async getSessionToken() {
    try {
      const res = await axios({
        method: "GET",
        url: `/api/session-token`, // Using local Next.js API route
      });
      console.log(res.data);
      return res.data.data;
    } catch (e) {
      console.error(`Error ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async getAllCalenderDetails() {
    try {
      const res = await axios({
        method: "GET",
        url: `${env.NEXT_PUBLIC_SERVER_URL}/api/calendar`,
        withCredentials: true,
      });
      console.log(res.data);
      return res.data.data;
    } catch (e) {
      console.error(`Error ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async getFewCalenderDetails(month: number, date: number) {
    try {
      const res = await axios({
        method: "GET",
        url: `${env.NEXT_PUBLIC_SERVER_URL}/api/calendar/${month}${date !== null ? `?date=${date}` : undefined}`,
        withCredentials: true,
      });
      console.log(res.data);
      return res.data.data;
    } catch (e) {
      console.error(`Error ${e}`);
    }
  }

  async storeHistory() {}
}

export default DeskGenieClient;
