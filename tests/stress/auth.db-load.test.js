import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    signup_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      exec: 'signup',
    },
    login_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      exec: 'login',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Relaxed for mixed load
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/auth';

export function setup() {
  // Create a user for the login tests
  const email = `dbload-${randomString(10)}@k6.local`;
  const password = 'password123';
  
  const payload = JSON.stringify({
    username: `DBLoadUser-${randomString(5)}`,
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

export function signup() {
  const email = `stress-${randomString(10)}@k6.local`;
  const payload = JSON.stringify({
    username: `User ${randomString(5)}`,
    email: email,
    password: 'password123',
    role: 'user'
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/signup`, payload, params);

  check(res, {
    'signup status 201': (r) => r.status === 201,
  });
  sleep(1);
}

export function login(data) {
  const payload = JSON.stringify({
    email: data.email,
    password: data.password,
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/login`, payload, params);

  check(res, {
    'login status 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });
  sleep(1);
}
