import Mailer from "@/app/utils/Mailer";
import { EventEmitter } from "events";

const AppointmentEmmiter = new EventEmitter();
const m = new Mailer()

AppointmentEmmiter.on('alert', async (data) => {
  console.log(data)
  const { mail } = data;
  const { subject, email, html } = mail;
  await m.sendMailWithHtml(email, subject, html )
})

AppointmentEmmiter.on('alert_user', async (data) => {
  const { mail } = data;
  const { subject, email, html } = mail;
  await m.sendMailWithHtml(email, subject, html )
})

export default AppointmentEmmiter;