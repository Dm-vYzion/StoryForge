import request from 'supertest';
import { app } from '../src/app';

describe('Public worlds and campaigns', () => {
  it(
    'returns Eldertide Realms from /api/worlds/public',
    async () => {
      const res = await request(app).get('/api/worlds/public');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data.worlds)).toBe(true);

      const worlds = res.body.data.worlds;

      const eldertide = worlds.find(
        (w: any) => w.name === 'Eldertide Realms'
      );

      expect(eldertide).toBeDefined();
      expect(typeof (eldertide.id || eldertide._id)).toBe('string');
      expect(typeof eldertide.slug).toBe('string');
      expect(typeof eldertide.description).toBe('string');
      expect(Array.isArray(eldertide.defaultTags)).toBe(true);
      // baseTruths may not be present in this listing; only assert if present
      if (eldertide.baseTruths) {
        expect(Array.isArray(eldertide.baseTruths)).toBe(true);
      }

      // Basic pagination shape
      expect(res.body.data).toHaveProperty('pagination');
      expect(typeof res.body.data.pagination.page).toBe('number');
      expect(typeof res.body.data.pagination.total).toBe('number');
    },
    10000
  );

  it(
    'returns Shadows over Eldertide from /api/campaign-defs/public',
    async () => {
      const res = await request(app).get('/api/campaign-defs/public');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data.campaigns)).toBe(true);

      const campaigns = res.body.data.campaigns;

      const shadows = campaigns.find(
        (c: any) => c.title === 'Shadows over Eldertide'
      );

      expect(shadows).toBeDefined();
      expect(typeof (shadows.id || shadows._id)).toBe('string');

      // worldId is populated with minimal world info in this listing
      expect(shadows).toHaveProperty('worldId');
      expect(typeof shadows.worldId._id).toBe('string');
      expect(typeof shadows.worldId.name).toBe('string');
      expect(typeof shadows.worldId.slug).toBe('string');

      expect(typeof shadows.shortDescription).toBe('string');
      expect(Array.isArray(shadows.tags)).toBe(true);

      expect(shadows).toHaveProperty('recommendedLevel');
      expect(typeof shadows.recommendedLevel.min).toBe('number');
      expect(typeof shadows.recommendedLevel.max).toBe('number');

      expect(typeof shadows.visibility).toBe('string');
      expect(typeof shadows.isPaid).toBe('boolean');
      expect(typeof shadows.price).toBe('number');
      expect(typeof shadows.currency).toBe('string');

      expect(res.body.data).toHaveProperty('pagination');
      expect(typeof res.body.data.pagination.page).toBe('number');
      expect(typeof res.body.data.pagination.total).toBe('number');
    },
    10000
  );
});