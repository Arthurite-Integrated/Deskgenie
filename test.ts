import { Agent, run } from '@openai/agents';
import * as tools from '@/app/tools'

const agent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant.',
  tools: Object.values(tools)
});

const result = await run(
  agent,
  // `Schedule a physical appointment for 10th of November, 9pm i want to meet the company for a business trip plan. sarafasatar@gmail.com. I'm spectra`,
  `Hi Genie! I need to schedule a business consultation appointment. Here are all my details:

Name: Sara Fasatar (S-A-R-A  F-A-S-A-T-A-R)
Email: sarafasatar@gmail.com (s-a-r-a-f-a-s-a-t-a-r at g-m-a-i-l dot com)
Phone: (555) 123-4567
Appointment Type: Business Strategy Consultation
Description: I need a comprehensive business strategy consultation to discuss growth opportunities, market analysis, and operational improvements for my startup company.
Preferred Date: Next Wednesday, January 27th, 2026 at 2:00 PM
Meeting Type: Virtual
Duration: 60 minutes

Please confirm this appointment and send me the meeting details. I've provided all the information needed - no need to ask for additional details.`
);

console.log(result.finalOutput);

// console.log(await db.query.appointment.findFirst({
//   where: (a, {eq}) => eq(a.reference_id, 'TZM3E6s')
// }))

// import { sendCancelNotification, sendRescheduleNotification } from "@/app/server/helper/appointment.helper";
// await sendCancelNotification('MEMMEME', { email: 'sarafasatar@gmail.com', name: 'spectra gee'})