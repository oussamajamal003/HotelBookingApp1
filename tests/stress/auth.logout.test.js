import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const scenarios = {
  normal: {
    executor: 'constant-arrival-rate',
    rate: 1,
    timeUnit: '1s',
    duration: '2m',
    preAllocatedVUs: 50,
    maxVUs: 100,
  },
  high: {
    executor: 'constant-arrival-rate',
    rate: 5,
    timeUnit: '1s',
    duration: '5m',
    preAllocatedVUs: 500,
    maxVUs: 1000,
  },
  stress: {
    executor: 'ramping-arrival-rate',
    startRate: 1,
    timeUnit: '1s',
    preAllocatedVUs: 500,
    maxVUs: 3000,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 2000 },
      { duration: '2m', target: 0 },
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

export function setup() {
  const email = `logout-test-${randomString(10)}@k6.local`;
  const password = 'password123';
  
  const payload = JSON.stringify({
    username: `LogoutUser-${randomString(5)}`, // Randomize to avoid collisions
    email: email,
    password: password,
    role: 'user'
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/signup`, payload, params);

  if (res.status !== 201) {
    throw new Error(`Setup failed: Unable to create user. Status: ${res.status}`);
  }

  return { email, password };
}

export default function (data) {
  // 1. Login to get token
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    email: data.email,
    password: data.password,
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'login success': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  // 2. Logout using token
  const logoutRes = http.post(`${BASE_URL}/logout`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    tags: { name: 'LogoutRequest' } // Tag for separate metrics if needed
  });

  check(logoutRes, {
    'logout status 200': (r) => r.status === 200,
    'logout time < 500ms': (r) => r.timings.duration < 500,
  });

  if (logoutRes.status !== 200) {
    console.warn(`Logout failed. Status: ${logoutRes.status} Body: ${logoutRes.body}`);
  }
  
  sleep(1);
}
