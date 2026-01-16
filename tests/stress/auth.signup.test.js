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
      { duration: '2m', target: 10 }, // Ramp up
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
    http_req_duration: ['p(95)<500', 'avg<200', 'max<2000'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/auth';

export default function () {
  const email = `test-${randomString(10)}@k6.local`;
  const payload = JSON.stringify({
    username: `User ${randomString(5)}`,
    email: email,
    password: 'password123',
    role: 'user'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/signup`, payload, params);

  const isSuccessful = check(res, {
    'is status 201': (r) => r.status === 201, // Assuming 201 Created
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });

  if (!isSuccessful) {
    console.warn(`Signup failed. Status: ${res.status} Body: ${res.body}`);
  }

  sleep(1);
}
