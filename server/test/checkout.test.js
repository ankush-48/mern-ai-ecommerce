import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { normalizeItems, priceCart } from '../utils/cart.js';

let db, server, cookie, product;
const port = 20000 + Math.floor(Math.random() * 30000);
const base = 'http://127.0.0.1:' + port;
const shippingAddress = { address: 'Test street', city: 'Test city', postalCode: '560001', country: 'India', phone: '9999999999' };
async function request(url, body, headers = {}) {
  const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json(), headers: response.headers };
}
before(async () => {
  db = await MongoMemoryReplSet.create({ binary: { downloadDir: new URL('../node_modules/.cache/mongodb-binaries/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') }, replSet: { count: 1 } });
  await mongoose.connect(db.getUri());
  await Order.init();
  server = spawn(process.execPath, ['server.js'], { cwd: new URL('../', import.meta.url), env: { ...process.env, NODE_ENV: 'production', MONGO_URI: db.getUri(), JWT_SECRET: 'test-only-secret-with-at-least-32-characters', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    let errors = '';
    server.stderr.on('data', chunk => { errors += String(chunk); });
    const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 30000);
    server.stdout.on('data', chunk => { if (String(chunk).includes('Server running')) { clearTimeout(timeout); resolve(); } });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error('Server exited: ' + code + '\n' + errors)); });
  });
  const registration = await request('/api/auth/register', { name: 'Test customer', email: 'test@example.com', password: 'LongTestPassword123!' });
  assert.equal(registration.status, 201);
  cookie = registration.headers.get('set-cookie').split(';')[0];
  product = await Product.create({ name: 'Test product', description: 'Test', category: 'Test', price: 100, stock: 5, images: [{ url: 'https://placehold.co/200' }] });
}, { timeout: 1200000 });
after(async () => {
  if (server && server.exitCode === null) { server.kill(); await once(server, 'exit'); }
  await mongoose.disconnect();
  if (db) await db.stop();
});
test('rejects malformed and negative quantities and merges duplicates', () => {
  const id = String(product._id);
  for (const qty of [-1, 0, 1.5, '2', 101]) assert.throws(() => normalizeItems([{ product: id, qty }]));
  assert.deepEqual(normalizeItems([{ product: id, qty: 1 }, { product: id, qty: 2 }]), [{ product: id, qty: 3 }]);
});
test('uses catalogue prices rather than caller prices', () => {
  const cart = priceCart([{ product: String(product._id), qty: 1, price: 0.01 }], [product]);
  assert.equal(cart.totalPrice, 217);
});
test('rejects cross-origin writes', async () => {
  assert.equal((await request('/api/auth/login', { email: 'test@example.com', password: 'x' }, { Origin: 'https://attacker.example' })).status, 403);
});
test('COD checkout ignores forged totals and changes inventory exactly once', async () => {
  const result = await request('/api/orders', { orderItems: [{ product: String(product._id), qty: 2, price: 0.01 }], shippingAddress, paymentMethod: 'COD', totalPrice: 0.02 });
  assert.equal(result.status, 201);
  assert.equal(result.data.totalPrice, 335);
  assert.equal(result.data.orderItems[0].price, 100);
  assert.equal((await Product.findById(product._id)).stock, 3);
});
test('failed address validation leaves inventory unchanged', async () => {
  assert.equal((await request('/api/orders', { orderItems: [{ product: String(product._id), qty: 1 }], shippingAddress: {}, paymentMethod: 'COD' })).status, 400);
  assert.equal((await Product.findById(product._id)).stock, 3);
});
test('concurrent orders cannot oversell stock', async () => {
  const body = { orderItems: [{ product: String(product._id), qty: 2 }], shippingAddress, paymentMethod: 'COD' };
  const results = await Promise.all([request('/api/orders', body), request('/api/orders', body)]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 400]);
  assert.equal((await Product.findById(product._id)).stock, 1);
});
test('AI missing-key failure is readable and does not prevent API startup', async () => {
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/api/ai/semantic-search', { query: 'test' })).status, 503);
});
test('SPA routes work and unknown API paths remain JSON errors', async () => {
  const response = await fetch(base + '/shop');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<div id="root">/);
  assert.equal((await request('/api/does-not-exist')).status, 404);
});

