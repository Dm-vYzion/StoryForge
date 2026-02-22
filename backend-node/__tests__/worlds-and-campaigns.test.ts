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

describe('GET /api/worlds/mine', () => {
  it(
    'returns worlds created by the logged-in author',
    async () => {
      // Log in as the seeded author user (same as in auth.test.ts)
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'author@example.com',
          password: 'dev-only-placeholder',
        });

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Create a new world as this author
      const createRes = await request(app)
        .post('/api/worlds')
        .set('Cookie', cookies)
        .send({
          name: 'Author Personal World',
          slug: `author-personal-world-${Date.now()}`,
          description: 'World owned by the seeded author user',
        })
        .expect(201);

      const createdWorld = createRes.body.data.world;
      expect(createdWorld).toBeDefined();

      // Fetch /api/worlds/mine as the same author
      const mineRes = await request(app)
        .get('/api/worlds/mine')
        .set('Cookie', cookies)
        .expect(200);

      expect(mineRes.body.success).toBe(true);
      expect(Array.isArray(mineRes.body.data.worlds)).toBe(true);

      const worldIds = mineRes.body.data.worlds.map((w: any) => w._id);
      expect(worldIds).toContain(createdWorld._id);
    },
    10000
  );

  it(
    'rejects unauthenticated access',
    async () => {
      const res = await request(app).get('/api/worlds/mine');

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty('success', false);
    },
    10000
  );
});

describe('World slug behavior', () => {
  async function loginAuthor() {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'author@example.com',
        password: 'dev-only-placeholder',
      });

    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    return cookies;
  }

	it(
		'auto-generates unique slugs when none is provided',
		async () => {
			const cookies = await loginAuthor();

			// Create first world with name "Earth" and no slug
			const res1 = await request(app)
				.post('/api/worlds')
				.set('Cookie', cookies)
				.send({
					name: 'Earth',
					description: 'First Earth',
				})
				.expect(201);

			const slug1 = res1.body.data.world.slug as string;

			// Create second world with same name
			const res2 = await request(app)
				.post('/api/worlds')
				.set('Cookie', cookies)
				.send({
					name: 'Earth',
					description: 'Second Earth',
				})
				.expect(201);

			const slug2 = res2.body.data.world.slug as string;

			// Third world with same name
			const res3 = await request(app)
				.post('/api/worlds')
				.set('Cookie', cookies)
				.send({
					name: 'Earth',
					description: 'Third Earth',
				})
				.expect(201);

			const slug3 = res3.body.data.world.slug as string;

			// All slugs should start with "earth"
			expect(slug1.startsWith('earth')).toBe(true);
			expect(slug2.startsWith('earth')).toBe(true);
			expect(slug3.startsWith('earth')).toBe(true);

			// All slugs should be unique
			expect(new Set([slug1, slug2, slug3]).size).toBe(3);

			// If they have numeric suffixes, they should increase
			const suffix = (slug: string) => {
				const match = slug.match(/^earth(?:-(\d+))?$/);
				if (!match) return 1;
				return match[1] ? parseInt(match[1], 10) : 1;
			};

			expect(suffix(slug2)).toBeGreaterThanOrEqual(suffix(slug1));
			expect(suffix(slug3)).toBeGreaterThanOrEqual(suffix(slug2));
		},
		20000
	);

	it(
		'enforces uniqueness for client-provided slugs',
		async () => {
			const cookies = await loginAuthor();

			const baseSlug = `my-new-world-${Date.now()}`;

			// Create a world with an explicit slug
			const res1 = await request(app)
				.post('/api/worlds')
				.set('Cookie', cookies)
				.send({
					name: 'My New World',
					slug: baseSlug,
					description: 'With custom slug',
				})
				.expect(201);

			const slug1 = res1.body.data.world.slug;
			expect(slug1).toBe(baseSlug);

			// Try to create another world reusing that slug
			const res2 = await request(app)
				.post('/api/worlds')
				.set('Cookie', cookies)
				.send({
					name: 'Another World',
					slug: baseSlug,
					description: 'Should conflict',
				});

			expect(res2.status).toBe(409);
			expect(res2.body).toHaveProperty(
				'error',
				'A world with this slug already exists'
			);
		},
		20000
	);
});