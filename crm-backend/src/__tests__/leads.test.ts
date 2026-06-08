import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

const MONGO_TEST_URI =
  process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/crm_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/leads', () => {
  const validLead = {
    name: 'Alice Smith',
    email: 'alice@acme.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    status: 'New',
    notes: 'Test note',
  };

  it('creates a lead successfully', async () => {
    const res = await request(app).post('/api/leads').send(validLead);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Smith');
    expect(res.body.data.score).toBeGreaterThan(0);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/leads').send({ name: 'Bob' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/leads').send({ ...validLead, email: 'bad-email' });
    expect(res.status).toBe(400);
  });

  it('calculates lead score on creation', async () => {
    const res = await request(app).post('/api/leads').send(validLead);
    expect(res.body.data.score).toBeDefined();
    expect(typeof res.body.data.score).toBe('number');
  });
});

describe('GET /api/leads', () => {
  beforeEach(async () => {
    await request(app).post('/api/leads').send({
      name: 'Alice Smith', email: 'alice@acme.com', phone: '+1234567890', company: 'Acme', status: 'New',
    });
    await request(app).post('/api/leads').send({
      name: 'Bob Jones', email: 'bob@gmail.com', phone: '+0987654321', company: 'Beta', status: 'Qualified',
    });
  });

  it('returns paginated leads', async () => {
    const res = await request(app).get('/api/leads?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/leads?status=Qualified');
    expect(res.status).toBe(200);
    expect(res.body.data.every((l: { status: string }) => l.status === 'Qualified')).toBe(true);
  });

  it('searches by name', async () => {
    const res = await request(app).get('/api/leads?search=Alice');
    expect(res.status).toBe(200);
    expect(res.body.data.some((l: { name: string }) => l.name.includes('Alice'))).toBe(true);
  });
});

describe('PUT /api/leads/:id', () => {
  it('updates a lead', async () => {
    const create = await request(app).post('/api/leads').send({
      name: 'Charlie', email: 'charlie@test.com', phone: '+111', company: 'Co', status: 'New',
    });
    const id = create.body.data._id;
    const res = await request(app).put(`/api/leads/${id}`).send({ status: 'Contacted' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Contacted');
  });

  it('returns 404 for non-existent lead', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/leads/${fakeId}`).send({ status: 'Lost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/leads/:id', () => {
  it('deletes a lead', async () => {
    const create = await request(app).post('/api/leads').send({
      name: 'Dave', email: 'dave@x.com', phone: '+222', company: 'XCo', status: 'New',
    });
    const id = create.body.data._id;
    const res = await request(app).delete(`/api/leads/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/leads/stats', () => {
  it('returns statistics', async () => {
    const res = await request(app).get('/api/leads/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.total).toBe('number');
  });
});

describe('GET /api/leads/export/csv', () => {
  it('returns CSV file', async () => {
    const res = await request(app).get('/api/leads/export/csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });
});
