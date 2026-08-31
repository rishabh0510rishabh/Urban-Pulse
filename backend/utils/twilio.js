const twilio = require("twilio");

let client = null;
if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN
) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (e) {
    console.warn("Twilio initialization warning:", e.message);
  }
}

async function sendSMS(to, body) {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[Mock SMS] To: +91${to} | Message: ${body}`);
    return { sid: "mock_sms_sid" };
  }
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${to}`, // India format (adjust if global)
    });

    console.log("SMS sent:", message.sid);
    return message;
  } catch (err) {
    console.error("Twilio SMS Error:", err);
    throw err;
  }
}

module.exports = { sendSMS };
