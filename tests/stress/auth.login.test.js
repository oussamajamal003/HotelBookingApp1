import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configuration scenarios
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
      { duration: '2m', target: 50 }, // Ramp up
      { duration: '5m', target: 2000 }, // Stress
      { duration: '2m', target: 0 }, // Ramp down
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

// Setup: Create a user to log in with
export function setup() {
  const email = `login-test-${randomString(10)}@k6.local`;
  const password = 'password123';
  
  const payload = JSON.stringify({
    username: `LoginUser-${randomString(5)}`,
    email: email,
    password: password,
    role: 'user'
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/signup`, payload, params);
  
  if (res.status !== 201) {
    throw new Error(`Setup failed: Unable to create user. Status: ${res.status}`);
  }

  return { email, password };
}

export default function (data) {
  const payload = JSON.stringify({
    email: data.email,
    password: data.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/login`, payload, params);

  const isSuccessful = check(res, {
    'is status 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });

  if (!isSuccessful) {
    console.warn(`Login failed. Status: ${res.status} Body: ${res.body}`);
  }

  sleep(1);
}
