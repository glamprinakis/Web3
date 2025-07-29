const request = require('supertest');
const app = require('./server'); // adjust path if needed

describe('Smoke test', () => {
  it('responds 200 on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
