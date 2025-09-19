import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// Custom metrics for capacity analysis
const errorRate = new Rate("error_rate");
const responseTime = new Trend("response_time");
const successfulLogins = new Counter("successful_logins");
const failedLogins = new Counter("failed_logins");

export let options = {
  // Gradual ramp-up to find maximum concurrent user capacity
  stages: [
    { duration: "2m", target: 50 },    // Ramp up to 50 users
    { duration: "2m", target: 100 },   // Increase to 100 users
    { duration: "2m", target: 200 },   // Push to 200 users
    { duration: "2m", target: 300 },   // Test 300 users
    { duration: "2m", target: 500 },   // Test 500 users
    { duration: "2m", target: 750 },   // Test 750 users
    { duration: "2m", target: 1000 },  // Test 1000 users
    { duration: "3m", target: 1000 },  // Sustain 1000 users
    { duration: "2m", target: 0 },     // Ramp down
  ],
  
  // Performance thresholds to identify capacity limits
  thresholds: {
    // Response time thresholds
    http_req_duration: [
      "p(50)<3000",   // 50% of requests should be below 3s
      "p(95)<10000",  // 95% of requests should be below 10s
      "p(99)<15000",  // 99% of requests should be below 15s
    ],
    
    // Error rate thresholds
    http_req_failed: ["rate<0.05"],     // Error rate should be below 5%
    error_rate: ["rate<0.05"],          // Custom error rate below 5%
    
    // Request rate thresholds
    http_reqs: ["rate>10"],             // Should handle at least 10 req/s
    
    // Check success thresholds
    checks: ["rate>0.90"],              // 90% of checks should pass
  },
  
  // Additional options for capacity testing
  discardResponseBodies: true,  // Save memory during high load
  noConnectionReuse: false,     // Allow connection reuse for realistic testing
};

const BASE_URL = "http://103.89.50.67";
const LOGIN_ENDPOINT = "/api/v1/Authenticate/login";

// Test credentials
const TEST_CREDENTIALS = {
  UserName: "WWTinmeb",
  Password: "Mcis2242025"
};

// Authorization token
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJYNlFNV0U5a05XekxMU3VjQ2xWbVRCb2t3WFIrU2lZclgvUUpiRVpPMWlkeklmb0dCTGtrNFNtK3U1NWYwb0NyIiwicm9sZSI6IlNBIiwidW5pcXVlX25hbWUiOiJXYXIgV2FyIFRpbiIsImp0aSI6IjdmYmMxYTE3LTViNWItNDRhZS1iZGY1LWM3NDc3MTlkZGMyOSIsImlhdCI6MTc1ODE2NzQzNSwibmJmIjoxNzU4MTY3NDM1LCJleHAiOjE3NTgxODgyOTMsImlzcyI6Ik1pbmlzdHJ5IG9mIEZpbmFuY2UgTXlhbm1hciIsImF1ZCI6IkdvdmVybm1lbnQncyBBdXRob3JpemVkIExlbmRlcnMifQ.an52PpFM2KL4pXiLnYIFU1Y7b-yxg0l4L0bbUX5cHUc";

export default function () {
  const startTime = Date.now();
  
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
    timeout: "30s", // Set timeout for high load scenarios
  });

  // Calculate response time
  const responseTimeMs = Date.now() - startTime;
  responseTime.add(responseTimeMs);

  // Track errors
  const isError = response.status !== 200;
  errorRate.add(isError);

  // Comprehensive checks for capacity analysis
  const checksResult = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 10s": (r) => r.timings.duration < 10000,
    "response time < 5s": (r) => r.timings.duration < 5000,
    "response has body": (r) => r.body && r.body.length > 0,
    "no server errors (5xx)": (r) => r.status < 500,
    "no client errors (4xx)": (r) => r.status < 400 || r.status >= 500,
  });

  // Track login success/failure
  if (response.status === 200) {
    successfulLogins.add(1);
  } else {
    failedLogins.add(1);
    console.error(`Login failed - Status: ${response.status}, VUs: ${__VU}, Iteration: ${__ITER}`);
  }

  // Log performance degradation
  if (responseTimeMs > 10000) {
    console.warn(`Slow response detected: ${responseTimeMs}ms - VUs: ${__VU}`);
  }

  // Variable sleep time based on load (simulate realistic user behavior)
  const currentVUs = __ENV.K6_VUS || 1;
  const sleepTime = currentVUs > 500 ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1;
  sleep(sleepTime);
}

// Setup function - runs once at the beginning
export function setup() {
  console.log("🚀 Starting API Concurrent User Capacity Test");
  console.log(`📍 Target URL: ${BASE_URL}${LOGIN_ENDPOINT}`);
  console.log(`👤 Test User: ${TEST_CREDENTIALS.UserName}`);
  console.log("📊 Test will gradually increase concurrent users to find capacity limits");
  console.log("⏱️  Total test duration: ~21 minutes");
  
  // Test initial connectivity
  const testResponse = http.get(BASE_URL);
  if (testResponse.status !== 200) {
    console.warn(`⚠️  Initial connectivity test failed: ${testResponse.status}`);
  } else {
    console.log("✅ Initial connectivity test passed");
  }
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log("\n🏁 API Concurrent User Capacity Test Completed");
  console.log("📈 Check the results above to determine:");
  console.log("   • Maximum concurrent users your API can handle");
  console.log("   • Response time degradation patterns");
  console.log("   • Error rate at different load levels");
  console.log("   • Performance bottlenecks and capacity limits");
}

// Handle script interruption gracefully
export function handleSummary(data) {
  const maxVUs = Math.max(...Object.keys(data.metrics.vus?.values || {}).map(Number));
  const avgResponseTime = data.metrics.http_req_duration?.values?.avg || 0;
  const errorRate = data.metrics.http_req_failed?.values?.rate || 0;
  const totalRequests = data.metrics.http_reqs?.values?.count || 0;
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 CAPACITY TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`🔢 Maximum Concurrent Users Tested: ${maxVUs}`);
  console.log(`⏱️  Average Response Time: ${(avgResponseTime/1000).toFixed(2)}s`);
  console.log(`❌ Error Rate: ${(errorRate * 100).toFixed(2)}%`);
  console.log(`📈 Total Requests Processed: ${totalRequests}`);
  console.log("=".repeat(60));
  
  return {
    'capacity-test-summary.json': JSON.stringify(data, null, 2),
  };
}