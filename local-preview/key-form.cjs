const http = require('node:http');
const crypto = require('node:crypto');
const { save, status } = require('./configure-env.cjs');
const origin = 'http://127.0.0.1:5175';
const nonce = crypto.randomBytes(32).toString('hex');
const fields = { GEMINI_API_KEY: 'Gemini API key', CLOUDINARY_CLOUD_NAME: 'Cloudinary cloud name', CLOUDINARY_API_KEY: 'Cloudinary API key', CLOUDINARY_API_SECRET: 'Cloudinary API secret', RAZORPAY_KEY_ID: 'Razorpay test key ID', RAZORPAY_KEY_SECRET: 'Razorpay test key secret', STRIPE_SECRET_KEY: 'Stripe test secret' };
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const server = http.createServer(async (req, res) => {
  const headers = {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
  const respond = (code, text) => {res.writeHead(code, headers); res.end(text);};
  if (req.headers.host !== '127.0.0.1:5175') return respond(403, 'Invalid host.');
  if (req.method === 'POST' && req.url === '/save') {
    if (req.headers.origin !== origin) return respond(403, 'Invalid origin.');
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 16384) return respond(413, 'Request too large.'); }
    const input = new URLSearchParams(body);
    if (input.get('csrf') !== nonce) return respond(403, 'Invalid form token.');
    const values = {};
    for (const key of Object.keys(fields)) if (input.get(key)) values[key] = input.get(key);
    try { save(values); } catch (error) { return respond(400, escape(error.message)); }
    return respond(200, '<h1>Keys saved locally</h1><p>NovaCart configuration updated. Key values are never returned to this page.</p><p>Restart the app to apply the settings.</p>');
  }
  if (req.method !== 'GET' || req.url !== '/') return respond(404,'Not found.');
  const controls = Object.entries(fields).map(([key,label]) => `<label for="${key}">${label}</label><input type="password" id="${key}" name="${key}" autocomplete="off" spellcheck="false">`).join('');
  respond(200, `<!doctype html><meta charset="utf-8"><title>NovaCart local key setup</title><style>body{font:16px system-ui;max-width:650px;margin:40px auto;background:#f8fafc;color:#172033}label{display:block;margin-top:16px}input{box-sizing:border-box;width:100%;padding:10px;border:1px solid #aab4c8;border-radius:6px}button{padding:12px 22px;background:#4f46e5;color:white;border:0;border-radius:8px;margin-top:22px}</style><h1>NovaCart service keys</h1><p>This form saves keys on this computer. Blank fields preserve saved settings. Payment keys must be test keys.</p><form action="/save" method="post"><input type="hidden" name="csrf" value="${nonce}">${controls}<button>Save locally</button></form><pre>${escape(JSON.stringify(status(),null,2))}</pre>`);
});
server.listen(5175,'127.0.0.1',()=>console.log('Local key form ready at '+origin));

