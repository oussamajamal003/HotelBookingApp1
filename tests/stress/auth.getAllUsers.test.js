import http from 'k6/http';
import { check, sleep } from 'k6';

const scenarios = {
  normal: {
    executor: 'constant-arrival-rate',
    rate: 1,
    timeUnit: '1s',
    duration: '2m',
    preAllocatedVUs: 10, // Admin users are usually few, but we can simulate load
    maxVUs: 50,
  },
  high: {
    executor: 'constant-arrival-rate',
    rate: 5,
    timeUnit: '1s',
    duration: '5m',
    preAllocatedVUs: 50,
    maxVUs: 100,
  },
  stress: {
    executor: 'ramping-arrival-rate',
    startRate: 1,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 200,
    stages: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 50 },
      { duration: '1m', target: 0 },
    ],
  },
};

const SCENARIO_NAME = __ENV.SCENARIO || 'normal';

export const options = {
  scenarios: {
    [SCENARIO_NAME]: scenarios[SCENARIO_NAME],
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'avg<200', 'max<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/auth';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin123';

export function setup() {
  // Login as admin to get token
  const payload = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/login`, payload, params);

  if (res.status !== 200) {
    console.error(`Admin login failed with status ${res.status}. Response: ${res.body}`);
    // If we can't login as admin, we can't proceed.
    // However, k6 setup failure stops the test.
    // We'll throw an error to make it clear.
    throw new Error('Could not login as admin. Please provide valid ADMIN_EMAIL and ADMIN_PASSWORD env vars.');
  }

  return { token: res.json('token') };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(`${BASE_URL}/`, params); // GET /api/auth/ (list all users)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
