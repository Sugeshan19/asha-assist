const twilio = require('twilio');

const buildMessage = ({ patientName, village, disease, riskLevel }) =>
  `[ASHA Assist] HIGH RISK ALERT: Patient ${patientName} from ${village} village has possible ${disease}. Risk Level: ${riskLevel}. Please review immediately on ASHA Assist portal.`;

exports.sendDoctorAlert = async ({ doctorPhone, patientName, village, disease, riskLevel }) => {
  const message = buildMessage({ patientName, village, disease, riskLevel });

  // Check if Twilio is configured
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID.startsWith('AC_') || TWILIO_ACCOUNT_SID.startsWith('ACx')) {
    console.log('[SMS Mock] Would send to', doctorPhone, ':', message);
    return { success: true, sid: `MOCK_${Date.now()}`, message, mock: true };
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: doctorPhone
    });
    console.log(`[SMS] Alert sent to ${doctorPhone}, SID: ${result.sid}`);
    return { success: true, sid: result.sid, message };
  } catch (err) {
    console.error('[SMS] Failed to send alert:', err.message);
    return { success: false, error: err.message, message };
  }
};
