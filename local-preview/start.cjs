const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { initialize } = require('./configure-env.cjs');
const { MongoClient } = require('mongodb');

(async () => {
  const dbPath = path.join(__dirname, 'db');
  const stopRequest = path.join(__dirname, 'stop.request');
  fs.rmSync(stopRequest, { force: true });
  fs.mkdirSync(dbPath, { recursive: true });
  const config = initialize();
  const mongo = await MongoMemoryServer.create({
    instance: { ip: '127.0.0.1', port: 27018, dbPath, dbName: 'novacart_local_preview', storageEngine: 'wiredTiger' },
    binary: { version: '8.0.16', downloadDir: path.join(__dirname, 'mongodb-binaries') },
  });
  const cwd = path.resolve(__dirname, '../server');
  const env = {
    ...process.env,
    ...config,
    MONGO_URI: mongo.getUri('novacart_local_preview'),
  };
  console.log('Isolated local preview database ready.');
  const marker = path.join(__dirname, 'seeded');
  if (!fs.existsSync(marker)) {
    await new Promise((resolve, reject) => {
      const seed = spawn(process.execPath, ['utils/seeder.js'], { cwd, env, stdio: 'inherit', windowsHide: true });
      seed.on('exit', code => code === 0 ? resolve() : reject(new Error(`Seeder exited: ${code}`)));
      seed.on('error', reject);
    });
    fs.writeFileSync(marker, 'Local preview catalog seeded.');
  }
  const server = spawn(process.execPath, ['server.js'], { cwd, env, stdio: 'inherit', windowsHide: true });
  let stopping = false;
  const stop = async (code = 0) => {
    if (stopping) return;
    stopping = true;
    fs.unwatchFile(stopRequest);
    server.kill();
    const admin = new MongoClient(mongo.getUri(), { serverSelectionTimeoutMS: 3000, socketTimeoutMS: 3000 });
    try {
      await admin.connect();
      await admin.db('admin').command({ shutdown: 1 });
    } catch (error) {
      // MongoDB normally closes the socket before replying to a shutdown command.
      if (!['MongoNetworkError', 'MongoServerSelectionError'].includes(error.name)) console.warn('Local database shutdown:', error.name);
    } finally { await admin.close(); }
    await mongo.stop({ doCleanup: false });
    fs.rmSync(stopRequest, { force: true });
    process.exit(code);
  };
  server.on('exit', code => stop(code || 0));
  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());
  fs.watchFile(stopRequest, { interval: 500 }, () => {
    if (fs.existsSync(stopRequest)) stop();
  });
})().catch(error => { console.error(error); process.exit(1); });

