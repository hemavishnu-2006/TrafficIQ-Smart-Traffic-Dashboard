import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'violations.json');
const PORT = Number(process.env.API_PORT || 4000);

const seed = [
  { id:'TV-24081', plate:'AP 16 DK 4821', type:'No Helmet', location:'Benz Circle', time:'10:42:18', status:'Pending', severity:'High', camera:'CAM-04' },
  { id:'TV-24080', plate:'AP 07 CX 9032', type:'Signal Jump', location:'MG Road Junction', time:'10:40:52', status:'Verified', severity:'Critical', camera:'CAM-02' },
  { id:'TV-24079', plate:'TS 09 EF 1188', type:'Wrong Parking', location:'Governor Peta', time:'10:37:09', status:'Pending', severity:'Medium', camera:'CAM-11' },
  { id:'TV-24078', plate:'AP 16 BN 7710', type:'Triple Riding', location:'Ramavarappadu', time:'10:33:41', status:'Challan Issued', severity:'High', camera:'CAM-07' },
  { id:'TV-24077', plate:'AP 39 GH 5504', type:'No Seatbelt', location:'Eluru Road', time:'10:29:06', status:'Verified', severity:'Medium', camera:'CAM-09' },
  { id:'TV-24076', plate:'AP 16 QZ 2401', type:'Overspeeding', location:'Kanuru Main Road', time:'10:24:33', status:'Pending', severity:'Critical', camera:'CAM-15' },
  { id:'TV-24075', plate:'AP 16 AB 6219', type:'No Helmet', location:'Benz Circle', time:'10:19:20', status:'Challan Issued', severity:'High', camera:'CAM-04' }
];

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try { await readFile(DATA_FILE, 'utf8'); }
  catch { await writeFile(DATA_FILE, JSON.stringify(seed, null, 2)); }
}
async function readRows() { return JSON.parse(await readFile(DATA_FILE, 'utf8')); }
async function saveRows(rows) { await writeFile(DATA_FILE, JSON.stringify(rows, null, 2)); }
function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}
async function bodyJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { status: 'ok', service: 'TrafficIQ API' });
    }
    if (req.method === 'GET' && url.pathname === '/api/violations') {
      return send(res, 200, await readRows());
    }
    if (req.method === 'POST' && url.pathname === '/api/violations') {
      const input = await bodyJson(req);
      const required = ['id', 'plate', 'type', 'location', 'time', 'severity', 'camera'];
      if (required.some(key => typeof input[key] !== 'string' || !input[key].trim())) {
        return send(res, 400, { error: 'Missing or invalid violation fields.' });
      }
      const rows = await readRows();
      if (rows.some(row => row.id === input.id)) return send(res, 409, { error: 'Violation ID already exists.' });
      const item = { ...Object.fromEntries(required.map(key => [key, input[key].trim()])), status: 'Pending' };
      rows.unshift(item);
      await saveRows(rows);
      return send(res, 201, item);
    }
    const match = url.pathname.match(/^\/api\/violations\/([^/]+)$/);
    if (req.method === 'PATCH' && match) {
      const id = decodeURIComponent(match[1]);
      const input = await bodyJson(req);
      if (!['Pending', 'Verified', 'Challan Issued'].includes(input.status)) {
        return send(res, 400, { error: 'Status must be Pending, Verified, or Challan Issued.' });
      }
      const rows = await readRows();
      const index = rows.findIndex(row => row.id === id);
      if (index === -1) return send(res, 404, { error: 'Violation not found.' });
      rows[index] = { ...rows[index], status: input.status };
      await saveRows(rows);
      return send(res, 200, rows[index]);
    }
    return send(res, 404, { error: 'Route not found.' });
  } catch (error) {
    console.error(error);
    return send(res, error instanceof SyntaxError ? 400 : 500, { error: 'Request could not be processed.' });
  }
});

await ensureStore();
server.listen(PORT, '0.0.0.0', () => console.log(`TrafficIQ API running at http://localhost:${PORT}`));
