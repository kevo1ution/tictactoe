require('dotenv').config();
const { spawn } = require('child_process');
const axios = require('axios');
const getPort = require('get-port');

const { waitFor } = require('./util');

function waitUntilRunning(api, timeout = 10000, buffer = 200) {
  return waitFor(async () => { await api.get('/readiness'); },
    timeout, buffer, 'Server was not ready');
}

async function spawnServer(env, api) {
  const server = spawn('node', ['index.js'], { env });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
  try {
    await waitUntilRunning(api);
  } catch (err) {
    server.kill();
    throw err;
  }
  return server;
}

function killServer(server) {
  server.kill();
}

async function spawnApp() {
  const env = {
    GOOGLE_STORAGE_BUCKET_URL: process.env.GOOGLE_STORAGE_BUCKET_URL,
    MONGODB_CONNECTION_URL: process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/test?replicaSet=testrs',
    PATH: process.env.PATH,
    PORT: await getPort(),
    REDIS_CONNECTION_URL: process.env.REDIS_CONNECTION_URL,
  };
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  }
  const baseURL = `http://localhost:${env.PORT}`;
  const api = axios.create({ baseURL });
  const server = await spawnServer(env, api);
  return { api, server, baseURL };
}

async function killApp(app) {
  killServer(app.server);
}

module.exports = { spawnApp, killApp };
