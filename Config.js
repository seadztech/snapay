module.exports = {
  DB_CONNECTION_STRING: process.env.DB_URI,
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  C2B_APPLICATION_ENDPOINT: process.env.C2B_APPLICATION_ENDPOINT,
  // C2B_APPLICATION_ENDPOINT: "http://localhost:3000/api/mtransactions",
  // C2B_APPLICATION_ENDPOINT: "https://epos.snaveware.com/api/mtransactions",
  ADAPTERS: ["MPESA", "NAWIRI", "WINAS", "KCB", "MPESA-TILL"],
  SMS_BATCH: 100,
  MAX_ATTEMPTS: 5,
  PROCESS_POLLING_INTERVAL:
    parseInt(process.env.PROCESS_POLLING_INTERVAL) || 30000,
  COMPANY_GET_URL: "https://snaveware.com/api/companies",
  COMPANY_SMS_POST_PATH: "/mtransactions/api/sms",
};
