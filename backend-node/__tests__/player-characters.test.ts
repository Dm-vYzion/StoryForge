import request from 'supertest';
import { app } from '../src/app';

describe('Player characters', () => {
  it(
    'rejects /api/player-characters/mine when unauthenticated',
    async () => {
      const res = await request(app).get('/api/player-characters/mine');

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    },
    10000
  );

  it(
    'returns Aria characters for the logged-in user from /api/player-characters/mine',
    async () => {
      // Log in first
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'author@example.com',
          password: 'dev-only-placeholder',
        });

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Fetch PCs
      const res = await request(app)
        .get('/api/player-characters/mine')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const pcs = res.body.data;

      // At least one Aria PC should exist from seed
      const aria = pcs.find(
        (pc: any) => pc.name === 'Aria Seed' || pc.name === 'Aria Test'
      );

      expect(aria).toBeDefined();

      // Basic shape and types
      expect(typeof (aria.id || aria._id)).toBe('string');
      expect(typeof aria.ownerUserId).toBe('string');
      expect(typeof aria.name).toBe('string');
      expect(typeof aria.race).toBe('string');
      expect(typeof aria.class).toBe('string');
      expect(typeof aria.level).toBe('number');
      expect(typeof aria.maxHp).toBe('number');

      // Base stats object, if present
      if (aria.baseStats) {
        const statValues = Object.values(aria.baseStats);
        expect(statValues.length).toBeGreaterThan(0);
        statValues.forEach((val: any) => {
          expect(typeof val).toBe('number');
        });
      }

      // Arrays for titles/abilities/achievements if present
      if (aria.titles) {
        expect(Array.isArray(aria.titles)).toBe(true);
      }
      if (aria.abilities) {
        expect(Array.isArray(aria.abilities)).toBe(true);
      }
      if (aria.achievements) {
        expect(Array.isArray(aria.achievements)).toBe(true);
      }
    },
    10000
  );
});