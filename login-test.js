import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "10s", target: 5 },   // ramp up to 5 users
    { duration: "30s", target: 10 },  // stay at 10 users
    { duration: "10s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.1"],     // error rate should be below 10%
  },
};

const BASE_URL = "http://103.89.50.67";
const LOGIN_ENDPOINT = "/api/v1/Authenticate/login";

// Test credentials
const TEST_CREDENTIALS = {
  UserName: "WWTinmeb",
  Password: "Mcis2242025"
};

// Authorization token (if needed for the request)
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJYNlFNV0U5a05XekxMU3VjQ2xWbVRCb2t3WFIrU2lZclgvUUpiRVpPMWlkeklmb0dCTGtrNFNtK3U1NWYwb0NyIiwicm9sZSI6IlNBIiwidW5pcXVlX25hbWUiOiJXYXIgV2FyIFRpbiIsImp0aSI6IjdmYmMxYTE3LTViNWItNDRhZS1iZGY1LWM3NDc3MTlkZGMyOSIsImlhdCI6MTc1ODE2NzQzNSwibmJmIjoxNzU4MTY3NDM1LCJleHAiOjE3NTgxODgyOTMsImlzcyI6Ik1pbmlzdHJ5IG9mIEZpbmFuY2UgTXlhbm1hciIsImF1ZCI6IkdvdmVybm1lbnQncyBBdXRob3JpemVkIExlbmRlcnMifQ.an52PpFM2KL4pXiLnYIFU1Y7b-yxg0l4L0bbUX5cHUc";

export default function () {
  // Prepare headers
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AUTH_TOKEN}`,
  };

  // Prepare payload
  const payload = JSON.stringify(TEST_CREDENTIALS);

  // Make login request
  const response = http.post(`${BASE_URL}${LOGIN_ENDPOINT}`, payload, {
    headers: headers,
  });

  // Validate response
  const loginSuccess = check(response, {
    "login request successful": (r) => r.status === 200,
    "response time < 2000ms": (r) => r.timings.duration < 2000,
    "response has body": (r) => r.body && r.body.length > 0,
    "content type is JSON": (r) => 
      r.headers["Content-Type"] && 
      r.headers["Content-Type"].includes("application/json"),
  });

  // Additional checks for successful login response
  if (loginSuccess && response.status === 200) {
    try {
      const responseBody = JSON.parse(response.body);
      
      check(responseBody, {
        "response contains token": (body) => body.token !== undefined,
        "response contains user info": (body) => body.user !== undefined || body.userName !== undefined,
        "token is not empty": (body) => body.token && body.token.length > 0,
      });

      console.log(`Login successful for user: ${TEST_CREDENTIALS.UserName}`);
    } catch (e) {
      console.error("Failed to parse response JSON:", e);
    }
  } else {
    console.error(`Login failed with status: ${response.status}, body: ${response.body}`);
  }

  // Wait between requests
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log("Starting login API stress test...");
  console.log(`Target URL: ${BASE_URL}${LOGIN_ENDPOINT}`);
  console.log(`Test user: ${TEST_CREDENTIALS.UserName}`);
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log("Login API stress test completed.");
}