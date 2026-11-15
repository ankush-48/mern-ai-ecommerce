const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const dotenv = require('../server/node_modules/dotenv');

const serverPath = path.resolve(__dirname, '../server/.env');
const clientPath = path.resolve(__dirname, '../client/.env.local');
const serviceKeys = ['GEMINI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'STRIPE_SECRET_KEY'];
function read(file) { return fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {}; }
function usable(value) {
  return typeof value === 'string' && value.trim() !== '' && !/(xxxx|^your_|<username>|change_me)/i.test(value);
}
function write(file, values) {
  const content = '# Local NovaCart configuration. Contains secrets. Do not commit or share.\n' +
    Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(String(value))}`).join('\n') + '\n';
  fs.writeFileSync(file, content, { mode: 0o600 });
}
function initialize() {
  const stored = read(serverPath);
  const config = { NODE_ENV: 'development', PORT: '5000', CLIENT_URL: 'http://localhost:5173',
    MONGO_URI: 'mongodb://127.0.0.1:27018/novacart_local_preview', JWT_EXPIRE: '7d', GEMINI_MODEL: 'gemini-3.5-flash-lite', ...stored };
  if (!usable(config.JWT_SECRET)) config.JWT_SECRET = randomBytes(64).toString('hex');
  for (const key of serviceKeys) {
    config[key] = usable(config[key]) ? config[key] : usable(process.env[key]) ? process.env[key] : '';
  }
  write(serverPath, config);
  const client = read(clientPath);
  // Only the public Razorpay ID belongs in Vite's browser bundle.
  client.VITE_API_URL = '/api';
  client.VITE_RAZORPAY_KEY_ID = config.RAZORPAY_KEY_ID;
  write(clientPath, client);
  return config;
}
function status() {
  const config = read(serverPath);
  const has = key => usable(config[key]);
  const all = keys => keys.every(has);
  return {
    database: has('MONGO_URI') ? 'configured locally' : 'missing',
    loginSecret: has('JWT_SECRET') ? 'configured' : 'missing',
    gemini: has('GEMINI_API_KEY') ? 'configured; provider verification pending' : 'awaiting account key',
    cloudinary: all(['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) ? 'configured; provider verification pending' : 'optional; using local image fallback',
    razorpay: all(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) ? 'test credentials configured; provider verification pending' : 'awaiting test credentials; simulator and COD available',
    stripe: has('STRIPE_SECRET_KEY') ? 'test key configured; checkout integration still incomplete' : 'optional; no Stripe checkout UI in existing app',
  };
}
function save(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid settings.');
  const config = initialize();
  for (const [key, raw] of Object.entries(input)) {
    if (!serviceKeys.includes(key) || typeof raw !== 'string') throw Error('Unsupported setting.');
    const value = raw.trim();
    if (!value) continue; // Empty fields preserve any existing credential.
    if (/[\r\n\u0000]/.test(value)) throw Error('Credentials must occupy a single line.');
    if (!usable(value)) throw Error('Placeholder credentials are not accepted.');
    config[key] = value;
  }
  const validateGroup = keys => {
    const count = keys.filter(key => usable(config[key])).length;
    if (count !== 0 && count !== keys.length) throw Error(`Provide all settings in the ${keys[0].split('_')[0]} group.`);
  };
  validateGroup(['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']);
  validateGroup(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']);
  if (config.RAZORPAY_KEY_ID && !config.RAZORPAY_KEY_ID.startsWith('rzp_test_')) throw Error('Use a Razorpay TEST key for this local preview.');
  if (config.STRIPE_SECRET_KEY && !/^(sk|rk)_test_/.test(config.STRIPE_SECRET_KEY)) throw Error('Use a Stripe TEST key for this local preview.');
  write(serverPath, config);
  const client = read(clientPath);
  client.VITE_API_URL = '/api';
  client.VITE_RAZORPAY_KEY_ID = config.RAZORPAY_KEY_ID;
  write(clientPath, client);
}

module.exports = { initialize, status, serverPath, save };
if (require.main === module) {
  const action = process.argv[2] || 'status';
  try {
    if (action === 'initialize') initialize();
    if (action === 'save') {
      const input = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
      save(input);
      console.log('Credentials saved locally. Restart the API and frontend to apply changes.');
    } else console.log(JSON.stringify(status(), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

