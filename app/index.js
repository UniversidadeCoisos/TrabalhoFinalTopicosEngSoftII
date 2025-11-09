const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const client = require('prom-client');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL pool - use env vars from docker-compose
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'appdb',
  port: 5432
});

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005,0.01,0.05,0.1,0.5,1,2,5]
});

// helper middleware to time requests
app.use(async (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Simple static HTML UI
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

// CRUD endpoints for "items"
app.get('/api/items', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, description, price, created_at FROM items ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT id, name, description, price, created_at FROM items WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.post('/api/items', async (req, res) => {
  const { name, description, price } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO items(name, description, price) VALUES($1, $2, $3) RETURNING id, name, description, price, created_at',
    [name, description, price]
  );
  res.status(201).json(rows[0]);
});

app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const { rowCount } = await pool.query(
    'UPDATE items SET name = $1, description = $2, price = $3 WHERE id = $4',
    [name, description, price, id]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
  const { rows } = await pool.query('SELECT id, name, description, price, created_at FROM items WHERE id = $1', [id]);
  res.json(rows[0]);
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
