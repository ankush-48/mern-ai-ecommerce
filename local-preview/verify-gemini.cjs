const fs = require('node:fs');
const dotenv = require('../server/node_modules/dotenv');
const { serverPath } = require('./configure-env.cjs');
(async () => {
  const config = dotenv.parse(fs.readFileSync(serverPath));
  if (!config.GEMINI_API_KEY) throw new Error('Gemini key is missing.');
  const model = process.argv[2] || config.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!/^[a-z0-9.-]+$/.test(model)) throw new Error('Invalid model name.');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST', headers: {'Content-Type':'application/json','x-goog-api-key':config.GEMINI_API_KEY},
    body: JSON.stringify({ contents:[{parts:[{text:'Reply with OK.'}]}], generationConfig:{maxOutputTokens:256} }),
    signal: AbortSignal.timeout(25000),
  });
  const body = await response.json();
  console.log(JSON.stringify({service:'Gemini',model,httpStatus:response.status, verified:response.ok && !!body.candidates?.length, error:body.error?.status || null, message:body.error?.message?.replaceAll(config.GEMINI_API_KEY,'[REDACTED]')}));
  process.exitCode = response.ok ? 0 : 1;
})().catch(error => {console.error('Gemini verification could not complete: '+error.name);process.exitCode=1;});

